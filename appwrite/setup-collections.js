#!/usr/bin/env node

/**
 * ZhCode IDE - Appwrite Collections Setup Script (Node.js)
 * 
 * Usage:
 *   node setup-collections.js
 * 
 * Environment Variables Required:
 *   APPWRITE_API_KEY - Your Appwrite API key
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  projectId: '694124fc00267079b6cd',
  databaseId: 'zhcode_db',
  apiEndpoint: 'https://sgp.cloud.appwrite.io/v1',
  apiKey: process.env.APPWRITE_API_KEY,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cloud.appwrite.io',
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function createCollection(collectionName, schemaPath) {
  log(`\nCreating collection: ${collectionName}...`, 'blue');

  if (!fs.existsSync(schemaPath)) {
    log(`  ❌ Schema file not found: ${schemaPath}`, 'red');
    return false;
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const collectionId = collectionName.replace(/\s+/g, '_').toLowerCase();

  try {
    // Create collection
    const payload = {
      collectionId: collectionId,
      name: schema.name,
      permissions: schema.permissions || [],
    };

    const response = await makeRequest(
      'POST',
      `/databases/${CONFIG.databaseId}/collections`,
      payload
    );

    if (response.status === 201 || response.status === 200) {
      log(`  ✅ Collection created: ${collectionName} (ID: ${collectionId})`, 'green');
    } else if (response.status === 409) {
      log(`  ⚠️  Collection already exists: ${collectionName}`, 'yellow');
    } else {
      log(`  ❌ Error: ${response.status}`, 'red');
      return false;
    }

    // Add attributes
    for (const attr of schema.attributes) {
      await addAttribute(collectionId, attr);
    }

    // Add indexes
    if (schema.indexes) {
      for (const index of schema.indexes) {
        await addIndex(collectionId, index);
      }
    }

    return true;
  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
    return false;
  }
}

async function addAttribute(collectionId, attr) {
  const payload = {
    key: attr.key,
    type: attr.type,
    required: attr.required,
    array: attr.array,
  };

  if (attr.size) payload.size = attr.size;
  if (attr.default) payload.default = attr.default;

  try {
    const response = await makeRequest(
      'POST',
      `/databases/${CONFIG.databaseId}/collections/${collectionId}/attributes`,
      payload
    );

    if (response.status === 201 || response.status === 200) {
      log(`    ✓ Added attribute: ${attr.key}`, 'green');
    } else if (response.status === 409) {
      // Attribute already exists, skip
    } else {
      log(`    ⚠️  Error adding attribute ${attr.key}: ${response.status}`, 'yellow');
    }
  } catch (error) {
    log(`    ⚠️  Error: ${error.message}`, 'yellow');
  }
}

async function addIndex(collectionId, index) {
  const payload = {
    key: index.key,
    type: index.type,
    attributes: index.attributes,
    orders: index.orders,
  };

  try {
    const response = await makeRequest(
      'POST',
      `/databases/${CONFIG.databaseId}/collections/${collectionId}/indexes`,
      payload
    );

    if (response.status === 201 || response.status === 200) {
      log(`    ✓ Added index: ${index.key}`, 'green');
    } else if (response.status === 409) {
      // Index already exists, skip
    } else {
      log(`    ⚠️  Error adding index ${index.key}: ${response.status}`, 'yellow');
    }
  } catch (error) {
    log(`    ⚠️  Error: ${error.message}`, 'yellow');
  }
}

async function main() {
  log('═══════════════════════════════════════', 'cyan');
  log('ZhCode IDE - Appwrite Collections Setup', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  log('', 'reset');

  if (!CONFIG.apiKey) {
    log('❌ Error: APPWRITE_API_KEY environment variable not set', 'red');
    log('', 'reset');
    log('Please set your API key:', 'yellow');
    log('  Windows: set APPWRITE_API_KEY=your_key_here', 'cyan');
    log('  Linux/Mac: export APPWRITE_API_KEY=your_key_here', 'cyan');
    log('', 'reset');
    process.exit(1);
  }

  log(`Project ID: ${CONFIG.projectId}`, 'dim');
  log(`Database ID: ${CONFIG.databaseId}`, 'dim');
  log(`API Endpoint: ${CONFIG.apiEndpoint}`, 'dim');
  log('', 'reset');

  const scriptDir = __dirname;

  try {
    const aiOpsSuccess = await createCollection(
      'ai_operations',
      path.join(scriptDir, 'ai_operations_schema.json')
    );

    const projectsSuccess = await createCollection(
      'zhcode_projects',
      path.join(scriptDir, 'zhcode_projects_schema.json')
    );

    const usersSuccess = await createCollection(
      'users',
      path.join(scriptDir, 'users_schema.json')
    );

    log('', 'reset');
    log('═══════════════════════════════════════', 'cyan');
    log('', 'reset');

    if (aiOpsSuccess && projectsSuccess && usersSuccess) {
      log('✅ All collections created successfully!', 'green');
      log('', 'reset');
      log('Collections ready to use:', 'green');
      log('  • ai_operations', 'green');
      log('  • zhcode_projects', 'green');
      log('  • users', 'green');
      log('', 'reset');
      process.exit(0);
    } else {
      log('❌ Some collections failed to create', 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run main
main();
