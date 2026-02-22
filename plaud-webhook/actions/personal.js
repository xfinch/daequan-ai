/**
 * PERSONAL Bucket Actions
 * - Create iCloud Reminder via AppleScript
 * - Send iMessage to +8176966645
 * - Store in memory/personal/YYYY-MM-DD.md
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const IMESSAGE_TARGET = process.env.PLAUD_IMESSAGE_TARGET || '+18176966645';
const MEMORY_DIR = process.env.PLAUD_MEMORY_DIR || path.join(process.cwd(), '..', 'memory', 'personal');

/**
 * Create iCloud Reminder via AppleScript
 */
async function createiCloudReminder(title, notes = '', listName = 'Reminders') {
  console.log(`🍎 Creating iCloud Reminder: "${title.substring(0, 50)}..."`);
  
  const script = `
    tell application "Reminders"
      set reminderTitle to "${escapeAppleScript(title)}"
      set reminderBody to "${escapeAppleScript(notes)}"
      
      -- Try to find specified list, default to first list if not found
      set targetList to first list
      try
        set targetList to list "${escapeAppleScript(listName)}"
      end try
      
      -- Create reminder
      tell targetList
        make new reminder with properties {name:reminderTitle, body:reminderBody}
      end tell
      
      return "Reminder created successfully"
    end tell
  `;
  
  try {
    // Write script to temp file
    const scriptPath = `/tmp/plaud_reminder_${Date.now()}.scpt`;
    fs.writeFileSync(scriptPath, script);
    
    // Execute AppleScript
    const { stdout, stderr } = await execPromise(`osascript "${scriptPath}"`);
    
    // Cleanup
    fs.unlinkSync(scriptPath);
    
    if (stderr) {
      console.warn('⚠️  AppleScript warning:', stderr);
    }
    
    console.log('✅ iCloud Reminder created');
    return { success: true, message: stdout.trim() };
    
  } catch (error) {
    console.error('❌ Failed to create iCloud Reminder:', error.message);
    
    // Fallback: log to console for manual creation
    console.log('💡 Fallback: Please create reminder manually:');
    console.log(`   Title: ${title}`);
    console.log(`   Notes: ${notes}`);
    
    return { 
      success: false, 
      error: error.message,
      fallback: 'logged'
    };
  }
}

/**
 * Send iMessage
 */
async function sendiMessage(phoneNumber, message) {
  console.log(`📱 Sending iMessage to ${phoneNumber}`);
  
  const script = `
    tell application "Messages"
      set targetService to 1st service whose service type = iMessage
      set targetBuddy to buddy "${phoneNumber}" of targetService
      send "${escapeAppleScript(message)}" to targetBuddy
      return "Message sent"
    end tell
  `;
  
  try {
    const scriptPath = `/tmp/plaud_imessage_${Date.now()}.scpt`;
    fs.writeFileSync(scriptPath, script);
    
    const { stdout, stderr } = await execPromise(`osascript "${scriptPath}"`);
    
    fs.unlinkSync(scriptPath);
    
    console.log('✅ iMessage sent');
    return { success: true, message: stdout.trim() };
    
  } catch (error) {
    console.error('❌ Failed to send iMessage:', error.message);
    
    // Fallback: log for manual sending
    console.log('💡 Fallback: Please send message manually:');
    console.log(`   To: ${phoneNumber}`);
    console.log(`   Message: ${message.substring(0, 100)}...`);
    
    return { 
      success: false, 
      error: error.message,
      fallback: 'logged'
    };
  }
}

/**
 * Store note in memory file
 */
async function storeInMemory(data) {
  // Ensure memory directory exists
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  // Generate filename based on date
  const date = new Date(data.timestamp);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = path.join(MEMORY_DIR, `${dateStr}.md`);
  
  // Format entry
  const timestamp = date.toLocaleString('en-US', { 
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const entry = `
## [${timestamp}] Voice Memo - ${data.recordingId}

**Summary:**
${data.summary || 'N/A'}

**Transcription:**
${data.transcription || 'N/A'}

**Actions Taken:**
- [x] Created iCloud Reminder
- [x] Sent iMessage notification
- [x] Logged to memory

---
`;
  
  try {
    // Append to file (create if doesn't exist)
    fs.appendFileSync(filename, entry);
    console.log(`📝 Stored in memory: ${filename}`);
    return { success: true, filename };
  } catch (error) {
    console.error('❌ Failed to store in memory:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Escape string for AppleScript
 */
function escapeAppleScript(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Extract actionable items from content
 */
function extractActionable(summary, transcription) {
  const combined = `${summary} ${transcription}`.toLowerCase();
  const actions = [];
  
  // Look for action phrases
  const patterns = [
    /\b(remind me to|remember to|don't forget to|need to|should|must)\s+(.+?)(?:\.|$|\n)/gi,
    /\b(call|text|email|message|reach out to)\s+(.+?)(?:\.|$|\n)/gi,
    /\b(buy|get|pick up|order)\s+(.+?)(?:\.|$|\n)/gi,
    /\b(schedule|book|make an? appointment|set up)\s+(.+?)(?:\.|$|\n)/gi
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(combined)) !== null) {
      actions.push(match[0].trim());
    }
  }
  
  return actions.length > 0 ? actions : ['Review voice memo'];
}

/**
 * Main handler for PERSONAL bucket
 */
async function handle(data) {
  console.log('\n👤 Processing PERSONAL bucket...');
  
  const results = {
    reminder: null,
    imessage: null,
    memory: null
  };
  
  try {
    // Extract actionable title
    const actions = extractActionable(data.summary, data.transcription);
    const reminderTitle = actions[0] || 'Review voice memo';
    const reminderNotes = `From Plaud recording (${data.recordingId}):\n\n${data.summary || data.transcription || ''}`;
    
    // Create iCloud Reminder
    results.reminder = await createiCloudReminder(
      reminderTitle,
      reminderNotes,
      'Reminders' // Default list
    );
    
    // Send iMessage with summary
    const messageText = `📝 Voice Memo: ${reminderTitle}\n\n${data.summary?.substring(0, 200) || 'No summary available'}${data.summary?.length > 200 ? '...' : ''}`;
    results.imessage = await sendiMessage(IMESSAGE_TARGET, messageText);
    
    // Store in memory
    results.memory = await storeInMemory(data);
    
    console.log('✅ PERSONAL actions completed');
    
  } catch (error) {
    console.error('❌ Error in PERSONAL handler:', error);
    results.error = error.message;
  }
  
  return results;
}

module.exports = {
  handle,
  createiCloudReminder,
  sendiMessage,
  storeInMemory,
  extractActionable
};

// CLI testing
if (require.main === module) {
  const testData = {
    recordingId: 'test_123',
    timestamp: new Date().toISOString(),
    summary: 'Remember to call dentist tomorrow and schedule cleaning. Also buy milk.',
    transcription: 'Hey, remind me to call the dentist tomorrow and schedule a cleaning appointment. Oh and we need milk too.'
  };
  
  console.log('Testing PERSONAL actions...\n');
  handle(testData).then(results => {
    console.log('\nResults:', JSON.stringify(results, null, 2));
  });
}
