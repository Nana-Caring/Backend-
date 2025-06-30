const db = require('../models');
const { Op } = require('sequelize');

const statsController = {
    // Get overall platform statistics
    getOverallStats: async (req, res) => {
        try {
            const stats = {
                totalUsers: await db.User.count(),
                totalFunders: await db.User.count({ where: { role: 'funder' } }),
                totalCaregivers: await db.User.count({ where: { role: 'caregiver' } }),
                totalDependents: await db.User.count({ where: { role: 'dependent' } }),
                // Add more stats as needed
                totalTransactions: await db.Transaction.count(),
                totalAmount: await db.Transaction.sum('amount')
            };

            res.json(stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    },

    // Get monthly statistics
    getMonthlyStats: async (req, res) => {
        try {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

            const monthlyStats = {
                newUsers: await db.User.count({
                    where: {
                        createdAt: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                }),
                monthlyTransactions: await db.Transaction.count({
                    where: {
                        createdAt: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                }),
                monthlyAmount: await db.Transaction.sum('amount', {
                    where: {
                        createdAt: {
                            [Op.gte]: firstDayOfMonth
                        }
                    }
                })
            };

            res.json(monthlyStats);
        } catch (error) {
            console.error('Error fetching monthly stats:', error);
            res.status(500).json({ error: 'Failed to fetch monthly statistics' });
        }
    }
};

module.exports = statsController;