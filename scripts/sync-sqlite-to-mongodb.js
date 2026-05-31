#!/usr/bin/env node
/**
 * Sync geocoded visits from SQLite to MongoDB
 * Updates lat/lng for visits that now have coordinates
 */

const { MongoClient } = require('mongodb');
const sqlite3 = require('sqlite3').verbose();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;
const SQLITE_PATH = '/Users/xfinch/.openclaw/workspace/comcast-crm/comcast.db';

async function syncToMongoDB() {
  console.log('🔄 Syncing geocoded visits from SQLite to MongoDB\n');
  console.log('='.repeat(50));
  
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not set');
    process.exit(1);
  }
  
  // Open SQLite
  const sqlite = new sqlite3.Database(SQLITE_PATH, sqlite3.OPEN_READONLY);
  
  // Connect to MongoDB
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('visits');
    
    // Get geocoded visits from SQLite
    const visits = await new Promise((resolve, reject) => {
      sqlite.all(
        'SELECT ghl_contact_id, business_name, lat, lng FROM business_visits WHERE lat IS NOT NULL AND lng IS NOT NULL AND ghl_contact_id IS NOT NULL',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    console.log(`📍 Found ${visits.length} geocoded visits in SQLite\n`);
    
    let updated = 0;
    let failed = 0;
    
    for (const visit of visits) {
      try {
        // Update by ghlContactId
        const result = await collection.updateOne(
          { ghlContactId: visit.ghl_contact_id },
          { $set: { lat: visit.lat, lng: visit.lng, updatedAt: new Date() } }
        );
        
        if (result.matchedCount > 0) {
          console.log(`✅ Updated: ${visit.business_name} (${visit.lat}, ${visit.lng})`);
          updated++;
        } else {
          // Try by business name
          const result2 = await collection.updateOne(
            { businessName: visit.business_name },
            { $set: { lat: visit.lat, lng: visit.lng, updatedAt: new Date() } }
          );
          
          if (result2.matchedCount > 0) {
            console.log(`✅ Updated (by name): ${visit.business_name}`);
            updated++;
          } else {
            console.log(`⏭️  Not found in MongoDB: ${visit.business_name}`);
          }
        }
      } catch (err) {
        console.error(`❌ Failed to update ${visit.business_name}: ${err.message}`);
        failed++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Updated: ${updated}`);
    console.log(`❌ Failed:  ${failed}`);
    console.log(`📊 Total:   ${visits.length}`);
    
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  } finally {
    sqlite.close();
    await client.close();
    console.log('\n🔌 Disconnected');
  }
}

syncToMongoDB();
