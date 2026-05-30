#!/usr/bin/env node
/**
 * Push today's visits to GHL as contacts
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';
const GHL_API_BASE = 'https://services.leadconnectorhq.com';

if (!GHL_TOKEN) {
  console.error('❌ GHL_COMCAST_TOKEN not set');
  process.exit(1);
}

const dbPath = path.join(__dirname, 'comcast.db');
const db = new sqlite3.Database(dbPath);

async function createGHLContact(visit) {
  const payload = {
    locationId: GHL_LOCATION_ID,
    firstName: visit.contact_name?.split(' ')[0] || 'Unknown',
    lastName: visit.contact_name?.split(' ').slice(1).join(' ') || '',
    name: visit.business_name,
    email: visit.email || undefined,
    phone: visit.phone || undefined,
    address1: visit.address,
    city: visit.city,
    state: visit.state,
    postalCode: visit.zip_code,
    source: 'Comcast Field Visit',
    tags: ['Comcast', 'Field Visit', '2026-05-26'],
    customFields: [
      { key: 'business_name', field_value: visit.business_name },
      { key: 'visit_status', field_value: visit.visit_status },
      { key: 'visit_notes', field_value: visit.notes }
    ]
  };

  try {
    const response = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();
    return { success: true, contactId: data.contact?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('🚀 Pushing today\'s visits to GHL...\n');

  const today = new Date().toISOString().split('T')[0];
  
  db.all(
    `SELECT * FROM business_visits WHERE date(created_at) = ? AND (synced_to_ghl = 0 OR synced_to_ghl IS NULL)`,
    [today],
    async (err, visits) => {
      if (err) {
        console.error('❌ DB error:', err);
        db.close();
        return;
      }

      if (visits.length === 0) {
        console.log('ℹ️ No unsynced visits found for today');
        db.close();
        return;
      }

      console.log(`📍 Found ${visits.length} visits to sync\n`);

      let success = 0;
      let failed = 0;

      for (const visit of visits) {
        process.stdout.write(`⏳ ${visit.business_name}... `);
        
        const result = await createGHLContact(visit);
        
        if (result.success) {
          console.log(`✅ Created (${result.contactId})`);
          
          // Mark as synced
          db.run(
            'UPDATE business_visits SET synced_to_ghl = 1, ghl_contact_id = ? WHERE id = ?',
            [result.contactId, visit.id]
          );
          success++;
        } else {
          console.log(`❌ ${result.error}`);
          
          // Store error
          db.run(
            'UPDATE business_visits SET last_sync_error = ? WHERE id = ?',
            [result.error.substring(0, 255), visit.id]
          );
          failed++;
        }
      }

      console.log(`\n📊 Results: ${success} created, ${failed} failed`);
      db.close();
    }
  );
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
