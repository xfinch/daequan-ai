#!/usr/bin/env node
/**
 * Business Card Processor
 * Extracts contact info from business card images using Google Vision API
 * Falls back to OpenAI Vision if Google Vision unavailable
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration - read from launchctl environment
const GHL_TOKEN = getEnv('GHL_COMCAST_TOKEN') || getEnv('GHL_TTL_TOKEN');
const GHL_LOCATION_ID = getEnv('GHL_COMCAST_LOCATION_ID') || 'nPubo6INanVq94ovAQNW';
const GOOGLE_VISION_KEY = getEnv('GOOGLE_VISION_API_KEY');
const OPENAI_KEY = getEnv('OPENAI_API_KEY');

/**
 * Get environment variable from launchctl (macOS) or process.env
 */
function getEnv(name) {
  try {
    const { execSync } = require('child_process');
    const value = execSync(`launchctl getenv ${name}`, { encoding: 'utf8' }).trim();
    return value || process.env[name];
  } catch {
    return process.env[name];
  }
}

// Required fields for complete entry
const REQUIRED_FIELDS = ['name', 'phone', 'email', 'address'];

// Phone regex patterns
const PHONE_REGEX = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const EMAIL_REGEX = /[\w.-]+@[\w.-]+\.\w+/g;
const ZIP_REGEX = /\b\d{5}(-\d{4})?\b/g;

/**
 * Main entry point
 */
async function main() {
  const args = parseArgs();
  
  if (!args.image) {
    console.error('Usage: process-card.js --image <path> [--source whatsapp|cli] [--dry-run]');
    process.exit(1);
  }

  if (!fs.existsSync(args.image)) {
    console.error(`Error: Image not found: ${args.image}`);
    process.exit(1);
  }

  console.log(`📇 Processing business card: ${args.image}`);

  try {
    // Step 1: OCR extraction
    const ocrText = await extractText(args.image);
    console.log('\n--- Raw OCR Text ---');
    console.log(ocrText);
    console.log('-------------------\n');

    // Step 2: Parse structured fields
    const parsed = parseBusinessCard(ocrText);
    console.log('--- Parsed Fields ---');
    console.log(JSON.stringify(parsed, null, 2));
    console.log('--------------------\n');

    // Step 3: Check for missing fields
    const missing = getMissingFields(parsed);
    
    if (args.dryRun) {
      console.log('--- DRY RUN ---');
      console.log('Status:', missing.length === 0 ? 'COMPLETE' : 'PARTIAL');
      console.log('Missing:', missing);
      return;
    }

    // Step 4: Create or update contact
    if (missing.length === 0) {
      const contactId = await createGHLContact(parsed);
      console.log(`✅ Complete! GHL Contact created: ${contactId}`);
      
      // Also save to local DB for map display
      await saveToLocalDB(parsed, contactId, 'complete');
      
      return { status: 'complete', contactId, data: parsed };
    } else {
      console.log(`⚠️ Partial entry - missing: ${missing.join(', ')}`);
      
      const partialId = await savePartialEntry(parsed, missing);
      console.log(`📝 Partial saved. ID: ${partialId}`);
      
      // Create GHL contact with missing tags
      const contactId = await createPartialGHLContact(parsed, missing);
      
      return { 
        status: 'partial', 
        partialId, 
        contactId,
        missing, 
        data: parsed,
        prompt: generatePromptForMissing(missing, parsed)
      };
    }

  } catch (error) {
    console.error('❌ Processing failed:', error.message);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = process.argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

/**
 * Extract text from image using Google Vision or OpenAI
 */
async function extractText(imagePath) {
  // Try Google Vision first if available
  if (GOOGLE_VISION_KEY) {
    try {
      return await extractWithGoogleVision(imagePath);
    } catch (err) {
      console.log('Google Vision failed, falling back to OpenAI:', err.message);
    }
  }

  // Fallback to OpenAI Vision
  if (OPENAI_KEY) {
    return await extractWithOpenAI(imagePath);
  }

  throw new Error('No OCR API available. Set GOOGLE_VISION_API_KEY or OPENAI_API_KEY');
}

/**
 * Extract text using Google Cloud Vision API
 */
async function extractWithGoogleVision(imagePath) {
  const imageBase64 = fs.readFileSync(imagePath).toString('base64');
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
        }]
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Vision API error: ${error}`);
  }

  const data = await response.json();
  
  if (data.responses?.[0]?.fullTextAnnotation?.text) {
    return data.responses[0].fullTextAnnotation.text;
  }
  
  if (data.responses?.[0]?.textAnnotations?.[0]?.description) {
    return data.responses[0].textAnnotations[0].description;
  }

  throw new Error('No text found in image');
}

/**
 * Extract text using OpenAI Vision API
 */
async function extractWithOpenAI(imagePath) {
  const imageBase64 = fs.readFileSync(imagePath).toString('base64');
  const mimeType = getMimeType(imagePath);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract ALL text from this business card image. Return only the raw text exactly as it appears, preserving line breaks. Do not add any commentary or formatting.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`
            }
          }
        ]
      }],
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Parse business card text into structured fields
 */
