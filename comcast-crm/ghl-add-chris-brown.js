#!/usr/bin/env node
const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';
const PIPELINE_ID = 'NYyk4ANJhoKiWL6mNxwI';
const STAGE_1 = '6b3a7508-93f1-44e5-bcb1-93f4260b9143'; // 1 - Initial Contact

async function addContact() {
  const contactData = {
    locationId: GHL_LOCATION_ID,
    firstName: 'Chris',
    lastName: 'Brown',
    email: null,
    phone: null,
    companyName: 'Chris Brown Law Office',
    address1: '708 South 7th Avenue SW',
    city: 'Tumwater',
    state: 'WA',
    postalCode: '98512',
    tags: ['comcast-prospect', 'referral-from-james-roddy', 'field-visit-3-17', 'manager-approval-needed'],
    source: 'Referral - James Roddy'
  };

  const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    body: JSON.stringify(contactData)
  });

  if (!response.ok) {
    throw new Error(`Contact creation failed: ${await response.text()}`);
  }

  const data = await response.json();
  return data.contact.id;
}

async function addNote(contactId) {
  await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    body: JSON.stringify({
      body: `NEW PROSPECT 3/17: Attorney with home office in Tumwater.

REFERRAL from James Roddy (Smart PNW).

Service Needed: Fiber internet for home office
Address: 708 South 7th Avenue SW, Tumwater, WA 98512

Special Requirements: Manager approval required (residential/business hybrid location)

Next Steps:
1. Get manager approval for fiber at residential address
2. Contact Chris with approval status and pricing
3. Schedule installation if approved`
    })
  });
}

async function createOpportunity(contactId) {
  const response = await fetch('https://services.leadconnectorhq.com/opportunities/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      pipelineId: PIPELINE_ID,
      pipelineStageId: STAGE_1,
      contactId: contactId,
      name: 'Chris Brown Law Office',
      status: 'open'
    })
  });

  if (!response.ok) {
    throw new Error(`Opportunity creation failed: ${await response.text()}`);
  }

  const data = await response.json();
  return data.opportunity.id;
}

async function main() {
  console.log('Adding Chris Brown to GHL...\n');
  
  try {
    console.log('Creating contact...');
    const contactId = await addContact();
    console.log(`✅ Contact created: ${contactId}`);
    
    console.log('Adding note...');
    await addNote(contactId);
    console.log('✅ Note added');
    
    console.log('Creating opportunity...');
    const oppId = await createOpportunity(contactId);
    console.log(`✅ Opportunity created: ${oppId}`);
    
    console.log('\n🎉 Chris Brown added to GHL pipeline!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main().catch(console.error);
