const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkEmmaDetails() {
  try {
    console.log('👶 CHECKING EMMA JOHNSON DETAILS\n');
    
    const result = await pool.query('SELECT * FROM "Users" WHERE id = 13');
    
    if (result.rows.length === 0) {
      console.log('❌ Emma Johnson (ID: 13) not found');
      return;
    }
    
    const emma = result.rows[0];
    
    console.log('📋 EMMA\'S DATABASE RECORD:');
    console.log('==========================');
    
    // Show all non-null fields
    Object.keys(emma).forEach(key => {
      if (emma[key] !== null && emma[key] !== undefined) {
        console.log(`${key}:`, emma[key]);
      }
    });
    
    console.log('\n🎂 AGE ANALYSIS:');
    console.log('================');
    
    // Check if there's a direct age field
    if (emma.age !== null && emma.age !== undefined) {
      console.log('Database age field:', emma.age, 'years');
      if (emma.age === 0) {
        console.log('✅ YES - Emma IS an infant (age = 0)');
      } else {
        console.log('❌ NO - Emma is NOT an infant (age =', emma.age + ')');
      }
    } else {
      console.log('⚠️ No direct age field found');
    }
    
    // Check date of birth if available
    if (emma.dateOfBirth) {
      const birthDate = new Date(emma.dateOfBirth);
      const today = new Date();
      const ageMs = today - birthDate;
      const ageYears = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
      const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
      
      console.log('Birth date:', emma.dateOfBirth);
      console.log('Today:', today.toISOString().split('T')[0]);
      console.log('Calculated age:', ageYears, 'years');
      console.log('Age in days:', ageDays, 'days');
      
      if (ageYears === 0) {
        console.log('✅ YES - Emma IS an infant (0 years old by birth date)');
      } else if (ageYears < 0) {
        console.log('⚠️ Birth date is in the future - might be unborn');
      } else {
        console.log('❌ NO - Emma is NOT an infant (' + ageYears + ' years old)');
      }
    } else {
      console.log('⚠️ No birth date found');
    }
    
    console.log('\n🏷️ ACCOUNT CLASSIFICATION:');
    console.log('==========================');
    
    // Check for baby/pregnancy related accounts
    const accountsResult = await pool.query(
      'SELECT "accountType", balance FROM "Accounts" WHERE "beneficiaryId" = 13'
    );
    
    const hasPregnancyAccount = accountsResult.rows.some(acc => acc.accountType === 'Pregnancy');
    const hasBabyCareAccount = accountsResult.rows.some(acc => acc.accountType === 'Baby Care');
    
    console.log('Has Pregnancy account:', hasPregnancyAccount ? '✅ YES' : '❌ NO');
    console.log('Has Baby Care account:', hasBabyCareAccount ? '✅ YES' : '❌ NO');
    
    if (hasPregnancyAccount && hasBabyCareAccount) {
      console.log('🤱 Account setup suggests: PREGNANCY/INFANT related');
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('==============');
    
    if (emma.age === 0 || (emma.dateOfBirth && ageYears === 0)) {
      console.log('✅ EMMA IS AN INFANT (0 years old)');
    } else if (emma.age === null && !emma.dateOfBirth) {
      console.log('⚠️ Cannot determine - missing age and birth date');
    } else {
      console.log('❌ EMMA IS NOT AN INFANT');
      if (emma.age) {
        console.log('   Current age:', emma.age, 'years');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkEmmaDetails();