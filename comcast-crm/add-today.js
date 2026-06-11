const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:WqZkVFPKklyhDCreWxNeBCCiBGQxPCxh@metro.proxy.rlwy.net:33745/?authSource=admin";

async function add() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('comcast');
  const visits = db.collection('visits');
  
  const today = new Date();
  
  // Add Play Live Nation
  await visits.insertOne({
    sqliteId: 160,
    businessName: 'Play Live Nation',
    contactName: 'Brian',
    address: '3500 S. Meridian, Unit 420',
    city: 'Puyallup',
    state: 'WA',
    zip: '98373',
    status: 'follow-up',
    notes: 'Gatekeeper: Andrew. Decision-maker: Brian (dad, tech guru). Best day: Tuesdays. High data usage during tournaments - fiber opportunity.',
    visitContext: 'Met with Andrew. Brian in on Tuesdays.',
    createdAt: today,
    updatedAt: today
  });
  console.log('✅ Added Play Live Nation');
  
  // Add Gentiletti's Pass
  await visits.insertOne({
    businessName: "Gentiletti's Pass",
    contactName: 'Brent',
    city: 'Puyallup',
    state: 'WA',
    zip: '98373',
    status: 'follow-up',
    notes: 'Gatekeeper: Brent (son of owner Flavien Gentiletti). Has service but may need upgrade. Low level lead.',
    visitContext: 'Met with Brent. Existing customer, upgrade potential.',
    createdAt: today,
    updatedAt: today
  });
  console.log('✅ Added Gentiletti\'s Pass');
  
  await client.close();
}

add().catch(console.error);
