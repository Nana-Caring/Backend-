const { User, Account, Transaction, FunderDependent, sequelize } = require('../models');

/**
 * Transfer funds from funder account to beneficiary account
 */
exports.transferToBeneficiary = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { beneficiaryId, targetAccountId, amount, description = '' } = req.body;
    const funderId = req.user.id;

    // Validate amount
    if (!amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid transfer amount'
      });
    }

    // Verify beneficiary relationship
    const relationship = await FunderDependent.findOne({
      where: {
        funderId: funderId,
        dependentId: beneficiaryId
      }
    });

    if (!relationship) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to transfer to this beneficiary'
      });
    }

    // Get funder's main account
    const funderAccount = await Account.findOne({
      where: {
        userId: funderId,
        accountType: 'Main'
      },
      transaction
    });

    if (!funderAccount) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Funder account not found'
      });
    }

    // Check sufficient balance
    const funderBalance = parseFloat(funderAccount.balance);
    if (funderBalance < amount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Available: ZAR ${funderBalance.toFixed(2)}, Requested: ZAR ${amount.toFixed(2)}`
      });
    }

    // Get target beneficiary account
    const beneficiaryAccount = await Account.findOne({
      where: {
        id: targetAccountId,
        userId: beneficiaryId
      },
      transaction
    });

    if (!beneficiaryAccount) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Beneficiary account not found'
      });
    }

    // Perform the transfer
    const newFunderBalance = funderBalance - amount;
    const newBeneficiaryBalance = parseFloat(beneficiaryAccount.balance) + amount;

    // Update balances
    await funderAccount.update(
      { balance: newFunderBalance },
      { transaction }
    );

    await beneficiaryAccount.update(
      { balance: newBeneficiaryBalance },
      { transaction }
    );

    // Create transaction records
    const transferReference = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Funder debit transaction (using existing Debit type)
    await Transaction.create({
      accountId: funderAccount.id,
      type: 'Debit',
      amount: amount, // Keep amount positive for now
      description: `Transfer to ${beneficiaryAccount.accountType} account - ${description}`,
      reference: transferReference
    }, { transaction });

    // Beneficiary credit transaction (using existing Credit type)
    await Transaction.create({
      accountId: beneficiaryAccount.id,
      type: 'Credit',
      amount: amount,
      description: `Transfer from funder - ${description}`,
      reference: transferReference
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        transferReference: transferReference,
        amount: amount,
        currency: 'ZAR',
        funder: {
          accountId: funderAccount.id,
          newBalance: newFunderBalance
        },
        beneficiary: {
          accountId: beneficiaryAccount.id,
          accountType: beneficiaryAccount.accountType,
          newBalance: newBeneficiaryBalance
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Transfer to beneficiary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete transfer',
      error: error.message
    });
  }
};

/**
 * Get transfer history for a funder
 */
exports.getTransferHistory = async (req, res) => {
  try {
    const funderId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // Get funder's main account
    const funderAccount = await Account.findOne({
      where: {
        userId: funderId,
        accountType: 'Main'
      }
    });

    if (!funderAccount) {
      return res.status(404).json({
        success: false,
        message: 'Funder account not found'
      });
    }

    // Get transfer transactions (using existing types)
    const offset = (page - 1) * limit;
    const transfers = await Transaction.findAndCountAll({
      where: {
        accountId: funderAccount.id,
        type: ['Debit', 'Credit']
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      attributes: ['id', 'type', 'amount', 'description', 'reference', 'createdAt']
    });

    res.json({
      success: true,
      data: {
        transfers: transfers.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transfers.count / limit),
          totalTransfers: transfers.count,
          hasMore: offset + transfers.rows.length < transfers.count
        }
      }
    });

  } catch (error) {
    console.error('Get transfer history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transfer history',
      error: error.message
    });
  }
};
