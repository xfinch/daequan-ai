#!/usr/bin/env node
/**
 * Add/Update today's prospects in GHL Pipeline
 * - James Roddy (Smart PNW) - update to appropriate stage
 * - Chris Brown (Attorney) - new prospect from referral
 * - Pamela Phelps (Proctor Art Gallery) - update status
 */

const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN;
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';
const PIPELINE_ID = 'NYyk4ANJhoKiWL6mNxwI';

// Stage mapping
const STAGE_MAP = {
  '0 - Door Knock': 'a93fb079-3746-4733-afa3-c2a2145fac97',
  '1 - Initial Contact': '6b3a7508-93f1-44e5-bcb1-93f4260b9143',
  '2 - Needs Analysis': 'a0bde08a-9d14-4ddd-b1c4-e77530e3e079',
  '3 - Second Review': 'e540b7f0-8a26-4948-9479-1ff653742ede',
  '4 - Proposal Sent': '4cc8371a-a550-49c9-b02d-1d59b811d18f',
  '5 - Contract Signed': 'd1081b1b-330c-4965-886d-9ab1c08dde6e'
};

// Today's updates
const UPDATES = [
  {
    businessName: "Smart PNW",
    contactName: "James Roddy",
    stage: "3 - Second Review",
    email: "james@smartpnw.com",
    phone: "253-448-0456",
    address: null,
    city: null,
    zip: null,
    notes: "3/17 UPDATE: COMMITTED to April transition. 7 mobile lines (3 iPads + 4 cellphones) + BVE. Quoted ~$235/month. Also wants fiber if can match current $440/month (minus $130 discounts). Referral partner activated - can get free internet via bill credits. Referred Chris Brown (attorney)."
  },
  {
    businessName: "Chris Brown Law Office",
    contactName: "Chris Brown",
    stage: "1 - Initial Contact",
    email: null,
    phone: null,
    address: "708 South 7th Avenue SW",
    city: "Tumwater",
    zip: "98512",
    notes: "NEW PROSPECT 3/17: Attorney with home office. REFERRAL from James Roddy (Smart PNW). Needs fiber internet for home office. Requires manager approval (residential/business hybrid location). Address: 708 South 7th Ave SW, Tumwater, WA 98512."
  },
  {
    businessName: "Proctor Art Gallery",
    contactName: "Pamela Phelps",
    stage: "2 - Needs Analysis",
    email: "pamelaphelps@proctorart.com",
    phone: "253-759-4238",
    address: "3811 North 26th Street",
    city: "Tacoma",
    zip: "98407",
    notes: "3/17 UPDATE: Stopped by gallery - she wasn't in, met gatekeeper. Billing successfully corrected, credits in progress. MAJOR DISCOVERY: She's overpaying for BVE - can adjust for lower bill. Status changed from 'just helped' to PROSPECT. Follow up by 3/18."
  }
];

const results = { created: [], updated: [], failed: [] };

async function searchContact(email, phone) {
  const query = email || phone;
  if (!query) return null;
  
  const response = await fetch(
    `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-04-15'
      }
    }
  );
  
  if (!response.ok) return null;
  const data = await response.json();
  return data.contacts?.[0] || null;
}

async function createContact(prospect) {
  const contactData = {
    locationId: GHL_LOCATION_ID,
    firstName: prospect.contactName.split(' ')[0],
    lastName: prospect.contactName.split(' ').slice(1).join(' ') || '',
    email: prospect.email,
    phone: prospect.phone,
    companyName: prospect.businessName,
    address1: prospect.address,
    city: prospect.city,
    state: 'WA',
    postalCode: prospect.zip,
    tags: ['comcast-prospect', 'field-visit-3-17'],
    source: 'Field Visit'
  };

  const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content': 'application/json',
      'Version': '2021-04-15'
    },
    body: JSON.stringify(contactData)
  });

  if (!response.ok) {
    throw new Error(`Contact creation failed: ${await response.text()}`);
  }

  const data = await response.json();
  return data.contact.id;
}

async function addNote(contactId, noteText) {
  await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-04-15'
    },
    body: JSON.stringify({ body: noteText })
  });
}

async function createOrUpdateOpportunity(contactId, prospect) {
  const stageId = STAGE_MAP[prospect.stage];
  if (!stageId) {
    console.log(`   ⚠️  No stage mapping for ${prospect.stage}`);
    return null;
  }

  // Check for existing opportunity in our pipeline
  const oppResponse = await fetch(
    `https://services.leadconnectorhq.com/opportunities/search/?locationId=${GHL_LOCATION_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        contactId: contactId,
        pipelineId: PIPELINE_ID
      })
    }
  );

  let existingOpp = null;
  if (oppResponse.ok) {
    const oppData = await oppResponse.json();
    existingOpp = oppData.opportunities?.[0];
  }

  if (existingOpp) {
    // Update existing opportunity stage
    console.log(`   🔄 Found existing opportunity: ${existingOpp.id}`);
    const updateResponse = await fetch(
      `https://services.leadconnectorhq.com/opportunities/${existingOpp.id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GHL_TOKEN}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          pipelineStageId: stageId,
          status: 'open'
        })
      }
    );
    
    if (updateResponse.ok) {
      console.log(`   ✅ Updated opportunity stage: ${prospect.stage}`);
      return existingOpp.id;
    } else {
      const errText = await updateResponse.text();
      throw new Error(`Update failed: ${errText}`);
    }
  }

  // Create new opportunity
  console.log(`   ➕ Creating new opportunity...`);
  const createResponse = await fetch('https://services.leadconnectorhq.com/opportunities/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      pipelineId: PIPELINE_ID,
      pipelineStageId: stageId,
      contactId: contactId,
      name: prospect.businessName,
      status: 'open'
    })
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    // Check if it's a duplicate error
    if (errText.includes('duplicate')) {
      console.log(`   ⚠️  Opportunity already exists (duplicate)`);
      return null;
    }
    throw new Error(`Opportunity creation failed: ${errText}`);
  }

  const data = await createResponse.json();
  console.log(`   ✅ Created opportunity: ${data.opportunity.id}`);
  return data.opportunity.id;
}

async function processProspect(prospect) {
  console.log(`\n📋 Processing: ${prospect.businessName}`);
  
  try {
    // Search for existing contact
    const existing = await searchContact(prospect.email, prospect.phone);
    let contactId;
    
    if (existing) {
      console.log(`   🔄 Found existing contact: ${existing.id}`);
      contactId = existing.id;
      results.updated.push({ businessName: prospect.businessName, contactId });
    } else {
      console.log(`   ➕ Creating new contact...`);
      contactId = await createContact(prospect);
      console.log(`   ✅ Created contact: ${contactId}`);
      results.created.push({ businessName: prospect.businessName, contactId });
    }
    
    // Add note with update details
    await addNote(contactId, prospect.notes);
    console.log(`   📝 Added note`);
    
    // Create/update opportunity in pipeline
    await createOrUpdateOpportunity(contactId, prospect);
    
    // Small delay
    await new Promise(r => setTimeout(r, 500));
    
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    results.failed.push({ businessName: prospect.businessName, error: err.message });
  }
}

async function main() {
  console.log('🚀 Updating GHL Pipeline with Today\'s Field Visits\n');
  console.log('=' .repeat(60));
  
  if (!GHL_TOKEN) {
    console.error('❌ GHL_COMCAST_TOKEN not set');
    process.exit(1);
  }
  
  for (const prospect of UPDATES) {
    await processProspect(prospect);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`🔄 Updated: ${results.updated.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED:');
    results.failed.forEach(f => console.log(`  - ${f.businessName}: ${f.error}`));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
