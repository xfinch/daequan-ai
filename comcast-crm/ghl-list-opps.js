#!/usr/bin/env node
const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const PIPELINE_ID = 'NYyk4ANJhoKiWL6mNxwI';

async function listOpportunities() {
  const response = await fetch(
    `https://services.leadconnectorhq.com/opportunities/?pipelineId=${PIPELINE_ID}&limit=100`,
    {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28'
      }
    }
  );
  
  if (!response.ok) {
    console.log('Error:', await response.text());
    return;
  }
  
  const data = await response.json();
  console.log('Opportunities in pipeline:');
  data.opportunities?.forEach(o => {
    console.log(`- ${o.name} (${o.id}): Stage ${o.pipelineStageId}, Contact: ${o.contactId}`);
  });
}

listOpportunities().catch(console.error);
