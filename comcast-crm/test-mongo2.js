const { MongoClient } = require('mongodb');

const uri = "mongodb://metro.proxy.rlwy.net:33745";

async function test() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000
  });
  
  try {
    await client.connect();
    console.log('✅ Connected without auth');
    const dbs = await client.db().admin().listDatabases();
    console.log('Databases:', dbs.databases.map(d => d.name));
    await client.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
