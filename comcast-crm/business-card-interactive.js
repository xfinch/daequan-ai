#!/usr/bin/env node
/**
 * Interactive Business Card OCR System
 * 
 * Workflow:
 * 1. User sends business card photo via WhatsApp
 * 2. I analyze and extract all visible info
 * 3. For any REQUIRED missing fields (name, phone, email, address):
 *    - Ask user: "What's the phone number?"
 *    - Show "needs updating" badge on map
 *    - Tag in GHL: "missing-phone", "missing-email", etc.
 * 4. User replies with missing info
 * 5. I update MongoDB + GHL + remove tags
 * 
 * Required fields: name, phone, email, address (street, city, state, zip)
 */

const REQUIRED_FIELDS = ['name', 'phone', 'email', 'address'];

/**
 * Initial analysis result - sent to user
 */
function createAnalysisResult(extractedData) {
  const missing = [];
  const found = [];
  
  if (!extractedData.name || extractedData.name === 'Unknown') {
    missing.push('name');
  } else {
    found.push(`Name: ${extractedData.name}`);
  }
  
  if (!extractedData.phone || extractedData.phone === 'Unknown') {
    missing.push('phone');
  } else {
    found.push(`Phone: ${extractedData.phone}`);
  }
  
  if (!extractedData.email || extractedData.email === 'Unknown') {
    missing.push('email');
  } else {
    found.push(`Email: ${extractedData.email}`);
  }
  
  if (!extractedData.address?.street || extractedData.address.street === 'Unknown') {
    missing.push('address');
  } else {
    found.push(`Address: ${extractedData.address.street}, ${extractedData.address.city}, ${extractedData.address.state} ${extractedData.address.zip}`);
  }
  
  return {
    found: found.join('\n'),
    missing: missing,
    canCreate: missing.length === 0,
    extractedData
  };
}

/**
 * Generate question for missing field
 */
function getMissingFieldQuestion(field) {
  const questions = {
    name: "❓ What's the contact's full name?",
    phone: "❓ What's the phone number?",
    email: "❓ What's the email address?",
    address: "❓ What's the street address? (I'll ask for city/state/zip separately if needed)"
  };
  return questions[field] || `❓ Please provide the ${field}:`;
}

/**
 * Create partial visit with missing fields tracked
 */
async function createPartialVisit(data, missingFields) {
  const visitData = {
    businessName: data.businessName || data.name || 'Unknown Business',
    contactName: data.name || 'PENDING',
    phone: data.phone || 'PENDING',
    email: data.email || 'PENDING',
    address: data.address?.street || 'PENDING',
    city: data.address?.city || 'Tacoma',
    state: data.address?.state || 'WA',
    zip: data.address?.zip || '98404',
    lat: null, // Will geocode once address is complete
    lng: null,
    status: 'interested',
    notes: `Business card scanned. Missing: ${missingFields.join(', ')}. ${data.notes || ''}`,
    missingFields: missingFields,
    needsUpdate: true
  };
  
  // Create in MongoDB with pending status
  const response = await fetch(`${process.env.API_BASE || 'https://daequanai.com'}/api/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitData)
  });
  
  return await response.json();
}

/**
 * Add GHL tags for missing fields
 */
async function tagGHLWithMissingFields(ghlContactId, missingFields) {
  // Tags like: "missing-phone", "missing-email", "needs-info"
  const tags = [...missingFields.map(f => `missing-${f}`), 'needs-info'];
  
  console.log(`Tagging GHL contact ${ghlContactId} with:`, tags);
  
  // Call GHL API to add tags
  // POST /contacts/{id}/tags
}

/**
 * Update visit with user-provided info
 */
async function updateVisitWithUserInfo(visitId, field, value, userContext = {}) {
  // Build update based on field
  const update = {};
  
  switch(field) {
    case 'name':
      update.contactName = value;
      // Also update business name if it's still pending
      if (userContext.businessName) {
        update.businessName = userContext.businessName;
      }
      break;
    case 'phone':
      update.phone = value;
      break;
    case 'email':
      update.email = value;
      break;
    case 'address':
      // Parse address components or use full string
      update.address = value;
      if (userContext.city) update.city = userContext.city;
      if (userContext.state) update.state = userContext.state;
      if (userContext.zip) update.zip = userContext.zip;
      break;
  }
  
  // Check if all required fields now present
  // Update missingFields array
  // If all complete: geocode address, update GHL, remove tags
  
  const response = await fetch(`${process.env.API_BASE || 'https://daequanai.com'}/api/visits/${visitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update)
  });
  
  return await response.json();
}

/**
 * Remove GHL tag when info is provided
 */
async function removeGHLTag(ghlContactId, tag) {
  console.log(`Removing tag ${tag} from GHL contact ${ghlContactId}`);
  // DELETE /contacts/{id}/tags
}

/**
 * Check if all required info collected
 */
function isVisitComplete(visit) {
  return visit.contactName && visit.contactName !== 'PENDING' &&
         visit.phone && visit.phone !== 'PENDING' &&
         visit.email && visit.email !== 'PENDING' &&
         visit.address && visit.address !== 'PENDING';
}

/**
 * Complete visit - geocode and finalize
 */
async function completeVisit(visitId) {
  // Get full visit data
  // Geocode address to get lat/lng
  // Update MongoDB with lat/lng and needsUpdate=false
  // Update GHL contact with complete info
  // Remove all "missing-" tags
  // Send confirmation to user
}

module.exports = {
  createAnalysisResult,
  getMissingFieldQuestion,
  createPartialVisit,
  tagGHLWithMissingFields,
  updateVisitWithUserInfo,
  removeGHLTag,
  isVisitComplete,
  completeVisit,
  REQUIRED_FIELDS
};
