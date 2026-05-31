#!/usr/bin/env node
/**
 * Geocode visits in MongoDB that are missing lat/lng coordinates
 * Uses Nominatim (OpenStreetMap) for free geocoding
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;

// Rate limiting - Nominatim requires max 1 request per second
const DELAY_MS = 1100;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeAddress(address, city, zip) {
  const fullAddress = `${address}, ${city || 'Tacoma'}, WA ${zip || ''}`.trim();
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DaequanAI-ComcastCRM/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (err) {
    console.error(`   Geocoding error for "${fullAddress}": ${err.message}`);
    return null;
  }
}

async function geocodeVisits() {
  console.log('🌍 Geocoding Visits\n');
  console.log('='.repeat(50));
  
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not set');
    process.exit(1);
  }
  
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('visits');
    
    // Find visits without coordinates
    const visits = await collection.find({
      $or: [
        { lat: null },
        { lng: null },
        { lat: { $exists: false } },
        { lng: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`📍 Found ${visits.length} visits needing geocoding\n`);
    
    let success = 0;
    let failed = 0;
    let skipped = 0;
    
    for (let i = 0; i < visits.length; i++) {
      const visit = visits[i];
      const businessName = visit.businessName || 'Unknown';
      
      // Skip if no address
      if (!visit.address && !visit.zip) {
        console.log(`[${i + 1}/${visits.length}] ⏭️  Skipped: ${businessName} (no address)`);
        skipped++;
        continue;
      }
      
      console.log(`[${i + 1}/${visits.length}] 🌍 Geocoding: ${businessName}`);
      console.log(`   Address: ${visit.address}, ${visit.city}, ${visit.zip}`);
      
      const coords = await geocodeAddress(visit.address, visit.city, visit.zip);
      
      if (coords) {
        await collection.updateOne(
          { _id: visit._id },
          { $set: { lat: coords.lat, lng: coords.lng, updatedAt: new Date() } }
        );
        console.log(`   ✅ Updated: ${coords.lat}, ${coords.lng}`);
        success++;
      } else {
        console.log(`   ❌ Failed to geocode`);
        failed++;
      }
      
      // Rate limiting
      if (i < visits.length - 1) {
        await sleep(DELAY_MS);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 GEOCODING SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed:  ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total:   ${visits.length}`);
    
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run geocoding
geocodeVisits();
