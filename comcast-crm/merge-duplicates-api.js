#!/usr/bin/env node
/**
 * Merge duplicate visits via API
 * - Fetches all visits
 * - Identifies duplicates
 * - Updates the newest with merged notes
 * - Deletes the older duplicates
 */

const API_URL = 'https://daequanai.com/api/visits';

async function mergeDuplicates() {
  console.log('🚀 Merging duplicate visits via API\n');
  console.log('='.repeat(60));
  
  // Fetch all visits
  console.log('📥 Fetching visits...');
  const res = await fetch(API_URL);
  const data = await res.json();
  const visits = data.visits;
  
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
  console.log(`📋 Found ${duplicates.length} duplicate groups\n`);
  
  let merged = 0;
  let deleted = 0;
  let errors = [];
  
  for (const [key, items] of duplicates) {
    const [businessName] = key.split('|');
    console.log(`🔀 ${businessName}: ${items.length} duplicates`);
    
    // Sort by createdAt (newest first)
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    const keep = items[0];
    const toDelete = items.slice(1);
    
    // Merge notes from all duplicates
    const allNotes = items.map(v => v.notes).filter(n => n && n.trim());
    const uniqueNotes = [...new Set(allNotes)];
    const mergedNotes = uniqueNotes.join('\n\n---\n\n');
    
    // Update the kept record with merged notes if there are multiple unique notes
    if (uniqueNotes.length > 1) {
      console.log(`   📝 Merging ${uniqueNotes.length} unique notes`);
      try {
        const updateRes = await fetch(`${API_URL}/${keep._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: mergedNotes })
        });
        if (!updateRes.ok) {
          throw new Error(`Update failed: ${await updateRes.text()}`);
        }
        console.log(`   ✅ Updated notes`);
      } catch (err) {
        console.log(`   ❌ Update failed: ${err.message}`);
        errors.push({ business: businessName, error: err.message });
      }
    }
    
    // Delete duplicates
    for (const dup of toDelete) {
      try {
        const deleteRes = await fetch(`${API_URL}/${dup._id}`, {
          method: 'DELETE'
        });
        if (deleteRes.ok) {
          console.log(`   🗑️  Deleted: ${dup._id.slice(0, 8)}...`);
          deleted++;
        } else {
          throw new Error(`Delete failed: ${await deleteRes.text()}`);
        }
      } catch (err) {
        console.log(`   ❌ Delete failed: ${err.message}`);
        errors.push({ business: businessName, id: dup._id, error: err.message });
      }
      
      // Small delay
      await new Promise(r => setTimeout(r, 100));
    }
    
    merged++;
    
    // Delay between groups
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MERGE SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Merged:  ${merged} groups`);
  console.log(`🗑️  Deleted: ${deleted} duplicates`);
  console.log(`❌ Errors:  ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(e => console.log(`  - ${e.business}: ${e.error}`));
  }
  
  // Fetch final count
  const finalRes = await fetch(API_URL);
  const finalData = await finalRes.json();
  console.log(`📁 Final visit count: ${finalData.visits.length}`);
  
  console.log('\n🔌 Done');
}

mergeDuplicates().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