function parseBusinessCard(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const result = {
    name: null,
    business: null,
    title: null,
    phone: null,
    email: null,
    address: {
      street: null,
      city: null,
      state: null,
      zip: null
    },
    website: null
  };

  // Extract email
  const emailMatch = text.match(EMAIL_REGEX);
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase();
  }

  // Extract phone
  const phoneMatches = text.match(PHONE_REGEX);
  if (phoneMatches) {
    // Normalize to (XXX) XXX-XXXX
    const digits = phoneMatches[0].replace(/\D/g, '');
    if (digits.length === 10) {
      result.phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      result.phone = `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
  }

  // Extract zip and infer location
  const zipMatch = text.match(ZIP_REGEX);
  if (zipMatch) {
    result.address.zip = zipMatch[0].slice(0, 5);
    // Default to Tacoma WA for Comcast territory
    if (result.address.zip.startsWith('984')) {
      result.address.city = 'Tacoma';
      result.address.state = 'WA';
    }
  }

  // Extract name and business
  // Name is typically first or second line, title case, not all caps
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip emails, phones, websites
    if (line.includes('@') || PHONE_REGEX.test(line) || line.match(/^www\./i)) {
      continue;
    }

    // Business name: all caps or ends with Inc/LLC/Ltd/Co
    if (!result.business && (line === line.toUpperCase() || line.match(/\b(Inc\.?|LLC|Ltd\.?|Co\.?|Company|Corp\.?)\b/i))) {
      result.business = line;
      continue;
    }

    // Name detection: title case, 2-3 words, not common business words
    if (!result.name && isLikelyName(line)) {
      result.name = line;
      continue;
    }

    // Title detection
    if (!result.title && isLikelyTitle(line)) {
      result.title = line;
    }
  }

  // Extract address line
  for (const line of lines) {
    if (line.match(/^\d+\s+/) && !result.address.street) {
      result.address.street = line;
      break;
    }
  }

  // Extract website
  const websiteMatch = text.match(/(?:www\.)?[\w-]+\.(?:com|net|org|io)\b/i);
  if (websiteMatch) {
    result.website = websiteMatch[0].toLowerCase();
  }

  return result;
}

/**
 * Check if line is likely a person's name
 */
function isLikelyName(line) {
  // Title case, 2-3 words
  if (!line.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,2}$/)) return false;
  
  // Exclude common non-name words
  const excludeWords = ['street', 'st', 'avenue', 'ave', 'road', 'rd', 'drive', 'dr', 
    'boulevard', 'blvd', 'suite', 'ste', 'floor', 'building', 'office'];
  const lower = line.toLowerCase();
  if (excludeWords.some(w => lower.includes(w))) return false;
  
  return true;
}

/**
 * Check if line is likely a job title
 */
function isLikelyTitle(line) {
  const titleWords = ['owner', 'president', 'ceo', 'manager', 'director', 'sales', 
    'representative', 'consultant', 'engineer', 'developer', 'accountant', 
    'attorney', 'agent', 'broker', 'specialist', 'coordinator'];
  const lower = line.toLowerCase();
  return titleWords.some(w => lower.includes(w));
}

/**
 * Get list of missing required fields
 */
function getMissingFields(parsed) {
  const missing = [];
  
  if (!parsed.name) missing.push('name');
  if (!parsed.phone) missing.push('phone');
  if (!parsed.email) missing.push('email');
  if (!parsed.address.street) missing.push('address.street');
  if (!parsed.address.city) missing.push('address.city');
  if (!parsed.address.state) missing.push('address.state');
  if (!parsed.address.zip) missing.push('address.zip');
  
  return missing;
}

/**
 * Generate prompt asking for missing info
 */
function generatePromptForMissing(missing, parsed) {
  const found = [];
  if (parsed.name) found.push(`Name: ${parsed.name}`);
  if (parsed.phone) found.push(`Phone: ${parsed.phone}`);
  if (parsed.email) found.push(`Email: ${parsed.email}`);
  if (parsed.business) found.push(`Business: ${parsed.business}`);
  
  let prompt = '📇 Business Card Capture\n\n';
  prompt += 'Found:\n' + found.map(f => '✓ ' + f).join('\n') + '\n\n';
  prompt += 'Missing:\n' + missing.map(m => '❓ ' + m).join('\n') + '\n\n';
  
  // Ask for first missing field
  const firstMissing = missing[0];
  const fieldNames = {
    'name': 'the person\'s full name',
    'phone': 'the phone number',
    'email': 'the email address',
    'address.street': 'the street address',
    'address.city': 'the city',
    'address.state': 'the state',
    'address.zip': 'the ZIP code'
  };
  
  prompt += `Please reply with ${fieldNames[firstMissing] || firstMissing}:`;
  
  return prompt;
}

/**
 * Create contact in GHL
 */
async function createGHLContact(parsed) {
  if (!GHL_TOKEN) {
    throw new Error('GHL token not configured');
  }

  const body = {
    firstName: parsed.name?.split(' ')[0] || '',
    lastName: parsed.name?.split(' ').slice(1).join(' ') || '',
    email: parsed.email,
    phone: parsed.phone,
    address1: parsed.address.street,
    city: parsed.address.city,
    state: parsed.address.state,
    postalCode: parsed.address.zip,
    tags: ['business-card-capture', 'comcast-field'],
    source: 'Business Card Scan',
    customFields: [
      { key: 'business_name', value: parsed.business || '' },
      { key: 'job_title', value: parsed.title || '' },
      { key: 'website', value: parsed.website || '' }
    ]
  };

  const response = await fetch('https://services.leadconnectorhq.com/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-04-15'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API error: ${error}`);
  }

  const data = await response.json();
  return data.contact?.id || data.id;
}

