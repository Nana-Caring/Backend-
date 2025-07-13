// Get all dependents assigned to this caregiver, including relationship and caregiver info
const getCaregiverDependentsWithRelationship = async (req, res) => {
    try {
        const caregiverId = req.user.id;
        const dependents = await User.findAll({
            where: { role: 'dependent' },
            include: [
                {
                    model: Account,
                    as: 'accounts',
                    where: { caregiverId },
                    required: true,
                    include: [
                        {
                            model: User,
                            as: 'caregiver',
                            attributes: ['id', 'firstName', 'middleName', 'surname', 'email']
                        }
                    ]
                }
            ]
        });

        const result = dependents.map(dep => {
            const account = dep.accounts[0];
            return {
                dependentId: dep.id,
                dependentName: `${dep.firstName} ${dep.middleName || ''} ${dep.surname}`.trim(),
                relation: dep.relation,
                caregiver: account && account.caregiver ? {
                    id: account.caregiver.id,
                    name: `${account.caregiver.firstName} ${account.caregiver.middleName || ''} ${account.caregiver.surname}`.trim(),
                    email: account.caregiver.email
                } : null
            };
        });
        res.status(200).json({ success: true, dependents: result });
    } catch (error) {
        console.error('Error fetching dependents with relationship:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dependents with relationship', error: error.message });
    }
};

// Get a specific dependent's relationship to caregiver
const getDependentRelationship = async (req, res) => {
    try {
        const caregiverId = req.user.id;
        const { dependentId } = req.params;
        const dependent = await User.findOne({
            where: { id: dependentId, role: 'dependent' },
            include: [
                {
                    model: Account,
                    as: 'accounts',
                    where: { caregiverId },
                    required: true,
                    include: [
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
            return res.status(404).json({ success: false, message: 'Dependent not found or not assigned to this caregiver' });
        }
        const account = dependent.accounts[0];
        res.status(200).json({
            success: true,
            dependent: {
                id: dependent.id,
                name: `${dependent.firstName} ${dependent.middleName || ''} ${dependent.surname}`.trim(),
                relation: dependent.relation,
                caregiver: account && account.caregiver ? {
                    id: account.caregiver.id,
                    name: `${account.caregiver.firstName} ${account.caregiver.middleName || ''} ${account.caregiver.surname}`.trim(),
                    email: account.caregiver.email
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching dependent relationship:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dependent relationship', error: error.message });
    }
};
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

        // Build search conditions for dependents
        let dependentWhere = {
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

        // Find all dependents that have accounts assigned to this caregiver
        const dependents = await User.findAndCountAll({
            where: dependentWhere,
            include: [
                {
                    model: Account,
                    as: 'accounts',
                    where: { caregiverId: caregiverId },
                    required: true, // Only include users who have accounts with this caregiver
                    include: [
                        {
                            model: Transaction,
                            as: 'transactions',
                            limit: 5, // Get last 5 transactions
                            order: [['createdAt', 'DESC']],
                            required: false
                        }
                    ]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]],
            distinct: true
        });

        // Transform the response
        const transformedDependents = dependents.rows.map(dependent => {
            const account = dependent.accounts[0]; // Should only be one account per dependent
            
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
                account: account ? {
                    id: account.id,
                    accountNumber: account.accountNumber,
                    accountType: account.accountType,
                    balance: parseFloat(account.balance),
                    currency: account.currency,
                    status: account.status,
                    createdAt: account.createdAt,
                    lastTransactionDate: account.lastTransactionDate,
                    recentTransactions: account.transactions || []
                } : null,
                totalTransactions: account ? account.transactions.length : 0
            };
        });

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
                    as: 'accounts',
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

        // Get total dependents count
        const totalDependents = await User.count({
            where: { role: 'dependent' },
            include: [
                {
                    model: Account,
                    as: 'accounts',
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
                    as: 'accounts',
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
                    as: 'accounts',
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
                    as: 'accounts',
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
                    as: 'accounts',
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

module.exports = {
    getCaregiverDependents,
    getDependentById,
    getCaregiverStats,
    getRecentActivity
    ,getCaregiverDependentsWithRelationship
    ,getDependentRelationship
};
