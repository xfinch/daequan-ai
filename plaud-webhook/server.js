/**
 * Plaud Webhook Integration Server
 * Receives transcription summaries from Plaud via Zapier
 * Routes to PERSONAL, TTL, or COMCAST buckets
 * 
 * Endpoints:
 * - POST /plaud-webhook - Main webhook endpoint
 * - GET /plaud-webhook/health - Health check
 * - POST /plaud-webhook/test - Test mode endpoint
 */

require('dotenv').config();
const express = require('express');
const router = express.Router();

const { classifyContent } = require('./classifier');
const personalActions = require('./actions/personal');
const ttlActions = require('./actions/ttl');
const comcastActions = require('./actions/comcast');
const { generateHash, storeNoteIndex, getNoteByHash, searchNotes, getRecentNotes, noteIndex } = require('./hash-util');
const { addToReviewQueue, findPotentialMatches, getPendingReviews, getReviewById, assignNote, dismissReview, getQueueStats } = require('./review-queue');

// Configuration
const PLAUD_WEBHOOK_SECRET = process.env.PLAUD_WEBHOOK_SECRET || '';
const TEST_MODE = process.env.PLAUD_TEST_MODE === 'true' || false;

// Simple in-memory rate limiter
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, []);
  }
  
  const requests = rateLimiter.get(ip).filter(t => t > windowStart);
  requests.push(now);
  rateLimiter.set(ip, requests);
  
  return requests.length <= RATE_LIMIT_MAX;
}

// Verify webhook signature (if Plaud sends directly)
function verifySignature(req) {
  // If no secret configured, skip verification
  if (!PLAUD_WEBHOOK_SECRET) {
    return true;
  }
  
  // For Zapier integration, signature verification is typically not needed
  // as Zapier handles the Plaud side and sends with its own auth
  const signature = req.headers['x-plaud-signature'] || req.headers['x-zapier-signature'];
  
  if (!signature) {
    console.warn('⚠️  No signature header found');
    return PLAUD_WEBHOOK_SECRET ? false : true;
  }
  
  // Simple token-based verification
  // In production, implement HMAC signature verification per Plaud docs
  return signature === PLAUD_WEBHOOK_SECRET;
}

