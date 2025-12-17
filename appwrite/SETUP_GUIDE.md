# 🚀 Appwrite Collections Setup Guide

## Quick Start

### Step 1: Get Your API Key

1. Go to [Appwrite Cloud Console](https://cloud.appwrite.io)
2. Log in to your account
3. Select your project
4. Go to **Settings** → **API Keys**
5. Create a new API key with permissions:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
6. Copy the API key

### Step 2: Set Environment Variable (PowerShell)

```powershell
# Option 1: Temporary (current session only)
$env:APPWRITE_API_KEY = "your_api_key_here"

# Option 2: Permanent (all future sessions)
[Environment]::SetEnvironmentVariable("APPWRITE_API_KEY", "your_api_key_here", "User")
```

### Step 3: Navigate to Setup Directory

```powershell
cd c:\Users\mjtan\Desktop\wencode\appwrite
```

### Step 4: Run Setup Script

```powershell
.\setup-collections.ps1
```

Expected output:
```
═══════════════════════════════════════
ZhCode IDE - Appwrite Collections Setup
═══════════════════════════════════════

Creating collection: ai_operations...
✅ Collection created: ai_operations (ID: ai_operations)
  ✓ Added attribute: userId
  ✓ Added attribute: actionType
  [... more attributes ...]
  ✓ Added index: idx_userId
  ✓ Added index: idx_timestamp

Creating collection: zhcode_projects...
✅ Collection created: zhcode_projects (ID: zhcode_projects)
  ✓ Added attribute: userId
  ✓ Added attribute: projectName
  [... more attributes ...]
  ✓ Added index: idx_userId
  ✓ Added index: idx_updatedAt

✅ All collections created successfully!

Collections ready to use:
  • ai_operations
  • zhcode_projects
```

---

## Manual Setup (Using cURL)

If you prefer to use cURL commands directly:

### 1. Create ai_operations Collection

```bash
curl -X POST https://cloud.appwrite.io/v1/databases/zhcode_db/collections \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": "ai_operations",
    "name": "ai_operations",
    "permissions": []
  }'
```

### 2. Add Attributes to ai_operations

```bash
# userId
curl -X POST https://cloud.appwrite.io/v1/databases/zhcode_db/collections/ai_operations/attributes \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "userId",
    "type": "string",
    "required": true,
    "size": 255
  }'

# actionType
curl -X POST https://cloud.appwrite.io/v1/databases/zhcode_db/collections/ai_operations/attributes \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "actionType",
    "type": "string",
    "required": true,
    "size": 50,
    "default": "generate"
  }'

# ... (add other attributes similarly)
```

---

## Collection Schemas

### Collection 1: ai_operations

**Purpose**: Store all AI operation logs

**Attributes**:
```
userId          string    (required) - User who performed operation
actionType      string    (required) - generate|explain|optimize|suggest
input           string    (required) - User input (max 10000 chars)
output          string    (required) - AI output (max 10000 chars)
language        string    (required) - zh|en
framework       string    (required) - zhcode|react|javascript|other
status          string    (required) - success|error
errorMessage    string    (optional) - Error description
code            string    (optional) - Code snippet
fileId          string    (optional) - Associated file ID
timestamp       datetime  (required) - Operation time
```

**Indexes**:
- `idx_userId` - Fast lookup by user
- `idx_timestamp` - Sort by date

---

### Collection 2: zhcode_projects

**Purpose**: Store user projects

**Attributes**:
```
userId          string    (required) - Project owner
projectName     string    (required) - Project name (max 255)
description     string    (optional) - Project description
files           json      (required) - {filename: content} map
mainFile        string    (required) - Main file name
language        string    (required) - 'zh' for Chinese ZhCode
tags            string[]  (optional) - Project tags
isPublic        boolean   (optional) - Public/private flag
createdAt       datetime  (required) - Creation time
updatedAt       datetime  (required) - Last update time
```

**Indexes**:
- `idx_userId` - List user's projects
- `idx_updatedAt` - Sort by update time (newest first)
- `idx_projectName` - Search by name

---

## Troubleshooting

### Error: "Collection already exists" (409)

The collection already exists in your database. You can:

**Option 1**: Skip and continue (the script handles this)

**Option 2**: Delete existing collection first
```powershell
$headers = @{
    "Authorization" = "Bearer $API_KEY"
}

Invoke-RestMethod `
    -Uri "https://cloud.appwrite.io/v1/databases/zhcode_db/collections/ai_operations" `
    -Method Delete `
    -Headers $headers
```

### Error: "Invalid API key" (401)

1. Verify your API key is correct
2. Check API key has proper permissions
3. Verify it's in the environment variable:
   ```powershell
   Write-Host $env:APPWRITE_API_KEY
   ```

### Error: "Database not found" (404)

Verify your database ID:
1. Go to Appwrite Console
2. Select your database
3. Copy the database ID
4. Update `$DATABASE_ID` in the script

### Attributes won't add (409)

Attributes already exist. This is normal if you've run the script before.

---

## Verification

### Check Collections via API

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}

# List all collections
Invoke-RestMethod `
    -Uri "https://cloud.appwrite.io/v1/databases/zhcode_db/collections" `
    -Method Get `
    -Headers $headers | ConvertTo-Json
```

### Check in Appwrite Console

1. Go to [Appwrite Cloud Console](https://cloud.appwrite.io)
2. Select your database
3. You should see both collections:
   - `ai_operations`
   - `zhcode_projects`

---

## Environment Variables Needed

Update your `.env` file in `packages/ide/`:

```bash
VITE_APPWRITE_PROJECT_ID=6940e8610022e30d684a
VITE_APPWRITE_DATABASE_ID=zhcode_db
VITE_APPWRITE_COLLECTION_ID=ai_operations
VITE_APPWRITE_API_KEY=your_api_key_here  # Optional for frontend
```

---

## Next Steps

1. ✅ Create collections (this guide)
2. ✅ Set environment variables
3. ✅ Start IDE: `cd packages/ide && npm run dev`
4. ✅ Test cloud features

---

## Files Included

```
appwrite/
├── ai_operations_schema.json        # Schema for AI logs
├── zhcode_projects_schema.json      # Schema for projects
├── setup-collections.ps1             # Automated setup script
└── SETUP_GUIDE.md                    # This file
```

---

## Complete Setup Command

Copy and paste this entire command:

```powershell
# Set API key
$env:APPWRITE_API_KEY = "your_api_key_here"

# Navigate to appwrite folder
cd c:\Users\mjtan\Desktop\wencode\appwrite

# Run setup
.\setup-collections.ps1
```

---

**Need help?** Check the logs and error messages. The script provides detailed feedback on each step.

**Ready to continue?** Start the IDE:
```powershell
cd c:\Users\mjtan\Desktop\wencode\packages\ide
npm run dev
```

Visit: http://localhost:3001
