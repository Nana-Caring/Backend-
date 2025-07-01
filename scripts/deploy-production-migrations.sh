#!/bin/bash

# Production Migration Script for NANA Project Backend
# This script safely deploys database migrations to production

set -e  # Exit on any error

echo "🚀 Starting Production Migration Deployment"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in production
if [ "$NODE_ENV" != "production" ]; then
    print_error "NODE_ENV must be set to 'production'"
    echo "Please run: export NODE_ENV=production"
    exit 1
fi

# Check required environment variables
required_vars=("DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set"
        exit 1
    fi
done

print_status "Environment variables verified ✓"

# Confirm production deployment
echo ""
print_warning "You are about to run migrations on PRODUCTION database:"
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_error "Migration cancelled by user"
    exit 1
fi

# Create backup timestamp
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DB_NAME}_${BACKUP_TIMESTAMP}.sql"

print_status "Creating database backup..."
if command -v pg_dump &> /dev/null; then
    pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
    print_status "Backup created: $BACKUP_FILE ✓"
else
    print_warning "pg_dump not found. Please create manual backup before proceeding."
    read -p "Have you created a backup? (yes/no): " backup_confirm
    if [ "$backup_confirm" != "yes" ]; then
        print_error "Please create a backup before running migrations"
        exit 1
    fi
fi

# Check current migration status
print_status "Checking current migration status..."
npx sequelize-cli db:migrate:status --env production

echo ""
read -p "Continue with migrations? (yes/no): " migrate_confirm
if [ "$migrate_confirm" != "yes" ]; then
    print_error "Migration cancelled"
    exit 1
fi

# Run migrations
print_status "Running database migrations..."
if npx sequelize-cli db:migrate --env production; then
    print_status "Migrations completed successfully ✓"
else
    print_error "Migration failed!"
    echo ""
    print_warning "You may need to rollback. Backup file: $BACKUP_FILE"
    exit 1
fi

# Verify migration status
print_status "Verifying migration status..."
npx sequelize-cli db:migrate:status --env production

# Test database connection
print_status "Testing database connection..."
if node -e "
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
"; then
    print_status "Database connection test passed ✓"
else
    print_error "Database connection test failed!"
    exit 1
fi

echo ""
print_status "🎉 Production migration deployment completed successfully!"
print_status "Backup file: $BACKUP_FILE"
echo ""
print_warning "Next steps:"
echo "1. Start your application"
echo "2. Test key functionalities"
echo "3. Monitor application logs"
echo "4. Keep the backup file safe"
