# Production Migration Deployment Guide

## Pre-Deployment Checklist

### 1. Database Backup
**CRITICAL**: Always backup your production database before running migrations.

```bash
# For PostgreSQL
pg_dump -h your-host -U your-username -d your-database-name > backup_$(date +%Y%m%d_%H%M%S).sql

# For cloud databases, use your provider's backup tools
```

### 2. Environment Configuration
Ensure your production environment variables are set:

```bash
# Production database configuration
DB_HOST=your-production-host
DB_PORT=5432
DB_NAME=your-production-db
DB_USER=your-production-user
DB_PASSWORD=your-production-password
NODE_ENV=production
```

### 3. Migration Files Summary
The following migrations will be applied in order:

1. `20250101000001-create-users-table.js` - Creates Users table with all personal detail fields
2. `20250313201217-add-accountType-to-Accounts.js` - Creates Accounts table
3. `20250313210715-add-parentAccountId-to-accounts.js` - Adds parent account relationships
4. `20250315194834-add-caregiver-to-accounts.js` - Adds caregiver relationships
5. `20250315202604-add-idnumber-unique-constraint.js` - Adds ID number constraints
6. `20250316130704-remove-relation-from-users.js` - Schema cleanup (no-op)
7. `20250316144650-add-relation-to-users.js` - Schema cleanup (no-op)
8. `20250316163130-add-fields-to-account.js` - Adds account fields
9. `20250316204040-add-accountName-to-Accounts.js` - Adds account name
10. `20250316205028-add-accountNumber-to-Accounts.js` - Adds account number
11. `20250424000000-add autoincremenet-users-table.js` - Updates foreign keys
12. `20250424000002-create-accounts-table.js` - Disabled (no-op)
13. `20250424000006-create-transactions-table.js` - Creates Transactions table
14. `20250611165834-modify-lastname-to-middlename.js` - Schema cleanup (no-op)
15. `20250626202942-create-funder-dependent.js` - Creates FunderDependent relationship table
16. `20250630000001-create-transactions-uuid.js` - Disabled (no-op)
17. `20250630000002-create-transactions-simple.js` - Disabled (no-op)
18. `20250630000003-create-transactions-simple.js` - Disabled (no-op)
19. `20250630000004-add-user-profile-fields.js` - Schema cleanup (no-op)

## Deployment Steps

### Step 1: Test in Staging Environment
Before production, test on a staging environment that mirrors production:

```bash
# Set staging environment
export NODE_ENV=staging

# Run migrations
npx sequelize-cli db:migrate --env staging

# Verify tables and data
npx sequelize-cli db:migrate:status --env staging
```

### Step 2: Production Deployment

1. **Stop your application** (to prevent concurrent access during migration)
2. **Create database backup**
3. **Run migrations**:

```bash
# Set production environment
export NODE_ENV=production

# Run migrations
npx sequelize-cli db:migrate --env production

# Verify migration status
npx sequelize-cli db:migrate:status --env production
```

4. **Test database connectivity**
5. **Start your application**

### Step 3: Verification Commands

After deployment, verify the database schema:

```sql
-- Check Users table structure
\d "Users"

-- Check Accounts table structure  
\d "Accounts"

-- Check Transactions table structure
\d "Transactions"

-- Check FunderDependents table structure
\d "FunderDependents"

-- Verify personal detail fields are nullable
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'Users' 
AND column_name IN ('phoneNumber', 'postalAddressLine1', 'homeAddressLine1');
```

## Production Environment Configuration

### config/config.json
Ensure your production configuration is correct:

```json
{
  "production": {
    "username": "${DB_USER}",
    "password": "${DB_PASSWORD}",
    "database": "${DB_NAME}",
    "host": "${DB_HOST}",
    "port": "${DB_PORT}",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    },
    "logging": false
  }
}
```

## Rollback Plan

If something goes wrong, you can rollback migrations:

```bash
# Rollback last migration
npx sequelize-cli db:migrate:undo --env production

# Rollback to specific migration
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-migration-name.js --env production

# Restore from backup (last resort)
psql -h your-host -U your-username -d your-database-name < backup_file.sql
```

## Post-Migration Testing

After deployment, test these key functionalities:

1. **User Registration**: Verify new users are created with personal details as null
2. **User Login**: Verify existing users can still log in
3. **Profile Updates**: Test updating personal details
4. **Account Creation**: Test funder and dependent account creation
5. **Transactions**: Verify transaction functionality

## Monitoring

Monitor your application logs for:
- Database connection errors
- Migration-related errors  
- Model validation errors
- Foreign key constraint violations

## Key Changes in This Migration

1. **Personal Details as Null**: All personal detail fields (phone, addresses) are now null by default
2. **Consistent Data Types**: All IDs are now INTEGER for consistency
3. **Proper Foreign Keys**: Fixed UUID/INTEGER conflicts
4. **Profile Completion Tracking**: New endpoint to track profile completion

## Emergency Contacts

- Database Administrator: [Your DBA contact]
- DevOps Team: [Your DevOps contact]
- Application Owner: [Your contact]

---

**Remember**: Always test thoroughly in staging before production deployment!
