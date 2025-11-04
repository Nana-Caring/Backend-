const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  logging: false
});

async function checkEmmaAge() {
  try {
    const [rows] = await sequelize.query(
      'SELECT id, "firstName", "lastName", email, role, age, "dateOfBirth", "createdAt" FROM "Users" WHERE id = 13'
    );
    
    if (rows.length > 0) {
      const emma = rows[0];
      
      console.log('👶 EMMA JOHNSON AGE CHECK');
      console.log('========================');
      console.log('ID:', emma.id);
      console.log('Name:', emma.firstName, emma.lastName);
      console.log('Email:', emma.email);
      console.log('Role:', emma.role);
      console.log('Age:', emma.age, 'years');
      console.log('Date of Birth:', emma.dateOfBirth);
      console.log('Account Created:', emma.createdAt);
      console.log('');
      
      // Calculate age from date of birth if available
      if (emma.dateOfBirth) {
        const birthDate = new Date(emma.dateOfBirth);
        const today = new Date();
        const ageInYears = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        console.log('Calculated Age from Birth Date:', ageInYears, 'years');
        
        if (ageInYears === 0) {
          console.log('✅ YES - Emma is an infant (0 years old based on birth date)');
        } else if (ageInYears < 0) {
          console.log('⚠️ Birth date is in the future - this might be an unborn baby');
        } else {
          console.log('❌ NO - Emma is', ageInYears, 'years old, not an infant');
        }
      }
      
      if (emma.age === 0) {
        console.log('✅ Database age field shows: INFANT (0 years)');
      } else if (emma.age === null || emma.age === undefined) {
        console.log('⚠️ Database age field is null/undefined');
      } else {
        console.log('❌ Database age field shows:', emma.age, 'years (NOT an infant)');
      }
      
    } else {
      console.log('❌ Emma Johnson (ID: 13) not found in database');
    }
    
  } catch (error) {
    console.error('Error checking Emma\'s age:', error);
  } finally {
    await sequelize.close();
  }
}

checkEmmaAge();