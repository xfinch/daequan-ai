/**
 * Hash utility for Plaud notes
 * Generates unique short hashes for easy reference
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// In-memory store for quick lookups (in production, use Redis or DB)
const noteIndex = new Map();
const INDEX_FILE = path.join(process.cwd(), 'data', 'note-index.json');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load existing index if present
try {
  if (fs.existsSync(INDEX_FILE)) {
    const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    Object.entries(data).forEach(([hash, info]) => noteIndex.set(hash, info));
    console.log(`📚 Loaded ${noteIndex.size} notes from index`);
  }
} catch (err) {
  console.warn('⚠️  Could not load note index:', err.message);
}

/**
 * Generate short unique hash from recording ID + timestamp
 */
function generateHash(recordingId, timestamp) {
  const input = `${recordingId}-${timestamp}`;
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return `p-${hash.substring(0, 7)}`; // Short hash: p-a1b2c3d
}

/**
 * Store note metadata in index
 */
function storeNoteIndex(hash, data, bucket, filePath) {
  const entry = {
    hash,
    recordingId: data.recordingId,
    timestamp: data.timestamp,
    bucket,
    filePath,
    summary: data.summary?.substring(0, 200) || '',
    createdAt: new Date().toISOString()
  };
  
  noteIndex.set(hash, entry);
  
  // Persist to disk
  try {
    const obj = Object.fromEntries(noteIndex);
    fs.writeFileSync(INDEX_FILE, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error('❌ Failed to save note index:', err.message);
  }
  
  return entry;
}

/**
 * Lookup note by hash
 */
function getNoteByHash(hash) {
  return noteIndex.get(hash) || null;
}

/**
 * Search notes by keyword
 */
function searchNotes(query, bucket = null) {
  const results = [];
  const q = query.toLowerCase();
  
  for (const [hash, info] of noteIndex) {
    if (bucket && info.bucket !== bucket) continue;
    
    if (info.summary?.toLowerCase().includes(q) || 
        info.recordingId?.toLowerCase().includes(q)) {
      results.push({ hash, ...info });
    }
  }
  
  return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get recent notes
 */
function getRecentNotes(limit = 10, bucket = null) {
  const notes = [];
  
  for (const [hash, info] of noteIndex) {
    if (bucket && info.bucket !== bucket) continue;
    notes.push({ hash, ...info });
  }
  
  return notes
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

module.exports = {
  generateHash,
  storeNoteIndex,
  getNoteByHash,
  searchNotes,
  getRecentNotes,
  noteIndex
};