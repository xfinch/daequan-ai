const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:WqZkVFPKklyhDCreWxNeBCCiBGQxPCxh@metro.proxy.rlwy.net:33745/?authSource=admin";

async function check() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('comcast');
  const visits = db.collection('visits');
  
  // Find visits with business names matching today's
  const todays = await visits.find({
    businessName: { $in: ['Play Live Nation', "Gentiletti's Pass"] }
  }).toArray();
  
  console.log('Today\'s visits in MongoDB:');
  todays.forEach(v => {
    console.log(`- ${v.businessName}: createdAt=${v.createdAt}`);
  });
  
  // Check what the latest visit date is
  const latest = await visits.find().sort({ createdAt: -1 }).limit(5).toArray();
  console.log('\nLatest 5 visits:');
  latest.forEach(v => {
    console.log(`- ${v.businessName}: createdAt=${v.createdAt}`);
  });
  
  await client.close();
}

check().catch(console.error);
