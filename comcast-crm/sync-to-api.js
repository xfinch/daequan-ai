#!/usr/bin/env node
/**
 * Push all SQLite visits to daequanai.com API
 * This syncs local visits to the deployed MongoDB
 */

const sqlite3 = require('sqlite3').verbose();

const API_URL = 'https://daequanai.com/api/visits';

async function syncVisitsToAPI() {
  console.log('🚀 SQLite → daequanai.com API Sync\n');
  console.log('='.repeat(50));
  
  // Open SQLite
  const db = new sqlite3.Database('./comcast.db');
  
  // Fetch all visits from SQLite
  const visits = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        business_name,
        contact_name,
        phone,
        email,
        address,
        city,
        state,
        zip_code,
        lat,
        lng,
        visit_status,
        notes
      FROM business_visits
      ORDER BY visit_date DESC
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log(`📊 Found ${visits.length} visits in SQLite\n`);
  
  const results = {
    added: 0,
    failed: 0,
    errors: []
  };
  
  // Push each visit to API
  for (let i = 0; i < visits.length; i++) {
    const visit = visits[i];
    console.log(`[${i + 1}/${visits.length}] ${visit.business_name}`);
    
    try {
      const payload = {
        businessName: visit.business_name,
        contactName: visit.contact_name,
        phone: visit.phone,
        email: visit.email,
        address: visit.address,
        city: visit.city || 'Tacoma',
        state: visit.state || 'WA',
        zip: visit.zip_code,
        lat: visit.lat,
        lng: visit.lng,
        status: visit.visit_status || 'interested',
        notes: visit.notes
      };
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log(`   ✅ Added`);
        results.added++;
      } else {
        const error = await response.text();
        console.log(`   ❌ Failed: ${error}`);
        results.failed++;
        results.errors.push({ business: visit.business_name, error });
      }
      
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 100));
      
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message}`);
      results.failed++;
      results.errors.push({ business: visit.business_name, error: err.message });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Added:   ${results.added}`);
  console.log(`❌ Failed:  ${results.failed}`);
  console.log(`📊 Total:   ${visits.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(({ business, error }) => {
      console.log(`  - ${business}: ${error}`);
    });
  }
  
  db.close();
  console.log('\n🔌 Done');
}

syncVisitsToAPI().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
