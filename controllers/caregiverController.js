const { User, Account, Transaction } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Get all dependents assigned to this caregiver
const getCaregiverDependents = async (req, res) => {
    try {
        const caregiverId = req.user.id;
        const { 
            page = 1, 
            limit = 10, 
            search, 
            status = 'active',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // First, find all accounts managed by this caregiver
        const caregiverAccounts = await Account.findAll({
            where: { caregiverId: caregiverId },
            attributes: ['userId'],
            group: ['userId'] // Get unique user IDs
        });

        const dependentIds = caregiverAccounts.map(acc => acc.userId);

        if (dependentIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No dependents found for this caregiver',
                data: {
                    dependents: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalDependents: 0,
                        hasNextPage: false,
                        hasPrevPage: false,
                        limit: parseInt(limit)
                    }
                }
            });
        }

        // Build search conditions for dependents
        let dependentWhere = {
            id: { [Op.in]: dependentIds },
            role: 'dependent'
        };

        if (status !== 'all') {
            dependentWhere.status = status;
        }

        if (search) {
            dependentWhere[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { middleName: { [Op.iLike]: `%${search}%` } },
                { surname: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { Idnumber: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Find dependents
        const dependents = await User.findAndCountAll({
            where: dependentWhere,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]],
            distinct: true
        });

        // Get accounts and transactions for each dependent
        const transformedDependents = await Promise.all(
            dependents.rows.map(async (dependent) => {
                // Get accounts for this dependent managed by this caregiver
                const accounts = await Account.findAll({
                    where: { 
                        userId: dependent.id,
                        caregiverId: caregiverId
                    },
                    include: [
                        {
                            model: Transaction,
                            as: 'transactions',
                            limit: 5,
                            order: [['createdAt', 'DESC']],
                            required: false
                        }
                    ]
                });

                const mainAccount = accounts.find(acc => acc.accountType === 'Main') || accounts[0];

                return {
                    id: dependent.id,
                    firstName: dependent.firstName,
                    middleName: dependent.middleName,
                    surname: dependent.surname,
                    fullName: `${dependent.firstName} ${dependent.middleName || ''} ${dependent.surname}`.trim(),
                    email: dependent.email,
                    idNumber: dependent.Idnumber,
                    phoneNumber: dependent.phoneNumber,
                    relation: dependent.relation,
                    status: dependent.status,
                    isBlocked: dependent.isBlocked,
                    createdAt: dependent.createdAt,
                    updatedAt: dependent.updatedAt,
                    accountsCount: accounts.length,
                    account: mainAccount ? {
                        id: mainAccount.id,
                        accountNumber: mainAccount.accountNumber,
                        accountType: mainAccount.accountType,
                        balance: parseFloat(mainAccount.balance || 0),
                        currency: mainAccount.currency,
                        status: mainAccount.status,
                        createdAt: mainAccount.createdAt,
                        lastTransactionDate: mainAccount.lastTransactionDate,
                        recentTransactions: mainAccount.transactions || []
                    } : null,
                    totalTransactions: accounts.reduce((total, acc) => total + (acc.transactions?.length || 0), 0)
                };
            })
        );

        const totalPages = Math.ceil(dependents.count / limit);

        res.status(200).json({
            success: true,
            message: 'Dependents retrieved successfully',
            data: {
                dependents: transformedDependents,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: totalPages,
                    totalDependents: dependents.count,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching caregiver dependents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dependents',
            error: error.message
        });
    }
};

// Get a specific dependent by ID (caregiver must be assigned to them)
const getDependentById = async (req, res) => {
    try {
        const caregiverId = req.user.id;
        const { dependentId } = req.params;

        const dependent = await User.findOne({
            where: {
                id: dependentId,
                role: 'dependent'
            },
            include: [
                {
                    model: Account,
                    as: 'Accounts',  // ✅ Fixed: Use correct alias 'Accounts'
                    where: { caregiverId: caregiverId },
                    required: true,
                    include: [
                        {
                            model: Transaction,
                            as: 'transactions',
                            order: [['createdAt', 'DESC']],
                            limit: 20 // Get last 20 transactions
                        },
                        {
                            model: User,
                            as: 'caregiver',
                            attributes: ['id', 'firstName', 'middleName', 'surname', 'email']
                        }
                    ]
                }
            ]
        });

        if (!dependent) {
            return res.status(404).json({
                success: false,
                message: 'Dependent not found or you do not have caregiver access to this user'
            });
        }

        const account = dependent.accounts[0];

        // Calculate account statistics
        const totalTransactions = await Transaction.count({
            where: { accountId: account.id }
        });

        const totalCredits = await Transaction.sum('amount', {
            where: { 
                accountId: account.id,
                type: 'Credit'
            }
        }) || 0;

        const totalDebits = await Transaction.sum('amount', {
            where: { 
                accountId: account.id,
                type: 'Debit'
            }
        }) || 0;

        const responseData = {
            id: dependent.id,
            firstName: dependent.firstName,
            middleName: dependent.middleName,
            surname: dependent.surname,
            fullName: `${dependent.firstName} ${dependent.middleName || ''} ${dependent.surname}`.trim(),
            email: dependent.email,
            idNumber: dependent.Idnumber,
            phoneNumber: dependent.phoneNumber,
            relation: dependent.relation,
            status: dependent.status,
            isBlocked: dependent.isBlocked,
            blockReason: dependent.blockReason,
            createdAt: dependent.createdAt,
            updatedAt: dependent.updatedAt,
            // Address information
            postalAddress: {
                line1: dependent.postalAddressLine1,
                line2: dependent.postalAddressLine2,
                city: dependent.postalCity,
                province: dependent.postalProvince,
                postalCode: dependent.postalCode
            },
            physicalAddress: {
                line1: dependent.physicalAddressLine1,
                line2: dependent.physicalAddressLine2,
                city: dependent.physicalCity,
                province: dependent.physicalProvince,
                postalCode: dependent.physicalPostalCode
            },
            account: {
                id: account.id,
                accountNumber: account.accountNumber,
                accountType: account.accountType,
                balance: parseFloat(account.balance),
                currency: account.currency,
                status: account.status,
                createdAt: account.createdAt,
                lastTransactionDate: account.lastTransactionDate,
                statistics: {
                    totalTransactions,
                    totalCredits: parseFloat(totalCredits),
                    totalDebits: parseFloat(totalDebits),
                    netBalance: parseFloat(totalCredits) - parseFloat(totalDebits)
                },
                recentTransactions: account.transactions,
                caregiver: account.caregiver
            }
        };

        res.status(200).json({
            success: true,
            message: 'Dependent details retrieved successfully',
            data: responseData
        });

    } catch (error) {
        console.error('Error fetching dependent by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dependent details',
            error: error.message
        });
    }
};

