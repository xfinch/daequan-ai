/**
 * TTL (The Traffic Link) Bucket Actions
 * - Add note to GHL contact
 * - Create GHL task if actionable
 * - Tag appropriately
 */

const fs = require('fs');
const path = require('path');

// GHL Configuration
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_LOCATION_ID = process.env.GHL_TTL_LOCATION_ID || 'mhvGjZGZPcsK3vgjEDwI';
const GHL_TOKEN = process.env.GHL_TTL_TOKEN; // From env, not hardcoded

/**
 * Check if content is actionable
 */
function isActionable(summary, transcription) {
  const combined = `${summary} ${transcription}`.toLowerCase();
  
  // Action indicators
  const actionPatterns = [
    /\b(follow up|followup|follow-up)\b/i,
    /\b(call|email|text|reach out|contact)\s+(back|them|client|trina)/i,
    /\b(schedule|book|set up|arrange)\s+(a?\s?meeting|call|appointment)/i,
    /\b(send|draft|prepare|create)\s+(proposal|contract|invoice|email)/i,
    /\b(need to|should|must|have to)\s+\w+/i,
    /\b(don't forget|remember to|remind me)\b/i,
    /\b(urgent|asap|priority|important)\b/i,
    /\b(today|tomorrow|this week|by|deadline|due)\b/i
  ];
  
  for (const pattern of actionPatterns) {
    if (pattern.test(combined)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Extract client name from content
 */
function extractClientName(summary, transcription) {
  const combined = `${summary} ${transcription}`;
  
  // Look for "with [Name]" patterns
  const withPattern = /(?:with|from|about|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
  const match = combined.match(withPattern);
  if (match) {
    return match[1];
  }
  
  // Check for Trina specifically
  if (/\bTrina\b/i.test(combined)) {
    return 'Trina Fallardo';
  }
  
  return null;
}

/**
 * Extract due date from content
 */
function extractDueDate(summary, transcription) {
  const combined = `${summary} ${transcription}`.toLowerCase();
  
  // Today/tomorrow patterns
  if (/\btoday\b/.test(combined)) {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  if (/\btomorrow\b/.test(combined)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  if (/\bthis week\b/.test(combined)) {
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (5 - endOfWeek.getDay())); // Friday
    return endOfWeek.toISOString().split('T')[0];
  }
  
  // Date patterns (e.g., "by Friday", "on March 15")
  const datePattern = /(?:by|on|before)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\d{1,2}(?:\/|-)\d{1,2})/i;
  const dateMatch = combined.match(datePattern);
  if (dateMatch) {
    // Return current date + interpretation would go here
    // For now, default to 2 days from now
    const future = new Date();
    future.setDate(future.getDate() + 2);
    return future.toISOString().split('T')[0];
  }
  
  // Default: 3 days from now
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 3);
  return defaultDue.toISOString().split('T')[0];
}

/**
 * Search for GHL contact by name or email
 */
async function searchGHLContact(query) {
  console.log(`🔍 Searching GHL for: "${query}"`);
  
  try {
    const response = await fetch(`${GHL_BASE_URL}/contacts/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        query: query,
        pageLimit: 5
      })
    });
    
    if (!response.ok) {
      throw new Error(`GHL search failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.contacts && data.contacts.length > 0) {
      console.log(`✅ Found ${data.contacts.length} contact(s)`);
      return data.contacts[0]; // Return first match
    }
    
    console.log('⚠️  No contacts found');
    return null;
    
  } catch (error) {
    console.error('❌ GHL search error:', error.message);
    return null;
  }
}

/**
 * Add note to GHL contact
 */
async function addNoteToContact(contactId, data) {
  console.log(`📝 Adding note to contact: ${contactId}`);
  
  const noteBody = `**Voice Memo from Plaud**

**Summary:**
${data.summary || 'N/A'}

**Transcription:**
${data.transcription ? data.transcription.substring(0, 2000) + (data.transcription.length > 2000 ? '...' : '') : 'N/A'}

**Recording ID:** ${data.recordingId}
**Timestamp:** ${data.timestamp}

---
*Added automatically via Plaud integration*`;
  
  try {
    const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        body: noteBody
      })
    });
    
    if (!response.ok) {
      throw new Error(`GHL add note failed: ${response.status}`);
    }
    
    console.log('✅ Note added to GHL contact');
    return { success: true, contactId };
    
  } catch (error) {
    console.error('❌ GHL add note error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Create GHL task
 */
async function createGHLTask(contactId, title, description, dueDate) {
  console.log(`📋 Creating GHL task: "${title}"`);
  
  try {
    const response = await fetch(`${GHL_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        contactId: contactId,
        title: title,
        description: description,
        dueDate: dueDate,
        locationId: GHL_LOCATION_ID,
        status: 'incomplete'
      })
    });
    
    if (!response.ok) {
      throw new Error(`GHL create task failed: ${response.status}`);
    }
    
    const task = await response.json();
    console.log('✅ GHL task created');
    return { success: true, taskId: task.id };
    
  } catch (error) {
    console.error('❌ GHL create task error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Log to memory file for TTL
 */
async function logToMemory(data, actions) {
  const memoryDir = path.join(process.cwd(), '..', 'memory', 'ttl');
  
  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
  }
  
  const date = new Date(data.timestamp);
  const dateStr = date.toISOString().split('T')[0];
  const filename = path.join(memoryDir, `${dateStr}.md`);
  
  const timestamp = date.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const entry = `
## [${timestamp}] TTL Voice Memo - ${data.recordingId}

**Summary:**
${data.summary || 'N/A'}

**Transcription:**
${data.transcription || 'N/A'}

**Actions Taken:**
${actions.map(a => `- [x] ${a}`).join('\n')}

---
`;
  
  try {
    fs.appendFileSync(filename, entry);
    console.log(`📝 Logged to TTL memory: ${filename}`);
    return { success: true, filename };
  } catch (error) {
    console.error('❌ Failed to log to memory:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main handler for TTL bucket
 */
async function handle(data) {
  console.log('\n🏢 Processing TTL bucket...');
  
  const results = {
    contact: null,
    note: null,
    task: null,
    memory: null
  };
  
  try {
    // Extract client info
    const clientName = extractClientName(data.summary, data.transcription);
    console.log(`👤 Detected client: ${clientName || 'Unknown'}`);
    
    // Search for contact
    let contact = null;
    if (clientName) {
      contact = await searchGHLContact(clientName);
    }
    
    if (!contact) {
      // Try searching for generic terms
      contact = await searchGHLContact('Trina');
    }
    
    results.contact = contact;
    
    if (contact) {
      // Add note to contact
      results.note = await addNoteToContact(contact.id, data);
      
      // Check if actionable and create task
      if (isActionable(data.summary, data.transcription)) {
        const dueDate = extractDueDate(data.summary, data.transcription);
        const taskTitle = data.summary?.substring(0, 100) || 'Follow up on voice memo';
        const taskDesc = `From Plaud recording: ${data.recordingId}\n\n${data.summary || ''}`;
        
        results.task = await createGHLTask(contact.id, taskTitle, taskDesc, dueDate);
      } else {
        console.log('ℹ️  Content not actionable, skipping task creation');
      }
    } else {
      console.log('⚠️  No contact found - note will need manual entry');
    }
    
    // Log to memory
    const actions = ['Processed via TTL bucket'];
    if (results.note?.success) actions.push('Added note to GHL');
    if (results.task?.success) actions.push('Created GHL task');
    
    results.memory = await logToMemory(data, actions);
    
    console.log('✅ TTL actions completed');
    
  } catch (error) {
    console.error('❌ Error in TTL handler:', error);
    results.error = error.message;
  }
  
  return results;
}

module.exports = {
  handle,
  isActionable,
  extractClientName,
  extractDueDate,
  searchGHLContact,
  addNoteToContact,
  createGHLTask
};