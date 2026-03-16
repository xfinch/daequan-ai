#!/usr/bin/env node
/**
 * Business Card OCR Analyzer
 * Extracts contact info from business card images
 * Creates visits in MongoDB + syncs to GHL
 * Handles missing required fields with reminders
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE = process.env.API_BASE || 'https://daequanai.com';

// Required fields
const REQUIRED_FIELDS = ['name', 'phone', 'email', 'address'];

/**
 * Analyze business card image using AI vision
 */
async function analyzeBusinessCard(imagePath) {
  // Read image and convert to base64 for analysis
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;
  
  // Use image analysis (this would call the image tool)
  const prompt = `Extract all information from this business card. Return JSON format:
{
  "name": "Full name of contact",
  "phone": "Phone number",
  "email": "Email address",
  "businessName": "Company/business name",
  "address": {
    "street": "Street address",
    "city": "City",
    "state": "State (abbreviation)",
    "zip": "ZIP code"
  },
  "website": "Website if present",
  "title": "Job title if present",
  "notes": "Any other relevant text"
}

If any field is not present or unclear, use "Unknown".`;

  // For now, return mock result - actual implementation would use image tool
  return {
    name: null, // Will be filled by actual analysis
    phone: null,
    email: null,
    businessName: null,
    address: {
      street: null,
      city: null,
      state: null,
      zip: null
    },
    website: null,
    title: null,
    notes: null
  };
}

/**
 * Geocode address to get lat/lng
 */
async function geocodeAddress(street, city, state, zip) {
  const address = `${street}, ${city}, ${state} ${zip}`;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      { headers: { 'User-Agent': 'DaequanAI/1.0' } }
    );
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (err) {
    console.error('Geocoding failed:', err);
  }
  
  return null;
}

/**
 * Check for missing required fields
 */
function checkMissingFields(data) {
  const missing = [];
  
  if (!data.name || data.name === 'Unknown') missing.push('name');
  if (!data.phone || data.phone === 'Unknown') missing.push('phone');
  if (!data.email || data.email === 'Unknown') missing.push('email');
  if (!data.address?.street || data.address.street === 'Unknown') missing.push('address');
  
  return missing;
}

/**
 * Upload business card image to GHL as contact attachment
 */
async function attachImageToGHLContact(ghlContactId, imagePath) {
  const GHL_API_KEY = process.env.GHL_COMCAST_TOKEN || process.env.GHL_TTL_TOKEN;
  const GHL_LOCATION_ID = process.env.GHL_COMCAST_LOCATION_ID || process.env.GHL_LOCATION_ID;
  
  if (!GHL_API_KEY || !ghlContactId) {
    console.warn('⚠️  GHL not configured or no contact ID - skipping image attachment');
    return null;
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    
    // Create form data for file upload
    const FormData = require('form-data');
    const form = new FormData();
    form.append('fileAttachment', imageBuffer, {
      filename: fileName,
      contentType: 'image/jpeg'
    });
    form.append('contactId', ghlContactId);

    const response = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-04-15',
        ...form.getHeaders()
      },
      body: form
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ GHL image attachment failed:', error);
      return null;
    }

    const data = await response.json();
    console.log('✅ Business card image attached to GHL contact');
    return data;
  } catch (err) {
    console.error('❌ GHL image attachment error:', err.message);
    return null;
  }
}

/**
 * Create a visit via API
 */
async function createVisit(data, missingFields = []) {
  const geocode = data.address ? await geocodeAddress(
    data.address.street,
    data.address.city,
    data.address.state,
    data.address.zip
  ) : null;
  
  const visitData = {
    businessName: data.businessName || data.name || 'Unknown Business',
    contactName: data.name || 'Unknown',
    phone: data.phone || 'Unknown',
    email: data.email || 'Unknown',
    address: data.address?.street || 'Unknown',
    city: data.address?.city || 'Tacoma',
    state: data.address?.state || 'WA',
    zip: data.address?.zip || '98404',
    lat: geocode?.lat || null,
    lng: geocode?.lng || null,
    status: 'interested',
    notes: data.notes || '',
    missingFields: missingFields.length > 0 ? missingFields : undefined
  };
  
  try {
    const response = await fetch(`${API_BASE}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error('Failed to create visit:', err);
    throw err;
  }
}

/**
 * Create GHL task for missing information
 */
async function createMissingInfoTask(visitId, missingFields) {
  console.log(`Creating task to collect missing info: ${missingFields.join(', ')}`);
  // This would integrate with GHL tasks API
  // For now, just log it
}

/**
 * Main function
 */
async function processBusinessCard(imagePath, context = '') {
  console.log('🔍 Analyzing business card...');
  
  // Step 1: Analyze image
  const data = await analyzeBusinessCard(imagePath);
  
  // Step 2: Check for missing required fields
  const missingFields = checkMissingFields(data);
  
  if (missingFields.length > 0) {
    console.log(`⚠️ Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Step 3: Create visit
  console.log('💾 Creating visit...');
  const visit = await createVisit(data, missingFields);
  
  // Step 4: Attach business card image to GHL contact
  if (visit.ghlContactId && imagePath) {
    console.log('📎 Attaching business card image to GHL contact...');
    await attachImageToGHLContact(visit.ghlContactId, imagePath);
  }
  
  // Step 5: Create reminder for missing info
  if (missingFields.length > 0) {
    await createMissingInfoTask(visit._id, missingFields);
  }
  
  // Step 6: Return summary
  return {
    success: true,
    visitId: visit._id,
    ghlContactId: visit.ghlContactId,
    ghlUrl: visit.ghlContactId ? 
      `https://app.thetraffic.link/v2/location/${process.env.GHL_LOCATION_ID}/contacts/detail/${visit.ghlContactId}` : 
      null,
    extracted: data,
    missingFields,
    needsFollowUp: missingFields.length > 0
  };
}

// CLI usage
if (require.main === module) {
  const imagePath = process.argv[2];
  const context = process.argv[3] || '';
  
  if (!imagePath) {
    console.error('Usage: node business-card-scanner.js <image-path> [context]');
    process.exit(1);
  }
  
  processBusinessCard(imagePath, context)
    .then(result => {
      console.log('\n✅ Business card processed!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = { processBusinessCard, analyzeBusinessCard, attachImageToGHLContact };
