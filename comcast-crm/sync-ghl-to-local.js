#!/usr/bin/env node
/**
 * Sync GHL Comcast Prospects to Local Map Database
 * Backfills SQLite with prospects from GHL pipeline
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'comcast.db');

// Get token from environment or launchctl
let GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
if (!GHL_TOKEN || GHL_TOKEN === 'FROM_LAUNCHCTL') {
  // Try to get from launchctl when running via LaunchAgent
  try {
    const { execSync } = require('child_process');
    GHL_TOKEN = execSync('launchctl getenv GHL_COMCAST_TOKEN', { encoding: 'utf8' }).trim();
  } catch (e) {
    GHL_TOKEN = null;
  }
}

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

  while (hasMore && page <= 10) {
    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100&page=${page}`,
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
    const pageContacts = data.contacts || [];
    
    if (pageContacts.length === 0) {
      hasMore = false;
    } else {
      contacts.push(...pageContacts);
      hasMore = data.meta?.nextPageUrl ? true : false;
      page++;
    }
  }

  return contacts;
}

/**
 * Fetch all opportunities from GHL
 */
async function fetchGHLOpportunities() {
  try {
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
      console.log(`   ⚠️  Opportunities endpoint returned ${response.status}, continuing without opportunity data`);
      return [];
    }

    const data = await response.json();
    return data.opportunities || [];
  } catch (err) {
    console.log(`   ⚠️  Could not fetch opportunities: ${err.message}, continuing without opportunity data`);
    return [];
  }
}

/**
 * Check if contact exists in local DB by email or GHL contact ID
 */
function checkExistingContact(db, email, ghlContactId) {
  return new Promise((resolve, reject) => {
    // First check by GHL contact ID (most reliable)
    if (ghlContactId) {
      db.get(
        'SELECT id FROM business_visits WHERE ghl_contact_id = ?',
        [ghlContactId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          if (row) {
            resolve(row);
            return;
          }
          // If not found by GHL ID, check by email
          db.get(
            'SELECT id FROM business_visits WHERE email = ?',
            [email],
            (err2, row2) => {
              if (err2) reject(err2);
              resolve(row2);
            }
          );
        }
      );
    } else {
      // Just check by email if no GHL contact ID
      db.get(
        'SELECT id FROM business_visits WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    }
  });
}

/**
 * Extract visit_context from GHL custom fields
 */
function getVisitContext(contact) {
  if (!contact.customFields || !Array.isArray(contact.customFields)) {
    return '';
  }
  const visitContextField = contact.customFields.find(
    f => f.key === 'contact.visit_context' || f.id === 'JxkUDvOziE2UkuwY8Um3'
  );
  return visitContextField?.value || '';
}

/**
 * Extract clean notes from GHL (without sync metadata)
 */
function getCleanNotes(contact) {
  // If contact has notes in GHL, use those
  if (contact.notes && contact.notes.length > 0) {
    return contact.notes[0].body || '';
  }
  // Otherwise return empty - don't add "Synced from GHL" prefix
  return '';
}

/**
 * Insert contact into local DB
 */
function insertContact(db, contact, opportunity) {
  return new Promise((resolve, reject) => {
    // Map GHL stage to visit_status
    let status = 'interested';
    if (contact.tags?.includes('hot-lead')) status = 'interested';
    if (contact.tags?.includes('follow-up-later')) status = 'followup';
    if (contact.tags?.includes('customer')) status = 'customer';

    // Use GHL's dateAdded if available, otherwise use current timestamp
    const visitDate = contact.dateAdded 
      ? new Date(contact.dateAdded).toISOString().replace('T', ' ').split('.')[0]
      : new Date().toISOString().replace('T', ' ').split('.')[0];

    // Get visit context from custom fields
    const visitContext = getVisitContext(contact);
    
    // Get clean notes (without "Synced from GHL" prefix)
    const cleanNotes = getCleanNotes(contact);

    const insert = `
      INSERT INTO business_visits (
        ghl_contact_id, ghl_location_id, business_name, contact_name,
        phone, email, address, city, state, zip_code,
        website, visit_status, notes, visit_context, source, synced_to_ghl, visit_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      cleanNotes,
      visitContext,
      'GHL Sync',
      1,
      visitDate
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
        // Check if already exists (by GHL ID or email)
        const existing = await checkExistingContact(db, contact.email, contact.id);
        
        // Skip if no email AND no GHL ID (can't identify unique contact)
        if (!contact.email && !contact.id) {
          console.log('   ⏭️  Skipped: No email and no GHL ID');
          continue;
        }
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
