// Portal admin login: authenticate as user and issue portal JWT
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const portalAdminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ 
            where: { email: username },
            attributes: [
                'id', 'firstName', 'middleName', 'surname', 'email', 
                'password', 'role', 'createdAt', 'updatedAt'
            ]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Issue a portal JWT scoped for this user with admin privileges
        const token = jwt.sign({ 
            id: user.id, 
            role: 'admin', 
            portal: true, 
            originalUserId: user.id 
        }, process.env.JWT_SECRET, { expiresIn: '2h' });
        
        res.json({ 
            token, 
            user: {
                id: user.id,
                firstName: user.firstName,
                surname: user.surname,
                email: user.email,
                role: user.role,
                status: user.status || 'active' // Fallback for missing status field
            }
        });
    } catch (error) {
        console.error('Portal login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const { Transaction, Account, PaymentCard } = require('../models');
const { Op } = require('sequelize');

// Get all transactions with filters and pagination
const getAllTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            accountId,
            userId,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = {};
        const accountWhereClause = {};
        const userWhereClause = {};

        // Filter by transaction type
        if (type) {
            whereClause.type = type;
        }

        // Filter by account ID
        if (accountId) {
            whereClause.accountId = accountId;
        }

        // Filter by user ID (through account)
        if (userId) {
            accountWhereClause.userId = userId;
        }

        // Filter by date range
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) {
                whereClause.createdAt[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                whereClause.createdAt[Op.lte] = new Date(endDate);
            }
        }

        // Filter by amount range
        if (minAmount || maxAmount) {
            whereClause.amount = {};
            if (minAmount) {
                whereClause.amount[Op.gte] = parseFloat(minAmount);
            }
            if (maxAmount) {
                whereClause.amount[Op.lte] = parseFloat(maxAmount);
            }
        }

        // Search in description or reference
        if (search) {
            whereClause[Op.or] = [
                { description: { [Op.iLike]: `%${search}%` } },
                { reference: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const transactions = await Transaction.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: Object.keys(accountWhereClause).length > 0 ? accountWhereClause : undefined,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
                            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
                        }
                    ]
                }
            ],
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                transactions: transactions.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: transactions.count,
                    pages: Math.ceil(transactions.count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
};

// Get transaction by ID with full details
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByPk(id, {
            include: [
                {
                    model: Account,
                    as: 'account',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'idNumber']
                        }
                    ]
                }
            ]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            data: transaction
        });

    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction',
            error: error.message
        });
    }
};

// Create manual transaction (admin only)
const createManualTransaction = async (req, res) => {
    try {
        const {
            accountId,
            amount,
            type,
            description,
            reference,
            metadata
        } = req.body;

        // Validate required fields
        if (!accountId || !amount || !type) {
            return res.status(400).json({
                success: false,
                message: 'Account ID, amount, and type are required'
            });
        }

        // Validate transaction type
        if (!['Credit', 'Debit'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Transaction type must be Credit or Debit'
            });
        }

        // Check if account exists
        const account = await Account.findByPk(accountId);
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            accountId,
            amount: parseFloat(amount),
            type,
            description: description || `Manual ${type.toLowerCase()} by admin`,
            reference: reference || `admin-${Date.now()}`,
            metadata: {
                ...metadata,
                source: 'admin_manual',
                adminId: req.user.id,
                adminEmail: req.user.email,
                createdAt: new Date().toISOString()
            }
        });

        // Update account balance
        if (type === 'Credit') {
            await account.increment('balance', { by: parseFloat(amount) });
        } else {
            await account.decrement('balance', { by: parseFloat(amount) });
        }

        // Fetch the created transaction with account details
        const createdTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                {
                    model: Account,
                    as: 'account',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'lastName', 'email']
                        }
                    ]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Manual transaction created successfully',
            data: createdTransaction
        });

    } catch (error) {
        console.error('Error creating manual transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create manual transaction',
            error: error.message
        });
    }
};

