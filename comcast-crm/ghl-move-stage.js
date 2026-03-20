#!/usr/bin/env node
/**
 * Move prospects to new pipeline stages
 */

const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';

// Stage IDs from bulk-sync-pipeline.js
const STAGES = {
  '3 - Second Review': 'e540b7f0-8a26-4948-9479-1ff653742ede',
  '2 - Needs Analysis': 'a0bde08a-9d14-4ddd-b1c4-e77530e3e079'
};

const MOVES = [
  { contactId: 'N9CLfbjct7vKAYcp0hFZ', businessName: 'Smart PNW', stageId: STAGES['3 - Second Review'] },
  { contactId: 'ajQ51e0fgZsx735tn7Vi', businessName: 'Proctor Art Gallery', stageId: STAGES['2 - Needs Analysis'] }
];

async function findOpportunity(contactId) {
  const response = await fetch(
    `https://services.leadconnectorhq.com/opportunities/?locationId=${GHL_LOCATION_ID}&contactId=${contactId}&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28'
      }
    }
  );
  
  if (!response.ok) return null;
  const data = await response.json();
  return data.opportunities?.[0];
}

async function moveStage(oppId, stageId, businessName) {
  const response = await fetch(
    `https://services.leadconnectorhq.com/opportunities/${oppId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({ pipelineStageId: stageId })
    }
  );
  
  if (response.ok) {
    console.log(`✅ ${businessName}: Moved to new stage`);
    return true;
  } else {
    console.log(`❌ ${businessName}: ${await response.text()}`);
    return false;
  }
}

async function main() {
  console.log('Moving prospects to new pipeline stages...\n');
  
  for (const move of MOVES) {
    console.log(`📋 ${move.businessName}`);
    const opp = await findOpportunity(move.contactId);
    if (opp) {
      console.log(`   Found opportunity: ${opp.id}`);
      await moveStage(opp.id, move.stageId, move.businessName);
    } else {
      console.log(`   ⚠️  No opportunity found`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

main().catch(console.error);
