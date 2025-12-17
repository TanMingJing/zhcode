#!/usr/bin/env node
/**
 * ZhCode IDE - Add Attributes to Appwrite Collections
 * Uses official Appwrite Node.js SDK
 */

const { Client, Databases } = require('node-appwrite');

// Configuration
const CONFIG = {
  endpoint: 'https://sgp.cloud.appwrite.io/v1',
  projectId: '694124fc00267079b6cd',
  databaseId: 'zhcode_db',
  apiKey: process.env.APPWRITE_API_KEY
};

if (!CONFIG.apiKey) {
  console.error('❌ APPWRITE_API_KEY environment variable not set');
  process.exit(1);
}

// Initialize Appwrite
const client = new Client()
  .setEndpoint(CONFIG.endpoint)
  .setProject(CONFIG.projectId)
  .setKey(CONFIG.apiKey);

const databases = new Databases(client);

// Helper to add attribute with error handling
async function addAttribute(collectionId, type, key, options = {}) {
  try {
    let result;
    switch (type) {
      case 'string':
        result = await databases.createStringAttribute(
          CONFIG.databaseId,
          collectionId,
          key,
          options.size || 255,
          options.required || false,
          options.default || null,
          options.array || false
        );
        break;
      case 'email':
        result = await databases.createEmailAttribute(
          CONFIG.databaseId,
          collectionId,
          key,
          options.required || false,
          options.default || null,
          options.array || false
        );
        break;
      case 'boolean':
        result = await databases.createBooleanAttribute(
          CONFIG.databaseId,
          collectionId,
          key,
          options.required || false,
          options.default || null,
          options.array || false
        );
        break;
      case 'datetime':
        result = await databases.createDatetimeAttribute(
          CONFIG.databaseId,
          collectionId,
          key,
          options.required || false,
          options.default || null,
          options.array || false
        );
        break;
      case 'integer':
        result = await databases.createIntegerAttribute(
          CONFIG.databaseId,
          collectionId,
          key,
          options.required || false,
          options.min || null,
          options.max || null,
          options.default || null,
          options.array || false
        );
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }
    console.log(`  ✅ Added ${key} (${type})`);
    return result;
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ⚠️  ${key} already exists, skipping`);
    } else {
      console.log(`  ❌ Failed to add ${key}: ${error.message}`);
    }
  }
}

// Helper to add index
async function addIndex(collectionId, key, type, attributes) {
  try {
    const result = await databases.createIndex(
      CONFIG.databaseId,
      collectionId,
      key,
      type,
      attributes
    );
    console.log(`  ✅ Added index ${key}`);
    return result;
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ⚠️  Index ${key} already exists, skipping`);
    } else {
      console.log(`  ❌ Failed to add index ${key}: ${error.message}`);
    }
  }
}

async function setupUsersCollection() {
  console.log('\n📋 Setting up USERS collection...');
  const id = 'users';
  
  await addAttribute(id, 'string', 'userId', { size: 128, required: true });
  await addAttribute(id, 'email', 'email', { required: true });
  await addAttribute(id, 'string', 'username', { size: 128, required: true });
  await addAttribute(id, 'string', 'name', { size: 256, required: false });
  await addAttribute(id, 'string', 'avatar', { size: 2048, required: false });
  await addAttribute(id, 'string', 'bio', { size: 1024, required: false });
  await addAttribute(id, 'string', 'theme', { size: 50, required: false, default: 'dark' });
  await addAttribute(id, 'string', 'language', { size: 10, required: false, default: 'en' });
  await addAttribute(id, 'boolean', 'isVerified', { required: false, default: false });
  await addAttribute(id, 'boolean', 'isPremium', { required: false, default: false });
  await addAttribute(id, 'datetime', 'createdAt', { required: true });
  await addAttribute(id, 'datetime', 'updatedAt', { required: true });
  
  // Wait for attributes to be ready before creating indexes
  console.log('  ⏳ Waiting for attributes to be ready...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await addIndex(id, 'idx_email', 'unique', ['email']);
  await addIndex(id, 'idx_username', 'unique', ['username']);
  await addIndex(id, 'idx_userId', 'unique', ['userId']);
  await addIndex(id, 'idx_createdAt', 'key', ['createdAt']);
}

async function setupAiOperationsCollection() {
  console.log('\n📋 Setting up AI_OPERATIONS collection...');
  const id = 'ai_operations';
  
  await addAttribute(id, 'string', 'userId', { size: 255, required: true });
  await addAttribute(id, 'string', 'actionType', { size: 50, required: true, default: 'generate' });
  await addAttribute(id, 'string', 'input', { size: 10000, required: true });
  await addAttribute(id, 'string', 'output', { size: 10000, required: true });
  await addAttribute(id, 'string', 'language', { size: 10, required: true, default: 'zh' });
  await addAttribute(id, 'string', 'framework', { size: 50, required: true, default: 'zhcode' });
  await addAttribute(id, 'string', 'status', { size: 20, required: true, default: 'success' });
  await addAttribute(id, 'string', 'errorMessage', { size: 5000, required: false });
  await addAttribute(id, 'string', 'code', { size: 10000, required: false });
  await addAttribute(id, 'string', 'fileId', { size: 255, required: false });
  await addAttribute(id, 'datetime', 'timestamp', { required: true });
  
  console.log('  ⏳ Waiting for attributes to be ready...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await addIndex(id, 'idx_userId', 'key', ['userId']);
  await addIndex(id, 'idx_timestamp', 'key', ['timestamp']);
}

async function setupProjectsCollection() {
  console.log('\n📋 Setting up ZHCODE_PROJECTS collection...');
  const id = 'zhcode_projects';
  
  await addAttribute(id, 'string', 'userId', { size: 255, required: true });
  await addAttribute(id, 'string', 'projectName', { size: 255, required: true });
  await addAttribute(id, 'string', 'description', { size: 5000, required: false });
  await addAttribute(id, 'string', 'files', { size: 100000, required: true }); // JSON stored as string
  await addAttribute(id, 'string', 'mainFile', { size: 255, required: true });
  await addAttribute(id, 'string', 'language', { size: 10, required: true, default: 'zh' });
  await addAttribute(id, 'string', 'tags', { size: 1000, required: false, array: true });
  await addAttribute(id, 'boolean', 'isPublic', { required: false, default: false });
  await addAttribute(id, 'datetime', 'createdAt', { required: true });
  await addAttribute(id, 'datetime', 'updatedAt', { required: true });
  
  console.log('  ⏳ Waiting for attributes to be ready...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await addIndex(id, 'idx_userId', 'key', ['userId']);
  await addIndex(id, 'idx_updatedAt', 'key', ['updatedAt']);
  await addIndex(id, 'idx_projectName', 'key', ['projectName']);
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('ZhCode IDE - Add Attributes to Collections');
  console.log('═══════════════════════════════════════');
  console.log(`Endpoint: ${CONFIG.endpoint}`);
  console.log(`Project: ${CONFIG.projectId}`);
  console.log(`Database: ${CONFIG.databaseId}`);
  
  try {
    await setupUsersCollection();
    await setupAiOperationsCollection();
    await setupProjectsCollection();
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ All attributes and indexes added!');
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