// Update transaction (limited fields)
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, metadata } = req.body;

        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Only allow updating description and metadata for safety
        const updateData = {};
        if (description !== undefined) {
            updateData.description = description;
        }
        if (metadata !== undefined) {
            updateData.metadata = {
                ...transaction.metadata,
                ...metadata,
                lastModified: new Date().toISOString(),
                modifiedBy: req.user.id
            };
        }

        await transaction.update(updateData);

        // Fetch updated transaction with details
        const updatedTransaction = await Transaction.findByPk(id, {
            include: [
                {
                    model: Account,
                    as: 'account',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'lastName', 'email']
                        }
                    ]
                }
            ]
        });

        res.json({
            success: true,
            message: 'Transaction updated successfully',
            data: updatedTransaction
        });

    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update transaction',
            error: error.message
        });
    }
};

// Reverse/void transaction (creates opposing transaction)
const reverseTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const originalTransaction = await Transaction.findByPk(id, {
            include: [{ model: Account, as: 'account' }]
        });

        if (!originalTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Check if already reversed
        const existingReversal = await Transaction.findOne({
            where: {
                reference: `reversal-${id}`,
                metadata: {
                    originalTransactionId: id
                }
            }
        });

        if (existingReversal) {
            return res.status(400).json({
                success: false,
                message: 'Transaction has already been reversed'
            });
        }

        // Create reversal transaction
        const reversalType = originalTransaction.type === 'Credit' ? 'Debit' : 'Credit';
        const reversalTransaction = await Transaction.create({
            accountId: originalTransaction.accountId,
            amount: originalTransaction.amount,
            type: reversalType,
            description: `Reversal of transaction: ${originalTransaction.description}`,
            reference: `reversal-${id}`,
            metadata: {
                isReversal: true,
                originalTransactionId: id,
                originalReference: originalTransaction.reference,
                reason: reason || 'Admin reversal',
                reversedBy: req.user.id,
                reversedAt: new Date().toISOString()
            }
        });

        // Update account balance
        if (reversalType === 'Credit') {
            await originalTransaction.account.increment('balance', { by: originalTransaction.amount });
        } else {
            await originalTransaction.account.decrement('balance', { by: originalTransaction.amount });
        }

        // Mark original transaction as reversed
        await originalTransaction.update({
            metadata: {
                ...originalTransaction.metadata,
                isReversed: true,
                reversalTransactionId: reversalTransaction.id,
                reversedBy: req.user.id,
                reversedAt: new Date().toISOString(),
                reversalReason: reason
            }
        });

        res.json({
            success: true,
            message: 'Transaction reversed successfully',
            data: {
                originalTransaction,
                reversalTransaction
            }
        });

    } catch (error) {
        console.error('Error reversing transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reverse transaction',
            error: error.message
        });
    }
};

