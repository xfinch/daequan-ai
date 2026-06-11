const { MongoClient } = require('mongodb');

// Try with authSource=admin and the root credentials
const uri = "mongodb://mongo:WqZkVFPKklyhDCreWxNeBCCiBGQxPCxh@metro.proxy.rlwy.net:33745/test?authSource=admin&authMechanism=SCRAM-SHA-256";

async function test() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000
  });
  
  try {
    await client.connect();
    console.log('✅ Connected with root credentials');
    const db = client.db('comcast');
    const collections = await db.listCollections().toArray();
    console.log('Collections in comcast db:', collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
