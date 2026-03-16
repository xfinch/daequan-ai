#!/usr/bin/env node
/**
 * Bulk Sync Comcast Prospects from Kanban to GHL
 * One-time script to backfill all pipeline data
 */

const fs = require('fs');
const path = require('path');

// GHL Configuration
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

// Prospect data extracted from kanban-comcast.md
const PROSPECTS = [
  {
    businessName: "Knapp's Restaurant",
    contactName: "Billy Brewer",
    stage: "3 - Second Review",
    status: "🟡 Active",
    phone: null,
    email: null,
    address: "Proctor District",
    notes: "Triple Play package (Gigabit + Voice 5 lines + Video). Sales Engineer review completed."
  },
  {
    businessName: "KO Construction",
    contactName: "Keith Osmonson",
    stage: "4 - Proposal Sent",
    status: "🟡 Active",
    phone: null,
    email: null,
    address: null,
    notes: "Bill reviewed and contacted. Address qualification pending."
  },
  {
    businessName: "Chirp & Co",
    contactName: "Liz Bright",
    stage: "1 - Initial Contact",
    status: "🟡 Follow-up Later",
    phone: "253-759-2884",
    email: "chirpandco@hotmail.com",
    address: "3803 North 26th Street, Tacoma, WA 98407",
    notes: "Existing Comcast (live stream). Past issues during fiber install. Follow up after construction settles."
  },
  {
    businessName: "Proctor Art Gallery",
    contactName: "Pamela Phelps",
    stage: "2 - Needs Analysis",
    status: "🔥 Hot Lead",
    phone: "253-759-4238",
    email: "pamelaphelps@proctorart.com",
    address: "3811 North 26th Street, Tacoma, WA 98407",
    notes: "Paying $100+/mo, wants better deal. Previous rep never followed through. Email sent 3/12."
  },
  {
    businessName: "Compass Rose",
    contactName: "Tanya Brooks",
    stage: "1 - Initial Contact",
    status: "🟡 New",
    phone: "253-773-0077",
    email: null,
    address: "3815 North 26th Street, Tacoma, WA 98407",
    notes: "13-year Proctor District staple. Need email for follow-up."
  },
  {
    businessName: "Proctor Shoe Repair",
    contactName: "Henry",
    stage: "1 - Initial Contact",
    status: "🟡 Existing Customer",
    phone: "253-883-9136",
    email: null,
    address: "3817 1/2 North 26th Street, Tacoma, WA 98407",
    notes: "Existing Comcast Internet + TV. Need email for newsletter."
  },
  {
    businessName: "Lapis",
    contactName: "Emily",
    stage: "1 - Initial Contact",
    status: "🟡 New",
    phone: "253-507-4969",
    email: "hello@lapistacoma.com",
    address: "3823 N 26th Street, Tacoma, WA 98407",
    notes: "Jewelry store. Met Peyton (gatekeeper)."
  },
  {
    businessName: "New Era Cleaners",
    contactName: "Yesi",
    stage: "1 - Initial Contact",
    status: "🟡 New",
    phone: "253-759-3501",
    email: "fuzzywuzzy@q.com",
    address: "2621 N Proctor Street, Tacoma, WA 98407",
    notes: "Dual business: Cleaners + Fuzzy Wuzzy Rug Cleaning. Gatekeeper: Natasha."
  },
  {
    businessName: "Strategy Three",
    contactName: "Leah Noel Knoll",
    stage: null,
    status: "🔴 Lost to Competitor",
    phone: "253-267-7704",
    email: "leah@strategythree.com",
    address: "2607 N Proctor Street, Tacoma, WA 98407",
    notes: "Switched FROM Comcast TO Lightcurve. Not interested in returning."
  },
  {
    businessName: "Tacoma Glass Gallery",
    contactName: "Jeannine Sigafoos",
    stage: "1 - Initial Contact",
    status: "🟡 New",
    phone: null,
    email: "tgsglass@gmail.com",
    address: "2621 N Proctor Street, Tacoma, WA 98407",
    notes: "Proctor location retail gallery. Gatekeeper: Dirk."
  },
  {
    businessName: "Proctor Family Dentistry",
    contactName: "Greg Dent",
    stage: "1 - Initial Contact",
    status: "🟡 New",
    phone: "253-759-6800",
    email: null,
    address: "2614 North Adams Street, Tacoma, WA 98407",
    notes: "Dental office. Gatekeeper: Andy. Office Manager: Jennifer."
  },
  {
    businessName: "Crave Cookies",
    contactName: "Dalton Ohlson",
    stage: "1 - Initial Contact",
    status: "🟡 Relationship Building",
    phone: "253-260-7417",
    email: null,
    address: "17526 Meridian Avenue East, Suite B202, Puyallup, WA 98375",
    notes: "Personal: 253-457-6486. Multi-business owner. Co-owners: Ham and Brad."
  },
  {
    businessName: "Endeavor Eye Center",
    contactName: "Dr. Kevin / Dr. Connie",
    stage: "1 - Initial Contact",
    status: "🟡 New",
    phone: null,
    email: null,
    address: null,
    notes: "Gatekeeper: Cher. Good rapport established. Need to reach doctors."
  },
  {
    businessName: "Fleet Feet",
    contactName: "Wade & Julie Pannell",
    stage: "1 - Initial Contact",
    status: "🔥 Hot Lead",
    phone: "253-272-8890",
    email: "jeremiah@fleetfeettacoma.com",
    address: "3812 N 26th St, Tacoma, WA 98407",
    notes: "10 locations! Gatekeeper: Jeremiah Garza. Existing Comcast — bill analysis needed."
  },
  {
    businessName: "Chalet Bowl",
    contactName: null,
    stage: "0 - Door Knock",
    status: "⚪ Closed/No Contact",
    phone: null,
    email: null,
    address: "3806 North 26th Street, Tacoma, WA 98407",
    notes: "Stopped by, closed. Return later."
  },
  {
    businessName: "Manny's Place",
    contactName: "Brett",
    stage: "0 - Door Knock",
    status: "🟡 Gatekeeper Contact",
    phone: null,
    email: null,
    address: "3814 North 26th Street, Tacoma, WA 98407",
    notes: "Gatekeeper: April. Brett stepped out. Return later."
  },
  {
    businessName: "Peaks and Pints",
    contactName: "Ron Swarner",
    stage: "1 - Initial Contact",
    status: "🟡 Gatekeeper Contact",
    phone: "253-328-5621",
    email: "ron.swarner@peaksandpints.com",
    address: "3816 N 26th St, Ste B, Tacoma, WA 98407",
    notes: "Craft beer bar. Gatekeeper: Trish."
  },
  {
    businessName: "Connections Fine Jewelry",
    contactName: "Tad Kraus",
    stage: "1 - Initial Contact",
    status: "🟡 Card Collected",
    phone: "253-752-0940",
    email: null,
    address: "3822 N 26th St, Tacoma, WA 98407",
    notes: "With Lightcurve. Wants competitive comparison content."
  },
  {
    businessName: "Smart PNW",
    contactName: "James Roddy",
    stage: "2 - Needs Analysis",
    status: "🔥 Hot Lead",
    phone: "253-448-0456",
    email: "james@smartpnw.com",
    address: null,
    notes: "1-2 BVE + 7 mobile lines. Quote needed. Old Ignite friend."
  },
  {
    businessName: "Ice Cream Social",
    contactName: "Iris All",
    stage: "1 - Initial Contact",
    status: "🟡 Gatekeeper Contact",
    phone: "253-327-1803",
    email: null,
    address: "2521 North Proctor Street, Tacoma, WA 98407",
    notes: "Gatekeeper: Max. Decision maker: Iris All."
  },
  {
    businessName: "Pizzeria Fondi",
    contactName: "Chris Olsen",
    stage: "2 - Needs Analysis",
    status: "🔥 Hot Lead",
    phone: "253-851-6666",
    email: "chris@fondi.com",
    address: "2515 N. Proctor St, Tacoma, WA 98406",
    notes: "2-3 locations. Wants fiber + mobile quotes. Proctor District leader."
  }
];