// Delete transaction (hard delete - use with caution)
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmDelete, adjustBalance = true } = req.body;

        if (!confirmDelete) {
            return res.status(400).json({
                success: false,
                message: 'Delete confirmation required. Set confirmDelete: true to proceed.'
            });
        }

        const transaction = await Transaction.findByPk(id, {
            include: [{ model: Account, as: 'account' }]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Optionally adjust account balance before deletion
        if (adjustBalance) {
            if (transaction.type === 'Credit') {
                await transaction.account.decrement('balance', { by: transaction.amount });
            } else {
                await transaction.account.increment('balance', { by: transaction.amount });
            }
        }

        // Store transaction details for response
        const deletedTransactionData = {
            id: transaction.id,
            accountId: transaction.accountId,
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            reference: transaction.reference
        };

        // Delete transaction
        await transaction.destroy();

        res.json({
            success: true,
            message: 'Transaction deleted successfully',
            data: {
                deletedTransaction: deletedTransactionData,
                balanceAdjusted: adjustBalance
            }
        });

    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete transaction',
            error: error.message
        });
    }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
    try {
        const { startDate, endDate, accountId, userId } = req.query;

        const whereClause = {};
        const accountWhereClause = {};

        // Filter by date range
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) {
                whereClause.createdAt[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                whereClause.createdAt[Op.lte] = new Date(endDate);
            }
        }

        // Filter by account
        if (accountId) {
            whereClause.accountId = accountId;
        }

        // Filter by user (through account)
        if (userId) {
            accountWhereClause.userId = userId;
        }

        const includeAccount = Object.keys(accountWhereClause).length > 0 
            ? [{ model: Account, as: 'account', where: accountWhereClause }]
            : [];

        // Get basic stats
        const totalTransactions = await Transaction.count({
            where: whereClause,
            include: includeAccount
        });

        const creditTransactions = await Transaction.count({
            where: { ...whereClause, type: 'Credit' },
            include: includeAccount
        });

        const debitTransactions = await Transaction.count({
            where: { ...whereClause, type: 'Debit' },
            include: includeAccount
        });

        // Get amount stats
        const creditSum = await Transaction.sum('amount', {
            where: { ...whereClause, type: 'Credit' },
            include: includeAccount
        }) || 0;

        const debitSum = await Transaction.sum('amount', {
            where: { ...whereClause, type: 'Debit' },
            include: includeAccount
        }) || 0;

        const avgTransactionAmount = await Transaction.findOne({
            attributes: [
                [Transaction.sequelize.fn('AVG', Transaction.sequelize.col('amount')), 'avgAmount']
            ],
            where: whereClause,
            include: includeAccount,
            raw: true
        });

        // Get daily transaction counts for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyStats = await Transaction.findAll({
            attributes: [
                [Transaction.sequelize.fn('DATE', Transaction.sequelize.col('createdAt')), 'date'],
                [Transaction.sequelize.fn('COUNT', '*'), 'count'],
                [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'totalAmount']
            ],
            where: {
                ...whereClause,
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            },
            include: includeAccount,
            group: [Transaction.sequelize.fn('DATE', Transaction.sequelize.col('createdAt'))],
            order: [[Transaction.sequelize.fn('DATE', Transaction.sequelize.col('createdAt')), 'ASC']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                summary: {
                    totalTransactions,
                    creditTransactions,
                    debitTransactions,
                    totalCreditAmount: creditSum,
                    totalDebitAmount: debitSum,
                    netAmount: creditSum - debitSum,
                    averageTransactionAmount: parseFloat(avgTransactionAmount?.avgAmount || 0).toFixed(2)
                },
                dailyStats,
                period: {
                    startDate: startDate || thirtyDaysAgo.toISOString().split('T')[0],
                    endDate: endDate || new Date().toISOString().split('T')[0]
                }
            }
        });

    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction statistics',
            error: error.message
        });
    }
};

// Bulk operations
const bulkOperations = async (req, res) => {
    try {
        const { operation, transactionIds, data } = req.body;

        if (!operation || !transactionIds || !Array.isArray(transactionIds)) {
            return res.status(400).json({
                success: false,
                message: 'Operation and transaction IDs array are required'
            });
        }

        let results = [];

        switch (operation) {
            case 'delete':
                if (!data?.confirmDelete) {
                    return res.status(400).json({
                        success: false,
                        message: 'Delete confirmation required'
                    });
                }

                const deletedCount = await Transaction.destroy({
                    where: { id: { [Op.in]: transactionIds } }
                });

                results = { deletedCount };
                break;

            case 'updateDescription':
                if (!data?.description) {
                    return res.status(400).json({
                        success: false,
                        message: 'Description is required for update operation'
                    });
                }

                const [updatedCount] = await Transaction.update(
                    { 
                        description: data.description,
                        metadata: Transaction.sequelize.literal(`
                            COALESCE(metadata, '{}') || '{"bulkUpdated": true, "updatedBy": "${req.user.id}", "updatedAt": "${new Date().toISOString()}"}'
                        `)
                    },
                    { where: { id: { [Op.in]: transactionIds } } }
                );

                results = { updatedCount };
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid operation. Supported: delete, updateDescription'
                });
        }

        res.json({
            success: true,
            message: `Bulk ${operation} completed successfully`,
            data: results
        });

    } catch (error) {
        console.error('Error performing bulk operation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk operation',
            error: error.message
        });
    }
};

module.exports = {
    portalAdminLogin,
    getAllTransactions,
    getTransactionById,
    createManualTransaction,
    updateTransaction,
    reverseTransaction,
    deleteTransaction,
    getTransactionStats,
    bulkOperations
};
