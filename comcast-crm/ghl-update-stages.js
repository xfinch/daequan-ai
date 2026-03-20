#!/usr/bin/env node
const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';
const PIPELINE_ID = 'NYyk4ANJhoKiWL6mNxwI';

// Stage IDs
const STAGES = {
  '2 - Needs Analysis': 'a0bde08a-9d14-4ddd-b1c4-e77530e3e079',
  '3 - Second Review': 'e540b7f0-8a26-4948-9479-1ff653742ede'
};

// Updates needed
const UPDATES = [
  { name: 'Smart PNW', stageName: '3 - Second Review', stageId: STAGES['3 - Second Review'] },
  { name: 'Proctor Art Gallery', stageName: '2 - Needs Analysis', stageId: STAGES['2 - Needs Analysis'] }
];

async function getOpportunities() {
  const response = await fetch(
    'https://services.leadconnectorhq.com/opportunities/search',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({ locationId: GHL_LOCATION_ID })
    }
  );
  
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.opportunities?.filter(o => o.pipelineId === PIPELINE_ID) || [];
}

async function updateStage(oppId, stageId, name, stageName) {
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
    console.log(`✅ ${name}: Moved to "${stageName}"`);
    return true;
  } else {
    console.log(`❌ ${name}: ${await response.text()}`);
    return false;
  }
}

async function main() {
  console.log('Fetching opportunities and updating stages...\n');
  
  const opps = await getOpportunities();
  console.log(`Found ${opps.length} opportunities in pipeline\n`);
  
  for (const update of UPDATES) {
    const opp = opps.find(o => o.name.toLowerCase().includes(update.name.toLowerCase()));
    if (opp) {
      console.log(`📋 ${update.name}`);
      console.log(`   Current stage: ${opp.pipelineStageId}`);
      console.log(`   Moving to: ${update.stageName}`);
      await updateStage(opp.id, update.stageId, update.name, update.stageName);
    } else {
      console.log(`⚠️  ${update.name}: Not found in pipeline`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

main().catch(console.error);
