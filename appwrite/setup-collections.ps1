# ZhCode IDE - Appwrite Collections Setup Script
# This script creates the required collections for ZhCode IDE

# Configuration
$PROJECT_ID = "694124fc00267079b6cd"
$DATABASE_ID = "zhcode_db"
$API_ENDPOINT = "https://sgp.cloud.appwrite.io/v1"

# You need to set your API key as an environment variable before running this script
# Set-Item -Path Env:APPWRITE_API_KEY -Value "your_api_key_here"

$API_KEY = $env:APPWRITE_API_KEY

if (-not $API_KEY) {
    Write-Host "❌ Error: APPWRITE_API_KEY environment variable not set" -ForegroundColor Red
    Write-Host "Please set your API key first:" -ForegroundColor Yellow
    Write-Host 'Set-Item -Path Env:APPWRITE_API_KEY -Value "your_api_key_here"' -ForegroundColor Cyan
    exit 1
}

# Function to create collection
function Create-Collection {
    param(
        [string]$CollectionName,
        [string]$SchemaFilePath
    )

    Write-Host "Creating collection: $CollectionName..." -ForegroundColor Blue
    
    if (-not (Test-Path $SchemaFilePath)) {
        Write-Host "❌ Schema file not found: $SchemaFilePath" -ForegroundColor Red
        return $false
    }

    $schema = Get-Content -Path $SchemaFilePath -Raw | ConvertFrom-Json
    
    $collectionId = ($CollectionName -replace ' ', '_').ToLower()
    
    # Create collection payload
    $payload = @{
        collectionId = $collectionId
        name = $schema.name
        permissions = $schema.permissions
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $API_KEY"
        "Content-Type" = "application/json"
    }

    try {
        # Create the collection
        $response = Invoke-RestMethod `
            -Uri "$API_ENDPOINT/databases/$DATABASE_ID/collections" `
            -Method Post `
            -Headers $headers `
            -Body $payload

        Write-Host "✅ Collection created: $CollectionName (ID: $collectionId)" -ForegroundColor Green
        
        # Add attributes
        foreach ($attr in $schema.attributes) {
            Add-Attribute -CollectionId $collectionId -Attribute $attr
        }

        # Add indexes
        foreach ($index in $schema.indexes) {
            Add-Index -CollectionId $collectionId -Index $index
        }

        return $true
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "⚠️  Collection already exists: $CollectionName" -ForegroundColor Yellow
            return $true
        }
        Write-Host "❌ Error creating collection: $_" -ForegroundColor Red
        return $false
    }
}

# Function to add attribute to collection
function Add-Attribute {
    param(
        [string]$CollectionId,
        [PSObject]$Attribute
    )

    $payload = @{
        key = $Attribute.key
        type = $Attribute.type
        required = $Attribute.required
        array = $Attribute.array
    }

    if ($Attribute.size) {
        $payload.size = $Attribute.size
    }

    if ($Attribute.default) {
        $payload.default = $Attribute.default
    }

    if ($Attribute.type -eq "string" -or $Attribute.type -eq "integer") {
        if ($Attribute.PSObject.Properties.Name -contains "size") {
            $payload.size = $Attribute.size
        }
    }

    $headers = @{
        "Authorization" = "Bearer $API_KEY"
        "Content-Type" = "application/json"
    }

    try {
        $response = Invoke-RestMethod `
            -Uri "$API_ENDPOINT/databases/$DATABASE_ID/collections/$CollectionId/attributes" `
            -Method Post `
            -Headers $headers `
            -Body ($payload | ConvertTo-Json)

        Write-Host "  ✓ Added attribute: $($Attribute.key)" -ForegroundColor Green
    }
    catch {
        if ($_.Exception.Response.StatusCode -ne 409) {
            Write-Host "  ⚠ Attribute error: $($Attribute.key)" -ForegroundColor Yellow
        }
    }
}

# Function to add index to collection
function Add-Index {
    param(
        [string]$CollectionId,
        [PSObject]$Index
    )

    $payload = @{
        key = $Index.key
        type = $Index.type
        attributes = $Index.attributes
        orders = $Index.orders
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $API_KEY"
        "Content-Type" = "application/json"
    }

    try {
        $response = Invoke-RestMethod `
            -Uri "$API_ENDPOINT/databases/$DATABASE_ID/collections/$CollectionId/indexes" `
            -Method Post `
            -Headers $headers `
            -Body $payload

        Write-Host "  ✓ Added index: $($Index.key)" -ForegroundColor Green
    }
    catch {
        if ($_.Exception.Response.StatusCode -ne 409) {
            Write-Host "  ⚠ Index error: $($Index.key)" -ForegroundColor Yellow
        }
    }
}

# Main execution
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ZhCode IDE - Appwrite Collections Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Gray
Write-Host "Database ID: $DATABASE_ID" -ForegroundColor Gray
Write-Host "API Endpoint: $API_ENDPOINT" -ForegroundColor Gray
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Create collections
$ai_ops_success = Create-Collection -CollectionName "ai_operations" `
    -SchemaFilePath "$scriptDir\ai_operations_schema.json"

$projects_success = Create-Collection -CollectionName "zhcode_projects" `
    -SchemaFilePath "$scriptDir\zhcode_projects_schema.json"

$users_success = Create-Collection -CollectionName "users" `
    -SchemaFilePath "$scriptDir\users_schema.json"

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if ($ai_ops_success -and $projects_success -and $users_success) {
    Write-Host "✅ All collections created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Collections ready to use:" -ForegroundColor Green
    Write-Host "  • ai_operations" -ForegroundColor Green
    Write-Host "  • zhcode_projects" -ForegroundColor Green
    Write-Host "  • users" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "❌ Some collections failed to create" -ForegroundColor Red
    exit 1
}
