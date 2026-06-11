const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:WqZkVFPKklyhDCreWxNeBCCiBGQxPCxh@metro.proxy.rlwy.net:33745";

async function test() {
  const client = new MongoClient(uri, {
    authSource: 'admin',
    serverSelectionTimeoutMS: 5000
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    const db = client.db('test');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await client.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
