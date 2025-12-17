# Appwrite Collections - cURL Commands Reference

## Prerequisites

```bash
# Set environment variable
export APPWRITE_API_KEY="your_api_key_here"
export PROJECT_ID="6940e8610022e30d684a"
export DATABASE_ID="zhcode_db"
export API_ENDPOINT="https://cloud.appwrite.io/v1"
```

---

## 1. Create Collections

### Create ai_operations Collection

```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": "ai_operations",
    "name": "ai_operations",
    "permissions": []
  }'
```

### Create zhcode_projects Collection

```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": "zhcode_projects",
    "name": "zhcode_projects",
    "permissions": []
  }'
```

---

## 2. Add Attributes - ai_operations

### userId
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "userId",
    "type": "string",
    "required": true,
    "size": 255
  }'
```

### actionType
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "actionType",
    "type": "string",
    "required": true,
    "size": 50,
    "default": "generate"
  }'
```

### input
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "input",
    "type": "string",
    "required": true,
    "size": 10000
  }'
```

### output
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "output",
    "type": "string",
    "required": true,
    "size": 10000
  }'
```

### language
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "language",
    "type": "string",
    "required": true,
    "size": 10,
    "default": "zh"
  }'
```

### framework
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "framework",
    "type": "string",
    "required": true,
    "size": 50,
    "default": "zhcode"
  }'
```

### status
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "status",
    "type": "string",
    "required": true,
    "size": 20,
    "default": "success"
  }'
```

### errorMessage (optional)
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "errorMessage",
    "type": "string",
    "required": false,
    "size": 5000
  }'
```

### code (optional)
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "code",
    "type": "string",
    "required": false,
    "size": 10000
  }'
```

### fileId (optional)
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "fileId",
    "type": "string",
    "required": false,
    "size": 255
  }'
```

### timestamp
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "timestamp",
    "type": "datetime",
    "required": true,
    "default": "now"
  }'
```

---

## 3. Add Attributes - zhcode_projects

### userId
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "userId",
    "type": "string",
    "required": true,
    "size": 255
  }'
```

### projectName
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "projectName",
    "type": "string",
    "required": true,
    "size": 255
  }'
```

### description (optional)
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "description",
    "type": "string",
    "required": false,
    "size": 5000
  }'
```

### files
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "files",
    "type": "json",
    "required": true
  }'
```

### mainFile
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "mainFile",
    "type": "string",
    "required": true,
    "size": 255
  }'
```

### language
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "language",
    "type": "string",
    "required": true,
    "size": 10,
    "default": "zh"
  }'
```

### tags (optional array)
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "tags",
    "type": "string",
    "required": false,
    "array": true,
    "size": 1000
  }'
```

### isPublic (optional)
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "isPublic",
    "type": "boolean",
    "required": false,
    "default": false
  }'
```

### createdAt
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "createdAt",
    "type": "datetime",
    "required": true,
    "default": "now"
  }'
```

### updatedAt
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/attributes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "updatedAt",
    "type": "datetime",
    "required": true,
    "default": "now"
  }'
```

---

## 4. Add Indexes

### ai_operations Indexes

#### idx_userId
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/indexes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "idx_userId",
    "type": "key",
    "attributes": ["userId"],
    "orders": ["ASC"]
  }'
```

#### idx_timestamp
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations/indexes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "idx_timestamp",
    "type": "key",
    "attributes": ["timestamp"],
    "orders": ["DESC"]
  }'
```

### zhcode_projects Indexes

#### idx_userId
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/indexes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "idx_userId",
    "type": "key",
    "attributes": ["userId"],
    "orders": ["ASC"]
  }'
```

#### idx_updatedAt
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/indexes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "idx_updatedAt",
    "type": "key",
    "attributes": ["updatedAt"],
    "orders": ["DESC"]
  }'
```

#### idx_projectName
```bash
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects/indexes \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "idx_projectName",
    "type": "key",
    "attributes": ["projectName"],
    "orders": ["ASC"]
  }'
```

---

## 5. Verify

### List all collections
```bash
curl -X GET "${API_ENDPOINT}/databases/${DATABASE_ID}/collections" \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json"
```

### Get ai_operations collection
```bash
curl -X GET "${API_ENDPOINT}/databases/${DATABASE_ID}/collections/ai_operations" \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json"
```

### Get zhcode_projects collection
```bash
curl -X GET "${API_ENDPOINT}/databases/${DATABASE_ID}/collections/zhcode_projects" \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json"
```

---

## Quick Script (Bash)

Save as `setup.sh`:

```bash
#!/bin/bash

export APPWRITE_API_KEY="your_api_key_here"
export DATABASE_ID="zhcode_db"
export API_ENDPOINT="https://cloud.appwrite.io/v1"

# Create collections
curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"collectionId": "ai_operations", "name": "ai_operations"}'

curl -X POST ${API_ENDPOINT}/databases/${DATABASE_ID}/collections \
  -H "Authorization: Bearer ${APPWRITE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"collectionId": "zhcode_projects", "name": "zhcode_projects"}'

echo "✅ Collections created!"
```

Then run:
```bash
chmod +x setup.sh
./setup.sh
```

---

## Troubleshooting cURL

### Pretty print JSON response
```bash
curl ... | jq .
```

### Save response to file
```bash
curl -X GET ... > response.json
```

### Show response headers
```bash
curl -i -X GET ...
```

### Debug mode
```bash
curl -v -X GET ...
```

---

**Next Step**: Use the PowerShell or Node.js script for easier setup!