// Main webhook handler
router.post('/', async (req, res) => {
  const startTime = Date.now();
  const clientIp = req.ip || req.connection.remoteAddress;
  
  console.log(`\n📥 [${new Date().toISOString()}] Plaud webhook received from ${clientIp}`);
  
  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    console.warn('⚠️  Rate limit exceeded for:', clientIp);
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // Signature verification (if configured)
  if (!verifySignature(req)) {
    console.error('❌ Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  try {
    // Extract data from request (supports both Zapier format and direct format)
    const payload = req.body;
    
    // Handle different payload structures
    const data = {
      transcription: payload.transcription || payload.text || payload.content || '',
      summary: payload.summary || payload.ai_summary || payload.notes || '',
      timestamp: payload.timestamp || payload.created_at || payload.date || new Date().toISOString(),
      recordingId: payload.recording_id || payload.id || `plaud_${Date.now()}`,
      duration: payload.duration || payload.length || 0,
      source: payload.source || 'plaud',
      // Additional metadata
      tags: payload.tags || [],
      language: payload.language || 'en'
    };
    
    // Validate required fields
    if (!data.transcription && !data.summary) {
      console.error('❌ Missing transcription or summary');
      return res.status(400).json({ 
        error: 'Missing required field: transcription or summary',
        received: Object.keys(payload)
      });
    }
    
    // Generate unique hash for this note
    data.hash = generateHash(data.recordingId, data.timestamp);
    console.log(`📝 Recording ID: ${data.recordingId}`);
    console.log(`🔑 Hash: ${data.hash}`);
    console.log(`🕐 Timestamp: ${data.timestamp}`);
    console.log(`📄 Summary length: ${data.summary?.length || 0} chars`);
    console.log(`🎙️  Transcription length: ${data.transcription?.length || 0} chars`);
    
    // Test mode - just classify and return
    if (TEST_MODE || payload.test === true) {
      console.log('🧪 TEST MODE - Classifying only');
      const classification = await classifyContent(data);
      return res.json({
        success: true,
        testMode: true,
        classification,
        data: {
          recordingId: data.recordingId,
          timestamp: data.timestamp,
          summaryPreview: data.summary?.substring(0, 200) + '...'
        }
      });
    }
    
    // Classify the content
    const bucket = await classifyContent(data);
    console.log(`🏷️  Classified as: ${bucket}`);
    
    // Route to appropriate action handler
    let result;
    const routingStart = Date.now();
    
    switch (bucket) {
      case 'PERSONAL':
        result = await personalActions.handle(data);
        break;
      case 'TTL':
        result = await ttlActions.handle(data);
        break;
      case 'COMCAST':
        result = await comcastActions.handle(data);
        
        // If no contact found, check for potential matches and queue for review
        if (!result.contact) {
          console.log('🔍 No exact match found - checking for potential matches...');
          
          try {
            // Fetch visits from main API
            const visitsResponse = await fetch('https://daequanai.com/api/visits');
            const visitsData = await visitsResponse.json();
            const visits = visitsData.visits || [];
            
            // Find potential matches
            const potentialMatches = findPotentialMatches(data, visits);
            
            if (potentialMatches.length > 0) {
              console.log(`⚠️  Found ${potentialMatches.length} potential matches - queuing for review`);
              const reviewEntry = addToReviewQueue(data, potentialMatches.length === 1 ? 'low_confidence' : 'multiple_matches');
              reviewEntry.suggestedMatches = potentialMatches;
              result.queuedForReview = true;
              result.reviewId = reviewEntry.id;
              result.potentialMatches = potentialMatches;
            } else {
              console.log('⚠️  No potential matches found - queuing for review');
              const reviewEntry = addToReviewQueue(data, 'no_match');
              result.queuedForReview = true;
              result.reviewId = reviewEntry.id;
            }
          } catch (error) {
            console.error('❌ Error finding matches:', error.message);
            // Still queue it
            const reviewEntry = addToReviewQueue(data, 'error');
            result.queuedForReview = true;
            result.reviewId = reviewEntry.id;
          }
        }
        break;
      default:
        // Default to PERSONAL if classification uncertain
        console.warn(`⚠️  Unknown bucket "${bucket}", defaulting to PERSONAL`);
        result = await personalActions.handle(data);
    }
    
    const routingTime = Date.now() - routingStart;
    const totalTime = Date.now() - startTime;
    
    // Store in index for reference
    const filePath = result?.memory?.filename || result?.note?.filePath || null;
    const indexEntry = storeNoteIndex(data.hash, data, bucket, filePath);
    
    console.log(`✅ Routed to ${bucket} in ${routingTime}ms`);
    console.log(`⏱️  Total processing time: ${totalTime}ms`);
    console.log(`🔗 Reference: ${data.hash}`);
    
    // Build response
    const response = {
      success: true,
      hash: data.hash,
      bucket,
      recordingId: data.recordingId,
      referenceUrl: `https://xaviers-mac-mini.tailc89dd8.ts.net/plaud-webhook/note/${data.hash}`,
      actions: result,
      timing: {
        routing: routingTime,
        total: totalTime
      }
    };
    
    // Add review info if applicable
    if (result.queuedForReview) {
      response.queuedForReview = true;
      response.reviewId = result.reviewId;
      response.reviewUrl = `https://xaviers-mac-mini.tailc89dd8.ts.net/plaud-webhook/reviews/${result.reviewId}`;
      if (result.potentialMatches) {
        response.potentialMatches = result.potentialMatches;
      }
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    // Log error details for debugging
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      recordingId: req.body?.recording_id || 'unknown'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    testMode: TEST_MODE,
    buckets: ['PERSONAL', 'TTL', 'COMCAST']
  });
});

// Test endpoint - for validating Zapier integration
router.post('/test', async (req, res) => {
  console.log('\n🧪 Test webhook received');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const classification = await classifyContent(req.body);
    res.json({
      success: true,
      message: 'Test webhook received successfully',
      classification,
      received: {
        headers: Object.keys(req.headers),
        bodyKeys: Object.keys(req.body)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Statistics endpoint
router.get('/stats', (req, res) => {
  const stats = {
    totalProcessed: noteIndex.size,
    byBucket: {
      PERSONAL: 0,
      TTL: 0,
      COMCAST: 0
    },
    lastProcessed: null
  };
  
  for (const [, info] of noteIndex) {
    if (stats.byBucket[info.bucket] !== undefined) {
      stats.byBucket[info.bucket]++;
    }
  }
  
  const sorted = Array.from(noteIndex.values()).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  if (sorted.length > 0) {
    stats.lastProcessed = sorted[0].createdAt;
  }
  
  res.json(stats);
});

// Get note by hash
router.get('/note/:hash', (req, res) => {
  const { hash } = req.params;
  const note = getNoteByHash(hash);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found', hash });
  }
  
  res.json({
    success: true,
    note
  });
});

// Search notes
router.get('/notes/search', (req, res) => {
  const { q, bucket, limit = 10 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" required' });
  }
  
  const results = searchNotes(q, bucket).slice(0, parseInt(limit));
  
  res.json({
    success: true,
    query: q,
    bucket: bucket || 'all',
    count: results.length,
    results
  });
});

// Get recent notes
router.get('/notes/recent', (req, res) => {
  const { bucket, limit = 10 } = req.query;
  const results = getRecentNotes(parseInt(limit), bucket);
  
  res.json({
    success: true,
    bucket: bucket || 'all',
    count: results.length,
    results
  });
});

// Get notes by business/contact name (for map integration)
router.get('/notes/by-business', (req, res) => {
  const { name, limit = 3 } = req.query;
  
  if (!name) {
    return res.status(400).json({ error: 'Business name required' });
  }
  
  // Search for notes matching business name (COMCAST bucket only for map)
  const results = [];
  const searchName = name.toLowerCase();
  
  for (const [hash, info] of noteIndex) {
    if (info.bucket !== 'COMCAST') continue;
    
    // Check if business name appears in summary or recordingId
    const summary = (info.summary || '').toLowerCase();
    const recordingId = (info.recordingId || '').toLowerCase();
    
    // Simple matching - check if business name words appear
    const nameWords = searchName.split(/\s+/).filter(w => w.length > 2);
    const matchScore = nameWords.filter(word => 
      summary.includes(word) || recordingId.includes(word)
    ).length;
    
    if (matchScore > 0) {
      results.push({
        hash,
        ...info,
        matchScore
      });
    }
  }
  
  // Sort by match score and date, return top N
  const sorted = results
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return new Date(b.timestamp) - new Date(a.timestamp);
    })
    .slice(0, parseInt(limit));
  
  res.json({
    success: true,
    businessName: name,
    count: sorted.length,
    notes: sorted
  });
});

// Review Queue Endpoints

// Get pending reviews for manual assignment
router.get('/reviews/pending', (req, res) => {
  const { limit = 10 } = req.query;
  const pending = getPendingReviews().slice(0, parseInt(limit));
  
  res.json({
    success: true,
    count: pending.length,
    reviews: pending
  });
});

// Get review queue stats
router.get('/reviews/stats', (req, res) => {
  res.json({
    success: true,
    stats: getQueueStats()
  });
});

// Get specific review
router.get('/reviews/:id', (req, res) => {
  const { id } = req.params;
  const review = getReviewById(id);
  
  if (!review) {
    return res.status(404).json({ error: 'Review not found', id });
  }
  
  res.json({
    success: true,
    review
  });
});

// Assign note to business
router.post('/reviews/:id/assign', (req, res) => {
  const { id } = req.params;
  const { visitId, businessName } = req.body;
  
  if (!visitId || !businessName) {
    return res.status(400).json({ error: 'visitId and businessName required' });
  }
  
  const review = assignNote(id, visitId, businessName);
  
  if (!review) {
    return res.status(404).json({ error: 'Review not found', id });
  }
  
  res.json({
    success: true,
    message: `Assigned to ${businessName}`,
    review
  });
});

// Dismiss review
router.post('/reviews/:id/dismiss', (req, res) => {
  const { id } = req.params;
  const review = dismissReview(id);
  
  if (!review) {
    return res.status(404).json({ error: 'Review not found', id });
  }
  
  res.json({
    success: true,
    message: 'Review dismissed',
    review
  });
});

// Find potential matches for a note (for review UI)
router.get('/reviews/:id/matches', async (req, res) => {
  const { id } = req.params;
  const review = getReviewById(id);
  
  if (!review) {
    return res.status(404).json({ error: 'Review not found', id });
  }
  
  // Fetch visits from main API
  try {
    const response = await fetch('https://daequanai.com/api/visits');
    const data = await response.json();
    const visits = data.visits || [];
    
    const matches = findPotentialMatches(review, visits);
    
    res.json({
      success: true,
      reviewId: id,
      potentialMatches: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch visits',
      message: error.message
    });
  }
});

module.exports = router;

// If run directly, start standalone server
if (require.main === module) {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/plaud-webhook', router);
  
  const PORT = process.env.PLAUD_PORT || 3456;
  app.listen(PORT, () => {
    console.log(`🎙️  Plaud Webhook Server running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/plaud-webhook/health`);
    console.log(`   Test mode: ${TEST_MODE ? 'ENABLED' : 'DISABLED'}`);
  });
}
