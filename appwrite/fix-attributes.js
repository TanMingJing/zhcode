#!/usr/bin/env node
/**
 * ZhCode IDE - Fix Missing Attributes
 */

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

async function addStringAttr(collectionId, key, size, required = false) {
  try {
    await databases.createStringAttribute(CONFIG.databaseId, collectionId, key, size, required);
    console.log(`  ✅ Added ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`  ⚠️  ${key} exists`);
    else console.log(`  ❌ ${key}: ${e.message}`);
  }
}

async function addDatetimeAttr(collectionId, key, required = false) {
  try {
    await databases.createDatetimeAttribute(CONFIG.databaseId, collectionId, key, required);
    console.log(`  ✅ Added ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`  ⚠️  ${key} exists`);
    else console.log(`  ❌ ${key}: ${e.message}`);
  }
}

async function addBooleanAttr(collectionId, key, required = false) {
  try {
    await databases.createBooleanAttribute(CONFIG.databaseId, collectionId, key, required);
    console.log(`  ✅ Added ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`  ⚠️  ${key} exists`);
    else console.log(`  ❌ ${key}: ${e.message}`);
  }
}

async function addIndex(collectionId, key, type, attrs) {
  try {
    await databases.createIndex(CONFIG.databaseId, collectionId, key, type, attrs);
    console.log(`  ✅ Index ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`  ⚠️  Index ${key} exists`);
    else console.log(`  ❌ Index ${key}: ${e.message}`);
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('Fixing Missing Attributes');
  console.log('═══════════════════════════════════════\n');

  // Fix USERS collection
  console.log('📋 USERS collection:');
  await addStringAttr('users', 'userId', 128, true);
  await addStringAttr('users', 'username', 128, true);
  await addStringAttr('users', 'avatar', 2048, false);
  await addStringAttr('users', 'bio', 1024, false);
  await addStringAttr('users', 'theme', 50, false);
  await addStringAttr('users', 'language', 10, false);
  await addBooleanAttr('users', 'isPremium', false);
  await addDatetimeAttr('users', 'createdAt', true);
  await addDatetimeAttr('users', 'updatedAt', true);
  
  console.log('  ⏳ Waiting...');
  await new Promise(r => setTimeout(r, 5000));
  
  await addIndex('users', 'idx_email', 'unique', ['email']);
  await addIndex('users', 'idx_username', 'unique', ['username']);
  await addIndex('users', 'idx_userId', 'unique', ['userId']);
  await addIndex('users', 'idx_createdAt', 'key', ['createdAt']);

  // Fix AI_OPERATIONS - no defaults for required fields
  console.log('\n📋 AI_OPERATIONS collection:');
  await addStringAttr('ai_operations', 'actionType', 50, false); // Make optional with no default
  await addStringAttr('ai_operations', 'output', 5000, false); // Smaller size
  await addStringAttr('ai_operations', 'language', 10, false);
  await addStringAttr('ai_operations', 'framework', 50, false);
  await addStringAttr('ai_operations', 'status', 20, false);
  await addStringAttr('ai_operations', 'code', 5000, false);

  // Fix ZHCODE_PROJECTS
  console.log('\n📋 ZHCODE_PROJECTS collection:');
  await addStringAttr('zhcode_projects', 'language', 10, false);

  console.log('\n═══════════════════════════════════════');
  console.log('✅ Done!');
  console.log('═══════════════════════════════════════\n');
}

main();
