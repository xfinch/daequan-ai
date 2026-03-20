#!/usr/bin/env node
/**
 * Sync GHL Comcast Prospects to MongoDB (Railway)
 * Restores 3-layer architecture: GHL ↔ SQLite ↔ MongoDB
 */

const { MongoClient, ObjectId } = require('mongodb');

// Configuration
const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;

// Results tracking
const results = {
  added: [],
  updated: [],
  skipped: [],
  failed: []
};

/**
 * Fetch all contacts from GHL
 */
async function fetchGHLContacts() {
  const contacts = [];
  let page = 1;
  let hasMore = true;

  console.log('📥 Fetching contacts from GHL (filtered by comcast-prospect tag)...');

  while (hasMore && page <= 10) {
    // Filter by tag to only get Comcast prospects
    const url = `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100&tags=comcast-prospect`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-04-15'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.status}`);
    }

    const data = await response.json();
    const pageContacts = data.contacts || [];
    contacts.push(...pageContacts);
    
    hasMore = data.meta?.nextPageUrl ? true : false;
    page++;
    
    process.stdout.write(`   Page ${page-1}: ${contacts.length} contacts\r`);
    
    // Stop if we got fewer than limit (no more pages)
    if (pageContacts.length < 100) {
      hasMore = false;
    }
  }

  console.log(`\n   ✅ Total: ${contacts.length} contacts`);
  return contacts;
}

/**
 * Fetch all opportunities from GHL
 */
async function fetchGHLOpportunities() {
  console.log('📥 Fetching opportunities from GHL...');
  
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
      console.log(`   ⚠️  Opportunities API failed (${response.status}), continuing without pipeline data`);
      return [];
    }

    const data = await response.json();
    const opportunities = data.opportunities || [];
    console.log(`   ✅ Total: ${opportunities.length} opportunities`);
    return opportunities;
  } catch (err) {
    console.log(`   ⚠️  Opportunities fetch failed: ${err.message}, continuing without pipeline data`);
    return [];
  }
}

/**
 * Transform GHL contact to MongoDB format
 */
function transformContact(contact, opportunity) {
  // Extract ZIP from address or tags
  let zipCode = contact.postalCode || '';
  if (!zipCode && contact.tags) {
    const zipTag = contact.tags.find(t => t.startsWith('zip-'));
    if (zipTag) zipCode = zipTag.replace('zip-', '');
  }
  
  // Determine status
  let status = 'interested';
  if (contact.tags) {
    if (contact.tags.includes('hot-lead')) status = 'interested';
    if (contact.tags.includes('follow-up-later')) status = 'followup';
    if (contact.tags.includes('customer')) status = 'customer';
    if (contact.tags.includes('not-interested')) status = 'not-interested';
  }
  if (opportunity?.status === 'closed') {
    status = 'closed';
  }
  
  // Extract name
  const firstName = contact.firstName || contact.first_name || '';
  const lastName = contact.lastName || contact.last_name || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || contact.name || '';
  
  return {
    ghlContactId: contact.id,
    businessName: contact.companyName || contact.company_name || fullName || 'Unknown Business',
    contactName: fullName,
    phone: contact.phone || '',
    email: contact.email || '',
    address: contact.address1 || contact.address || '',
    city: contact.city || 'Tacoma',
    state: contact.state || 'WA',
    zip: zipCode,
    website: contact.website || '',
    status: status,
    notes: `Synced from GHL. Tags: ${(contact.tags || []).join(', ')}`,
    lat: null,  // Will be geocoded separately
    lng: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Sync contact to MongoDB
 */
async function syncContact(collection, contact, opportunity) {
  const businessName = contact.companyName || contact.company_name || contact.name || 'Unknown';
  
  try {
    // Check if exists by email or GHL contact ID
    const query = { $or: [] };
    if (contact.email) query.$or.push({ email: contact.email });
    if (contact.id) query.$or.push({ ghlContactId: contact.id });
    
    if (query.$or.length === 0) {
      results.skipped.push({ businessName, reason: 'No email or GHL ID' });
      console.log(`   ⏭️  Skipped: ${businessName} (no identifier)`);
      return 'skipped';
    }
    
    const existing = await collection.findOne(query);
    const record = transformContact(contact, opportunity);
    
    if (existing) {
      // Update existing
      delete record.createdAt; // Don't overwrite createdAt
      await collection.updateOne(
        { _id: existing._id },
        { $set: record }
      );
      
      results.updated.push({ businessName, id: existing._id.toString() });
      console.log(`   🔄 Updated: ${businessName}`);
      return 'updated';
    } else {
      // Insert new
      const result = await collection.insertOne(record);
      results.added.push({ businessName, id: result.insertedId.toString() });
      console.log(`   ✅ Added: ${businessName}`);
      return 'added';
    }
    
  } catch (err) {
    results.failed.push({ businessName, error: err.message });
    console.log(`   ❌ Failed: ${businessName} - ${err.message}`);
    return 'failed';
  }
}

/**
 * Main sync function
 */
async function syncToMongoDB() {
  console.log('🚀 GHL → MongoDB Sync\n');
  console.log('='.repeat(50));
  
  // Validate environment
  if (!GHL_TOKEN) {
    console.error('❌ GHL_COMCAST_TOKEN not set');
    process.exit(1);
  }
  
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI (MONGODB_URI/MONGO_URL/MONGO_PUBLIC_URL/DATABASE_URL) not set');
    process.exit(1);
  }
  
  console.log('📡 Connecting to MongoDB...');
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('   ✅ Connected\n');
    
    const db = client.db();
    const collection = db.collection('visits');
    
    // Fetch from GHL
    const contacts = await fetchGHLContacts();
    const opportunities = await fetchGHLOpportunities();
    
    // Create opportunity lookup
    const oppByContact = {};
    opportunities.forEach(opp => {
      if (opp.contactId) {
        oppByContact[opp.contactId] = opp;
      }
    });
    
    console.log('\n💾 Syncing to MongoDB...\n');
    
    // Sync each contact
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const businessName = contact.companyName || contact.company_name || contact.name || 'Unknown';
      
      console.log(`[${i + 1}/${contacts.length}] ${businessName}`);
      
      const opportunity = oppByContact[contact.id];
      await syncContact(collection, contact, opportunity);
      
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 50));
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Added:    ${results.added.length}`);
    console.log(`🔄 Updated:  ${results.updated.length}`);
    console.log(`⏭️  Skipped: ${results.skipped.length}`);
    console.log(`❌ Failed:   ${results.failed.length}`);
    console.log(`📊 Total:    ${contacts.length}`);
    
    if (results.failed.length > 0) {
      console.log('\n❌ FAILED ITEMS:');
      results.failed.forEach(({ businessName, error }) => {
        console.log(`  - ${businessName}: ${error}`);
      });
    }
    
    // Save results
    const fs = require('fs');
    const resultsPath = require('path').join(__dirname, 'sync-mongodb-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run sync
syncToMongoDB();
