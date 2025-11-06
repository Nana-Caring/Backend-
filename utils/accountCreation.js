const { Account } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate a unique account number for new accounts
 * @returns {Promise<string>} - Unique 10-digit account number
 */
const generateUniqueAccountNumber = async () => {
  let isUnique = false;
  let accountNumber;
  
  while (!isUnique) {
    // Generate 10-digit number starting with 6 (NANA bank code)
    accountNumber = '6' + Math.floor(Math.random() * 999999999).toString().padStart(9, '0');
    
    // Check if this number already exists
    const existing = await Account.findOne({
      where: { accountNumber }
    });
    
    isUnique = !existing;
  }
  
  return accountNumber;
};

/**
 * Create complete account structure for a new dependent
 * @param {number} dependentId - ID of the dependent user
 * @param {number} caregiverId - ID of the caregiver
 * @returns {Promise<Object>} - Account creation result
 */
const createDependentAccounts = async (dependentId, caregiverId) => {
  const accountTypes = [
    { 
      type: 'Main', 
      description: 'Primary emergency fund account',
      isParent: true
    },
    { 
      type: 'Education', 
      description: 'School fees and educational materials',
      isParent: false
    },
    { 
      type: 'Healthcare', 
      description: 'Medical expenses and medications',
      isParent: false
    },
    { 
      type: 'Groceries', 
      description: 'Food security and nutrition needs',
      isParent: false
    },
    { 
      type: 'Clothing', 
      description: 'Clothing and housing-related expenses',
      isParent: false
    },
    { 
      type: 'Baby Care', 
      description: 'Baby care products and services',
      isParent: false
    },
    { 
      type: 'Entertainment', 
      description: 'Recreation and developmental activities',
      isParent: false
    },
    { 
      type: 'Pregnancy', 
      description: 'Pregnancy and prenatal care expenses',
      isParent: false
    }
  ];

  const createdAccounts = [];
  let mainAccount = null;

  try {
    console.log(`🏦 Creating accounts for dependent ${dependentId} under caregiver ${caregiverId}`);

    // Create main account first
    const mainAccountNumber = await generateUniqueAccountNumber();
    const mainAccountType = accountTypes.find(acc => acc.type === 'Main');
    
    mainAccount = await Account.create({
      userId: dependentId,
      caregiverId: caregiverId,
      accountType: 'Main',
      balance: 0.00,
      parentAccountId: null,
      accountNumber: mainAccountNumber,
      currency: 'ZAR',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    createdAccounts.push({
      type: 'Main',
      id: mainAccount.id,
      accountNumber: mainAccount.accountNumber,
      balance: 0.00,
      isParent: true,
      description: mainAccountType.description
    });

    console.log(`✅ Created Main account: ${mainAccount.accountNumber}`);

    // Create sub-accounts
    const subAccountTypes = accountTypes.filter(acc => acc.type !== 'Main');
    
    for (const accountType of subAccountTypes) {
      try {
        const subAccountNumber = await generateUniqueAccountNumber();
        
        const subAccount = await Account.create({
          userId: dependentId,
          caregiverId: caregiverId,
          accountType: accountType.type,
          balance: 0.00,
          parentAccountId: mainAccount.id,
          accountNumber: subAccountNumber,
          currency: 'ZAR',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        createdAccounts.push({
          type: accountType.type,
          id: subAccount.id,
          accountNumber: subAccount.accountNumber,
          balance: 0.00,
          isParent: false,
          parentAccountId: mainAccount.id,
          description: accountType.description
        });

        console.log(`✅ Created ${accountType.type} account: ${subAccount.accountNumber}`);

      } catch (subAccountError) {
        console.error(`❌ Failed to create ${accountType.type} account:`, subAccountError);
        throw new Error(`Failed to create ${accountType.type} account: ${subAccountError.message}`);
      }
    }

    // Verify all accounts were created
    const accountCount = await Account.count({
      where: {
        userId: dependentId,
        caregiverId: caregiverId
      }
    });

    if (accountCount !== accountTypes.length) {
      throw new Error(`Expected ${accountTypes.length} accounts but created ${accountCount}`);
    }

    console.log(`🎉 Successfully created ${createdAccounts.length} accounts for dependent ${dependentId}`);

    return {
      success: true,
      count: createdAccounts.length,
      mainAccountId: mainAccount.id,
      mainAccountNumber: mainAccount.accountNumber,
      accounts: createdAccounts,
      summary: {
        totalAccounts: createdAccounts.length,
        mainAccount: createdAccounts.find(acc => acc.type === 'Main'),
        subAccounts: createdAccounts.filter(acc => acc.type !== 'Main')
      }
    };

  } catch (error) {
    console.error('❌ Account creation error:', error);
    
    // Rollback: Delete any created accounts if there was an error
    if (createdAccounts.length > 0) {
      try {
        const accountIds = createdAccounts.map(acc => acc.id);
        const deletedCount = await Account.destroy({
          where: {
            id: { [Op.in]: accountIds }
          }
        });
        console.log(`🔄 Rolled back ${deletedCount} accounts due to error`);
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError);
      }
    }
    
    throw new Error(`Account creation failed: ${error.message}`);
  }
};

/**
 * Verify account structure for a dependent
 * @param {number} dependentId - ID of the dependent
 * @param {number} caregiverId - ID of the caregiver
 * @returns {Promise<Object>} - Verification result
 */
const verifyDependentAccounts = async (dependentId, caregiverId) => {
  try {
    const accounts = await Account.findAll({
      where: {
        userId: dependentId,
        caregiverId: caregiverId
      },
      order: [['createdAt', 'ASC']]
    });

    const expectedTypes = ['Main', 'Education', 'Healthcare', 'Groceries', 'Clothing', 'Baby Care', 'Entertainment', 'Pregnancy'];
    const actualTypes = accounts.map(acc => acc.accountType);
    const missingTypes = expectedTypes.filter(type => !actualTypes.includes(type));
    const extraTypes = actualTypes.filter(type => !expectedTypes.includes(type));

    const mainAccount = accounts.find(acc => acc.accountType === 'Main');
    const subAccounts = accounts.filter(acc => acc.accountType !== 'Main');
    
    // Check if all sub-accounts are properly linked to main account
    const unlinkedSubAccounts = subAccounts.filter(acc => acc.parentAccountId !== mainAccount?.id);

    return {
      isComplete: missingTypes.length === 0 && mainAccount !== undefined,
      accountCount: accounts.length,
      expectedCount: expectedTypes.length,
      missingTypes,
      extraTypes,
      hasMainAccount: !!mainAccount,
      mainAccountId: mainAccount?.id,
      unlinkedSubAccounts: unlinkedSubAccounts.length,
      accounts: accounts.map(acc => ({
        id: acc.id,
        type: acc.accountType,
        accountNumber: acc.accountNumber,
        balance: parseFloat(acc.balance || 0),
        parentAccountId: acc.parentAccountId,
        isLinkedToMain: acc.accountType === 'Main' || acc.parentAccountId === mainAccount?.id
      }))
    };

  } catch (error) {
    console.error('Account verification error:', error);
    return {
      isComplete: false,
      error: error.message
    };
  }
};

/**
 * Fix broken caregiver-dependent account relationships
 * @param {number} dependentId - ID of the dependent
 * @param {number} caregiverId - ID of the caregiver
 * @returns {Promise<Object>} - Fix result
 */
const fixAccountRelationships = async (dependentId, caregiverId) => {
  try {
    console.log(`🔧 Fixing account relationships for dependent ${dependentId} with caregiver ${caregiverId}`);

    // Update all accounts for this dependent to link to the caregiver
    const [updatedCount] = await Account.update(
      { caregiverId: caregiverId },
      { 
        where: { 
          userId: dependentId,
          caregiverId: { [Op.or]: [null, { [Op.ne]: caregiverId }] }
        }
      }
    );

    // Verify the fix
    const verification = await verifyDependentAccounts(dependentId, caregiverId);

    console.log(`✅ Updated ${updatedCount} account relationships`);

    return {
      success: true,
      updatedAccounts: updatedCount,
      verification
    };

  } catch (error) {
    console.error('❌ Failed to fix account relationships:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateUniqueAccountNumber,
  createDependentAccounts,
  verifyDependentAccounts,
  fixAccountRelationships
};