// Results tracking
const results = {
  created: [],
  existing: [],
  failed: [],
  skipped: []
};

/**
 * Create or find GHL contact
 */
async function createOrFindContact(prospect) {
  // First, check if contact exists by email
  if (prospect.email) {
    const existing = await searchContactByEmail(prospect.email);
    if (existing) {
      results.existing.push({ prospect, contactId: existing.id });
      return existing.id;
    }
  }

  // Create new contact
  const contactData = {
    locationId: GHL_LOCATION_ID,
    firstName: prospect.contactName?.split(' ')[0] || prospect.businessName,
    lastName: prospect.contactName?.split(' ').slice(1).join(' ') || '',
    email: prospect.email,
    phone: prospect.phone,
    companyName: prospect.businessName,
    address1: prospect.address,
    city: prospect.address?.includes('Tacoma') ? 'Tacoma' : 'Puyallup',
    state: 'WA',
    postalCode: prospect.address?.match(/\d{5}/)?.[0] || null,
    tags: ['comcast-prospect', 'pipeline-sync'],
    source: 'Field Visit'
  };

  const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-04-15'
    },
    body: JSON.stringify(contactData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Contact creation failed: ${error}`);
  }

  const data = await response.json();
  
  // Add notes as a separate note entry
  if (prospect.notes) {
    await addContactNote(data.contact.id, prospect.notes);
  }
  
  results.created.push({ prospect, contactId: data.contact.id });
  return data.contact.id;
}

/**
 * Search for existing contact by email
 */
async function searchContactByEmail(email) {
  const response = await fetch(
    `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(email)}`,
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

/**
 * Add note to contact
 */
async function addContactNote(contactId, noteText) {
  const noteData = {
    body: noteText
  };

  const response = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-04-15'
    },
    body: JSON.stringify(noteData)
  });

  if (!response.ok) {
    console.log(`   ⚠️  Note addition failed (non-critical)`);
  }
}

/**
 * Create opportunity in pipeline
 */
async function createOpportunity(contactId, prospect) {
  const stageId = STAGE_MAP[prospect.stage];
  if (!stageId) {
    console.log(`⚠️  Skipping opportunity for ${prospect.businessName}: no stage mapping`);
    results.skipped.push({ prospect, reason: 'No stage mapping' });
    return null;
  }

  const opportunityData = {
    locationId: GHL_LOCATION_ID,
    pipelineId: PIPELINE_ID,
    pipelineStageId: stageId,
    contactId: contactId,
    name: prospect.businessName,
    status: 'open'
  };

  const response = await fetch('https://services.leadconnectorhq.com/opportunities/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    body: JSON.stringify(opportunityData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Opportunity creation failed: ${error}`);
  }

  const data = await response.json();
  return data.opportunity.id;
}

