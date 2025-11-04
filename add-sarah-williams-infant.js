const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addSarahWilliamsInfant() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🤱 Creating Sarah Williams and her infant Emma...\n');
    
    // Step 1: Check if a caregiver exists, if not create one
    let caregiverResult = await client.query(
      'SELECT * FROM "Users" WHERE role = $1 LIMIT 1',
      ['caregiver']
    );
    
    let caregiverId;
    if (caregiverResult.rows.length === 0) {
      console.log('📝 Creating caregiver account...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const newCaregiver = await client.query(
        `INSERT INTO "Users" ("firstName", "lastName", email, password, role, phone, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
        ['John', 'Williams', 'john.williams@example.com', hashedPassword, 'caregiver', '+27123456789']
      );
      caregiverId = newCaregiver.rows[0].id;
      console.log('✅ Caregiver created:', newCaregiver.rows[0].first_name, newCaregiver.rows[0].last_name);
    } else {
      caregiverId = caregiverResult.rows[0].id;
      console.log('✅ Using existing caregiver:', caregiverResult.rows[0].first_name, caregiverResult.rows[0].last_name);
    }
    
    // Step 2: Create Sarah Williams (pregnant mother)
    console.log('\n👶 Creating Sarah Williams (pregnant mother)...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const sarahResult = await client.query(
      `INSERT INTO users (
        first_name, last_name, email, password, role, phone,
        caregiver_id, is_pregnant, due_date, last_menstrual_period,
        doctor_name, medical_aid_number, emergency_contact_name,
        emergency_contact_phone, emergency_contact_relationship,
        allergies, chronic_conditions, previous_pregnancies,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()) 
      RETURNING *`,
      [
        'Sarah', 'Williams', 'sarah.williams@example.com', hashedPassword, 'dependent', '+27123456780',
        caregiverId, true, '2025-06-15', '2024-09-08',
        'Dr. Emily Smith', 'MED123456', 'John Williams',
        '+27987654321', 'Husband',
        JSON.stringify(['Penicillin']), JSON.stringify([]), 1
      ]
    );
    
    const sarahId = sarahResult.rows[0].id;
    console.log('✅ Sarah Williams created:', {
      id: sarahId,
      name: `${sarahResult.rows[0].first_name} ${sarahResult.rows[0].last_name}`,
      email: sarahResult.rows[0].email,
      isPregnant: sarahResult.rows[0].is_pregnant,
      dueDate: sarahResult.rows[0].due_date
    });
    
    // Step 3: Create Emma Williams (infant - 0 years old)
    console.log('\n👶 Creating Emma Williams (infant)...');
    
    const emmaResult = await client.query(
      `INSERT INTO users (
        first_name, last_name, email, password, role, date_of_birth,
        caregiver_id, parent_id, gender, birth_weight, birth_length,
        hospital_of_birth, birth_certificate_number, medical_notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()) 
      RETURNING *`,
      [
        'Emma', 'Williams', 'emma.williams@example.com', hashedPassword, 'dependent', '2025-11-01',
        caregiverId, sarahId, 'female', 3.2, 50.0,
        'Cape Town Maternity Hospital', 'BC2025110001', 'Healthy birth, full term'
      ]
    );
    
    const emmaId = emmaResult.rows[0].id;
    console.log('✅ Emma Williams created:', {
      id: emmaId,
      name: `${emmaResult.rows[0].first_name} ${emmaResult.rows[0].last_name}`,
      email: emmaResult.rows[0].email,
      dateOfBirth: emmaResult.rows[0].date_of_birth,
      age: emmaResult.rows[0].age,
      parentId: emmaResult.rows[0].parent_id,
      birthWeight: emmaResult.rows[0].birth_weight
    });
    
    // Step 4: Verify age calculation
    const ageCheck = await client.query(
      'SELECT first_name, last_name, age, date_of_birth FROM users WHERE id = $1',
      [emmaId]
    );
    
    console.log('\n🎂 Age verification for Emma:', {
      name: `${ageCheck.rows[0].first_name} ${ageCheck.rows[0].last_name}`,
      age: ageCheck.rows[0].age,
      dateOfBirth: ageCheck.rows[0].date_of_birth,
      isInfant: ageCheck.rows[0].age === 0
    });
    
    // Step 5: Create family relationship summary
    console.log('\n👨‍👩‍👧 Family Summary:');
    const familyQuery = await client.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        u.age,
        u.is_pregnant,
        u.due_date,
        CASE 
          WHEN u.parent_id IS NOT NULL THEN 'child'
          WHEN u.is_pregnant = true THEN 'pregnant_mother'
          WHEN u.role = 'caregiver' THEN 'caregiver'
          ELSE 'adult'
        END as family_role
      FROM users u 
      WHERE u.caregiver_id = $1 OR u.id = $1
      ORDER BY u.role, u.age DESC NULLS FIRST
    `, [caregiverId]);
    
    familyQuery.rows.forEach(member => {
      console.log(`  • ${member.first_name} ${member.last_name}:`, {
        role: member.role,
        familyRole: member.family_role,
        age: member.age,
        isPregnant: member.is_pregnant,
        dueDate: member.due_date
      });
    });
    
    // Step 6: Test login credentials
    console.log('\n🔑 Login Credentials Created:');
    console.log('Caregiver (John Williams):');
    console.log('  Email: john.williams@example.com');
    console.log('  Password: password123');
    console.log('\nPregnant Mother (Sarah Williams):');
    console.log('  Email: sarah.williams@example.com');
    console.log('  Password: password123');
    console.log('\nInfant (Emma Williams):');
    console.log('  Email: emma.williams@example.com');
    console.log('  Password: password123');
    console.log('  Age: 0 years (automatically calculated)');
    
    await client.query('COMMIT');
    console.log('\n✅ SUCCESS: Sarah Williams family created successfully!');
    
    // Step 7: Return useful information for API testing
    return {
      caregiver: {
        id: caregiverId,
        email: caregiverResult.rows.length > 0 ? caregiverResult.rows[0].email : 'john.williams@example.com'
      },
      mother: {
        id: sarahId,
        email: 'sarah.williams@example.com',
        isPregnant: true,
        dueDate: '2025-06-15'
      },
      infant: {
        id: emmaId,
        email: 'emma.williams@example.com',
        age: 0,
        birthDate: '2025-11-01'
      }
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating Sarah Williams family:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
if (require.main === module) {
  addSarahWilliamsInfant()
    .then((result) => {
      console.log('\n🎯 Test with these IDs:');
      console.log('Caregiver ID:', result.caregiver.id);
      console.log('Mother ID:', result.mother.id);
      console.log('Infant ID:', result.infant.id);
      
      console.log('\n🚀 Ready for API testing!');
      console.log('1. Login as caregiver with:', result.caregiver.email);
      console.log('2. Use mother ID for pregnancy endpoints:', result.mother.id);
      console.log('3. Use infant ID for infant management:', result.infant.id);
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create family:', error);
      process.exit(1);
    });
}

module.exports = { addSarahWilliamsInfant };