/**
 * Create partial contact in GHL with missing tags
 */
async function createPartialGHLContact(parsed, missing) {
  if (!GHL_TOKEN) {
    console.log('Warning: GHL token not configured, skipping GHL contact creation');
    return null;
  }

  const tags = ['business-card-capture', 'comcast-field', 'needs-info'];
  missing.forEach(m => tags.push(`missing-${m.replace('.', '-')}`));

  const body = {
    firstName: parsed.name?.split(' ')[0] || 'Unknown',
    lastName: parsed.name?.split(' ').slice(1).join(' ') || '',
    email: parsed.email || '',
    phone: parsed.phone || '',
    address1: parsed.address.street || '',
    city: parsed.address.city || '',
    state: parsed.address.state || '',
    postalCode: parsed.address.zip || '',
    tags: tags,
    source: 'Business Card Scan (Incomplete)',
    customFields: [
      { key: 'business_name', value: parsed.business || '' },
      { key: 'job_title', value: parsed.title || '' }
    ]
  };

  const response = await fetch('https://services.leadconnectorhq.com/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-04-15'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('GHL partial contact error:', error);
    return null;
  }

  const data = await response.json();
  return data.contact?.id || data.id;
}

/**
 * Save to local SQLite DB for map display
 */
async function saveToLocalDB(parsed, contactId, status) {
  // This would integrate with the comcast-crm SQLite DB
  // For now, just log it
  console.log('Saving to local DB:', { parsed, contactId, status });
}

/**
 * Save partial entry for later completion
 */
async function savePartialEntry(parsed, missing) {
  const partialId = `card_${Date.now()}`;
  const partialDir = path.join(__dirname, '..', 'data', 'partial');
  
  if (!fs.existsSync(partialDir)) {
    fs.mkdirSync(partialDir, { recursive: true });
  }

  const partialData = {
    id: partialId,
    timestamp: new Date().toISOString(),
    data: parsed,
    missing: missing,
    status: 'pending'
  };

  fs.writeFileSync(
    path.join(partialDir, `${partialId}.json`),
    JSON.stringify(partialData, null, 2)
  );

  return partialId;
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return types[ext] || 'image/jpeg';
}

// Run main
main().catch(console.error);
