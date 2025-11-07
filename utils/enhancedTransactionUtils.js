const { User, Account, Transaction } = require('../models');

/**
 * Enhanced Transaction Creation Utility
 * Creates transactions with sender/recipient names for better statement clarity
 */

/**
 * Create an enhanced transaction with sender and recipient details
 * @param {Object} transactionData - Transaction data
 * @param {string} transactionData.accountId - Target account ID
 * @param {string} transactionData.type - Transaction type ('Credit' or 'Debit')
 * @param {number} transactionData.amount - Transaction amount
 * @param {string} transactionData.description - Transaction description
 * @param {string} transactionData.reference - Unique reference
 * @param {string} transactionData.transactionCategory - Category of transaction
 * @param {string} transactionData.senderAccountId - Sender account ID (optional)
 * @param {string} transactionData.recipientAccountId - Recipient account ID (optional)
 * @param {string} transactionData.merchantName - Merchant name for purchases (optional)
 * @param {Object} dbTransaction - Database transaction for rollback (optional)
 * @returns {Promise<Object>} Created transaction
 */
async function createEnhancedTransaction(transactionData, dbTransaction = null) {
    try {
        const {
            accountId,
            type,
            amount,
            description,
            reference,
            transactionCategory,
            senderAccountId,
            recipientAccountId,
            merchantName
        } = transactionData;

        // Get target account with user details
        const targetAccount = await Account.findByPk(accountId, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'middleName', 'surname', 'email']
            }],
            transaction: dbTransaction
        });

        if (!targetAccount) {
            throw new Error(`Account not found: ${accountId}`);
        }

        let senderName = null;
        let senderAccountNumber = null;
        let recipientName = null;
        let recipientAccountNumber = null;

        // For Credit transactions (money coming in)
        if (type === 'Credit') {
            // Recipient is the account owner
            recipientName = `${targetAccount.user.firstName} ${targetAccount.user.middleName || ''} ${targetAccount.user.surname}`.trim();
            recipientAccountNumber = targetAccount.accountNumber;

            // Get sender details if sender account provided
            if (senderAccountId) {
                const senderAccount = await Account.findByPk(senderAccountId, {
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['firstName', 'middleName', 'surname']
                    }],
                    transaction: dbTransaction
                });

                if (senderAccount) {
                    senderName = `${senderAccount.user.firstName} ${senderAccount.user.middleName || ''} ${senderAccount.user.surname}`.trim();
                    senderAccountNumber = senderAccount.accountNumber;
                }
            }
        }
        // For Debit transactions (money going out)
        else if (type === 'Debit') {
            // Sender is the account owner
            senderName = `${targetAccount.user.firstName} ${targetAccount.user.middleName || ''} ${targetAccount.user.surname}`.trim();
            senderAccountNumber = targetAccount.accountNumber;

            // Get recipient details if recipient account provided
            if (recipientAccountId) {
                const recipientAccount = await Account.findByPk(recipientAccountId, {
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['firstName', 'middleName', 'surname']
                    }],
                    transaction: dbTransaction
                });

                if (recipientAccount) {
                    recipientName = `${recipientAccount.user.firstName} ${recipientAccount.user.middleName || ''} ${recipientAccount.user.surname}`.trim();
                    recipientAccountNumber = recipientAccount.accountNumber;
                }
            }
            // For purchases, use merchant name as recipient
            else if (merchantName) {
                recipientName = merchantName;
                recipientAccountNumber = `MERCHANT-${merchantName.replace(/\s+/g, '-').toUpperCase()}`;
            }
        }

        // Create the enhanced transaction
        const transaction = await Transaction.create({
            accountId,
            type,
            amount,
            description,
            reference,
            transactionCategory,
            senderName,
            senderAccountNumber,
            recipientName,
            recipientAccountNumber,
            merchantName
        }, { transaction: dbTransaction });

        return transaction;

    } catch (error) {
        console.error('Error creating enhanced transaction:', error);
        throw error;
    }
}

/**
 * Create a fund transfer with both debit and credit transactions
 * @param {Object} transferData - Transfer data
 * @param {string} transferData.fromAccountId - Sender account ID
 * @param {string} transferData.toAccountId - Recipient account ID
 * @param {number} transferData.amount - Transfer amount
 * @param {string} transferData.description - Transfer description
 * @param {string} transferData.category - Transaction category
 * @param {string} transferData.baseReference - Base reference for transaction IDs
 * @param {Object} dbTransaction - Database transaction
 * @returns {Promise<Object>} Object with debit and credit transactions
 */
