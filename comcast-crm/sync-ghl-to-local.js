#!/usr/bin/env node
/**
 * Sync GHL Comcast Prospects to Local Map Database
 * Backfills SQLite with prospects from GHL pipeline
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'comcast.db');
const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';

// Results tracking
const results = {
  added: [],
  existing: [],
  failed: []
};

/**
 * Fetch all contacts from GHL Comcast location
 */
async function fetchGHLContacts() {
  const contacts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 5) {
    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_TOKEN}`,
          'Version': '2021-04-15'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.status}`);
    }

    const data = await response.json();
    contacts.push(...(data.contacts || []));
    
    hasMore = data.meta?.nextPageUrl ? true : false;
    page++;
  }

  return contacts;
}

/**
 * Fetch all opportunities from GHL
 */
async function fetchGHLOpportunities() {
  const response = await fetch(
    `https://services.leadconnectorhq.com/opportunities/?locationId=${GHL_LOCATION_ID}&limit=100`,
    {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch opportunities: ${response.status}`);
  }

  const data = await response.json();
  return data.opportunities || [];
}

/**
 * Check if contact exists in local DB
 */
function checkExistingContact(db, email) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM business_visits WHERE email = ?',
      [email],
      (err, row) => {
        if (err) reject(err);
        resolve(row);
      }
    );
  });
}

/**
 * Insert contact into local DB
 */
function insertContact(db, contact, opportunity) {
  return new Promise((resolve, reject) => {
    // Map GHL stage to visit_status
    const stageMap = {
      'Door Knock': 'door-knock',
      'Initial Contact': 'interested',
      'Needs Analysis': 'interested',
      'Second Review': 'interested',
      'Proposal Sent': 'interested',
      'Contract Signed': 'customer'
    };

    // Get stage name from opportunity if available
    let status = 'interested';
    if (opportunity) {
      // We'd need to fetch stage names, but for now use tags
      if (contact.tags?.includes('hot-lead')) status = 'interested';
      if (contact.tags?.includes('follow-up-later')) status = 'followup';
    }

    const insert = `
      INSERT INTO business_visits (
        ghl_contact_id, ghl_location_id, business_name, contact_name,
        phone, email, address, city, state, zip_code,
        website, visit_status, notes, source, synced_to_ghl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(insert, [
      contact.id,
      GHL_LOCATION_ID,
      contact.companyName || contact.contactName || 'Unknown Business',
      contact.contactName || '',
      contact.phone || '',
      contact.email || '',
      contact.address1 || '',
      contact.city || 'Tacoma',
      contact.state || 'WA',
      contact.postalCode || '',
      contact.website || '',
      status,
      `Synced from GHL. Tags: ${(contact.tags || []).join(', ')}`,
      'GHL Sync',
      1
    ], function(err) {
      if (err) reject(err);
      resolve(this.lastID);
    });
  });
}

/**
 * Main sync function
 */
async function syncToLocalDB() {
  console.log('🚀 Syncing GHL Prospects to Local Map Database\n');

  if (!GHL_TOKEN) {
    console.error('❌ GHL_COMCAST_TOKEN not set');
    process.exit(1);
  }

  // Open database
  const db = new sqlite3.Database(DB_PATH);

  try {
    // Fetch from GHL
    console.log('📥 Fetching contacts from GHL...');
    const contacts = await fetchGHLContacts();
    console.log(`   Found ${contacts.length} contacts`);

    console.log('📥 Fetching opportunities from GHL...');
    const opportunities = await fetchGHLOpportunities();
    console.log(`   Found ${opportunities.length} opportunities`);

    // Create opportunity lookup by contact ID
    const oppByContact = {};
    opportunities.forEach(opp => {
      if (opp.contactId) {
        oppByContact[opp.contactId] = opp;
      }
    });

    // Sync each contact
    console.log('\n💾 Syncing to local database...\n');
    
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const businessName = contact.companyName || contact.contactName || 'Unknown';
      
      console.log(`[${i + 1}/${contacts.length}] ${businessName}`);

      try {
        // Skip if no email
        if (!contact.email) {
          console.log('   ⏭️  Skipped: No email');
          continue;
        }

        // Check if already exists
        const existing = await checkExistingContact(db, contact.email);
        if (existing) {
          console.log('   ⚪ Already exists in local DB');
          results.existing.push({ businessName, id: existing.id });
          continue;
        }

        // Find matching opportunity
        const opportunity = oppByContact[contact.id];

        // Insert new
        const localId = await insertContact(db, contact, opportunity);
        console.log(`   ✅ Added to local DB (ID: ${localId})`);
        results.added.push({ businessName, localId, ghlId: contact.id });

        // Small delay
        await new Promise(r => setTimeout(r, 100));

      } catch (err) {
        console.error(`   ❌ Error: ${err.message}`);
        results.failed.push({ businessName, error: err.message });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Added: ${results.added.length}`);
    console.log(`⚪ Existing: ${results.existing.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    db.close();
  }
}

// Run sync
syncToLocalDB();
