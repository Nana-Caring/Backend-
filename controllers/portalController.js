const { User, Account, Transaction } = require('../models');


// Get user details with dependents, accounts, and recent activity
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'firstName', 'surname', 'email', 'role', 'status', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: User,
                    as: 'Dependents',
                    attributes: ['id', 'firstName', 'surname', 'email', 'role', 'status'],
                    include: [
                        {
                            model: Account,
                            as: 'Accounts',
                            attributes: ['id', 'accountNumber', 'accountType', 'balance', 'currency', 'status']
                        }
                    ]
                },
                {
                    model: Account,
                    as: 'Accounts',
                    attributes: ['id', 'accountNumber', 'accountType', 'balance', 'currency', 'status']
                }
            ]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Optionally fetch recent activity (last 10 transactions)
        const accountIds = user.Accounts ? user.Accounts.map(acc => acc.id) : [];
        let recentTransactions = [];
        if (accountIds.length > 0) {
            recentTransactions = await Transaction.findAll({
                where: { accountId: accountIds },
                order: [['createdAt', 'DESC']],
                limit: 10,
                attributes: ['id', 'accountId', 'amount', 'type', 'description', 'reference', 'createdAt', 'updatedAt']
            });
        }
        res.json({ user, recentTransactions });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user accounts with sub-accounts and parent info
exports.getUserAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll({
            where: { userId: req.user.id },
            attributes: ['id', 'accountNumber', 'accountType', 'balance', 'currency', 'status', 'createdAt', 'updatedAt', 'parentAccountId'],
            include: [
                {
                    model: Account,
                    as: 'subAccounts',
                    attributes: ['id', 'accountNumber', 'accountType', 'balance', 'currency', 'status']
                },
                {
                    model: Account,
                    as: 'parentAccount',
                    attributes: ['id', 'accountNumber', 'accountType', 'balance', 'status']
                }
            ]
        });
        res.json({ accounts });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user transactions with advanced filtering
exports.getUserTransactions = async (req, res) => {
    try {
        const { type, startDate, endDate, minAmount, maxAmount, search, sortBy = 'createdAt', sortOrder = 'DESC', limit = 20, page = 1 } = req.query;
        const accounts = await Account.findAll({
            where: { userId: req.user.id },
            attributes: ['id']
        });
        const accountIds = accounts.map(acc => acc.id);
        const whereClause = { accountId: accountIds };
        if (type) whereClause.type = type;
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt['$gte'] = new Date(startDate);
            if (endDate) whereClause.createdAt['$lte'] = new Date(endDate);
        }
        if (minAmount || maxAmount) {
            whereClause.amount = {};
            if (minAmount) whereClause.amount['$gte'] = parseFloat(minAmount);
            if (maxAmount) whereClause.amount['$lte'] = parseFloat(maxAmount);
        }
        if (search) {
            whereClause['$or'] = [
                { description: { $like: `%${search}%` } },
                { reference: { $like: `%${search}%` } }
            ];
        }
        const offset = (page - 1) * limit;
        const transactions = await Transaction.findAndCountAll({
            where: whereClause,
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: [
                'id',
                'accountId',
                'amount',
                'type',
                'description',
                'reference',
                'metadata',      // Include metadata for source info
                'createdAt',     // Date/time of transaction
                'updatedAt'
            ],
            include: [
                {
                    model: Account,
                    as: 'account',
                    attributes: ['accountNumber', 'accountType']
                }
            ]
        });
        res.json({
            transactions: transactions.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: transactions.count,
                pages: Math.ceil(transactions.count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
