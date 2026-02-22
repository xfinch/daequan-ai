/**
 * Note Review Queue
 * Handles unmatched Plaud notes that need manual assignment
 */

const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(process.cwd(), 'data', 'note-review-queue.json');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load existing queue
let reviewQueue = [];
try {
  if (fs.existsSync(QUEUE_FILE)) {
    reviewQueue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  }
} catch (err) {
  console.warn('⚠️  Could not load review queue:', err.message);
}

/**
 * Add note to review queue
 */
function addToReviewQueue(noteData, reason) {
  const entry = {
    id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    hash: noteData.hash,
    recordingId: noteData.recordingId,
    timestamp: noteData.timestamp,
    summary: noteData.summary,
    transcription: noteData.transcription,
    bucket: noteData.bucket,
    reason, // 'low_confidence', 'no_match', 'multiple_matches'
    status: 'pending', // pending, assigned, dismissed
    suggestedMatches: [],
    assignedTo: null,
    assignedAt: null,
    createdAt: new Date().toISOString()
  };
  
  reviewQueue.push(entry);
  saveQueue();
  
  console.log(`📝 Added to review queue: ${entry.id} (${reason})`);
  return entry;
}

/**
 * Find potential business matches for a note
 */
function findPotentialMatches(noteData, visits) {
  const matches = [];
  const noteText = `${noteData.summary} ${noteData.transcription}`.toLowerCase();
  
  for (const visit of visits) {
    if (!visit.businessName) continue;
    
    const bizName = visit.businessName.toLowerCase();
    const bizWords = bizName.split(/\s+/).filter(w => w.length > 3);
    
    // Check for name matches
    let score = 0;
    
    // Exact or near-exact match
    if (noteText.includes(bizName)) {
      score += 10;
    }
    
    // Word matches
    for (const word of bizWords) {
      if (noteText.includes(word)) {
        score += 2;
      }
    }
    
    // Address/zip match
    if (visit.zip && noteText.includes(visit.zip)) {
      score += 3;
    }
    if (visit.address) {
      const addrWords = visit.address.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      for (const word of addrWords) {
        if (noteText.includes(word)) {
          score += 1;
        }
      }
    }
    
    if (score > 0) {
      matches.push({
        visitId: visit._id || visit.id,
        businessName: visit.businessName,
        address: visit.address,
        zip: visit.zip,
        score,
        ghlUrl: visit.ghlUrl
      });
    }
  }
  
  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Get all pending reviews
 */
function getPendingReviews() {
  return reviewQueue.filter(r => r.status === 'pending');
}

/**
 * Get review by ID
 */
function getReviewById(id) {
  return reviewQueue.find(r => r.id === id) || null;
}

/**
 * Assign note to a business
 */
function assignNote(reviewId, visitId, businessName) {
  const review = reviewQueue.find(r => r.id === reviewId);
  if (!review) return null;
  
  review.status = 'assigned';
  review.assignedTo = { visitId, businessName };
  review.assignedAt = new Date().toISOString();
  
  saveQueue();
  console.log(`✅ Assigned note ${review.hash} to ${businessName}`);
  return review;
}

/**
 * Dismiss review (not relevant)
 */
function dismissReview(reviewId) {
  const review = reviewQueue.find(r => r.id === reviewId);
  if (!review) return null;
  
  review.status = 'dismissed';
  review.assignedAt = new Date().toISOString();
  
  saveQueue();
  console.log(`🗑️ Dismissed review ${reviewId}`);
  return review;
}

/**
 * Get stats
 */
function getQueueStats() {
  return {
    total: reviewQueue.length,
    pending: reviewQueue.filter(r => r.status === 'pending').length,
    assigned: reviewQueue.filter(r => r.status === 'assigned').length,
    dismissed: reviewQueue.filter(r => r.status === 'dismissed').length
  };
}

/**
 * Save queue to disk
 */
function saveQueue() {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(reviewQueue, null, 2));
  } catch (err) {
    console.error('❌ Failed to save review queue:', err.message);
  }
}

module.exports = {
  addToReviewQueue,
  findPotentialMatches,
  getPendingReviews,
  getReviewById,
  assignNote,
  dismissReview,
  getQueueStats,
  reviewQueue
};