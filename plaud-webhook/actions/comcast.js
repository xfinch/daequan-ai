/**
 * COMCAST Bucket Actions
 * - Add note to MongoDB CRM
 * - Extract package mentions (triple play, internet, etc.)
 * - Update contact in CRM
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// MongoDB Configuration
const MONGODB_URI = process.env.COMCAST_MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.COMCAST_MONGODB_DB || 'comcast_crm';

/**
 * Extract package type mentions
 */
function extractPackageMentions(summary, transcription) {
  const combined = `${summary} ${transcription}`.toLowerCase();
  const packages = [];
  
  // Package patterns
  const patterns = [
    { name: 'Triple Play', regex: /\b(triple play|all three|internet.*tv.*phone|bundle)\b/i },
    { name: 'Double Play', regex: /\b(double play|internet.*tv|tv.*internet|two services)\b/i },
    { name: 'Internet Only', regex: /\b(just internet|internet only|single play|only internet)\b/i },
    { name: 'TV Only', regex: /\b(just tv|tv only|television only|cable only)\b/i },
    { name: 'Phone Only', regex: /\b(just phone|phone only|voice only|business phone)\b/i },
    { name: 'Gigabit', regex: /\b(gigabit|gig|1gb|high speed|fast internet)\b/i },
    { name: 'Business Internet', regex: /\b(business internet|b2b internet|commercial internet)\b/i }
  ];
  
  for (const pattern of patterns) {
    if (pattern.regex.test(combined)) {
      packages.push(pattern.name);
    }
  }
  
  // Interest level
  const interestPatterns = {
    'Hot Lead': /\b(interested|want|ready|sign up|yes|definitely|absolutely|lets do it)\b/i,
    'Warm Lead': /\b(considering|thinking about|maybe|possibly|price|cost|how much)\b/i,
    'Cold Lead': /\b(not interested|no|already have|under contract|maybe later)\b/i
  };
  
  let interestLevel = 'Unknown';
  for (const [level, regex] of Object.entries(interestPatterns)) {
    if (regex.test(combined)) {
      interestLevel = level;
      break;
    }
  }
  
  return { packages, interestLevel };
}

/**
 * Extract business name from content
 */
