#!/usr/bin/env node
const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';
const PIPELINE_ID = 'NYyk4ANJhoKiWL6mNxwI';

async function testEndpoints() {
  // Test 1: opportunities/search with location only
  console.log('Test 1: POST /opportunities/search (location only)');
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
        locationId: GHL_LOCATION_ID
      })
    }
  );
  console.log('Status:', response.status);
  if (response.ok) {
    const data = await response.json();
    console.log('Found', data.opportunities?.length || 0, 'opportunities');
    // Filter for our pipeline
    const ourPipeline = data.opportunities?.filter(o => o.pipelineId === PIPELINE_ID);
    console.log('In our pipeline:', ourPipeline?.length || 0);
    if (ourPipeline?.length > 0) {
      console.log('Sample:', ourPipeline[0].name, '- Stage:', ourPipeline[0].pipelineStageId);
    }
  } else {
    console.log('Error:', await response.text());
  }
}

testEndpoints().catch(console.error);
