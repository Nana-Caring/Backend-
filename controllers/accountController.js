const { Account, User, Transaction } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get user's own accounts and balances
exports.getUserAccounts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only allow funders and caregivers to use this endpoint
        // Dependents should use the dedicated dependent endpoint
        if (userRole === 'dependent') {
            return res.status(403).json({
                message: "Access denied. Dependents should use /dependent/my-accounts endpoint."
            });
        }

        const accounts = await Account.findAll({
            where: { userId },
            attributes: [
                'id',
                'accountNumber',
                'accountType',
                'balance',
                'currency',
                'status',
                'creationDate',
                'lastTransactionDate',
                'parentAccountId'
            ],
            order: [
                ['accountType', 'ASC'],
                ['createdAt', 'ASC']
            ]
        });

        // Calculate total balance across all accounts
        const totalBalance = accounts.reduce((sum, account) => {
            return sum + parseFloat(account.balance || 0);
        }, 0);

        // Separate main and sub accounts
        const mainAccounts = accounts.filter(acc => !acc.parentAccountId);
        const subAccounts = accounts.filter(acc => acc.parentAccountId);

        res.status(200).json({
            message: "User accounts retrieved successfully",
            userRole: userRole,
            totalBalance: totalBalance.toFixed(2),
            currency: "ZAR",
            accountsCount: accounts.length,
            accounts: {
                main: mainAccounts,
                sub: subAccounts
            },
            allAccounts: accounts
        });

    } catch (error) {
        console.error('Get user accounts error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get specific account balance by account ID
exports.getAccountBalance = async (req, res) => {
    try {
        const { accountId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        let account;

        if (userRole === 'dependent') {
            // Dependents can only access their own accounts
            account = await Account.findOne({
                where: { 
                    id: accountId,
                    userId: userId
                },
                attributes: [
                    'id',
                    'accountNumber',
                    'accountType',
                    'balance',
                    'currency',
                    'status',
                    'lastTransactionDate'
                ]
            });
        } else if (userRole === 'caregiver') {
            // Caregivers can access their own accounts or their dependents' accounts
            account = await Account.findOne({
                where: { id: accountId },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'role']
                    }
                ],
                attributes: [
                    'id',
                    'accountNumber',
                    'accountType',
                    'balance',
                    'currency',
                    'status',
                    'lastTransactionDate',
                    'userId'
                ]
            });

            if (account) {
                // Check if it's the caregiver's own account
                if (account.userId === userId) {
                    // It's the caregiver's own account, allow access
                } else {
                    // Check if the caregiver has access to this dependent
                    const hasAccess = await User.findOne({
                        where: { id: userId },
                        include: [
                            {
                                model: User,
                                as: 'Dependents',
                                where: { id: account.userId },
                                required: true
                            }
                        ]
                    });

                    if (!hasAccess) {
                        return res.status(403).json({
                            message: "Access denied. You are not authorized to view this account."
                        });
                    }
                }
            }
        } else {
            // Funders and other roles can only access their own accounts
            account = await Account.findOne({
                where: { 
                    id: accountId,
                    userId: userId
                },
                attributes: [
                    'id',
                    'accountNumber',
                    'accountType',
                    'balance',
                    'currency',
                    'status',
                    'lastTransactionDate'
                ]
            });
        }

        if (!account) {
            return res.status(404).json({
                message: "Account not found or access denied"
            });
        }

        res.status(200).json({
            message: "Account balance retrieved successfully",
            account: account
        });

    } catch (error) {
        console.error('Get account balance error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get account balance by account number
exports.getAccountBalanceByNumber = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const userId = req.user.id;

        const account = await Account.findOne({
            where: { 
                accountNumber: accountNumber,
                userId: userId
            },
            attributes: [
                'id',
                'accountNumber',
                'accountType',
                'balance',
                'currency',
                'status',
                'lastTransactionDate'
            ]
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found or access denied"
            });
        }

        res.status(200).json({
            message: "Account balance retrieved successfully",
            account: account
        });

    } catch (error) {
        console.error('Get account balance by number error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get accounts by type (e.g., Main, Education, Healthcare, etc.)
exports.getAccountsByType = async (req, res) => {
    try {
        const { accountType } = req.params;
        const userId = req.user.id;

        const accounts = await Account.findAll({
            where: { 
                userId,
                accountType: accountType
            },
            attributes: [
                'id',
                'accountNumber',
                'accountType',
                'balance',
                'currency',
                'status',
                'creationDate',
                'lastTransactionDate'
            ]
        });

        const totalBalance = accounts.reduce((sum, account) => {
            return sum + parseFloat(account.balance || 0);
        }, 0);

        res.status(200).json({
            message: `${accountType} accounts retrieved successfully`,
            accountType: accountType,
            totalBalance: totalBalance.toFixed(2),
            currency: "ZAR",
            accountsCount: accounts.length,
            accounts: accounts
        });

    } catch (error) {
        console.error('Get accounts by type error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get account summary with recent transactions
exports.getAccountSummary = async (req, res) => {
    try {
        const { accountId } = req.params;
        const userId = req.user.id;

        const account = await Account.findOne({
            where: { 
                id: accountId,
                userId: userId
            },
            include: [
                {
                    model: Transaction,
                    as: 'transactions',
                    limit: 10,
                    order: [['createdAt', 'DESC']],
                    attributes: ['id', 'amount', 'type', 'createdAt', 'timestamp']
                }
            ]
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found or access denied"
            });
        }

        res.status(200).json({
            message: "Account summary retrieved successfully",
            account: account
        });

    } catch (error) {
        console.error('Get account summary error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// ADMIN ONLY: Get all accounts and balances
exports.getAllAccounts = async (req, res) => {
    try {
        const { page = 1, limit = 20, accountType, status } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        let whereClause = {};
        if (accountType) {
            whereClause.accountType = accountType;
        }
        if (status) {
            whereClause.status = status;
        }

        const { count, rows: accounts } = await Account.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'surname', 'email', 'role']
                }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        // Calculate total balance across all accounts
        const totalBalanceResult = await Account.sum('balance', { where: whereClause });
        const totalBalance = totalBalanceResult || 0;

        res.status(200).json({
            message: "All accounts retrieved successfully",
            totalBalance: totalBalance.toFixed(2),
            currency: "ZAR",
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalRecords: count,
                recordsPerPage: parseInt(limit)
            },
            accounts: accounts
        });

    } catch (error) {
        console.error('Get all accounts error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// ADMIN ONLY: Get account statistics
exports.getAccountStats = async (req, res) => {
    try {
        // Get total accounts count
        const totalAccounts = await Account.count();

        // Get accounts by type
        const accountsByType = await Account.findAll({
            attributes: [
                'accountType',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('balance')), 'totalBalance']
            ],
            group: ['accountType'],
            raw: true
        });

        // Get accounts by status
        const accountsByStatus = await Account.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('balance')), 'totalBalance']
            ],
            group: ['status'],
            raw: true
        });

        // Get total balance
        const totalBalance = await Account.sum('balance') || 0;

        // Get active accounts count
        const activeAccounts = await Account.count({
            where: { status: 'active' }
        });

        res.status(200).json({
            message: "Account statistics retrieved successfully",
            stats: {
                totalAccounts,
                activeAccounts,
                totalBalance: parseFloat(totalBalance).toFixed(2),
                currency: "ZAR",
                accountsByType: accountsByType.map(item => ({
                    type: item.accountType,
                    count: parseInt(item.count),
                    totalBalance: parseFloat(item.totalBalance || 0).toFixed(2)
                })),
                accountsByStatus: accountsByStatus.map(item => ({
                    status: item.status,
                    count: parseInt(item.count),
                    totalBalance: parseFloat(item.totalBalance || 0).toFixed(2)
                }))
            }
        });

    } catch (error) {
        console.error('Get account stats error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get dependent accounts (for caregivers)
exports.getDependentAccounts = async (req, res) => {
    try {
        const { dependentId } = req.params;
        const caregiverId = req.user.id;

        // Verify caregiver has access to this dependent
        const caregiver = await User.findByPk(caregiverId, {
            include: [
                {
                    model: User,
                    as: 'Dependents',
                    where: { id: dependentId },
                    required: true
                }
            ]
        });

        if (!caregiver || caregiver.role !== 'caregiver') {
            return res.status(403).json({
                message: "Access denied. You are not authorized to view this dependent's accounts."
            });
        }

        // Get dependent's accounts
        const accounts = await Account.findAll({
            where: { userId: dependentId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'surname', 'email', 'role'],
                    where: { role: 'dependent' }
                }
            ],
            attributes: [
                'id',
                'accountNumber',
                'accountType',
                'balance',
                'currency',
                'status',
                'creationDate',
                'lastTransactionDate'
            ]
        });

        if (accounts.length === 0) {
            return res.status(404).json({
                message: "No accounts found for this dependent"
            });
        }

        const totalBalance = accounts.reduce((sum, account) => {
            return sum + parseFloat(account.balance || 0);
        }, 0);

        res.status(200).json({
            message: "Dependent accounts retrieved successfully",
            dependent: accounts[0].user,
            totalBalance: totalBalance.toFixed(2),
            currency: "ZAR",
            accountsCount: accounts.length,
            accounts: accounts
        });

    } catch (error) {
        console.error('Get dependent accounts error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get dependent's own accounts (for dependents to view their own accounts only)
exports.getDependentOwnAccounts = async (req, res) => {
    try {
        const userId = req.user.id;

        // Verify user is a dependent
        if (req.user.role !== 'dependent') {
            return res.status(403).json({
                message: "Access denied. This endpoint is only for dependents."
            });
        }

        const accounts = await Account.findAll({
            where: { userId },
            attributes: [
                'id',
                'accountNumber',
                'accountType',
                'balance',
                'currency',
                'status',
                'creationDate',
                'lastTransactionDate',
                'parentAccountId',
                'createdAt',
                'updatedAt'
            ],
            include: [
                {
                    model: Account,
                    as: 'subAccounts',
                    attributes: [
                        'id',
                        'accountNumber',
                        'accountType',
                        'balance',
                        'currency',
                        'status',
                        'creationDate',
                        'lastTransactionDate'
                    ]
                },
                {
                    model: Account,
                    as: 'parentAccount',
                    attributes: [
                        'id',
                        'accountNumber',
                        'accountType',
                        'balance',
                        'status'
                    ],
                    required: false
                }
            ],
            order: [
                ['accountType', 'ASC'],
                ['createdAt', 'ASC']
            ]
        });

        // Calculate total balance across all accounts
        const totalBalance = accounts.reduce((sum, account) => {
            return sum + parseFloat(account.balance || 0);
        }, 0);

        // Separate main and sub accounts with enhanced details
        const mainAccounts = accounts.filter(acc => !acc.parentAccountId).map(account => ({
            id: account.id,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            balance: parseFloat(account.balance || 0).toFixed(2),
            currency: account.currency,
            status: account.status,
            creationDate: account.creationDate,
            lastTransactionDate: account.lastTransactionDate,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
            subAccounts: account.subAccounts || [],
            hasSubAccounts: account.subAccounts ? account.subAccounts.length > 0 : false
        }));

        const subAccounts = accounts.filter(acc => acc.parentAccountId).map(account => ({
            id: account.id,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            balance: parseFloat(account.balance || 0).toFixed(2),
            currency: account.currency,
            status: account.status,
            creationDate: account.creationDate,
            lastTransactionDate: account.lastTransactionDate,
            parentAccountId: account.parentAccountId,
            parentAccount: account.parentAccount,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt
        }));

        // Enhanced all accounts array with complete information
        const allAccountsDetailed = accounts.map(account => ({
            id: account.id,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            balance: parseFloat(account.balance || 0).toFixed(2),
            currency: account.currency,
            status: account.status,
            creationDate: account.creationDate,
            lastTransactionDate: account.lastTransactionDate,
            parentAccountId: account.parentAccountId,
            parentAccount: account.parentAccount,
            subAccounts: account.subAccounts || [],
            isMainAccount: !account.parentAccountId,
            isSubAccount: !!account.parentAccountId,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt
        }));

        res.status(200).json({
            message: "Your accounts retrieved successfully",
            totalBalance: totalBalance.toFixed(2),
            currency: "ZAR",
            accountsCount: accounts.length,
            mainAccountsCount: mainAccounts.length,
            subAccountsCount: subAccounts.length,
            accounts: {
                main: mainAccounts,
                sub: subAccounts
            },
            allAccounts: allAccountsDetailed,
            summary: {
                totalMainAccounts: mainAccounts.length,
                totalSubAccounts: subAccounts.length,
                totalBalance: totalBalance.toFixed(2),
                currency: "ZAR",
                accountTypes: [...new Set(accounts.map(acc => acc.accountType))],
                activeAccounts: accounts.filter(acc => acc.status === 'active').length,
                inactiveAccounts: accounts.filter(acc => acc.status === 'inactive').length
            }
        });

    } catch (error) {
        console.error('Get dependent own accounts error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get all dependents and their accounts (for caregivers)
exports.getAllDependentsAccounts = async (req, res) => {
    try {
        const caregiverId = req.user.id;

        // Verify caregiver role
        if (req.user.role !== 'caregiver') {
            return res.status(403).json({
                message: "Access denied. Caregiver role required."
            });
        }

        // Get caregiver with all their dependents and their accounts
        const caregiver = await User.findByPk(caregiverId, {
            include: [
                {
                    model: User,
                    as: 'Dependents',
                    attributes: ['id', 'firstName', 'surname', 'email', 'role'],
                    include: [
                        {
                            model: Account,
                            as: 'Accounts',
                            attributes: [
                                'id',
                                'accountNumber',
                                'accountType',
                                'balance',
                                'currency',
                                'status',
                                'creationDate',
                                'lastTransactionDate'
                            ]
                        }
                    ]
                }
            ]
        });

        if (!caregiver) {
            return res.status(404).json({
                message: "Caregiver not found"
            });
        }

        // Calculate totals for each dependent
        const dependentsWithAccountSummary = caregiver.Dependents.map(dependent => {
            const totalBalance = dependent.Accounts?.reduce((sum, account) => {
                return sum + parseFloat(account.balance || 0);
            }, 0) || 0;

            return {
                id: dependent.id,
                firstName: dependent.firstName,
                surname: dependent.surname,
                email: dependent.email,
                totalBalance: totalBalance.toFixed(2),
                accountsCount: dependent.Accounts?.length || 0,
                accounts: dependent.Accounts || []
            };
        });

        const grandTotal = dependentsWithAccountSummary.reduce((sum, dep) => {
            return sum + parseFloat(dep.totalBalance);
        }, 0);

        res.status(200).json({
            message: "All dependent accounts retrieved successfully",
            caregiver: {
                id: caregiver.id,
                firstName: caregiver.firstName,
                surname: caregiver.surname,
                email: caregiver.email
            },
            grandTotalBalance: grandTotal.toFixed(2),
            currency: "ZAR",
            dependentsCount: dependentsWithAccountSummary.length,
            dependents: dependentsWithAccountSummary
        });

    } catch (error) {
        console.error('Get all dependents accounts error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
