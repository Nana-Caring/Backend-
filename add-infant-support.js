require('dotenv').config();
const pool = require('./db');

async function addInfantSupport() {
  let client;
  
  try {
    console.log('🍼 ADDING INFANT SUPPORT TO NANA CARING SYSTEM');
    console.log('═══════════════════════════════════════════════\n');
    
    client = await pool.connect();
    console.log('✅ Database connected successfully\n');
    
    // Step 1: Add age-related columns to Users table for dependents
    console.log('📊 STEP 1: Adding age-related fields to Users table...');
    
    const alterQueries = [
      // Add birth date field
      `ALTER TABLE "Users" 
       ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE`,
      
      // Add calculated age field (virtual field)
      `ALTER TABLE "Users" 
       ADD COLUMN IF NOT EXISTS "calculatedAge" INTEGER`,
       
      // Add pregnancy status for caregivers
      `ALTER TABLE "Users" 
       ADD COLUMN IF NOT EXISTS "isPregnant" BOOLEAN DEFAULT FALSE`,
       
      // Add expected due date for pregnant caregivers
      `ALTER TABLE "Users" 
       ADD COLUMN IF NOT EXISTS "expectedDueDate" DATE`,
       
      // Add infant status for dependents
      `ALTER TABLE "Users" 
       ADD COLUMN IF NOT EXISTS "isInfant" BOOLEAN DEFAULT FALSE`,
       
      // Add unborn baby status
      `ALTER TABLE "Users" 
       ADD COLUMN IF NOT EXISTS "isUnborn" BOOLEAN DEFAULT FALSE`,
       
      // Add parent/guardian relationship
      `ALTER TABLE "Users" 
       ADD COLUMN IF NOT EXISTS "parentCaregiverId" INTEGER 
       REFERENCES "Users"(id) ON DELETE CASCADE`
    ];
    
    for (let query of alterQueries) {
      try {
        await client.query(query);
        console.log('   ✅ Added column successfully');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('   ✅ Column already exists');
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    // Step 2: Update age category enum to include Infant
    console.log('\n📂 STEP 2: Updating age category enum to include Infant...');
    
    try {
      // First check if Infant already exists
      const existingEnums = await client.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid 
          FROM pg_type 
          WHERE typname = 'enum_products_agecategory'
        )
      `);
      
      const hasInfant = existingEnums.rows.some(row => row.enumlabel === 'Infant');
      
      if (!hasInfant) {
        await client.query(`ALTER TYPE enum_products_agecategory ADD VALUE 'Infant'`);
        console.log('   ✅ Added "Infant" to age category enum');
      } else {
        console.log('   ✅ "Infant" already exists in age category enum');
      }
      
    } catch (error) {
      console.log(`   ❌ Error updating age category enum: ${error.message}`);
    }
    
    // Step 3: Create function to automatically calculate age
    console.log('\n🔢 STEP 3: Creating age calculation function...');
    
    const ageCalculationFunction = `
      CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
      RETURNS INTEGER AS $$
      BEGIN
        IF birth_date IS NULL THEN
          RETURN NULL;
        END IF;
        
        RETURN DATE_PART('year', AGE(birth_date));
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await client.query(ageCalculationFunction);
    console.log('   ✅ Created age calculation function');
    
    // Step 4: Create trigger to auto-update calculated age
    console.log('\n⚡ STEP 4: Creating auto-update trigger for age...');
    
    const updateAgeTrigger = `
      CREATE OR REPLACE FUNCTION update_calculated_age()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."calculatedAge" = calculate_age(NEW."dateOfBirth");
        NEW."isInfant" = (NEW."calculatedAge" IS NOT NULL AND NEW."calculatedAge" = 0) OR NEW."isUnborn" = TRUE;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS trigger_update_age ON "Users";
      
      CREATE TRIGGER trigger_update_age
        BEFORE INSERT OR UPDATE ON "Users"
        FOR EACH ROW
        EXECUTE FUNCTION update_calculated_age();
    `;
    
    await client.query(updateAgeTrigger);
    console.log('   ✅ Created auto-update trigger for age and infant status');
    
    // Step 5: Update product age categories to support pregnancy and infants
    console.log('\n📦 STEP 5: Updating products for pregnancy and infant support...');
    
    // Update existing pregnancy products to have proper age targeting
    await client.query(`
      UPDATE products 
      SET "ageCategory" = 'Adult',
          "minAge" = 0,
          "maxAge" = NULL,
          description = description || ' (Suitable for pregnancy and infant care)'
      WHERE category = 'Pregnancy'
    `);
    
    console.log('   ✅ Updated pregnancy products for infant care');
    
    // Step 6: Create sample infant and pregnancy data
    console.log('\n👶 STEP 6: Creating sample caregiver-infant relationships...');
    
    // Sample pregnant caregiver
    const pregnantCaregiverQuery = `
      INSERT INTO "Users" (
        "firstName", "surname", email, password, role, "Idnumber",
        "isPregnant", "expectedDueDate", "dateOfBirth", "createdAt", "updatedAt"
      ) VALUES (
        'Sarah', 'Mothwa', 'sarah.mothwa@example.com', 
        '$2b$10$defaulthashedpassword', 'caregiver', '8801124567890',
        TRUE, DATE('2025-03-15'), DATE('1988-01-12'), NOW(), NOW()
      )
      ON CONFLICT ("Idnumber") DO UPDATE SET
        "isPregnant" = TRUE,
        "expectedDueDate" = DATE('2025-03-15')
      RETURNING id, "firstName", "surname"
    `;
    
    try {
      const caregiverResult = await client.query(pregnantCaregiverQuery);
      console.log(`   ✅ Created/updated pregnant caregiver: ${caregiverResult.rows[0].firstName} ${caregiverResult.rows[0].surname}`);
      
      const caregiverId = caregiverResult.rows[0].id;
      
      // Create unborn baby dependent
      const unbornBabyQuery = `
        INSERT INTO "Users" (
          "firstName", "surname", email, password, role, "Idnumber",
          "isUnborn", "isInfant", "expectedDueDate", "parentCaregiverId",
          "createdAt", "updatedAt"
        ) VALUES (
          'Baby', 'Mothwa', 'baby.mothwa@system.internal', 
          '$2b$10$defaulthashedpassword', 'dependent', '0000000000001',
          TRUE, TRUE, DATE('2025-03-15'), $1, NOW(), NOW()
        )
        ON CONFLICT ("Idnumber") DO UPDATE SET
          "isUnborn" = TRUE,
          "isInfant" = TRUE,
          "parentCaregiverId" = $1
        RETURNING id, "firstName", "surname"
      `;
      
      const babyResult = await client.query(unbornBabyQuery, [caregiverId]);
      console.log(`   ✅ Created/updated unborn baby: ${babyResult.rows[0].firstName} ${babyResult.rows[0].surname}`);
      
      // Create newborn infant (0 years old)
      const infantQuery = `
        INSERT INTO "Users" (
          "firstName", "surname", email, password, role, "Idnumber",
          "dateOfBirth", "isInfant", "parentCaregiverId",
          "createdAt", "updatedAt"
        ) VALUES (
          'Aiden', 'Mothwa', 'aiden.mothwa@system.internal', 
          '$2b$10$defaulthashedpassword', 'dependent', '2024110400001',
          DATE('2024-11-04'), TRUE, $1, NOW(), NOW()
        )
        ON CONFLICT ("Idnumber") DO UPDATE SET
          "dateOfBirth" = DATE('2024-11-04'),
          "isInfant" = TRUE,
          "parentCaregiverId" = $1
        RETURNING id, "firstName", "surname", "calculatedAge"
      `;
      
      const infantResult = await client.query(infantQuery, [caregiverId]);
      console.log(`   ✅ Created/updated infant: ${infantResult.rows[0].firstName} ${infantResult.rows[0].surname} (Age: ${infantResult.rows[0].calculatedAge})`);
      
    } catch (error) {
      console.log(`   ❌ Error creating sample data: ${error.message}`);
    }
    
    // Step 7: Verify the setup
    console.log('\n📊 STEP 7: Verifying infant support setup...');
    
    const verificationQuery = `
      SELECT 
        "firstName", "surname", role, "dateOfBirth", "calculatedAge",
        "isInfant", "isUnborn", "isPregnant", "expectedDueDate"
      FROM "Users" 
      WHERE role IN ('caregiver', 'dependent')
      AND ("isInfant" = TRUE OR "isUnborn" = TRUE OR "isPregnant" = TRUE)
      ORDER BY role, "firstName"
    `;
    
    const verificationResult = await client.query(verificationQuery);
    
    console.log('Family relationships:');
    verificationResult.rows.forEach(user => {
      let status = [];
      if (user.isPregnant) status.push('Pregnant');
      if (user.isUnborn) status.push('Unborn');
      if (user.isInfant) status.push('Infant');
      
      console.log(`   ${user.firstName} ${user.surname} (${user.role})`);
      console.log(`     Age: ${user.calculatedAge || 'Unborn'} | Status: ${status.join(', ') || 'Normal'}`);
      if (user.expectedDueDate) {
        console.log(`     Expected Due: ${user.expectedDueDate.toISOString().split('T')[0]}`);
      }
    });
    
    // Check product categories
    const productCategoriesQuery = `
      SELECT category, COUNT(*) as count, 
             MIN("minAge") as min_age, MAX("maxAge") as max_age
      FROM products 
      GROUP BY category 
      ORDER BY category
    `;
    
    const productCategories = await client.query(productCategoriesQuery);
    
    console.log('\n📦 Product categories with age ranges:');
    productCategories.rows.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count} products (Ages: ${cat.min_age || 0}-${cat.max_age || '∞'})`);
    });
    
    console.log('\n🎉 INFANT SUPPORT SETUP COMPLETE!');
    console.log('════════════════════════════════════');
    console.log('✅ Added age calculation fields');
    console.log('✅ Added pregnancy tracking');
    console.log('✅ Added infant support (0 years)');
    console.log('✅ Added unborn baby support');
    console.log('✅ Created parent-child relationships');
    console.log('✅ Updated product age targeting');
    console.log('✅ Auto-calculating ages with triggers');
    
    console.log('\n🍼 PREGNANCY & INFANT FEATURES:');
    console.log('   • Caregivers can register as pregnant');
    console.log('   • Unborn babies can be registered as dependents');
    console.log('   • Newborns (0 years) automatically marked as infants');
    console.log('   • Pregnancy products target both mother and baby');
    console.log('   • Age automatically calculated from birth date');
    console.log('   • Parent-child relationships tracked');
    
  } catch (error) {
    console.error('❌ Error setting up infant support:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    process.exit(0);
  }
}

addInfantSupport();