// Get caregiver dashboard statistics
const getCaregiverStats = async (req, res) => {
    try {
        const caregiverId = req.user.id;

        // Get total dependents count (using correct alias)
        const totalDependents = await User.count({
            where: { role: 'dependent' },
            include: [
                {
                    model: Account, 
                    as: 'Accounts',  // ✅ Fixed: Use correct alias 'Accounts' not 'accounts'
                    where: { caregiverId: caregiverId },
                    required: true
                }
            ]
        });

        // Get dependents by status (simplified approach)
        const activeDependents = await User.count({
            where: { role: 'dependent', status: 'active' },
            include: [
                {
                    model: Account,
                    as: 'Accounts',  // ✅ Fixed: Use correct alias 'Accounts'
                    where: { caregiverId: caregiverId },
                    required: true
                }
            ]
        });

        const blockedDependents = await User.count({
            where: { role: 'dependent', status: 'blocked' },
            include: [
                {
                    model: Account,
                    as: 'Accounts',  // ✅ Fixed: Use correct alias 'Accounts'
                    where: { caregiverId: caregiverId },
                    required: true
                }
            ]
        });

        const suspendedDependents = await User.count({
            where: { role: 'dependent', status: 'suspended' },
            include: [
                {
                    model: Account,
                    as: 'Accounts',  // ✅ Fixed: Use correct alias 'Accounts'
                    where: { caregiverId: caregiverId },
                    required: true
                }
            ]
        });

        const pendingDependents = await User.count({
            where: { role: 'dependent', status: 'pending' },
            include: [
                {
                    model: Account,
                    as: 'Accounts',  // ✅ Fixed: Use correct alias 'Accounts'
                    where: { caregiverId: caregiverId },
                    required: true
                }
            ]
        });

        // Get total balance across all dependents
        const totalBalance = await Account.sum('balance', {
            where: { caregiverId: caregiverId }
        }) || 0;

        // Get recent transactions count (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentTransactionsCount = await Transaction.count({
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: { caregiverId: caregiverId },
                    required: true
                }
            ],
            where: {
                createdAt: {
                    [Op.gte]: sevenDaysAgo
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Caregiver statistics retrieved successfully',
            data: {
                totalDependents,
                dependentsByStatus: {
                    active: activeDependents,
                    blocked: blockedDependents,
                    suspended: suspendedDependents,
                    pending: pendingDependents
                },
                totalAccountBalance: parseFloat(totalBalance),
                recentTransactionsCount,
                currency: 'ZAR'
            }
        });

    } catch (error) {
        console.error('Error fetching caregiver stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve caregiver statistics',
            error: error.message
        });
    }
};

