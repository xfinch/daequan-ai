/**
 * SalesLoft Note Formatter
 * Converts Plaud voice memos into SalesLoft-ready note blocks
 * Formats for easy copy/paste into SalesLoft contact records
 */

/**
 * Extract key details using AI-like pattern matching
 */
function extractDetails(summary, transcription) {
  const combined = `${summary || ''} ${transcription || ''}`;
  
  // Extract business name
  const businessPatterns = [
    // Pattern 1: "at/stopped by/visited [Business Name]" - capture just the business
    /(?:at|stopped by|visited|saw)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\s+(?:Pizza|Cafe|Restaurant|Shop|Store|Salon|Dental|Auto|Repair|Construction|LLC|Inc|Co|Group|Bar|Pub|Hotel|Inn|Motel|Cleaners|Tailor)))/i,
    // Pattern 2: Specific known businesses (exact match)
    /\b(KO Construction|Knapp's Restaurant|MQF|Rudy's|Proctor Mercantile|Powder Room|Franco's Tailor|Morrell's Cleaners|Logic Staffing|GreenHaven Interactive)\b/i,
    // Pattern 3: Generic business with keywords
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\s+Pizza|\s+Cafe|\s+Restaurant|\s+Shop|\s+Pub|\s+Bar|\s+Cleaners|\s+Tailor|\s+Construction))\b/
  ];
  
  let businessName = null;
  for (const pattern of businessPatterns) {
    const match = combined.match(pattern);
    if (match) {
      businessName = match[1] || match[0];
      break;
    }
  }
  
  // Clean up business name - remove trailing words like "today", "and", "to"
  if (businessName) {
    businessName = businessName.replace(/\s+(today|and|to|in|on|for)\s*$/i, '');
  }
  
  // Extract contact name
  const namePatterns = [
    /(?:spoke with|talked to|met with|contact is|person is|named?|guy named?|lady named?|woman named?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\b(Keith|Billy|Shawn|Sarah|Anya|Andrea|Vance|Tara)\b/i
  ];
  
  let contactName = null;
  for (const pattern of namePatterns) {
    const match = combined.match(pattern);
    if (match) {
      contactName = match[1] || match[0];
      break;
    }
  }
  
  // Extract status/interest level
  const statusMap = {
    'Interested': /\b(interested|want|ready|sign up|yes|definitely|absolutely|lets do it|hot lead|very interested)\b/i,
    'Follow-up': /\b(follow up|follow-up|call back|check in|next week|schedule|appointment|meeting|proposal|quote)\b/i,
    'Not Interested': /\b(not interested|no|already have|under contract|not now|declined|pass)\b/i,
    'Called': /\b(called|left voicemail|left message|tried calling|phone tag)\b/i,
    'Customer': /\b(customer|signed up|installed|active|billing|account)\b/i
  };
  
  let status = 'Prospect';
  for (const [label, regex] of Object.entries(statusMap)) {
    if (regex.test(combined)) {
      status = label;
      break;
    }
  }
  
  // Extract location/address
  const locationPatterns = [
    /\b(\d+\s+[A-Za-z]+(?:\s+[A-Za-z]+)*(?:\s+(?:Ave|St|Blvd|Way|Dr|Rd|Ln|Ct))\b)/i,
    /\b(Proctor District|Downtown Tacoma|Point Ruston|Lakewood|Sumner|Tacoma)\b/i,
    /\b(98407|98403|98402|98404|98405|98406|98408|98409|98418|98421|98422|98444|98424|98390)\b/
  ];
  
  let location = null;
  for (const pattern of locationPatterns) {
    const match = combined.match(pattern);
    if (match) {
      location = match[1] || match[0];
      break;
    }
  }
  
  // Extract phone number
  const phonePattern = /\b(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/;
  const phoneMatch = combined.match(phonePattern);
  const phone = phoneMatch ? phoneMatch[1] : null;
  
  // Extract email
  const emailPattern = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/;
  const emailMatch = combined.match(emailPattern);
  const email = emailMatch ? emailMatch[1] : null;
  
  // Extract package mentions
  const packagePatterns = {
    'Triple Play': /\b(triple play|all three|internet.*tv.*phone)\b/i,
    'Internet': /\b(internet|wifi|broadband|connectivity)\b/i,
    'TV': /\b(tv|television|cable|channels)\b/i,
    'Phone': /\b(phone|voice|voip|business phone)\b/i,
    'Gigabit': /\b(gigabit|gig|1gb|high speed)\b/i
  };
  
  const packages = [];
  for (const [pkg, regex] of Object.entries(packagePatterns)) {
    if (regex.test(combined)) {
      packages.push(pkg);
    }
  }
  
  // Extract budget/pricing mentions
  const budgetPatterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per month|\/mo|monthly|mo|a month|per mo)/i,
    /\b(\d{3,4})\s*(?:per month|\/mo|monthly|mo|a month|dollars?\s*(?:per|a|\/))\b/i,
    /(?:budget|spending|around|about)\s+(?:\$)?(\d{3,4})\b/i
  ];
  
  let budget = null;
  for (const pattern of budgetPatterns) {
    const match = combined.match(pattern);
    if (match) {
      budget = match[1];
      break;
    }
  }
  
  // Extract next action
  const nextActionPatterns = [
    /(?:next|then|after that|plan to|need to|will)\s+(.{10,100})/i,
    /(?:follow up|call back|check in|schedule|send)\s+(.{5,80})/i
  ];
  
  let nextAction = null;
  for (const pattern of nextActionPatterns) {
    const match = combined.match(pattern);
    if (match) {
      nextAction = match[1].trim();
      // Clean up - stop at sentence end
      const sentenceEnd = nextAction.match(/[.!?]/);
      if (sentenceEnd) {
        nextAction = nextAction.substring(0, sentenceEnd.index + 1);
      }
      break;
    }
  }
  
  // Clean up transcription for notes
  let cleanNotes = transcription || summary || '';
  // Remove filler words, make more readable
  cleanNotes = cleanNotes
    .replace(/\b(um|uh|like|you know|so yeah)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    businessName,
    contactName,
    status,
    location,
    phone,
    email,
    packages,
    budget,
    nextAction,
    cleanNotes,
    rawSummary: summary,
    rawTranscription: transcription
  };
}

