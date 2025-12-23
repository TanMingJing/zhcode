/**
 * Script to add the fileRefs attribute to zhcode_projects collection
 * Run with: node add-fileRefs-attribute.js
 */

const sdk = require('node-appwrite');

// Configuration - update these values
const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '694124fc00267079b6cd';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'YOUR_API_KEY_HERE';
const DATABASE_ID = 'zhcode_db';
const COLLECTION_ID = 'zhcode_projects';

async function main() {
  if (!APPWRITE_API_KEY || APPWRITE_API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('Please set APPWRITE_API_KEY environment variable or update the script');
    console.log('');
    console.log('Alternative: Add the attribute manually in Appwrite Console:');
    console.log('1. Go to https://cloud.appwrite.io/console');
    console.log('2. Select your project');
    console.log('3. Go to Databases -> zhcode_db -> zhcode_projects');
    console.log('4. Click "Create attribute"');
    console.log('5. Select "String"');
    console.log('6. Set:');
    console.log('   - Attribute Key: fileRefs');
    console.log('   - Size: 100000');
    console.log('   - Required: Yes');
    console.log('   - Default value: [] (or leave empty)');
    console.log('7. Click "Create"');
    return;
  }

  const client = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  try {
    // Check if attribute already exists
    const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    const existingAttr = collection.attributes.find(a => a.key === 'fileRefs');
    
    if (existingAttr) {
      console.log('fileRefs attribute already exists!');
      console.log('Status:', existingAttr.status);
      return;
    }

    // Create the fileRefs attribute
    console.log('Creating fileRefs attribute...');
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'fileRefs',      // key
      100000,          // size (100KB should be enough for file references JSON)
      true,            // required
      '[]',            // default value (empty array)
      false            // array
    );

    console.log('fileRefs attribute created successfully!');
    console.log('Note: It may take a few seconds for the attribute to become available.');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 409) {
      console.log('Attribute already exists.');
    }
  }
}

main();
