const { Client } = require('pg');
require('dotenv').config();

async function updateDependentIdNumbers() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'prince123',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nanapocket',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 UPDATING DEPENDENT ID NUMBERS FOR AGE TESTING\n');
    console.log('=' .repeat(60));

    await client.connect();

    // First, get current dependents
    console.log('📊 STEP 1: Current Dependents');
    console.log('-' .repeat(40));
    
    const currentDependents = await client.query(`
      SELECT id, "firstName", "surname", "Idnumber", "calculatedAge"
      FROM public."Users" 
      WHERE role = 'dependent' 
      AND "isBlocked" = false
      ORDER BY id
    `);

    console.log(`Found ${currentDependents.rows.length} dependents:`);
    currentDependents.rows.forEach(dep => {
      console.log(`   👤 ${dep.firstName} ${dep.surname} (ID: ${dep.id})`);
      console.log(`      Current ID Number: ${dep.Idnumber}`);
      console.log(`      Current Age: ${dep.calculatedAge || 'Unknown'}`);
      console.log('');
    });

    if (currentDependents.rows.length === 0) {
      console.log('❌ No dependents found to update');
      return;
    }

    // Create ID numbers for different age categories
    console.log('\n🎯 STEP 2: Generating Test ID Numbers');
    console.log('-' .repeat(40));

    // Function to generate SA ID number for specific age
    function generateSAIdForAge(targetAge) {
      const currentDate = new Date();
      const birthYear = currentDate.getFullYear() - targetAge;
      
      // Convert to 2-digit year format
      const yearSuffix = birthYear.toString().slice(-2);
      
      // Use realistic month and day
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      
      // Gender digit (0-4 female, 5-9 male) + sequence
      const genderSequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      
      // Citizenship (0 for SA citizen)
      const citizenship = '0';
      
      // Race indicator (deprecated, usually 8)
      const race = '8';
      
      // Calculate check digit (simplified Luhn algorithm)
      const baseNumber = yearSuffix + month + day + genderSequence + citizenship + race;
      let sum = 0;
      for (let i = 0; i < baseNumber.length; i++) {
        let digit = parseInt(baseNumber[i]);
        if (i % 2 === 1) {
          digit *= 2;
          if (digit > 9) digit = digit - 9;
        }
        sum += digit;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      
      return baseNumber + checkDigit;
    }

    // Define age test cases with realistic names and ages
    const ageTestCases = [
      { targetAge: 2, category: 'Toddler', description: '2-year-old toddler' },
      { targetAge: 8, category: 'Child', description: '8-year-old child' },
      { targetAge: 15, category: 'Teen', description: '15-year-old teenager' },
      { targetAge: 20, category: 'Adult', description: '20-year-old young adult' },
      { targetAge: 35, category: 'Adult', description: '35-year-old adult' },
      { targetAge: 70, category: 'Senior', description: '70-year-old senior' }
    ];

    console.log('Generated test ID numbers:');
    const testIdNumbers = [];
    ageTestCases.forEach((testCase, index) => {
      const idNumber = generateSAIdForAge(testCase.targetAge);
      testIdNumbers.push({
        ...testCase,
        idNumber,
        index
      });
      console.log(`   ${index + 1}. ${testCase.description} (${testCase.category})`);
      console.log(`      ID Number: ${idNumber}`);
      console.log(`      Expected Age: ${testCase.targetAge} years`);
      console.log('');
    });

    // Update dependents with new ID numbers
    console.log('\n🔄 STEP 3: Updating Dependent ID Numbers');
    console.log('-' .repeat(40));

    const dependentsToUpdate = currentDependents.rows.slice(0, testIdNumbers.length);
    const updates = [];

    for (let i = 0; i < dependentsToUpdate.length && i < testIdNumbers.length; i++) {
      const dependent = dependentsToUpdate[i];
      const testCase = testIdNumbers[i];
      
      console.log(`\n📝 Updating ${dependent.firstName} ${dependent.surname}:`);
      console.log(`   From: ${dependent.Idnumber} (Age: ${dependent.calculatedAge || 'Unknown'})`);
      console.log(`   To:   ${testCase.idNumber} (Age: ${testCase.targetAge}, ${testCase.category})`);
      
      try {
        // Calculate birth date for the new ID
        const birthYear = new Date().getFullYear() - testCase.targetAge;
        const birthMonth = parseInt(testCase.idNumber.substring(2, 4)) - 1; // JS months are 0-indexed
        const birthDay = parseInt(testCase.idNumber.substring(4, 6));
        const dateOfBirth = new Date(birthYear, birthMonth, birthDay);

        // Update the dependent
        const updateResult = await client.query(`
          UPDATE public."Users" 
          SET 
            "Idnumber" = $1,
            "dateOfBirth" = $2,
            "calculatedAge" = $3,
            "updatedAt" = NOW()
          WHERE id = $4
          RETURNING id, "firstName", "surname", "Idnumber", "calculatedAge", "dateOfBirth"
        `, [testCase.idNumber, dateOfBirth, testCase.targetAge, dependent.id]);

        if (updateResult.rows.length > 0) {
          const updated = updateResult.rows[0];
          console.log(`   ✅ Successfully updated!`);
          console.log(`      New ID: ${updated.Idnumber}`);
          console.log(`      New Age: ${updated.calculatedAge}`);
          console.log(`      New DOB: ${updated.dateOfBirth.toDateString()}`);
          
          updates.push({
            id: updated.id,
            name: `${updated.firstName} ${updated.surname}`,
            oldId: dependent.Idnumber,
            newId: updated.Idnumber,
            age: updated.calculatedAge,
            category: testCase.category
          });
        }
      } catch (error) {
        console.log(`   ❌ Failed to update: ${error.message}`);
      }
    }

    // Verify the updates
    console.log('\n✅ STEP 4: Verification');
    console.log('-' .repeat(40));

    if (updates.length > 0) {
      console.log('Successfully updated dependents:');
      updates.forEach((update, index) => {
        console.log(`\n   ${index + 1}. ${update.name} (ID: ${update.id})`);
        console.log(`      Age: ${update.age} years (${update.category})`);
        console.log(`      ID Number: ${update.newId}`);
      });

      // Test age calculation
      console.log('\n🧪 STEP 5: Testing Age-Based Product Access');
      console.log('-' .repeat(40));

      for (const update of updates.slice(0, 3)) { // Test first 3
        console.log(`\n👤 Testing ${update.name} (Age: ${update.age})`);
        
        const productAccess = await client.query(`
          SELECT 
            category,
            COUNT(*) as available_products
          FROM public.products 
          WHERE "isActive" = true 
          AND "inStock" = true
          AND (("minAge" IS NULL OR "minAge" <= $1))
          AND (("maxAge" IS NULL OR "maxAge" >= $1))
          GROUP BY category
          ORDER BY available_products DESC
        `, [update.age]);

        console.log(`   Available categories:`);
        productAccess.rows.forEach(cat => {
          console.log(`     ✅ ${cat.category}: ${cat.available_products} products`);
        });

        const totalAvailable = productAccess.rows.reduce((sum, cat) => sum + parseInt(cat.available_products), 0);
        console.log(`   📊 Total: ${totalAvailable} products available`);
      }
    }

    console.log('\n🎉 DEPENDENT ID NUMBERS UPDATE COMPLETE!');
    console.log('\nNow you can test age-based filtering with:');
    console.log('• Toddler (2 years) - Limited product access');
    console.log('• Child (8 years) - Most products except age-restricted');
    console.log('• Teen (15 years) - Most products except 18+ items');
    console.log('• Adult (20+ years) - Full product access');
    console.log('• Senior (70 years) - Full product access');

  } catch (error) {
    console.error('❌ Error updating ID numbers:', error);
  } finally {
    await client.end();
  }
}

updateDependentIdNumbers().catch(console.error);