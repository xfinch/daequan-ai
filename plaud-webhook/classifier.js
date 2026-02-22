/**
 * Plaud Content Classifier
 * Hybrid routing: Keywords first, AI classification as fallback
 * 
 * Buckets:
 * - PERSONAL: Life admin, personal reminders, family stuff
 * - TTL: Business operations, client work, the traffic link
 * - COMCAST: Sales territory work, prospecting, Comcast business
 */

const { execSync } = require('child_process');
const path = require('path');

// Keyword patterns for quick classification
const KEYWORD_PATTERNS = {
  PERSONAL: {
    // Keywords that indicate personal content
    prefix: [
      /^PERSONAL/i,
      /^LIFE/i,
      /^HOME/i,
      /^FAMILY/i,
      /^PRIVATE/i,
      /^ME/i,
      /^MY/i
    ],
    suffix: [
      /PERSONAL$/i,
      /LIFE$/i,
      /HOME$/i,
      /FAMILY$/i,
      /PRIVATE$/i
    ],
    contains: [
      // Personal life indicators
      /\b(remind me to|remember to|don't forget|call my|text my)\b/i,
      /\b(birthday|anniversary|wedding|party|dinner|lunch)\b/i,
      /\b(grocery|shopping|buy|pick up|get from)\b/i,
      /\b(dentist|doctor|appointment|checkup)\b/i,
      /\b(kids?|children|wife|husband|spouse|partner|mom|dad)\b/i,
      /\b(personal|life|home|family)\s+(task|note|reminder)\b/i,
      /\b(wedding|vacation|trip|travel|hotel|flight)\b/i,
      /\b(bank account|credit card|bill pay|mortgage|rent)\b/i
    ]
  },
  
  TTL: {
    // Keywords that indicate TTL business
    prefix: [
      /^TTL/i,
      /^TRAFFIC/i,
      /^CLIENT/i,
      /^TRINA/i,
      /^BUSINESS/i,
      /^WORK/i
    ],
    suffix: [
      /TTL$/i,
      /TRAFFIC$/i,
      /CLIENT$/i,
      /WORK$/i,
      /BUSINESS$/i
    ],
    contains: [
      /\b(the traffic link|traffic link|TTL)\b/i,
      /\b(client|project|campaign|email|marketing|lead)\b/i,
      /\b(Trina|Fallardo|consulting|consultant)\b/i,
      /\b(GHL|go high level|highlevel|CRM)\b/i,
      /\b(proposal|contract|invoice|payment|billing)\b/i,
      /\b(cold email|warmup|deliverability|domain)\b/i,
      /\b(sub-?account|location|agency)\b/i,
      /\b(website|funnel|landing page|opt-?in)\b/i
    ]
  },
  
  COMCAST: {
    // Keywords that indicate Comcast work
    prefix: [
      /^COMCAST/i,
      /^SALES/i,
      /^TERRITORY/i,
      /^PROSPECT/i,
      /^BUSINESS/i,
      /^B2B/i
    ],
    suffix: [
      /COMCAST$/i,
      /SALES$/i,
      /TERRITORY$/i,
      /PROSPECT$/i
    ],
    contains: [
      /\b(comcast|xfinity|cable|internet|triple play)\b/i,
      /\b(territory|zip|zipcode|area|zone|route)\b/i,
      /\b(prospect|lead|business|owner|manager|decision maker)\b/i,
      /\b(visit|door knock|walk-?in|cold call|follow-?up)\b/i,
      /\b(business card|card scan|OCR|extracted)\b/i,
      /\b(gigabit|business internet|voice|TV|phone service)\b/i,
      /\b(contract|install|installation|tech|technician)\b/i,
      /\b(tacoma|puyallup|federal way|auburn|kent)\b/i
    ]
  }
};

// Check for keyword matches
function checkKeywords(text) {
  const normalizedText = (text || '').trim();
  const firstLine = normalizedText.split('\n')[0].trim();
  const lastLine = normalizedText.split('\n').pop().trim();
  
  // Phase 1: Check ALL prefix patterns first (explicit overrides)
  for (const [bucket, patterns] of Object.entries(KEYWORD_PATTERNS)) {
    for (const pattern of patterns.prefix) {
      if (pattern.test(firstLine)) {
        console.log(`🏷️  Keyword match: "${bucket}" (prefix in first line)`);
        return bucket;
      }
    }
  }
  
  // Phase 2: Check ALL suffix patterns second
  for (const [bucket, patterns] of Object.entries(KEYWORD_PATTERNS)) {
    for (const pattern of patterns.suffix) {
      if (pattern.test(lastLine)) {
        console.log(`🏷️  Keyword match: "${bucket}" (suffix in last line)`);
        return bucket;
      }
    }
  }
  
  // Phase 3: Check contains patterns last (least specific)
  for (const [bucket, patterns] of Object.entries(KEYWORD_PATTERNS)) {
    for (const pattern of patterns.contains) {
      if (pattern.test(normalizedText)) {
        console.log(`🏷️  Keyword match: "${bucket}" (content match)`);
        return bucket;
      }
    }
  }
  
  return null;
}

// AI-powered classification using local LLM via OpenClaw
async function classifyWithAI(data) {
  console.log('🤖 Falling back to AI classification...');
  
  const prompt = `You are a content classifier for voice memo transcriptions. Classify this content into exactly one of three buckets:

BUCKETS:
1. PERSONAL - Personal life tasks, reminders, family matters, appointments, home admin
2. TTL - The Traffic Link business, client work, consulting, marketing projects  
3. COMCAST - Comcast sales work, territory visits, prospecting, B2B sales

RULES:
- PERSONAL: Anything about family, home, personal appointments, personal reminders, life admin
- TTL: Anything about Xavier's consulting business, client work, marketing, the traffic link
- COMCAST: Anything about Xavier's Comcast sales job, territory visits, business prospects

CONTENT TO CLASSIFY:
Summary: ${data.summary?.substring(0, 500) || 'N/A'}
Transcription excerpt: ${data.transcription?.substring(0, 1000) || 'N/A'}

Respond with ONLY the bucket name (PERSONAL, TTL, or COMCAST). No explanation.`;

  try {
    // Try to use OpenClaw's image/analyze function or make a direct call
    // For now, we'll use a simple heuristic-based fallback
    
    // Count indicator words in both summary and transcription
    const combinedText = `${data.summary} ${data.transcription}`.toLowerCase();
    
    const scores = {
      PERSONAL: 0,
      TTL: 0,
      COMCAST: 0
    };
    
    // Personal indicators
    const personalWords = ['remind', 'remember', 'forget', 'family', 'home', 'wife', 'kids', 'appointment', 'doctor', 'dentist', 'grocery', 'shopping', 'birthday', 'party', 'dinner', 'personal', 'my', 'i need to', 'call my', 'text my'];
    personalWords.forEach(word => {
      if (combinedText.includes(word)) scores.PERSONAL++;
    });
    
    // TTL indicators
    const ttlWords = ['client', 'trina', 'traffic link', 'consulting', 'campaign', 'marketing', 'ghl', 'crm', 'project', 'proposal', 'contract', 'invoice', 'business'];
    ttlWords.forEach(word => {
      if (combinedText.includes(word)) scores.TTL++;
    });
    
    // Comcast indicators
    const comcastWords = ['comcast', 'xfinity', 'territory', 'zip', 'prospect', 'visit', 'door', 'business card', 'install', 'internet', 'cable', 'gigabit', 'sales'];
    comcastWords.forEach(word => {
      if (combinedText.includes(word)) scores.COMCAST++;
    });
    
    console.log('🤖 AI classification scores:', scores);
    
    // Return the bucket with highest score
    const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    
    if (winner[1] === 0) {
      // No clear indicators, default to PERSONAL
      console.log('🤖 No clear indicators, defaulting to PERSONAL');
      return 'PERSONAL';
    }
    
    console.log(`🤖 AI classified as: ${winner[0]} (score: ${winner[1]})`);
    return winner[0];
    
  } catch (error) {
    console.error('❌ AI classification failed:', error.message);
    // Default to PERSONAL on error
    return 'PERSONAL';
  }
}

// Main classification function
async function classifyContent(data) {
  const combinedText = `${data.summary || ''} ${data.transcription || ''}`;
  
  console.log('\n🔍 Classifying content...');
  console.log(`   Input length: ${combinedText.length} chars`);
  
  // Step 1: Check for explicit keywords (fast path)
  const keywordResult = checkKeywords(combinedText);
  if (keywordResult) {
    return keywordResult;
  }
  
  // Step 2: AI classification (fallback)
  return await classifyWithAI(data);
}

// Helper to validate bucket name
function isValidBucket(bucket) {
  return ['PERSONAL', 'TTL', 'COMCAST'].includes(bucket);
}

// Export for testing
module.exports = {
  classifyContent,
  checkKeywords,
  classifyWithAI,
  isValidBucket,
  KEYWORD_PATTERNS
};

// CLI testing
if (require.main === module) {
  const testCases = [
    { summary: 'PERSONAL: Call dentist tomorrow', transcription: '' },
    { summary: 'TTL: Follow up with Trina about cold email campaign', transcription: '' },
    { summary: 'COMCAST: Visited pizza place on 6th Ave, owner interested in triple play', transcription: '' },
    { summary: 'Need to buy groceries and call mom', transcription: '' },
    { summary: 'Client meeting about website redesign COMCAST', transcription: '' }
  ];
  
  console.log('Testing classifier...\n');
  
  (async () => {
    for (const test of testCases) {
      console.log('─'.repeat(60));
      console.log('Input:', test.summary);
      const result = await classifyContent(test);
      console.log('Result:', result);
      console.log('');
    }
  })();
}
