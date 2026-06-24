#!/usr/bin/env node
/**
 * WA Secretary of State Browser Scraper
 * 
 * Uses browser automation to search for new LLCs/corporations
 * filed in the last 30 days in your territory ZIP codes.
 * 
 * Note: This requires a headless browser (puppeteer/playwright)
 * which may need separate installation.
 * 
 * Alternative: Use the bulk data download if available
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Comcast Territory ZIP codes
const TERRITORY_ZIPS = [
  '98402', '98403', '98404', '98405', '98406', '98407', '98408', '98409',
  '98418', '98421', '98422', '98424', '98444', '98445', '98446', '98447',
  '98465', '98466', '98321', '98391', '98323'
];

const DATA_DIR = path.join(__dirname, 'sos-data');
const PREVIOUS_RUN_FILE = path.join(DATA_DIR, 'previous-run.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Try to download the bulk corporations data
 * WA SOS provides a full database dump
 */
function downloadBulkData() {
  return new Promise((resolve, reject) => {
    // The bulk data URL (this changes, need to check current location)
    const url = 'https://www.sos.wa.gov/corps/all_corps.zip';
    
    console.log('Attempting to download bulk corporations data...');
    console.log('URL:', url);
    
    const options = {
      hostname: 'www.sos.wa.gov',
      path: '/corps/all_corps.zip',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        console.log('Redirected to:', res.headers.location);
        resolve({ redirected: true, location: res.headers.location });
        return;
      }
      
      if (res.statusCode !== 200) {
        resolve({ error: `HTTP ${res.statusCode}` });
        return;
      }

      const filePath = path.join(DATA_DIR, 'all_corps.zip');
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve({ success: true, file: filePath });
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    req.setTimeout(30000, () => {
      req.destroy();
      resolve({ error: 'Timeout' });
    });
    req.end();
  });
}

/**
 * Alternative: Scrape using the CCFS API if available
 * The new CCFS system may have undocumented endpoints
 */
async function scrapeViaAPI() {
  console.log('Checking for CCFS API endpoints...');
  
  // Try the known API pattern
  const endpoints = [
    'https://ccfs.sos.wa.gov/api/entities/search',
    'https://ccfs.sos.wa.gov/api/corporations/search',
    'https://ccfs.sos.wa.gov/ccfs/api/Search/SearchCorporations'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint);
      if (result.valid) {
        console.log('Found working endpoint:', endpoint);
        return result;
      }
    } catch (e) {
      // Continue to next endpoint
    }
  }
  
  return null;
}

function testEndpoint(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ valid: true, data: json });
        } catch (e) {
          resolve({ valid: false });
        }
      });
    });

    req.on('error', () => resolve({ valid: false }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ valid: false });
    });
    req.end();
  });
}

/**
 * Manual search approach using the public search
 * This searches by city name and filters results
 */
async function searchByCity(city) {
  console.log(`Searching for businesses in ${city}...`);
  
  // The CCFS search uses a POST request to their search endpoint
  // This is the pattern used by their Angular frontend
  const postData = JSON.stringify({
    searchName: '*',
    city: city,
    state: 'WA',
    zip: '',
    entityType: '',
    status: 'Active',
    start: 0,
    count: 100
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ccfs.sos.wa.gov',
      path: '/ccfs/api/Search/SearchCorporations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON', raw: data.substring(0, 200) });
        }
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ error: 'Timeout' });
    });
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('=== WA Secretary of State Corporation Scraper ===\n');
  
  // Try bulk download first
  const bulkResult = await downloadBulkData();
  if (bulkResult.success) {
    console.log('✅ Bulk data downloaded:', bulkResult.file);
    console.log('You can extract and filter this data for your ZIP codes.');
    return;
  }
  
  if (bulkResult.redirected) {
    console.log('⚠️  Bulk data URL has moved. New location:', bulkResult.location);
  } else {
    console.log('❌ Bulk download failed:', bulkResult.error);
  }
  
  console.log('\n--- Trying API approach ---\n');
  
  // Try API approach
  const apiResult = await scrapeViaAPI();
  if (apiResult) {
    console.log('API working:', apiResult.data);
    return;
  }
  
  console.log('❌ No working API endpoint found');
  
  console.log('\n--- Trying city search ---\n');
  
  // Try searching major cities in territory
  const cities = ['Tacoma', 'Bonney Lake', 'Buckley'];
  for (const city of cities) {
    const result = await searchByCity(city);
    if (!result.error) {
      console.log(`${city}:`, result.length || result.count || 'Found results');
    } else {
      console.log(`${city}: ${result.error}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n--- Recommendations ---');
  console.log('1. The WA SOS bulk data download is the best option');
  console.log('2. Visit: https://www.sos.wa.gov/corporations-charities/business-entities/corporations-data-extract-download');
  console.log('3. Download the CSV, filter for your ZIP codes and recent filing dates');
  console.log('4. Alternatively, use a browser automation tool like Puppeteer to scrape the CCFS website');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
