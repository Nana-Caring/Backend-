const { User, Account, Transaction } = require('../models');
const { Op } = require('sequelize'); // Add this at the top


// Get user details with dependents, accounts, and recent activity
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: [
                'id', 'firstName', 'middleName', 'surname', 'email', 'role', 'status', 
                'phoneNumber', 'postalAddressLine1', 'postalAddressLine2', 'postalCity', 
                'postalProvince', 'postalCode', 'homeAddressLine1', 'homeAddressLine2', 
                'homeCity', 'homeProvince', 'homeCode', 'createdAt', 'updatedAt'
            ],
            include: [
                {
                    model: User,
                    as: 'Dependents',
                    attributes: ['id', 'firstName', 'middleName', 'surname', 'email', 'role', 'status'],
                    include: [
                        {
                            model: Account,
                            as: 'accounts',
                            attributes: ['id', 'accountNumber', 'accountType', 'balance', 'currency', 'status']
                        }
                    ]
                },
                {
                    model: Account,
                    as: 'accounts',
                    attributes: ['id', 'accountNumber', 'accountType', 'balance', 'currency', 'status']
                }
            ]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Optionally fetch recent activity (last 10 transactions)
        const accountIds = user.accounts ? user.accounts.map(acc => acc.id) : [];
        let recentTransactions = [];
        if (accountIds.length > 0) {
            recentTransactions = await Transaction.findAll({
                where: { accountId: accountIds },
                order: [['createdAt', 'DESC']],
                limit: 10,
                attributes: ['id', 'accountId', 'amount', 'type', 'description', 'reference', 'metadata', 'createdAt', 'updatedAt'],
                include: [
                    {
                        model: Account,
                        as: 'account',
                        attributes: ['accountNumber', 'accountType']
                    }
                ]
            });
        }
        res.json({ user, recentTransactions });
    } catch (error) {
        console.error('getUserDetails error:', error);
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
        
        // Get user's accounts
        const accounts = await Account.findAll({
            where: { userId: req.user.id },
            attributes: ['id']
        });
        
        if (accounts.length === 0) {
            return res.json({
                transactions: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    pages: 0
                }
            });
        }
        
        const accountIds = accounts.map(acc => acc.id);
        const whereClause = { accountId: { [Op.in]: accountIds } };
        
        if (type) whereClause.type = type;
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
            if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
        }
        if (minAmount || maxAmount) {
            whereClause.amount = {};
            if (minAmount) whereClause.amount[Op.gte] = parseFloat(minAmount);
            if (maxAmount) whereClause.amount[Op.lte] = parseFloat(maxAmount);
        }
        if (search) {
            whereClause[Op.or] = [
                { description: { [Op.like]: `%${search}%` } },
                { reference: { [Op.like]: `%${search}%` } }
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
        console.error('getUserTransactions error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user profile (admin or user via portal)
exports.updateUserProfile = async (req, res) => {
    try {
        const { 
            email, firstName, middleName, surname, phoneNumber,
            postalAddressLine1, postalAddressLine2, postalCity, postalProvince, postalCode,
            homeAddressLine1, homeAddressLine2, homeCity, homeProvince, homeCode
        } = req.body;
        
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update fields if provided
        if (email !== undefined) user.email = email;
        if (firstName !== undefined) user.firstName = firstName;
        if (middleName !== undefined) user.middleName = middleName;
        if (surname !== undefined) user.surname = surname;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (postalAddressLine1 !== undefined) user.postalAddressLine1 = postalAddressLine1;
        if (postalAddressLine2 !== undefined) user.postalAddressLine2 = postalAddressLine2;
        if (postalCity !== undefined) user.postalCity = postalCity;
        if (postalProvince !== undefined) user.postalProvince = postalProvince;
        if (postalCode !== undefined) user.postalCode = postalCode;
        if (homeAddressLine1 !== undefined) user.homeAddressLine1 = homeAddressLine1;
        if (homeAddressLine2 !== undefined) user.homeAddressLine2 = homeAddressLine2;
        if (homeCity !== undefined) user.homeCity = homeCity;
        if (homeProvince !== undefined) user.homeProvince = homeProvince;
        if (homeCode !== undefined) user.homeCode = homeCode;
        
        await user.save();
        
        // Return updated user without password
        const updatedUser = user.get({ plain: true });
        delete updatedUser.password;
        
        res.json({ message: 'User profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('updateUserProfile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
