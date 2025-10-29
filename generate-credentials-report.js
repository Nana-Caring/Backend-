const { User, Account } = require('./models');

async function generateUserCredentialsReport() {
  console.log('👥 NANA Portal - Live User Credentials Report');
  console.log('=' .repeat(60));
  console.log(`📅 Generated: ${new Date().toLocaleString()}\n`);

  try {
    // Find all users with their accounts
    const users = await User.findAll({
      include: [{
        model: Account,
        as: 'Accounts',
        attributes: ['id', 'accountType', 'balance', 'accountNumber']
      }],
      order: [
        ['role', 'ASC'], // Caregivers first
        ['createdAt', 'ASC']
      ]
    });

    let totalUsers = 0;
    let totalCaregivers = 0;
    let totalDependents = 0;
    let totalAccounts = 0;

    // Group users by role
    const caregivers = users.filter(u => u.role === 'caregiver');
    const dependents = users.filter(u => u.role === 'dependent');
    const funders = users.filter(u => u.role === 'funder');

    // Display Caregivers
    if (caregivers.length > 0) {
      console.log('🧑‍💼 CAREGIVERS:');
      console.log('-' .repeat(40));
      caregivers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.surname}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user.Idnumber}`);
        console.log(`   🔑 Password: [Contact admin for caregiver passwords]`);
        console.log(`   📊 Linked Dependents: ${dependents.length}`);
        console.log('');
        totalCaregivers++;
      });
    }

    // Display Funders
    if (funders.length > 0) {
      console.log('💰 FUNDERS:');
      console.log('-' .repeat(40));
      funders.forEach((user, index) => {
        const accounts = user.Accounts || [];
        console.log(`${index + 1}. ${user.firstName} ${user.surname}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user.Idnumber}`);
        console.log(`   🔑 Password: [Contact admin for funder passwords]`);
        console.log(`   💳 Accounts: ${accounts.length}`);
        console.log('');
      });
    }

    // Display Dependents
    if (dependents.length > 0) {
      console.log('👶 DEPENDENTS:');
      console.log('-' .repeat(40));
      
      // Group dependents by age
      const ageGroups = {};
      dependents.forEach(dep => {
        // Calculate age from ID number
        const yearDigits = dep.Idnumber.substring(0, 2);
        const fullYear = parseInt(yearDigits) < 50 ? 2000 + parseInt(yearDigits) : 1900 + parseInt(yearDigits);
        const age = new Date().getFullYear() - fullYear;
        
        let category;
        if (age <= 2) category = '👶 Babies/Toddlers (0-2)';
        else if (age <= 12) category = '🧒 Children (3-12)';
        else if (age <= 17) category = '👦 Teens (13-17)';
        else if (age <= 25) category = '👨 Youth (18-25)';
        else category = '🧑 Adults (26+)';

        if (!ageGroups[category]) ageGroups[category] = [];
        ageGroups[category].push({ ...dep.toJSON(), calculatedAge: age });
      });

      // Display by age groups
      Object.entries(ageGroups).forEach(([category, deps]) => {
        console.log(`\n${category}:`);
        deps.forEach((dep, index) => {
          const accounts = dep.Accounts || [];
          const mainAccount = accounts.find(acc => acc.accountType === 'Main');
          const subAccounts = accounts.filter(acc => acc.accountType !== 'Main');
          
          // Determine password pattern based on email
          let passwordGuess = 'Unknown';
          if (dep.email.includes('.baby@')) {
            passwordGuess = `${dep.firstName}${dep.calculatedAge}Test!`;
          } else if (dep.email.includes('@kidsemail.') || dep.email.includes('@teenmail.') || dep.email.includes('@youthmail.')) {
            passwordGuess = `${dep.firstName}${dep.calculatedAge}Test!`;
          } else if (dep.email === 'dependent@demo.com') {
            passwordGuess = 'TestDependent2024!';
          }

          console.log(`  ${index + 1}. ${dep.firstName} ${dep.surname} (${dep.calculatedAge} years)`);
          console.log(`     📧 Email: ${dep.email}`);
          console.log(`     🔑 Password: ${passwordGuess}`);
          console.log(`     🆔 ID: ${dep.Idnumber}`);
          console.log(`     👥 Relation: ${dep.relation || 'Not specified'}`);
          console.log(`     💳 Total Accounts: ${accounts.length}`);
          
          if (mainAccount) {
            console.log(`     🏦 Main Account: ${mainAccount.accountNumber}`);
          }
          
          if (subAccounts.length > 0) {
            const accountTypes = subAccounts.map(acc => acc.accountType).sort();
            console.log(`     📁 Sub-Accounts: ${accountTypes.join(', ')}`);
            
            // Check for missing expected accounts
            const expectedSubAccounts = ['Healthcare', 'Groceries', 'Education', 'Clothing', 'Baby Care', 'Entertainment', 'Pregnancy'];
            const missingAccounts = expectedSubAccounts.filter(type => 
              !accountTypes.includes(type)
            );
            
            if (missingAccounts.length > 0) {
              console.log(`     ⚠️  Missing: ${missingAccounts.join(', ')}`);
            } else {
              console.log(`     ✅ Complete account structure`);
            }
          }
          
          console.log('');
          totalDependents++;
          totalAccounts += accounts.length;
        });
      });
    }

    // Summary Statistics
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log('=' .repeat(40));
    console.log(`👥 Total Users: ${caregivers.length + dependents.length + funders.length}`);
    console.log(`🧑‍💼 Caregivers: ${caregivers.length}`);
    console.log(`💰 Funders: ${funders.length}`);
    console.log(`👶 Dependents: ${dependents.length}`);
    console.log(`💳 Total Accounts: ${totalAccounts}`);
    console.log(`📊 Avg Accounts/Dependent: ${dependents.length > 0 ? (totalAccounts / dependents.length).toFixed(1) : 'N/A'}`);

    // Quick Login Examples
    console.log('\n🚀 QUICK LOGIN EXAMPLES:');
    console.log('=' .repeat(40));
    
    if (caregivers.length > 0) {
      const caregiver = caregivers[0];
      console.log('👨‍💼 Caregiver Login:');
      console.log(`   Email: ${caregiver.email}`);
      console.log(`   Password: [Contact admin]`);
      console.log('');
    }

    if (dependents.length > 0) {
      // Show different age examples
      const baby = dependents.find(d => d.email.includes('.baby@'));
      const child = dependents.find(d => d.email.includes('@kidsemail.'));
      const teen = dependents.find(d => d.email.includes('@teenmail.'));
      const youth = dependents.find(d => d.email.includes('@youthmail.'));
      const legacy = dependents.find(d => d.email === 'dependent@demo.com');

      if (baby) {
        console.log('👶 Baby Login Example:');
        console.log(`   Email: ${baby.email}`);
        console.log(`   Password: ${baby.firstName}1Test!`);
        console.log('');
      }

      if (child) {
        const yearDigits = child.Idnumber.substring(0, 2);
        const age = new Date().getFullYear() - (parseInt(yearDigits) < 50 ? 2000 + parseInt(yearDigits) : 1900 + parseInt(yearDigits));
        console.log('🧒 Child Login Example:');
        console.log(`   Email: ${child.email}`);
        console.log(`   Password: ${child.firstName}${age}Test!`);
        console.log('');
      }

      if (teen) {
        const yearDigits = teen.Idnumber.substring(0, 2);
        const age = new Date().getFullYear() - (parseInt(yearDigits) < 50 ? 2000 + parseInt(yearDigits) : 1900 + parseInt(yearDigits));
        console.log('👦 Teen Login Example:');
        console.log(`   Email: ${teen.email}`);
        console.log(`   Password: ${teen.firstName}${age}Test!`);
        console.log('');
      }

      if (legacy) {
        console.log('🔒 Legacy Login:');
        console.log(`   Email: ${legacy.email}`);
        console.log(`   Password: TestDependent2024!`);
        console.log('');
      }
    }

    console.log('🎯 Ready for testing! All credentials are available in USER_CREDENTIALS_DIRECTORY.md');

  } catch (error) {
    console.error('❌ Error generating report:', error);
  } finally {
    process.exit(0);
  }
}

// Run the report generator
if (require.main === module) {
  generateUserCredentialsReport();
}

module.exports = generateUserCredentialsReport;