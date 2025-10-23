'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all dependent users with their accounts using raw SQL with proper escaping
    const dependentUsers = await queryInterface.sequelize.query(
      `SELECT u.id as "userId", u."firstName", u.surname, a.id as "accountId", a.balance, a."accountNumber"
       FROM "Users" u 
       JOIN "Accounts" a ON u.id = a."userId" 
       WHERE u.role = 'dependent'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`Found ${dependentUsers.length} dependent users with accounts`);

    for (const user of dependentUsers) {
      console.log(`\nSetting up category accounts for ${user.firstName} ${user.surname}...`);
      
      // First, mark existing account as main account
      await queryInterface.bulkUpdate('Accounts', {
        isMainAccount: true,
        accountName: `${user.firstName} ${user.surname} - Main Savings`,
        updatedAt: new Date()
      }, {
        id: user.accountId
      });

      // Get current balance to distribute among categories
      const currentBalance = parseFloat(user.balance || 0);
      
      // Define category allocation percentages
      const categoryAllocations = {
        'Healthcare': 0.25,    // 25%
        'Groceries': 0.30,     // 30%
        'Education': 0.20,     // 20%
        'Transport': 0.15,     // 15%
        'Entertainment': 0.05, // 5%
        'Other': 0.05          // 5%
      };

      let categoryAccountsData = [];
      let totalAllocated = 0;

      // Create category accounts
      for (const [category, percentage] of Object.entries(categoryAllocations)) {
        const allocatedAmount = Math.round(currentBalance * percentage * 100) / 100; // Round to 2 decimal places
        totalAllocated += allocatedAmount;
        
        const accountNumber = `${user.accountNumber.split('001')[0]}${category.substring(0, 3).toUpperCase()}`;
        
        categoryAccountsData.push({
          userId: user.userId,
          accountName: `${user.firstName} ${user.surname} - ${category}`,
          accountNumber: accountNumber,
          accountType: 'category',
          balance: allocatedAmount,
          status: 'active',
          category: category,
          isMainAccount: false,
          allocatedFromId: user.accountId,
          creationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log(`  - ${category}: R${allocatedAmount.toFixed(2)} (${(percentage * 100)}%)`);
      }

      // Insert category accounts
      await queryInterface.bulkInsert('Accounts', categoryAccountsData);

      // Update main account to display total of all category accounts (keep original total)
      await queryInterface.bulkUpdate('Accounts', {
        balance: currentBalance, // Keep the total amount for display
        updatedAt: new Date()
      }, {
        id: user.accountId
      });

      console.log(`  - Main Savings: R${remainingBalance.toFixed(2)} (remaining)`);
      console.log(`  Total allocated: R${totalAllocated.toFixed(2)} + R${remainingBalance.toFixed(2)} = R${currentBalance.toFixed(2)}`);
    }

    console.log('\n✅ Category accounts setup completed for all dependent users');
  },

  async down(queryInterface, Sequelize) {
    // Get main accounts and their category totals
    const mainAccounts = await queryInterface.sequelize.query(
      `SELECT a1.id as "mainId", a1.balance as "mainBalance", 
              COALESCE(SUM(a2.balance), 0) as "categoryTotal"
       FROM "Accounts" a1 
       LEFT JOIN "Accounts" a2 ON a1.id = a2."allocatedFromId"
       WHERE a1."isMainAccount" = true
       GROUP BY a1.id, a1.balance`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const account of mainAccounts) {
      const totalBalance = parseFloat(account.mainBalance) + parseFloat(account.categoryTotal);
      
      // Restore original balance to main account
      await queryInterface.bulkUpdate('Accounts', {
        balance: totalBalance,
        isMainAccount: false,
        updatedAt: new Date()
      }, {
        id: account.mainId
      });
    }

    // Delete category accounts
    await queryInterface.bulkDelete('Accounts', {
      category: { [Sequelize.Op.ne]: null }
    });

    console.log('✅ Category accounts removed and balances restored');
  }
};