// Get recent activity for all dependents under this caregiver
const getRecentActivity = async (req, res) => {
    try {
        const caregiverId = req.user.id;
        const { limit = 20, days = 7 } = req.query;

        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - parseInt(days));

        const recentTransactions = await Transaction.findAll({
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: { caregiverId: caregiverId },
                    required: true,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'middleName', 'surname']
                        }
                    ]
                }
            ],
            where: {
                createdAt: {
                    [Op.gte]: pastDate
                }
            },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        const transformedTransactions = recentTransactions.map(transaction => ({
            id: transaction.id,
            amount: parseFloat(transaction.amount),
            type: transaction.type,
            description: transaction.description,
            reference: transaction.reference,
            timestamp: transaction.timestamp,
            createdAt: transaction.createdAt,
            dependent: {
                id: transaction.account.user.id,
                name: `${transaction.account.user.firstName} ${transaction.account.user.middleName || ''} ${transaction.account.user.surname}`.trim(),
                accountNumber: transaction.account.accountNumber
            }
        }));

        res.status(200).json({
            success: true,
            message: 'Recent activity retrieved successfully',
            data: {
                transactions: transformedTransactions,
                period: `Last ${days} days`,
                totalTransactions: transformedTransactions.length
            }
        });

    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve recent activity',
            error: error.message
        });
    }
};

// Get all transactions for all dependents assigned to this caregiver
const getAllDependentTransactions = async (req, res) => {
    try {
        const caregiverId = req.user.id;
        const { 
            page = 1, 
            limit = 20, 
            dependentId, 
            accountType, 
            transactionType, // 'Credit', 'Debit', or 'all'
            startDate, 
            endDate,
            minAmount,
            maxAmount,
            sortBy = 'timestamp',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // Build transaction filters
        let transactionWhere = {};
        
        if (transactionType && transactionType !== 'all') {
            transactionWhere.type = transactionType;
        }

        if (startDate || endDate) {
            transactionWhere.timestamp = {};
            if (startDate) {
                transactionWhere.timestamp[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                transactionWhere.timestamp[Op.lte] = new Date(endDate);
            }
        }

        if (minAmount || maxAmount) {
            transactionWhere.amount = {};
            if (minAmount) {
                transactionWhere.amount[Op.gte] = parseFloat(minAmount);
            }
            if (maxAmount) {
                transactionWhere.amount[Op.lte] = parseFloat(maxAmount);
            }
        }

        // Build account filters
        let accountWhere = { caregiverId: caregiverId };
        if (accountType && accountType !== 'all') {
            accountWhere.accountType = accountType;
        }

        // Build user filters
        let userWhere = { role: 'dependent' };
        if (dependentId) {
            userWhere.id = dependentId;
        }

        // Get all transactions for this caregiver's dependents
        const transactions = await Transaction.findAndCountAll({
            where: transactionWhere,
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: accountWhere,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            where: userWhere,
                            attributes: ['id', 'firstName', 'middleName', 'surname', 'email']
                        }
                    ]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]],
            distinct: true
        });

        // Transform response
        const transformedTransactions = transactions.rows.map(transaction => ({
            id: transaction.id,
            amount: parseFloat(transaction.amount),
            type: transaction.type,
            description: transaction.description,
            reference: transaction.reference,
            timestamp: transaction.timestamp,
            metadata: transaction.metadata,
            dependent: {
                id: transaction.account.user.id,
                firstName: transaction.account.user.firstName,
                middleName: transaction.account.user.middleName,
                surname: transaction.account.user.surname,
                fullName: `${transaction.account.user.firstName} ${transaction.account.user.middleName || ''} ${transaction.account.user.surname}`.trim(),
                email: transaction.account.user.email
            },
            account: {
                id: transaction.account.id,
                accountNumber: transaction.account.accountNumber,
                accountType: transaction.account.accountType,
                balance: parseFloat(transaction.account.balance)
            }
        }));

        const totalPages = Math.ceil(transactions.count / limit);

        res.status(200).json({
            success: true,
            message: 'Transactions retrieved successfully',
            data: {
                transactions: transformedTransactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: transactions.count,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all dependent transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve transactions',
            error: error.message
        });
    }
};

