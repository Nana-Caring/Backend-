const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize both raw connection and Sequelize
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  logging: console.log
});

async function connectSarahToEmma() {
  try {
    console.log('🤱 Connecting Sarah Williams to Emma Johnson (existing infant)...\n');
    
    // Step 1: Check Emma Johnson's current info
    console.log('📋 Checking Emma Johnson\'s current information...');
    const [emmaRows] = await sequelize.query(
      'SELECT * FROM "Users" WHERE id = 13'
    );
    
    if (emmaRows.length === 0) {
      throw new Error('Emma Johnson (ID: 13) not found in database');
    }
    
    const emma = emmaRows[0];
    console.log('✅ Emma Johnson found:', {
      id: emma.id,
      name: `${emma.firstName} ${emma.lastName}`,
      email: emma.email,
      role: emma.role,
      age: emma.age,
      dateOfBirth: emma.dateOfBirth
    });
    
    // Step 2: Check if Sarah Williams already exists
    console.log('\n👩 Checking if Sarah Williams exists...');
    const [sarahRows] = await sequelize.query(
      'SELECT * FROM "Users" WHERE email = ?',
      { replacements: ['sarah.williams@example.com'] }
    );
    
    let sarahId;
    if (sarahRows.length > 0) {
      sarahId = sarahRows[0].id;
      console.log('✅ Sarah Williams already exists:', {
        id: sarahId,
        name: `${sarahRows[0].firstName} ${sarahRows[0].lastName}`,
        email: sarahRows[0].email
      });
    } else {
      // Create Sarah Williams
      console.log('📝 Creating Sarah Williams...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const [sarahResult] = await sequelize.query(`
        INSERT INTO "Users" (
          "firstName", "lastName", email, password, role, phone,
          "isPregnant", "dueDate", "lastMenstrualPeriod",
          "doctorName", "medicalAidNumber", "emergencyContactName",
          "emergencyContactPhone", "emergencyContactRelationship",
          allergies, "chronicConditions", "previousPregnancies",
          "createdAt", "updatedAt"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        RETURNING *
      `, {
        replacements: [
          'Sarah', 'Williams', 'sarah.williams@example.com', hashedPassword, 'dependent', '+27123456780',
          true, '2025-06-15', '2024-09-08',
          'Dr. Emily Smith', 'MED123456', 'John Williams',
          '+27987654321', 'Husband',
          JSON.stringify(['Penicillin']), JSON.stringify([]), 1
        ]
      });
      
      sarahId = sarahResult[0].id;
      console.log('✅ Sarah Williams created:', {
        id: sarahId,
        name: `${sarahResult[0].firstName} ${sarahResult[0].lastName}`,
        email: sarahResult[0].email,
        isPregnant: sarahResult[0].isPregnant
      });
    }
    
    // Step 3: Update Emma to be Sarah's daughter
    console.log('\n👶 Establishing mother-daughter relationship...');
    
    // Update Emma's record to include parentId and change last name to Williams
    await sequelize.query(`
      UPDATE "Users" 
      SET 
        "lastName" = ?,
        "parentId" = ?,
        "updatedAt" = NOW()
      WHERE id = ?
    `, {
      replacements: ['Williams', sarahId, emma.id]
    });
    
    console.log('✅ Emma Johnson updated to Emma Williams with Sarah as mother');
    
    // Step 4: Verify the relationship
    console.log('\n🔍 Verifying family relationship...');
    const [familyRows] = await sequelize.query(`
      SELECT 
        u.id,
        u."firstName",
        u."lastName", 
        u.email,
        u.role,
        u.age,
        u."dateOfBirth",
        u."isPregnant",
        u."dueDate",
        u."parentId",
        parent."firstName" as parent_first_name,
        parent."lastName" as parent_last_name
      FROM "Users" u
      LEFT JOIN "Users" parent ON u."parentId" = parent.id
      WHERE u.id IN (?, ?) OR u."parentId" IN (?, ?)
      ORDER BY u.age DESC NULLS FIRST
    `, {
      replacements: [sarahId, emma.id, sarahId, emma.id]
    });
    
    console.log('\n👨‍👩‍👧 Family Summary:');
    familyRows.forEach(member => {
      const relationship = member.parentId ? 'Child' : (member.isPregnant ? 'Pregnant Mother' : 'Adult');
      console.log(`  • ${member.firstName} ${member.lastName}:`, {
        id: member.id,
        role: member.role,
        relationship: relationship,
        age: member.age,
        isPregnant: member.isPregnant,
        parent: member.parent_first_name ? `${member.parent_first_name} ${member.parent_last_name}` : 'None'
      });
    });
    
    // Step 5: Test API credentials
    console.log('\n🔑 API Testing Information:');
    console.log('Sarah Williams (Mother):');
    console.log('  ID:', sarahId);
    console.log('  Email: sarah.williams@example.com');
    console.log('  Password: password123');
    console.log('  Role: dependent');
    console.log('  Status: Pregnant');
    
    console.log('\nEmma Williams (Infant):');
    console.log('  ID:', emma.id);
    console.log('  Email:', emma.email);
    console.log('  Password: password123 (if needed)');
    console.log('  Role: dependent');
    console.log('  Age: 0 years (infant)');
    console.log('  Mother ID:', sarahId);
    
    console.log('\n🎯 Ready for pregnancy/infant API testing!');
    console.log('✅ Sarah Williams can be used for pregnancy endpoints');
    console.log('✅ Emma Williams can be used for infant management');
    console.log('✅ Mother-child relationship established');
    
    return {
      mother: {
        id: sarahId,
        email: 'sarah.williams@example.com',
        name: 'Sarah Williams'
      },
      infant: {
        id: emma.id,
        email: emma.email,
        name: 'Emma Williams',
        age: emma.age
      }
    };
    
  } catch (error) {
    console.error('❌ Error connecting Sarah to Emma:', error);
    throw error;
  } finally {
    await sequelize.close();
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  connectSarahToEmma()
    .then((result) => {
      console.log('\n🎉 SUCCESS: Family connection established!');
      console.log('Mother:', result.mother.name, '(ID:', result.mother.id + ')');
      console.log('Infant:', result.infant.name, '(ID:', result.infant.id + ')');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to connect family:', error);
      process.exit(1);
    });
}

module.exports = { connectSarahToEmma };