/**
 * Main sync function
 */
async function syncAllProspects() {
  console.log('🚀 Starting Comcast Pipeline Sync\n');
  console.log(`📊 Total prospects to sync: ${PROSPECTS.length}\n`);

  for (let i = 0; i < PROSPECTS.length; i++) {
    const prospect = PROSPECTS[i];
    console.log(`[${i + 1}/${PROSPECTS.length}] Processing: ${prospect.businessName}`);

    try {
      // Skip if no stage (lost prospects)
      if (!prospect.stage) {
        console.log(`   ⏭️  Skipped: No stage (lost prospect)`);
        results.skipped.push({ prospect, reason: 'No stage (lost prospect)' });
        continue;
      }

      // Create or find contact
      const contactId = await createOrFindContact(prospect);
      console.log(`   ✅ Contact: ${contactId}`);

      // Create opportunity
      const opportunityId = await createOpportunity(contactId, prospect);
      if (opportunityId) {
        console.log(`   ✅ Opportunity: ${opportunityId}`);
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      results.failed.push({ prospect, error: err.message });
    }

    console.log('');
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`⚪ Existing: ${results.existing.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED ITEMS:');
    results.failed.forEach(({ prospect, error }) => {
      console.log(`  - ${prospect.businessName}: ${error}`);
    });
  }

  // Save results to file
  const resultsPath = path.join(__dirname, 'sync-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${resultsPath}`);
}

// Validate environment
if (!GHL_TOKEN) {
  console.error('❌ GHL_COMCAST_TOKEN not set');
  process.exit(1);
}

// Run sync
syncAllProspects().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
