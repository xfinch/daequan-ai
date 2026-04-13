#!/usr/bin/env node
/**
 * Sync SQLite local visits to MongoDB (Railway)
 * Pushes all business_visits to MongoDB for map display
 */

const { MongoClient } = require('mongodb');
const sqlite3 = require('sqlite3').verbose();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;

const results = {
  added: [],
  updated: [],
  skipped: [],
  failed: []
};

async function syncSQLiteToMongoDB() {
  console.log('🚀 SQLite → MongoDB Sync\n');
  console.log('='.repeat(50));
  
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not set');
    process.exit(1);
  }
  
  // Open SQLite
  const db = new sqlite3.Database('./comcast.db');
  
  // Connect MongoDB
  console.log('📡 Connecting to MongoDB...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('   ✅ Connected\n');
  
  const collection = client.db().collection('visits');
  
  // Fetch all visits from SQLite
  const visits = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        id,
        ghl_contact_id,
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
        visit_date,
        notes
      FROM business_visits
      ORDER BY visit_date DESC
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log(`📊 Found ${visits.length} visits in SQLite\n`);
  
  // Sync each visit
  for (let i = 0; i < visits.length; i++) {
    const visit = visits[i];
    console.log(`[${i + 1}/${visits.length}] ${visit.business_name}`);
    
    try {
      // Build query - match by business name + zip or GHL contact ID
      const query = { $or: [] };
      if (visit.ghl_contact_id) {
        query.$or.push({ ghlContactId: visit.ghl_contact_id });
      }
      query.$or.push({ 
        businessName: visit.business_name,
        zip: visit.zip_code
      });
      
      const existing = await collection.findOne(query);
      
      const record = {
        sqliteId: visit.id,
        ghlContactId: visit.ghl_contact_id,
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
        visitDate: visit.visit_date,
        notes: visit.notes,
        updatedAt: new Date()
      };
      
      if (existing) {
        await collection.updateOne(
          { _id: existing._id },
          { $set: record }
        );
        results.updated.push({ businessName: visit.business_name, id: existing._id.toString() });
        console.log(`   🔄 Updated`);
      } else {
        record.createdAt = new Date();
        const result = await collection.insertOne(record);
        results.added.push({ businessName: visit.business_name, id: result.insertedId.toString() });
        console.log(`   ✅ Added`);
      }
    } catch (err) {
      results.failed.push({ businessName: visit.business_name, error: err.message });
      console.log(`   ❌ Failed: ${err.message}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Added:    ${results.added.length}`);
  console.log(`🔄 Updated:  ${results.updated.length}`);
  console.log(`❌ Failed:   ${results.failed.length}`);
  console.log(`📊 Total:    ${visits.length}`);
  
  // Verify count in MongoDB
  const mongoCount = await collection.countDocuments();
  console.log(`\n📁 MongoDB visits collection: ${mongoCount} documents`);
  
  db.close();
  await client.close();
  console.log('\n🔌 Done');
}

syncSQLiteToMongoDB().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