// Get transactions for a specific dependent
const getDependentTransactions = async (req, res) => {
    try {
        const caregiverId = req.user.id;
        const { dependentId } = req.params;
        const { 
            page = 1, 
            limit = 20, 
            accountType, 
            transactionType, // 'Credit', 'Debit', or 'all'
            startDate, 
            endDate,
            minAmount,
            maxAmount,
            sortBy = 'timestamp',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // Verify that this dependent belongs to this caregiver
        const dependentCheck = await Account.findOne({
            where: { 
                caregiverId: caregiverId,
                userId: dependentId 
            },
            include: [{
                model: User,
                as: 'user',
                where: { role: 'dependent' }
            }]
        });

        if (!dependentCheck) {
            return res.status(404).json({
                success: false,
                message: 'Dependent not found or not assigned to you'
            });
        }

        // Build transaction filters
        let transactionWhere = {};
        
        if (transactionType && transactionType !== 'all') {
            transactionWhere.type = transactionType;
        }

        if (startDate || endDate) {
            transactionWhere.timestamp = {};
            if (startDate) {
                transactionWhere.timestamp[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                transactionWhere.timestamp[Op.lte] = new Date(endDate);
            }
        }

        if (minAmount || maxAmount) {
            transactionWhere.amount = {};
            if (minAmount) {
                transactionWhere.amount[Op.gte] = parseFloat(minAmount);
            }
            if (maxAmount) {
                transactionWhere.amount[Op.lte] = parseFloat(maxAmount);
            }
        }

        // Build account filters
        let accountWhere = { 
            caregiverId: caregiverId,
            userId: dependentId 
        };
        if (accountType && accountType !== 'all') {
            accountWhere.accountType = accountType;
        }

        // Get transactions for this specific dependent
        const transactions = await Transaction.findAndCountAll({
            where: transactionWhere,
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: accountWhere,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'middleName', 'surname', 'email']
                        }
                    ]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]],
            distinct: true
        });

        // Get account summaries for this dependent
        const accountSummaries = await Account.findAll({
            where: {
                caregiverId: caregiverId,
                userId: dependentId
            },
            attributes: [
                'id',
                'accountNumber',
                'accountType',
                'balance',
                [Sequelize.fn('COUNT', Sequelize.col('transactions.id')), 'transactionCount'],
                [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN transactions.type = \'Credit\' THEN transactions.amount ELSE 0 END')), 'totalCredits'],
                [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN transactions.type = \'Debit\' THEN transactions.amount ELSE 0 END')), 'totalDebits']
            ],
            include: [
                {
                    model: Transaction,
                    as: 'transactions',
                    attributes: [],
                    required: false
                }
            ],
            group: ['Account.id'],
            raw: true
        });

        // Transform response
        const transformedTransactions = transactions.rows.map(transaction => ({
            id: transaction.id,
            amount: parseFloat(transaction.amount),
            type: transaction.type,
            description: transaction.description,
            reference: transaction.reference,
            timestamp: transaction.timestamp,
            metadata: transaction.metadata,
            account: {
                id: transaction.account.id,
                accountNumber: transaction.account.accountNumber,
                accountType: transaction.account.accountType,
                balance: parseFloat(transaction.account.balance)
            }
        }));

        const totalPages = Math.ceil(transactions.count / limit);

        res.status(200).json({
            success: true,
            message: 'Dependent transactions retrieved successfully',
            data: {
                dependent: {
                    id: dependentCheck.user.id,
                    firstName: dependentCheck.user.firstName,
                    middleName: dependentCheck.user.middleName,
                    surname: dependentCheck.user.surname,
                    fullName: `${dependentCheck.user.firstName} ${dependentCheck.user.middleName || ''} ${dependentCheck.user.surname}`.trim(),
                    email: dependentCheck.user.email
                },
                accountSummaries: accountSummaries.map(account => ({
                    id: account.id,
                    accountNumber: account.accountNumber,
                    accountType: account.accountType,
                    balance: parseFloat(account.balance || 0),
                    transactionCount: parseInt(account.transactionCount || 0),
                    totalCredits: parseFloat(account.totalCredits || 0),
                    totalDebits: parseFloat(account.totalDebits || 0),
                    netAmount: parseFloat((account.totalCredits || 0) - (account.totalDebits || 0))
                })),
                transactions: transformedTransactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: transactions.count,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get dependent transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dependent transactions',
            error: error.message
        });
    }
};