/**
 * Format note for SalesLoft
 */
function formatSalesLoftNote(details, recordingId) {
  const lines = [];
  
  // Header with emoji for visual scanning
  lines.push(`🎯 ${details.businessName || 'Unknown Business'}${details.contactName ? ` | ${details.contactName}` : ''}`);
  
  // Contact info line
  const contactInfo = [];
  if (details.location) contactInfo.push(`📍 ${details.location}`);
  if (details.phone) contactInfo.push(`📞 ${details.phone}`);
  if (details.email) contactInfo.push(`📧 ${details.email}`);
  if (contactInfo.length > 0) {
    lines.push(contactInfo.join(' | '));
  }
  
  // Status
  lines.push(`📊 Status: ${details.status}`);
  
  // Packages
  if (details.packages.length > 0) {
    lines.push(`📦 Packages: ${details.packages.join(', ')}`);
  }
  
  // Budget
  if (details.budget) {
    lines.push(`💰 Budget: $${details.budget}/mo`);
  }
  
  // Notes section
  lines.push('');
  lines.push('📝 Notes:');
  
  // Condensed notes (first 280 chars for quick scan)
  const shortNotes = details.cleanNotes.substring(0, 280);
  lines.push(shortNotes + (details.cleanNotes.length > 280 ? '...' : ''));
  
  // Next action
  if (details.nextAction) {
    lines.push('');
    lines.push(`➡️ Next Action: ${details.nextAction}`);
  }
  
  // Footer
  lines.push('');
  lines.push(`—`);
  lines.push(`Recorded: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);
  lines.push(`Ref: ${recordingId || 'N/A'}`);
  lines.push('');
  lines.push('Copy above → paste into SalesLoft contact note');
  
  return lines.join('\n');
}

/**
 * Format for iMessage (condensed version)
 */
function formatIMessage(details, recordingId) {
  const lines = [];
  
  // Header - business + contact
  lines.push(`🎯 ${details.businessName || 'Unknown'}${details.contactName ? ` | ${details.contactName}` : ''}`);
  
  // Status + packages
  const meta = [];
  meta.push(details.status);
  if (details.packages.length > 0) meta.push(details.packages.join('/'));
  if (details.budget) meta.push(`$${details.budget}/mo`);
  lines.push(meta.join(' • '));
  
  // Location if available
  if (details.location) {
    lines.push(`📍 ${details.location}`);
  }
  
  // Contact info
  if (details.phone || details.email) {
    const contacts = [];
    if (details.phone) contacts.push(details.phone);
    if (details.email) contacts.push(details.email);
    lines.push(contacts.join(' | '));
  }
  
  // Notes (shorter for iMessage)
  lines.push('');
  const shortNotes = details.cleanNotes.substring(0, 200);
  lines.push(shortNotes + (details.cleanNotes.length > 200 ? '...' : ''));
  
  // Next action
  if (details.nextAction) {
    lines.push(`➡️ ${details.nextAction}`);
  }
  
  // Minimal footer
  lines.push(`—SalesLoft note ready`);
  
  return lines.join('\n');
}

/**
 * Main formatter function
 */
function formatForSalesLoft(data, options = {}) {
  const details = extractDetails(data.summary, data.transcription);
  
  if (options.format === 'imessage') {
    return {
      text: formatIMessage(details, data.recordingId),
      details,
      format: 'imessage'
    };
  }
  
  return {
    text: formatSalesLoftNote(details, data.recordingId),
    details,
    format: 'salesloft'
  };
}

module.exports = {
  extractDetails,
  formatSalesLoftNote,
  formatIMessage,
  formatForSalesLoft
};
