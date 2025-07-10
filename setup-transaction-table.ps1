# PowerShell Script to Setup Transaction Table with UUID Support
# Run this script to execute the SQL setup and verify the Transaction table

# Database connection parameters (update these with your actual values)
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "your_database_name"  # Replace with your actual database name
$DB_USER = "your_username"       # Replace with your actual username
$DB_PASSWORD = "your_password"   # Replace with your actual password

# Alternative: Use environment variables or config file
# $DB_HOST = $env:DB_HOST
# $DB_PORT = $env:DB_PORT
# $DB_NAME = $env:DB_NAME
# $DB_USER = $env:DB_USER
# $DB_PASSWORD = $env:DB_PASSWORD

Write-Host "Starting Transaction Table Setup..." -ForegroundColor Green

# Function to execute SQL using psql
function Execute-SQL {
    param(
        [string]$SqlCommand,
        [string]$Description
    )
    
    Write-Host "Executing: $Description" -ForegroundColor Yellow
    
    # Use psql to execute the command
    $env:PGPASSWORD = $DB_PASSWORD
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $SqlCommand 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Success: $Description" -ForegroundColor Green
        if ($result) {
            Write-Host $result -ForegroundColor Cyan
        }
    } else {
        Write-Host "✗ Failed: $Description" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        return $false
    }
    return $true
}

# Function to execute SQL file
function Execute-SQLFile {
    param(
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "Executing SQL file: $Description" -ForegroundColor Yellow
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "✗ SQL file not found: $FilePath" -ForegroundColor Red
        return $false
    }
    
    $env:PGPASSWORD = $DB_PASSWORD
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $FilePath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Success: $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ Failed: $Description" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        return $false
    }
}

# Step 1: Check if psql is available
Write-Host "Checking psql availability..." -ForegroundColor Blue
try {
    $psqlVersion = & psql --version 2>&1
    Write-Host "✓ psql found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "You can download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Step 2: Test database connection
Write-Host "Testing database connection..." -ForegroundColor Blue
$env:PGPASSWORD = $DB_PASSWORD
$connectionTest = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database connection successful" -ForegroundColor Green
} else {
    Write-Host "✗ Database connection failed" -ForegroundColor Red
    Write-Host $connectionTest -ForegroundColor Red
    Write-Host "Please check your database connection parameters and try again." -ForegroundColor Yellow
    exit 1
}

# Step 3: Check current Transaction table structure
Write-Host "`nChecking current Transaction table structure..." -ForegroundColor Blue
$tableCheck = Execute-SQL "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'Transactions' ORDER BY ordinal_position;" "Check Transaction table structure"

# Step 4: Enable UUID extension if needed
Write-Host "`nEnabling UUID extension..." -ForegroundColor Blue
Execute-SQL 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' "Enable UUID extension"

# Step 5: Execute the main SQL setup file
Write-Host "`nExecuting Transaction table setup..." -ForegroundColor Blue
$sqlFilePath = Join-Path $PSScriptRoot "manual-transaction-table-setup.sql"
$setupSuccess = Execute-SQLFile $sqlFilePath "Transaction table setup"

if (-not $setupSuccess) {
    Write-Host "`nSetup failed. Please check the errors above and try again." -ForegroundColor Red
    exit 1
}

# Step 6: Verify the new table structure
Write-Host "`nVerifying new table structure..." -ForegroundColor Blue
Execute-SQL "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'Transactions' ORDER BY ordinal_position;" "Verify Transaction table structure"

# Step 7: Check foreign key constraints
Write-Host "`nChecking foreign key constraints..." -ForegroundColor Blue
Execute-SQL "SELECT tc.constraint_name, tc.constraint_type, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name LEFT JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE tc.table_name = 'Transactions';" "Check constraints"

# Step 8: Test UUID generation
Write-Host "`nTesting UUID generation..." -ForegroundColor Blue
Execute-SQL "SELECT gen_random_uuid() AS test_uuid;" "Test UUID generation"

# Step 9: Check if there are any accounts to test with
Write-Host "`nChecking available accounts..." -ForegroundColor Blue
Execute-SQL "SELECT id, \"accountName\", \"accountNumber\" FROM \"Accounts\" LIMIT 5;" "List available accounts"

Write-Host "`n=== Transaction Table Setup Complete ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test your money transfer endpoints" -ForegroundColor White
Write-Host "2. Verify that transactions are created with UUID ids" -ForegroundColor White
Write-Host "3. Check that foreign key relationships work properly" -ForegroundColor White

# Optional: Run a quick test transaction if accounts exist
$response = Read-Host "`nWould you like to create a test transaction? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "Creating test transaction..." -ForegroundColor Blue
    $testSql = @"
    WITH test_account AS (
        SELECT id FROM "Accounts" LIMIT 1
    )
    INSERT INTO "Transactions" 
    ("accountId", "amount", "type", "description", "reference") 
    SELECT 
        id,
        10.00, 
        'Credit', 
        'PowerShell setup test transaction',
        'ps-test-' || EXTRACT(EPOCH FROM NOW())
    FROM test_account
    RETURNING id, "accountId", amount, type, description;
"@
    
    Execute-SQL $testSql "Create test transaction"
    
    Write-Host "`nTest transaction created. You can delete it later if needed." -ForegroundColor Green
}

Write-Host "`nSetup script completed!" -ForegroundColor Green
