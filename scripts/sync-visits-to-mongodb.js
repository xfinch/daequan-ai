#!/usr/bin/env node
/**
 * Sync visits from SQLite to MongoDB
 * Run this before deploying to Railway to ensure MongoDB has all data
 */

const sqlite3 = require('sqlite3');
const mongoose = require('mongoose');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI, MONGO_URL, or MONGO_PUBLIC_URL must be set');
  process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'comcast-crm', 'comcast.db');

// Visit Schema (same as in lib/db.ts)
const VisitSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  contactName: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  lat: Number,
  lng: Number,
  status: { type: String, default: 'interested' },
  notes: String,
  ghlContactId: String,
  missingFields: [String],
  needsUpdate: { type: Boolean, default: false },
}, { timestamps: true });

const Visit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);

async function syncVisits() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  
  console.log('Opening SQLite database...');
  const db = new sqlite3.Database(dbPath);
  
  // Get all visits from SQLite
  const visits = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM business_visits ORDER BY id', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log(`Found ${visits.length} visits in SQLite`);
  
  // Clear existing visits in MongoDB (optional - remove if you want to keep existing)
  console.log('Clearing existing visits in MongoDB...');
  await Visit.deleteMany({});
  
  // Transform and insert visits
  let inserted = 0;
  let errors = 0;
  
  for (const visit of visits) {
    try {
      await Visit.create({
        businessName: visit.business_name,
        contactName: visit.contact_name,
        phone: visit.phone,
        email: visit.email,
        address: visit.address,
        city: visit.city,
        state: visit.state || 'WA',
        zip: visit.zip_code,
        lat: visit.lat,
        lng: visit.lng,
        status: visit.visit_status || 'interested',
        notes: visit.notes,
        ghlContactId: visit.ghl_contact_id,
        missingFields: visit.missingFields ? JSON.parse(visit.missingFields) : [],
        needsUpdate: visit.needsUpdate === 1,
        createdAt: visit.visit_date || visit.created_at,
        updatedAt: visit.updated_at
      });
      inserted++;
      process.stdout.write(`\rInserted: ${inserted}/${visits.length}`);
    } catch (err) {
      console.error(`\nError inserting visit ${visit.id}:`, err.message);
      errors++;
    }
  }
  
  console.log(`\n\nSync complete:`);
  console.log(`  - Total visits: ${visits.length}`);
  console.log(`  - Inserted: ${inserted}`);
  console.log(`  - Errors: ${errors}`);
  
  db.close();
  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
}

syncVisits().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