function extractBusinessName(summary, transcription) {
  const combined = `${summary} ${transcription}`;
  
  // Look for business patterns
  const patterns = [
    /(?:at|visited|stopped by|saw)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\s+(?:Pizza|Cafe|Restaurant|Shop|Store|Salon|Dental|Auto|Repair|LLC|Inc|Co)))/,
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:on|at|near)\s+\d+(?:th|st|nd|rd)?\s+(?:Ave|St|Blvd|Way|Dr))\b/,
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\s+Pizza|\s+Cafe|\s+Restaurant|\s+Shop))\b/
  ];
  
  for (const pattern of patterns) {
    const match = combined.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Extract address from content
 */
function extractAddress(summary, transcription) {
  const combined = `${summary} ${transcription}`;
  
  // Street address pattern
  const addressPattern = /\b(\d+\s+[A-Za-z]+(?:\s+[A-Za-z]+)*(?:\s+(?:Ave|St|Blvd|Way|Dr|Rd|Ln|Ct))\b)/i;
  const match = combined.match(addressPattern);
  
  if (match) {
    return match[1];
  }
  
  // Cross street pattern
  const crossPattern = /\b(corner of|intersection of)\s+([A-Za-z]+\s+(?:and|&)\s+[A-Za-z]+)/i;
  const crossMatch = combined.match(crossPattern);
  
  if (crossMatch) {
    return crossMatch[0];
  }
  
  return null;
}

/**
 * Connect to MongoDB
 */
async function connectToMongo() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

/**
 * Search for contact by business name or address
 */
async function searchComcastContact(businessName, address) {
  console.log(`🔍 Searching Comcast CRM for: ${businessName || address}`);
  
  let client;
  try {
    client = await connectToMongo();
    const db = client.db(MONGODB_DB);
    const contacts = db.collection('contacts');
    
    let query = {};
    if (businessName) {
      query.businessName = { $regex: businessName, $options: 'i' };
    } else if (address) {
      query.address = { $regex: address, $options: 'i' };
    }
    
    const contact = await contacts.findOne(query);
    
    if (contact) {
      console.log(`✅ Found contact: ${contact.businessName || contact.name}`);
    } else {
      console.log('⚠️  No existing contact found');
    }
    
    return contact;
    
  } catch (error) {
    console.error('❌ MongoDB search error:', error.message);
    return null;
  } finally {
    if (client) await client.close();
  }
}

/**
 * Add note to Comcast CRM contact
 */
async function addNoteToComcastContact(contactId, data, packageInfo) {
  console.log(`📝 Adding note to Comcast contact: ${contactId}`);
  
  const note = {
    type: 'voice_memo',
    recordingId: data.recordingId,
    timestamp: new Date(data.timestamp),
    summary: data.summary,
    transcription: data.transcription,
    packages: packageInfo.packages,
    interestLevel: packageInfo.interestLevel,
    source: 'plaud'
  };
  
  let client;
  try {
    client = await connectToMongo();
    const db = client.db(MONGODB_DB);
    const contacts = db.collection('contacts');
    
    // Update contact with new note and package info
    const update = {
      $push: { notes: note },
      $set: { 
        lastContact: new Date(),
        updatedAt: new Date()
      }
    };
    
    // If we detected packages, update those too
    if (packageInfo.packages.length > 0) {
      update.$addToSet = { interestedPackages: { $each: packageInfo.packages } };
    }
    
    // If we detected interest level, update status
    if (packageInfo.interestLevel === 'Hot Lead') {
      update.$set.status = 'Hot Lead';
    } else if (packageInfo.interestLevel === 'Warm Lead' && !update.$set.status) {
      update.$set.status = 'Warm Lead';
    }
    
    const result = await contacts.updateOne(
      { _id: contactId },
      update
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Note added to Comcast CRM');
      return { success: true, contactId };
    } else {
      throw new Error('Contact not found or not modified');
    }
    
  } catch (error) {
    console.error('❌ MongoDB update error:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (client) await client.close();
  }
}

/**
 * Create follow-up task in GHL for Comcast leads
 */
async function createComcastFollowUpTask(contactId, data, packageInfo) {
  console.log('📋 Creating follow-up task for Comcast lead');
  
  // Use GHL for task management (same TTL sub-account)
  const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
  const GHL_TOKEN = process.env.GHL_TTL_TOKEN;
  const GHL_LOCATION_ID = process.env.GHL_TTL_LOCATION_ID || 'mhvGjZGZPcsK3vgjEDwI';
  
  const priority = packageInfo.interestLevel === 'Hot Lead' ? 'high' : 'medium';
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (priority === 'high' ? 1 : 3));
  
  const taskTitle = `[Comcast] Follow up - ${packageInfo.packages.join(', ') || 'General inquiry'}`;
  const taskDesc = `From Plaud recording: ${data.recordingId}

**Summary:**
${data.summary || 'N/A'}

**Packages Mentioned:** ${packageInfo.packages.join(', ') || 'None'}
**Interest Level:** ${packageInfo.interestLevel}

**Transcription:**
${data.transcription ? data.transcription.substring(0, 1000) + '...' : 'N/A'}`;
  
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
        title: taskTitle,
        description: taskDesc,
        dueDate: dueDate.toISOString().split('T')[0],
        locationId: GHL_LOCATION_ID,
        status: 'incomplete'
      })
    });
    
    if (!response.ok) {
      throw new Error(`GHL task creation failed: ${response.status}`);
    }
    
    const task = await response.json();
    console.log('✅ Follow-up task created');
    return { success: true, taskId: task.id };
    
  } catch (error) {
    console.error('❌ GHL task error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Log to memory file for Comcast
 */
async function logToMemory(data, packageInfo, actions) {
  const memoryDir = path.join(process.cwd(), '..', 'memory', 'comcast');
  
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
## [${timestamp}] Comcast Voice Memo - ${data.recordingId}

**Business:** ${extractBusinessName(data.summary, data.transcription) || 'Unknown'}
**Address:** ${extractAddress(data.summary, data.transcription) || 'Unknown'}

**Packages Mentioned:** ${packageInfo.packages.join(', ') || 'None'}
**Interest Level:** ${packageInfo.interestLevel}

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
    console.log(`📝 Logged to Comcast memory: ${filename}`);
    return { success: true, filename };
  } catch (error) {
    console.error('❌ Failed to log to memory:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main handler for COMCAST bucket
 */
async function handle(data) {
  console.log('\n🏢 Processing COMCAST bucket...');
  
  const results = {
    businessName: null,
    address: null,
    contact: null,
    note: null,
    task: null,
    memory: null,
    packages: []
  };
  
  try {
    // Extract information
    results.businessName = extractBusinessName(data.summary, data.transcription);
    results.address = extractAddress(data.summary, data.transcription);
    
    console.log(`🏪 Business: ${results.businessName || 'Unknown'}`);
    console.log(`📍 Address: ${results.address || 'Unknown'}`);
    
    // Extract package mentions
    const packageInfo = extractPackageMentions(data.summary, data.transcription);
    results.packages = packageInfo.packages;
    
    console.log(`📦 Packages: ${packageInfo.packages.join(', ') || 'None'}`);
    console.log(`🔥 Interest: ${packageInfo.interestLevel}`);
    
    // Search for existing contact
    const contact = await searchComcastContact(results.businessName, results.address);
    results.contact = contact;
    
    if (contact) {
      // Add note to CRM
      results.note = await addNoteToComcastContact(contact._id, data, packageInfo);
      
      // Create follow-up task if lead is warm or hot
      if (packageInfo.interestLevel !== 'Cold Lead') {
        results.task = await createComcastFollowUpTask(contact._id, data, packageInfo);
      }
    } else {
      console.log('⚠️  No contact found - note queued for manual entry');
      // TODO: Queue for manual entry or create new contact
    }
    
    // Log to memory
    const actions = ['Processed via COMCAST bucket'];
    if (results.note?.success) actions.push('Added note to CRM');
    if (results.task?.success) actions.push('Created follow-up task');
    
    results.memory = await logToMemory(data, packageInfo, actions);
    
    console.log('✅ COMCAST actions completed');
    
  } catch (error) {
    console.error('❌ Error in COMCAST handler:', error);
    results.error = error.message;
  }
  
  return results;
}

module.exports = {
  handle,
  extractPackageMentions,
  extractBusinessName,
  extractAddress,
  searchComcastContact,
  addNoteToComcastContact,
  createComcastFollowUpTask
};