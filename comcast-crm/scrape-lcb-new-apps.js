#!/usr/bin/env node
/**
 * LCB New Application Scraper
 * 
 * Scrapes the LCB licensing website for NEW APPLICATIONS (not renewals)
 * in your territory ZIP codes.
 * 
 * This uses the LCB's web interface which shows:
 * - New Application
 * - Renewal  
 * - Change of Location
 * - Assumption
 * - etc.
 * 
 * Usage:
 *   node scrape-lcb-new-apps.js [--notify] [--save]
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

// LCB License types that matter for prospecting
const TARGET_LICENSE_TYPES = [
  { code: '470', name: 'Public House' },
  { code: '326', name: 'Microbrewery' },
  { code: '327', name: 'Washington Domestic Winery' },
  { code: '351', name: 'Craft Distillery' },
  { code: '360', name: 'Tavern' },
  { code: '361', name: 'Restaurant' },
  { code: '362', name: 'Hotel/Motel' },
  { code: '482', name: 'Spirits Retailer' }
];

const DATA_DIR = path.join(__dirname, 'lcb-data');
const PREVIOUS_RUN_FILE = path.join(DATA_DIR, 'previous-run.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function fetchLicenseList(typeLic, privDesc) {
  return new Promise((resolve, reject) => {
    const encodedDesc = encodeURIComponent(privDesc);
    const url = `https://licensinginfo.lcb.wa.gov/LicenseeListDetails.asp?typeLic=${typeLic}&PrivDesc=${encodedDesc}`;
    
    const options = {
      hostname: 'licensinginfo.lcb.wa.gov',
      path: `/LicenseeListDetails.asp?typeLic=${typeLic}&PrivDesc=${encodedDesc}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ data, url }));
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

function parseLicenseTable(html) {
  const businesses = [];
  
  // The LCB site uses <td valign="top" bgcolor=white> format
  // Match rows with license data (skip header row)
  const rowRegex = /<td[^>]*valign="top"[^>]*>\s*(?:<font[^>]*>)?\s*(?:&nbsp;)?(?:<b>)?([^<]+)(?:<\/b>)?(?:<\/font>)?\s*<\/td>\s*<td[^>]*valign="top"[^>]*>\s*(?:<font[^>]*>)?\s*(?:<b>)?([^<]+)(?:<\/b>)?(?:<\/font>)?\s*<\/td>\s*<td[^>]*valign="top"[^>]*>\s*(?:<font[^>]*>)?\s*([^<]+)(?:<\/font>)?\s*<\/td>\s*<td[^>]*valign="top"[^>]*>\s*(?:<font[^>]*>)?\s*([^<]+)(?:<\/font>)?\s*<\/td>\s*<td[^>]*valign="top"[^>]*>\s*(?:<font[^>]*>)?\s*([^<]+)(?:<\/font>)?\s*<\/td>\s*<td[^>]*valign="top"[^>]*>\s*(?:<font[^>]*>)?\s*([^<]+)(?:<\/font>)?\s*<\/td>/gi;
  
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const licenseNum = stripHtml(match[1]).trim();
    const licensee = stripHtml(match[2]).trim();
    const address = stripHtml(match[3]).trim();
    const city = stripHtml(match[4]).trim();
    const state = stripHtml(match[5]).trim();
    const zip = stripHtml(match[6]).trim();
    
    if (licenseNum && licenseNum !== 'License #' && /^\d+$/.test(licenseNum)) {
      businesses.push({
        license_number: licenseNum,
        business_name: licensee,
        address: address,
        city: city,
        state: state,
        zip: zip.trim(),
        full_address: `${address}, ${city}, ${state} ${zip.trim()}`
      });
    }
  }
  
  return businesses;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function filterByTerritory(businesses) {
  return businesses.filter(b => TERRITORY_ZIPS.includes(b.zip));
}

function loadPreviousRun() {
  try {
    if (fs.existsSync(PREVIOUS_RUN_FILE)) {
      return JSON.parse(fs.readFileSync(PREVIOUS_RUN_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading previous run:', e.message);
  }
  return { businesses: [], timestamp: null };
}

function saveRun(businesses) {
  const data = {
    businesses,
    timestamp: new Date().toISOString(),
    count: businesses.length
  };
  fs.writeFileSync(PREVIOUS_RUN_FILE, JSON.stringify(data, null, 2));
}

function findNewBusinesses(current, previous) {
  const previousKeys = new Set(previous.map(b => `${b.license_number}-${b.business_name}`));
  return current.filter(b => !previousKeys.has(`${b.license_number}-${b.business_name}`));
}

async function scrapeAllLicenseTypes() {
  const allBusinesses = [];
  
  console.log('Scraping LCB license lists...\n');
  
  for (const licenseType of TARGET_LICENSE_TYPES) {
    process.stdout.write(`  ${licenseType.name}... `);
    try {
      const { data } = await fetchLicenseList(licenseType.code, licenseType.name);
      const businesses = parseLicenseTable(data);
      const territoryBusinesses = filterByTerritory(businesses);
      
      // Add license type to each business
      territoryBusinesses.forEach(b => {
        b.license_type = licenseType.name;
        b.scraped_at = new Date().toISOString();
      });
      
      allBusinesses.push(...territoryBusinesses);
      process.stdout.write(`${territoryBusinesses.length} in territory (${businesses.length} total)\n`);
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      process.stdout.write(`ERROR: ${error.message}\n`);
    }
  }
  
  return allBusinesses;
}

function formatNotification(newBusinesses, allCount) {
  if (newBusinesses.length === 0) {
    return `📋 LCB Daily Scan Complete\n\nNo new businesses found today.\nTotal tracked: ${allCount} licenses in territory.`;
  }
  
  let message = `🍺 NEW LCB LICENSES FOUND!\n\n`;
  message += `${newBusinesses.length} new business${newBusinesses.length > 1 ? 'es' : ''} in your territory:\n\n`;
  
  // Group by city
  const byCity = {};
  for (const b of newBusinesses) {
    if (!byCity[b.city]) byCity[b.city] = [];
    byCity[b.city].push(b);
  }
  
  for (const [city, businesses] of Object.entries(byCity)) {
    message += `📍 ${city}:\n`;
    for (const b of businesses.slice(0, 5)) { // Limit to 5 per city
      message += `  • ${b.business_name}\n`;
      message += `    ${b.address}\n`;
    }
    if (businesses.length > 5) {
      message += `    ...and ${businesses.length - 5} more\n`;
    }
    message += '\n';
  }
  
  message += `Total territory licenses: ${allCount}`;
  return message;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldNotify = args.includes('--notify');
  const shouldSave = args.includes('--save') || shouldNotify;
  
  console.log('=== LCB New Application Scraper ===\n');
  console.log(`Territory: ${TERRITORY_ZIPS.length} ZIP codes`);
  console.log(`License types: ${TARGET_LICENSE_TYPES.length}\n`);
  
  // Scrape current data
  const currentBusinesses = await scrapeAllLicenseTypes();
  console.log(`\nTotal businesses in territory: ${currentBusinesses.length}`);
  
  // Load previous run
  const previousRun = loadPreviousRun();
  console.log(`Previous run: ${previousRun.businesses.length} businesses (${previousRun.timestamp || 'never'})`);
  
  // Find new businesses
  const newBusinesses = findNewBusinesses(currentBusinesses, previousRun.businesses);
  console.log(`\n🆕 NEW BUSINESSES: ${newBusinesses.length}`);
  
  // Display new businesses
  if (newBusinesses.length > 0) {
    console.log('\n--- NEW BUSINESSES ---');
    for (const b of newBusinesses) {
      console.log(`\n${b.business_name}`);
      console.log(`  ${b.address}, ${b.city} ${b.zip}`);
      console.log(`  License: ${b.license_number} (${b.license_type})`);
    }
  }
  
  // Save current run
  if (shouldSave) {
    saveRun(currentBusinesses);
    console.log(`\n✅ Saved to: ${PREVIOUS_RUN_FILE}`);
  }
  
  // Output notification text
  if (shouldNotify) {
    const notification = formatNotification(newBusinesses, currentBusinesses.length);
    console.log('\n--- NOTIFICATION ---\n');
    console.log(notification);
    
    // Save notification to file for cron to pick up
    const notificationFile = path.join(DATA_DIR, 'notification.txt');
    fs.writeFileSync(notificationFile, notification);
    console.log(`\nNotification saved to: ${notificationFile}`);
  }
  
  // Save CSV of new businesses
  if (newBusinesses.length > 0) {
    const csvFile = path.join(DATA_DIR, `new-businesses-${new Date().toISOString().split('T')[0]}.csv`);
    const headers = 'business_name,address,city,state,zip,license_number,license_type,scraped_at\n';
    const rows = newBusinesses.map(b => 
      `"${b.business_name}","${b.address}","${b.city}","${b.state}","${b.zip}","${b.license_number}","${b.license_type}","${b.scraped_at}"`
    ).join('\n');
    fs.writeFileSync(csvFile, headers + rows);
    console.log(`\nNew businesses CSV: ${csvFile}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
