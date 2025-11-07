const db = require('../models');
const { Op } = require('sequelize');

const statsController = {
    // Get overall platform statistics
    getOverallStats: async (req, res) => {
        try {
            // Verify db and models are available
            if (!db || !db.User) {
                throw new Error('Database models not properly initialized');
            }

            const stats = {
                totalUsers: await db.User.count() || 0,
                totalFunders: await db.User.count({ where: { role: 'funder' } }) || 0,
                totalCaregivers: await db.User.count({ where: { role: 'caregiver' } }) || 0,
                totalDependents: await db.User.count({ where: { role: 'dependent' } }) || 0,
                totalAccounts: await db.Account.count() || 0
            };

            // Add transaction stats if the model exists
            if (db.Transaction) {
                stats.totalTransactions = await db.Transaction.count() || 0;
                stats.totalAmount = await db.Transaction.sum('amount') || 0;
            }

            res.json({ 
                success: true, 
                data: stats 
            });
        } catch (error) {
            console.error('Error in getOverallStats:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch overall statistics',
                details: error.message 
            });
        }
    },

    // Get monthly statistics
    getMonthlyStats: async (req, res) => {
        try {
            // Debug: Log available models
            console.log('Available models:', Object.keys(db));
            console.log('User model exists:', !!db.User);
            console.log('Transaction model exists:', !!db.Transaction);

            // Verify db and models are available
            if (!db || !db.User) {
                throw new Error('Required database models not found');
            }

            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

            const monthlyStats = {
                newUsers: await db.User.count({
                    where: {
                        createdAt: {
                            [Op.gte]: firstDayOfMonth
                        } 
                    }
                }) || 0,
                
                // Add role-specific counts
                newFunders: await db.User.count({
                    where: {
                        role: 'funder',
                        createdAt: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                }) || 0,

                newCaregivers: await db.User.count({
                    where: {
                        role: 'caregiver',
                        createdAt: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                }) || 0,

                newDependents: await db.User.count({
                    where: {
                        role: 'dependent',
                        createdAt: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                }) || 0
            };

            // Add transaction stats only if Transaction model exists
            if (db.Transaction) {
                monthlyStats.monthlyTransactions = await db.Transaction.count({
                    where: {
                        createdAt: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                }) || 0;

                monthlyStats.monthlyAmount = await db.Transaction.sum('amount', {
                    where: {
                        createdAt: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                }) || 0;
            } else {
                monthlyStats.monthlyTransactions = 'Transaction model not available';
                monthlyStats.monthlyAmount = 'Transaction model not available';
            }

            res.json({
                success: true,
                data: monthlyStats
            });
        } catch (error) {
            console.error('Error in getMonthlyStats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch monthly statistics',
                details: error.message
            });
        }
    }
};

module.exports = statsController;