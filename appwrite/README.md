# 🗄️ Appwrite Setup Files

This directory contains all the necessary files and scripts to set up Appwrite collections for ZhCode IDE.

---

## 📁 Files Overview

| File | Purpose | Usage |
|------|---------|-------|
| **SETUP_GUIDE.md** | Complete setup instructions | Start here! |
| **ai_operations_schema.json** | AI operations collection schema | Used by setup scripts |
| **zhcode_projects_schema.json** | Projects collection schema | Used by setup scripts |
| **setup-collections.ps1** | PowerShell setup script (recommended) | Windows users |
| **setup-collections.js** | Node.js setup script | Cross-platform |
| **CURL_COMMANDS.md** | Manual cURL commands reference | Advanced users |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Set API Key (PowerShell)

```powershell
$env:APPWRITE_API_KEY = "your_api_key_here"
```

### Step 2: Navigate to Directory

```powershell
cd c:\Users\mjtan\Desktop\wencode\appwrite
```

### Step 3: Run Setup Script

**Option A - PowerShell (Recommended)**:
```powershell
.\setup-collections.ps1
```

**Option B - Node.js**:
```bash
node setup-collections.js
```

---

## 🎯 Setup Methods

### Method 1: PowerShell Script ⭐ (Recommended)

**Pros**:
- ✅ Native Windows support
- ✅ Detailed error messages
- ✅ Automatic retry logic
- ✅ No dependencies needed

**Steps**:
```powershell
# 1. Set API key
$env:APPWRITE_API_KEY = "your_api_key_here"

# 2. Run script
cd c:\Users\mjtan\Desktop\wencode\appwrite
.\setup-collections.ps1

# 3. Verify
# Look for "✅ All collections created successfully!"
```

---

### Method 2: Node.js Script

**Pros**:
- ✅ Cross-platform
- ✅ Works on Windows, Mac, Linux
- ✅ Colored output

**Steps**:
```bash
# 1. Set API key
export APPWRITE_API_KEY="your_api_key_here"  # Mac/Linux
set APPWRITE_API_KEY=your_api_key_here       # Windows

# 2. Run script
cd c:\Users\mjtan\Desktop\wencode\appwrite
node setup-collections.js
```

---

### Method 3: Manual cURL Commands

**Pros**:
- ✅ Full control
- ✅ Understand each step
- ✅ Debug issues

**Steps**:
1. See [CURL_COMMANDS.md](./CURL_COMMANDS.md)
2. Execute each command one by one
3. Check for `200` or `201` responses

---

## 📋 What Gets Created

### Collection 1: ai_operations

Stores all AI operation logs:
- User ID
- Operation type (generate, explain, optimize, suggest)
- Input and output
- Language and framework
- Status (success/error)
- Timestamp

**Indexes**:
- By user ID (fast lookup)
- By timestamp (sort by date)

### Collection 2: zhcode_projects

Stores user projects:
- Project name and description
- All files as JSON
- Main file reference
- Creation and update times
- Tags and public/private flag

**Indexes**:
- By user ID (list projects)
- By update time (newest first)
- By project name (search)

---

## 🔑 Get Your API Key

1. Go to [Appwrite Cloud Console](https://cloud.appwrite.io)
2. Login with your account
3. Select your project
4. Go to **Settings** → **API Keys**
5. Create a new key with:
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `collections.read`
   - ✅ `collections.write`
6. Copy the key

---

## ✅ Verify Setup

### Check Collections Exist

**Via Appwrite Console**:
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select your database
3. You should see both collections

**Via PowerShell**:
```powershell
$headers = @{"Authorization" = "Bearer YOUR_API_KEY"}
$uri = "https://cloud.appwrite.io/v1/databases/zhcode_db/collections"
Invoke-RestMethod -Uri $uri -Headers $headers
```

---

## 🔧 Troubleshooting

### "Collection already exists" 

This is normal if you've run setup before. The script will skip these and continue.

### "Invalid API key"

1. Double-check your API key
2. Verify it has the right permissions
3. Check environment variable is set correctly:
   ```powershell
   Write-Host $env:APPWRITE_API_KEY
   ```

### "Database not found"

1. Verify your database ID: `zhcode_db`
2. Check in Appwrite Console
3. Update config if needed

### Connection timeout

1. Check your internet connection
2. Verify Appwrite Cloud is accessible
3. Try again in a few moments

---

## 📊 Schema Details

### AI Operations Schema

```
userId          string    (required) - Who did it
actionType      string    (required) - What was done
input           string    (required) - User input (10k chars max)
output          string    (required) - AI output (10k chars max)
language        string    (required) - zh or en
framework       string    (required) - zhcode, react, javascript
status          string    (required) - success or error
errorMessage    string    (optional) - Error details
code            string    (optional) - Code snippet
fileId          string    (optional) - Associated file
timestamp       datetime  (required) - When it happened
```

### Projects Schema

```
userId          string    (required) - Project owner
projectName     string    (required) - Name (255 chars max)
description     string    (optional) - Description (5k chars max)
files           json      (required) - {filename: content}
mainFile        string    (required) - Main entry point
language        string    (required) - 'zh' for Chinese
tags            string[]  (optional) - Project tags
isPublic        boolean   (optional) - Public/private
createdAt       datetime  (required) - Creation time
updatedAt       datetime  (required) - Last update time
```

---

## 🎯 Next Steps

After setting up collections:

1. ✅ Collections created
2. ⏭️ Update `.env` file in `packages/ide/`:
   ```
   VITE_APPWRITE_PROJECT_ID=6940e8610022e30d684a
   VITE_APPWRITE_DATABASE_ID=zhcode_db
   VITE_APPWRITE_COLLECTION_ID=ai_operations
   ```

3. ⏭️ Start IDE:
   ```bash
   cd packages/ide
   npm install
   npm run dev
   ```

4. ⏭️ Visit http://localhost:3001

---

## 📚 Additional Resources

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete step-by-step guide
- [CURL_COMMANDS.md](./CURL_COMMANDS.md) - Manual API commands
- [Appwrite Docs](https://appwrite.io/docs) - Official documentation

---

## 💡 Tips

- **Keep API keys safe**: Never commit them to git
- **Use environment variables**: Safer than hardcoding
- **Check permissions**: API key needs database + collection permissions
- **Test immediately**: Run a test after setup to confirm

---

## 🆘 Need Help?

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review error messages carefully
3. Check [Appwrite Console](https://cloud.appwrite.io)
4. See [CURL_COMMANDS.md](./CURL_COMMANDS.md) for manual commands

---

**Ready?** Start with [SETUP_GUIDE.md](./SETUP_GUIDE.md) 🚀