// Get transaction analytics for all dependents
const getTransactionAnalytics = async (req, res) => {
    try {
        const caregiverId = req.user.id;
        const { 
            period = '30', // days
            dependentId,
            groupBy = 'day' // 'day', 'week', 'month'
        } = req.query;

        // Validate and parse the period parameter
        const parsedPeriod = parseInt(period);
        if (isNaN(parsedPeriod) || parsedPeriod <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid period parameter. Must be a positive number.',
                error: 'Period must be a valid positive integer'
            });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parsedPeriod);
        
        // Validate that startDate is valid
        if (isNaN(startDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date calculation',
                error: 'Failed to calculate start date from period'
            });
        }

        // Build filters
        let accountWhere = { caregiverId: caregiverId };
        let userWhere = { role: 'dependent' };
        
        // Validate dependentId if provided
        if (dependentId) {
            const parsedDependentId = parseInt(dependentId);
            if (isNaN(parsedDependentId) || parsedDependentId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid dependentId parameter. Must be a positive number.',
                    error: 'DependentId must be a valid positive integer'
                });
            }
            userWhere.id = parsedDependentId;
        }

        // Get transaction analytics
        const analytics = await Transaction.findAll({
            where: {
                timestamp: {
                    [Op.gte]: startDate.toISOString()
                }
            },
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: accountWhere,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            where: userWhere,
                            attributes: ['id', 'firstName', 'surname']
                        }
                    ]
                }
            ],
            attributes: [
                'type',
                'amount',
                'timestamp',
                [Sequelize.fn('DATE', Sequelize.col('timestamp')), 'date']
            ],
            order: [['timestamp', 'ASC']]
        });

        // Group analytics by period
        const groupedData = {};
        analytics.forEach(transaction => {
            const date = transaction.dataValues.date;
            if (!groupedData[date]) {
                groupedData[date] = {
                    date,
                    totalCredits: 0,
                    totalDebits: 0,
                    creditCount: 0,
                    debitCount: 0,
                    netAmount: 0
                };
            }

            if (transaction.type === 'Credit') {
                groupedData[date].totalCredits += parseFloat(transaction.amount);
                groupedData[date].creditCount += 1;
            } else {
                groupedData[date].totalDebits += parseFloat(transaction.amount);
                groupedData[date].debitCount += 1;
            }
            groupedData[date].netAmount = groupedData[date].totalCredits - groupedData[date].totalDebits;
        });

        // Calculate overall totals
        const overallTotals = analytics.reduce((acc, transaction) => {
            if (transaction.type === 'Credit') {
                acc.totalCredits += parseFloat(transaction.amount);
                acc.creditCount += 1;
            } else {
                acc.totalDebits += parseFloat(transaction.amount);
                acc.debitCount += 1;
            }
            return acc;
        }, {
            totalCredits: 0,
            totalDebits: 0,
            creditCount: 0,
            debitCount: 0
        });

        overallTotals.netAmount = overallTotals.totalCredits - overallTotals.totalDebits;
        overallTotals.totalTransactions = overallTotals.creditCount + overallTotals.debitCount;

        res.status(200).json({
            success: true,
            message: 'Transaction analytics retrieved successfully',
            data: {
                period: `${parsedPeriod} days`,
                startDate: startDate.toISOString().split('T')[0], // Include readable start date
                overallTotals,
                dailyBreakdown: Object.values(groupedData),
                summary: {
                    averageDailyCredits: overallTotals.totalCredits / parsedPeriod,
                    averageDailyDebits: overallTotals.totalDebits / parsedPeriod,
                    averageTransactionSize: overallTotals.totalTransactions > 0 ? 
                        (overallTotals.totalCredits + overallTotals.totalDebits) / overallTotals.totalTransactions : 0
                }
            }
        });

    } catch (error) {
        console.error('Get transaction analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve transaction analytics',
            error: error.message
        });
    }
};

module.exports = {
    getCaregiverDependents,
    getDependentById,
    getCaregiverStats,
    getRecentActivity,
    getAllDependentTransactions,
    getDependentTransactions,
    getTransactionAnalytics
};
