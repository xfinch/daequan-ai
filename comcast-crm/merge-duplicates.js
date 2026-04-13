#!/usr/bin/env node
/**
 * Merge duplicate visits in MongoDB
 * - Keeps the newest record
 * - Merges notes from all duplicates
 * - Deletes the older duplicates
 */

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL || process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set');
  process.exit(1);
}

async function mergeDuplicates() {
  const { MongoClient, ObjectId } = require('mongodb');
  
  console.log('🚀 Merging duplicate visits\n');
  console.log('='.repeat(60));
  
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  
  const collection = client.db().collection('visits');
  
  // Get all visits
  const visits = await collection.find({}).toArray();
  console.log(`📊 Found ${visits.length} total visits`);
  
  // Group by business name + zip
  const byKey = {};
  for (const v of visits) {
    const key = `${v.businessName}|${v.zip || ''}`;
    if (!byKey[key]) byKey[key] = [];
    byKey[key].push(v);
  }
  
  // Find duplicates
  const duplicates = Object.entries(byKey).filter(([key, items]) => items.length > 1);
  console.log(`📋 Found ${duplicates.length} duplicate groups`);
  
  let merged = 0;
  let deleted = 0;
  
  for (const [key, items] of duplicates) {
    const [businessName] = key.split('|');
    console.log(`\n🔀 ${businessName}: ${items.length} duplicates`);
    
    // Sort by createdAt (newest first)
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    const keep = items[0];
    const toDelete = items.slice(1);
    
    // Merge notes
    const allNotes = items.map(v => v.notes).filter(n => n && n.trim());
    const uniqueNotes = [...new Set(allNotes)];
    const mergedNotes = uniqueNotes.join('\n\n---\n\n');
    
    if (uniqueNotes.length > 1) {
      console.log(`   📝 Merging ${uniqueNotes.length} unique notes`);
      await collection.updateOne(
        { _id: keep._id },
        { $set: { notes: mergedNotes, updatedAt: new Date() } }
      );
    }
    
    // Delete duplicates
    for (const dup of toDelete) {
      await collection.deleteOne({ _id: dup._id });
      console.log(`   🗑️  Deleted: ${dup._id.toString().slice(0, 8)}...`);
      deleted++;
    }
    
    merged++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MERGE SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Merged:  ${merged} groups`);
  console.log(`🗑️  Deleted: ${deleted} duplicates`);
  
  const finalCount = await collection.countDocuments();
  console.log(`📁 Final visit count: ${finalCount}`);
  
  await client.close();
  console.log('\n🔌 Done');
}

mergeDuplicates().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
