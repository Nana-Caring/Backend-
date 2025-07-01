# Production Migration Script for NANA Project Backend (Windows PowerShell)
# This script safely deploys database migrations to production

param(
    [switch]$Force = $false
)

Write-Host "🚀 Starting Production Migration Deployment" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if running in production
if ($env:NODE_ENV -ne "production") {
    Write-Error "NODE_ENV must be set to 'production'"
    Write-Host "Please run: `$env:NODE_ENV='production'"
    exit 1
}

# Check required environment variables
$requiredVars = @("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD")
foreach ($var in $requiredVars) {
    if (-not (Get-Variable -Name $var -ValueOnly -ErrorAction SilentlyContinue)) {
        if (-not $env:$var) {
            Write-Error "Required environment variable $var is not set"
            exit 1
        }
    }
}

Write-Status "Environment variables verified ✓"

# Confirm production deployment
if (-not $Force) {
    Write-Host ""
    Write-Warning "You are about to run migrations on PRODUCTION database:"
    Write-Host "  Host: $($env:DB_HOST)"
    Write-Host "  Database: $($env:DB_NAME)"
    Write-Host "  User: $($env:DB_USER)"
    Write-Host ""
    
    $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Error "Migration cancelled by user"
        exit 1
    }
}

# Create backup timestamp
$backupTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_$($env:DB_NAME)_$backupTimestamp.sql"

Write-Status "Creating database backup..."
if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
    try {
        & pg_dump -h $env:DB_HOST -U $env:DB_USER -d $env:DB_NAME > $backupFile
        Write-Status "Backup created: $backupFile ✓"
    }
    catch {
        Write-Error "Failed to create backup: $_"
        exit 1
    }
}
else {
    Write-Warning "pg_dump not found. Please create manual backup before proceeding."
    if (-not $Force) {
        $backupConfirm = Read-Host "Have you created a backup? (yes/no)"
        if ($backupConfirm -ne "yes") {
            Write-Error "Please create a backup before running migrations"
            exit 1
        }
    }
}

# Check current migration status
Write-Status "Checking current migration status..."
try {
    & npx sequelize-cli db:migrate:status --env production
}
catch {
    Write-Error "Failed to check migration status: $_"
    exit 1
}

if (-not $Force) {
    Write-Host ""
    $migrateConfirm = Read-Host "Continue with migrations? (yes/no)"
    if ($migrateConfirm -ne "yes") {
        Write-Error "Migration cancelled"
        exit 1
    }
}

# Run migrations
Write-Status "Running database migrations..."
try {
    & npx sequelize-cli db:migrate --env production
    Write-Status "Migrations completed successfully ✓"
}
catch {
    Write-Error "Migration failed: $_"
    Write-Host ""
    Write-Warning "You may need to rollback. Backup file: $backupFile"
    exit 1
}

# Verify migration status
Write-Status "Verifying migration status..."
try {
    & npx sequelize-cli db:migrate:status --env production
}
catch {
    Write-Warning "Could not verify migration status: $_"
}

# Test database connection
Write-Status "Testing database connection..."
$testScript = @"
const { sequelize } = require('./models');
sequelize.authenticate()
    .then(() => {
        console.log('✓ Database connection successful');
        process.exit(0);
    })
    .catch(err => {
        console.error('✗ Database connection failed:', err.message);
        process.exit(1);
    });
"@

try {
    $testScript | node
    Write-Status "Database connection test passed ✓"
}
catch {
    Write-Error "Database connection test failed: $_"
    exit 1
}

Write-Host ""
Write-Status "🎉 Production migration deployment completed successfully!"
Write-Status "Backup file: $backupFile"
Write-Host ""
Write-Warning "Next steps:"
Write-Host "1. Start your application"
Write-Host "2. Test key functionalities"
Write-Host "3. Monitor application logs"
Write-Host "4. Keep the backup file safe"
