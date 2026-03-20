#!/usr/bin/env node
const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';
const PIPELINE_ID = 'NYyk4ANJhoKiWL6mNxwI';

async function testEndpoints() {
  // Test 1: opportunities/search with POST
  console.log('Test 1: POST /opportunities/search');
  let response = await fetch(
    'https://services.leadconnectorhq.com/opportunities/search',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        pipelineId: PIPELINE_ID
      })
    }
  );
  console.log('Status:', response.status);
  if (response.ok) {
    const data = await response.json();
    console.log('Found', data.opportunities?.length || 0, 'opportunities');
    if (data.opportunities?.length > 0) {
      console.log('First opp:', data.opportunities[0].name, '- Stage:', data.opportunities[0].pipelineStageId);
    }
  } else {
    console.log('Error:', await response.text());
  }
}

testEndpoints().catch(console.error);
