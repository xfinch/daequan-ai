/**
 * iMessage Sender Utility
 * Sends formatted notes to work iPhone via iMessage
 * Uses AppleScript on macOS to send messages
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Work iPhone number
const WORK_PHONE = process.env.COMCAST_WORK_PHONE || '3609998793';

/**
 * Send iMessage via AppleScript
 * Note: This requires the Mac to be signed into iMessage
 * and have the recipient in contacts (or use full number)
 */
async function sendIMessage(phoneNumber, message) {
  const target = phoneNumber || WORK_PHONE;
  
  // Format phone number (remove non-digits for AppleScript)
  const cleanNumber = target.replace(/\D/g, '');
  
  // Escape quotes in message for AppleScript
  const escapedMessage = message.replace(/"/g, '\\"');
  
  // AppleScript to send iMessage
  const appleScript = `
    tell application "Messages"
      set targetService to 1st service whose service type = iMessage
      set targetBuddy to buddy "${cleanNumber}" of targetService
      send "${escapedMessage}" to targetBuddy
    end tell
  `;
  
  try {
    console.log(`📱 Sending iMessage to ${target}...`);
    const { stdout, stderr } = await execPromise(`osascript -e '${appleScript}'`);
    
    if (stderr) {
      console.warn('⚠️ iMessage stderr:', stderr);
    }
    
    console.log('✅ iMessage sent successfully');
    return { success: true, sentTo: target };
    
  } catch (error) {
    console.error('❌ Failed to send iMessage:', error.message);
    return { 
      success: false, 
      error: error.message,
      fallback: 'Message logged to memory - manual copy required'
    };
  }
}

/**
 * Send message to work phone (default)
 */
async function sendToWorkPhone(message) {
  return sendIMessage(WORK_PHONE, message);
}

/**
 * Alternative: Use Messages app with temporary compose window
 * (More reliable but requires GUI)
 */
async function sendViaComposeWindow(phoneNumber, message) {
  const target = phoneNumber || WORK_PHONE;
  const cleanNumber = target.replace(/\D/g, '');
  const escapedMessage = message.replace(/"/g, '\\"');
  
  // This opens Messages and composes (you tap send)
  const appleScript = `
    tell application "Messages"
      activate
    end tell
    
    tell application "System Events"
      tell process "Messages"
        delay 0.5
        keystroke "n" using command down
        delay 0.5
        keystroke "${cleanNumber}"
        delay 0.3
        keystroke return
        delay 0.3
        keystroke "${escapedMessage}"
      end tell
    end tell
  `;
  
  try {
    await execPromise(`osascript -e '${appleScript}'`);
    return { 
      success: true, 
      method: 'compose',
      note: 'Message composed - tap send in Messages app'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendIMessage,
  sendToWorkPhone,
  sendViaComposeWindow,
  WORK_PHONE
};