async function createFundTransfer(transferData, dbTransaction) {
    try {
        const {
            fromAccountId,
            toAccountId,
            amount,
            description,
            category = 'fund_transfer',
            baseReference
        } = transferData;

        const debitReference = `${baseReference}-OUT`;
        const creditReference = `${baseReference}-IN`;

        // Get sender and recipient account details
        const [fromAccount, toAccount] = await Promise.all([
            Account.findByPk(fromAccountId, {
                include: [{ model: User, as: 'user', attributes: ['firstName', 'middleName', 'surname'] }],
                transaction: dbTransaction
            }),
            Account.findByPk(toAccountId, {
                include: [{ model: User, as: 'user', attributes: ['firstName', 'middleName', 'surname'] }],
                transaction: dbTransaction
            })
        ]);

        if (!fromAccount || !toAccount) {
            throw new Error('Sender or recipient account not found');
        }

        const fromUserName = `${fromAccount.user.firstName} ${fromAccount.user.middleName || ''} ${fromAccount.user.surname}`.trim();
        const toUserName = `${toAccount.user.firstName} ${toAccount.user.middleName || ''} ${toAccount.user.surname}`.trim();

        // Create debit transaction (money leaving sender)
        const debitTransaction = await Transaction.create({
            accountId: fromAccountId,
            type: 'Debit',
            amount: amount,
            description: `Transfer to ${toUserName} - ${description}`,
            reference: debitReference,
            transactionCategory: category,
            senderName: fromUserName,
            senderAccountNumber: fromAccount.accountNumber,
            recipientName: toUserName,
            recipientAccountNumber: toAccount.accountNumber
        }, { transaction: dbTransaction });

        // Create credit transaction (money arriving at recipient)
        const creditTransaction = await Transaction.create({
            accountId: toAccountId,
            type: 'Credit',
            amount: amount,
            description: `Transfer from ${fromUserName} - ${description}`,
            reference: creditReference,
            transactionCategory: category,
            senderName: fromUserName,
            senderAccountNumber: fromAccount.accountNumber,
            recipientName: toUserName,
            recipientAccountNumber: toAccount.accountNumber
        }, { transaction: dbTransaction });

        return {
            debitTransaction,
            creditTransaction,
            fromUser: fromUserName,
            toUser: toUserName
        };

    } catch (error) {
        console.error('Error creating fund transfer:', error);
        throw error;
    }
}

/**
 * Create a purchase transaction with merchant details
 * @param {Object} purchaseData - Purchase data
 * @param {string} purchaseData.accountId - Account making the purchase
 * @param {number} purchaseData.amount - Purchase amount
 * @param {string} purchaseData.merchantName - Merchant name
 * @param {string} purchaseData.description - Purchase description
 * @param {string} purchaseData.reference - Transaction reference
 * @param {Object} dbTransaction - Database transaction
 * @returns {Promise<Object>} Created purchase transaction
 */
async function createPurchaseTransaction(purchaseData, dbTransaction = null) {
    try {
        const {
            accountId,
            amount,
            merchantName,
            description,
            reference
        } = purchaseData;

        return await createEnhancedTransaction({
            accountId,
            type: 'Debit',
            amount: Math.abs(amount), // Ensure positive amount
            description: description || `Purchase at ${merchantName}`,
            reference,
            transactionCategory: 'purchase',
            merchantName,
            recipientAccountId: null // Will use merchant name as recipient
        }, dbTransaction);

    } catch (error) {
        console.error('Error creating purchase transaction:', error);
        throw error;
    }
}

/**
 * Create smart distribution transactions (from Main to category accounts)
 * @param {Object} distributionData - Distribution data
 * @param {string} distributionData.mainAccountId - Main account ID
 * @param {Array} distributionData.distributions - Array of {accountId, amount, accountType}
 * @param {string} distributionData.description - Distribution description
 * @param {string} distributionData.baseReference - Base reference
 * @param {Object} dbTransaction - Database transaction
 * @returns {Promise<Array>} Array of created transactions
 */
async function createSmartDistribution(distributionData, dbTransaction) {
    try {
        const {
            mainAccountId,
            distributions,
            description = 'Smart distribution',
            baseReference
        } = distributionData;

        const transactions = [];

        for (let i = 0; i < distributions.length; i++) {
            const { accountId, amount, accountType } = distributions[i];
            
            const transferResult = await createFundTransfer({
                fromAccountId: mainAccountId,
                toAccountId: accountId,
                amount,
                description: `${description} to ${accountType} account`,
                category: 'smart_distribution',
                baseReference: `${baseReference}-${accountType.toUpperCase()}-${i + 1}`
            }, dbTransaction);

            transactions.push(transferResult);
        }

        return transactions;

    } catch (error) {
        console.error('Error creating smart distribution:', error);
        throw error;
    }
}

module.exports = {
    createEnhancedTransaction,
    createFundTransfer,
    createPurchaseTransaction,
    createSmartDistribution
};