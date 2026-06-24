#!/usr/bin/env node
/**
 * LCB (Liquor Control Board) Business Scraper for Comcast Territory
 * 
 * Fetches new liquor licenses from data.wa.gov API for target ZIP codes
 * and outputs prospects for the Comcast CRM.
 * 
 * Usage:
 *   node scrape-lcb.js [--days=30] [--format=json|csv]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Comcast Territory ZIP codes
const TERRITORY_ZIPS = [
  // Tacoma
  '98402', '98403', '98404', '98405', '98406', '98407', '98408', '98409',
  '98418', '98421', '98422', '98424', '98444', '98445', '98446', '98447',
  '98465', '98466',
  // Buckley, Bonney Lake, Carbonado
  '98321', '98391', '98323'
];

// High-value license types for Comcast prospecting
const TARGET_LICENSE_TYPES = [
  'S/B/W Restaurant Lounge (+)',
  'S/B/W Restaurant Lounge (-)',
  'S/B/W Restaurant - Wine',
  'B/W Restaurant - Wine',
  'Microbrewery',
  'Hotel',
  'Tavern - Beer/Wine',
  'Spirits/Beer/Wine Restaurant Lounge',
  'Catering',
  'Private Club - Spirits/Beer/Wine',
  'Non-Profit Arts Organization'
];

// Socrata API endpoint
const API_BASE = 'data.wa.gov';
const API_DATASET = '9dee-kzm5'; // LCB Liquor Renewal dataset

function fetchFromAPI(queryString) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: `/resource/${API_DATASET}.json?${queryString}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Comcast-CRM-Scraper/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function fetchAllLicensesForZip(zipCode, limit = 1000) {
  const query = new URLSearchParams({
    '$limit': limit.toString(),
    'zipcode': zipCode
  });
  
  try {
    return await fetchFromAPI(query.toString());
  } catch (error) {
    console.error(`Error fetching ZIP ${zipCode}:`, error.message);
    return [];
  }
}

async function fetchAllLicenses() {
  const allLicenses = [];
  
  console.log(`Fetching licenses for ${TERRITORY_ZIPS.length} ZIP codes...`);
  
  for (const zip of TERRITORY_ZIPS) {
    process.stdout.write(`  ${zip}... `);
    const licenses = await fetchAllLicensesForZip(zip);
    process.stdout.write(`${licenses.length} found\n`);
    allLicenses.push(...licenses);
    
    // Rate limiting - be nice to the API
    await new Promise(r => setTimeout(r, 100));
  }
  
  return allLicenses;
}

function filterHighValueProspects(licenses) {
  return licenses.filter(license => {
    // Check if any privilege description matches our target types
    for (let i = 1; i <= 6; i++) {
      const privDesc = license[`privdesc${i.toString().padStart(2, '0')}`];
      if (privDesc && TARGET_LICENSE_TYPES.some(type => 
        privDesc.toLowerCase().includes(type.toLowerCase()) ||
        type.toLowerCase().includes(privDesc.toLowerCase())
      )) {
        return true;
      }
    }
    return false;
  });
}

function formatProspect(license) {
  const privileges = [];
  for (let i = 1; i <= 6; i++) {
    const privDesc = license[`privdesc${i.toString().padStart(2, '0')}`];
    if (privDesc) privileges.push(privDesc);
  }
  
  return {
    business_name: license.tradename || license.businessname || 'Unknown',
    address: license.streetaddress,
    city: license.city,
    state: license.state,
    zip: license.zipcode,
    phone: license.dayphone,
    license_number: license.license,
    ubi: license.ubi,
    license_type: license.l_a_type,
    privileges: privileges.join('; '),
    renewal_date: license.renewaldate,
    latitude: license.location?.latitude,
    longitude: license.location?.longitude,
    source: 'LCB_API',
    scraped_at: new Date().toISOString()
  };
}

function toCSV(prospects) {
  if (prospects.length === 0) return '';
  
  const headers = Object.keys(prospects[0]);
  const rows = prospects.map(p => 
    headers.map(h => {
      const val = p[h] || '';
      // Escape values with commas or quotes
      if (String(val).includes(',') || String(val).includes('"')) {
        return `"${String(val).replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const format = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'json';
  const outputFile = args.find(a => a.startsWith('--output='))?.split('=')[1];
  
  console.log('=== LCB Business License Scraper ===\n');
  
  // Fetch all licenses
  const allLicenses = await fetchAllLicenses();
  console.log(`\nTotal licenses fetched: ${allLicenses.length}`);
  
  // Filter for high-value prospects
  const prospects = filterHighValueProspects(allLicenses);
  console.log(`High-value prospects: ${prospects.length}`);
  
  // Format prospects
  const formattedProspects = prospects.map(formatProspect);
  
  // Sort by city and business name
  formattedProspects.sort((a, b) => {
    if (a.city !== b.city) return a.city.localeCompare(b.city);
    return a.business_name.localeCompare(b.business_name);
  });
  
  // Output
  let output;
  if (format === 'csv') {
    output = toCSV(formattedProspects);
  } else {
    output = JSON.stringify(formattedProspects, null, 2);
  }
  
  if (outputFile) {
    fs.writeFileSync(outputFile, output);
    console.log(`\nOutput written to: ${outputFile}`);
  } else {
    console.log('\n--- OUTPUT ---\n');
    console.log(output);
  }
  
  // Summary by city
  console.log('\n=== Summary by City ===');
  const byCity = {};
  for (const p of formattedProspects) {
    byCity[p.city] = (byCity[p.city] || 0) + 1;
  }
  for (const [city, count] of Object.entries(byCity).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${city}: ${count}`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
