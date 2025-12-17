#!/usr/bin/env node
const { Client, Databases } = require('node-appwrite');

const CONFIG = {
  endpoint: 'https://sgp.cloud.appwrite.io/v1',
  projectId: '694124fc00267079b6cd',
  databaseId: 'zhcode_db',
  apiKey: process.env.APPWRITE_API_KEY
};

const client = new Client()
  .setEndpoint(CONFIG.endpoint)
  .setProject(CONFIG.projectId)
  .setKey(CONFIG.apiKey);

const databases = new Databases(client);

async function main() {
  try {
    // List all collections
    const collections = await databases.listCollections(CONFIG.databaseId);
    
    for (const col of collections.collections) {
      console.log(`\n📋 Collection: ${col.name} (${col.$id})`);
      console.log('   Attributes:');
      
      const attrs = await databases.listAttributes(CONFIG.databaseId, col.$id);
      for (const attr of attrs.attributes) {
        console.log(`   - ${attr.key}: ${attr.type}${attr.size ? ` (${attr.size})` : ''} ${attr.required ? '[required]' : ''}`);
      }
      
      const indexes = await databases.listIndexes(CONFIG.databaseId, col.$id);
      console.log('   Indexes:');
      for (const idx of indexes.indexes) {
        console.log(`   - ${idx.key}: ${idx.type} [${idx.attributes.join(', ')}]`);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
