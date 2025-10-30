// Admin User Management Controller
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Account, Transaction } = require('../models');
const { Op } = require('sequelize');
const { 
    sendMail, 
    getUserBlockedEmail, 
    getUserSuspendedEmail, 
    getUserUnblockedEmail, 
    getUserUnsuspendedEmail, 
    getAccountDeletedEmail 
} = require('../utils/emailService');

// Get all users with filtering
const getAllUsers = async (req, res) => {
    try {
        // Debug: list User associations to ensure alias matches
        if (process.env.DEBUG_ADMIN?.toLowerCase() === 'true') {
            try {
                const assoc = User.associations || {};
                console.log('User associations:', Object.keys(assoc));
                Object.entries(assoc).forEach(([key, a]) => {
                    console.log(` - ${key}: target=${a?.target?.name}, as=${a?.as}`);
                });
            } catch (e) {
                console.log('User associations debug failed:', e?.message);
            }
        }
        const {
            status,
            role,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            limit: limitRaw,
            page: pageRaw
        } = req.query;

        // Sanitize pagination and sorting
        const allowedSortBy = new Set(['createdAt', 'updatedAt', 'firstName', 'surname', 'email', 'role', 'status']);
        const sortKey = allowedSortBy.has(String(sortBy)) ? String(sortBy) : 'createdAt';
        const sortDir = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        const limit = Math.min(Math.max(parseInt(limitRaw ?? '25', 10) || 25, 1), 100);
        const page = Math.max(parseInt(pageRaw ?? '1', 10) || 1, 1);
        const offset = (page - 1) * limit;

        const whereClause = {};

        // Filter by status
        if (status) {
            whereClause.status = status;
        }

        // Filter by role
        if (role) {
            whereClause.role = role;
        }

        // Search in name or email
        if (search) {
            whereClause[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { surname: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const users = await User.findAndCountAll({
            where: whereClause,
            attributes: [
                'id', 'firstName', 'middleName', 'surname', 'email', 'role', 'status',
                'isBlocked', 'blockedAt', 'blockedBy', 'blockReason',
                'suspendedAt', 'suspendedUntil', 'suspendedBy', 'suspensionReason',
                'createdAt', 'updatedAt'
            ],
            include: [
                {
                    model: Account,
                    as: 'Accounts',
                    attributes: ['id', 'accountNumber', 'accountType', 'balance', 'status']
                }
            ],
            // Ensure correct total count when including hasMany associations
            distinct: true,
            order: [[sortKey, sortDir]],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                users: users.rows,
                total: users.count,
                page,
                pageCount: Math.ceil(users.count / limit),
                limit
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

// Get user by ID with full details
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Account,
                    as: 'Accounts',
                    attributes: ['id', 'accountNumber', 'accountType', 'balance', 'currency', 'status']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

// Block user
const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.status === 'blocked') {
            return res.status(400).json({
                success: false,
                message: 'User is already blocked'
            });
        }

        // Update user status
        await user.update({
            status: 'blocked',
            isBlocked: true,
            blockedAt: new Date(),
            blockedBy: adminId,
            blockReason: reason || 'No reason provided'
        });

        // Send notification email
        try {
            const emailHtml = getUserBlockedEmail({
                user,
                reason: reason || 'No reason provided',
                blockedBy: adminId
            });

            await sendMail({
                to: user.email,
                subject: 'NANA Portal - Account Blocked',
                html: emailHtml
            });

            console.log(`Block notification sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send block notification:', emailError);
        }

        res.json({
            success: true,
            message: 'User blocked successfully',
            data: {
                userId: user.id,
                email: user.email,
                status: 'blocked',
                blockedAt: user.blockedAt,
                reason: user.blockReason
            }
        });

    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to block user',
            error: error.message
        });
    }
};

// Unblock user
const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.status !== 'blocked') {
            return res.status(400).json({
                success: false,
                message: 'User is not blocked'
            });
        }

        // Update user status
        await user.update({
            status: 'active',
            isBlocked: false,
            blockedAt: null,
            blockedBy: null,
            blockReason: null
        });

        // Send notification email
        try {
            const emailHtml = getUserUnblockedEmail({ user });

            await sendMail({
                to: user.email,
                subject: 'NANA Portal - Account Reactivated',
                html: emailHtml
            });

            console.log(`Unblock notification sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send unblock notification:', emailError);
        }

        res.json({
            success: true,
            message: 'User unblocked successfully',
            data: {
                userId: user.id,
                email: user.email,
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unblock user',
            error: error.message
        });
    }
};

// Suspend user for a specific period
const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, suspensionDays } = req.body;
        const adminId = req.user.id;

        if (!suspensionDays || suspensionDays <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Suspension days must be a positive number'
            });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.status === 'suspended') {
            return res.status(400).json({
                success: false,
                message: 'User is already suspended'
            });
        }

        // Calculate suspension end date
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + parseInt(suspensionDays));

        // Update user status
        await user.update({
            status: 'suspended',
            suspendedAt: new Date(),
            suspendedUntil,
            suspendedBy: adminId,
            suspensionReason: reason || 'No reason provided'
        });

        // Send notification email
        try {
            const emailHtml = getUserSuspendedEmail({
                user,
                reason: reason || 'No reason provided',
                suspendedUntil,
                suspendedBy: adminId
            });

            await sendMail({
                to: user.email,
                subject: 'NANA Portal - Account Suspended',
                html: emailHtml
            });

            console.log(`Suspension notification sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send suspension notification:', emailError);
        }

        res.json({
            success: true,
            message: 'User suspended successfully',
            data: {
                userId: user.id,
                email: user.email,
                status: 'suspended',
                suspendedAt: user.suspendedAt,
                suspendedUntil: user.suspendedUntil,
                suspensionDays: parseInt(suspensionDays),
                reason: user.suspensionReason
            }
        });

    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to suspend user',
            error: error.message
        });
    }
};

// Unsuspend user (lift suspension early)
const unsuspendUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.status !== 'suspended') {
            return res.status(400).json({
                success: false,
                message: 'User is not suspended'
            });
        }

        // Update user status
        await user.update({
            status: 'active',
            suspendedAt: null,
            suspendedUntil: null,
            suspendedBy: null,
            suspensionReason: null
        });

        // Send notification email
        try {
            const emailHtml = getUserUnsuspendedEmail({ user });

            await sendMail({
                to: user.email,
                subject: 'NANA Portal - Suspension Lifted',
                html: emailHtml
            });

            console.log(`Unsuspension notification sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send unsuspension notification:', emailError);
        }

        res.json({
            success: true,
            message: 'User suspension lifted successfully',
            data: {
                userId: user.id,
                email: user.email,
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Error lifting user suspension:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to lift user suspension',
            error: error.message
        });
    }
};

// Delete user permanently
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmDelete, deleteData = true } = req.body;
        const adminId = req.user.id;

        if (!confirmDelete) {
            return res.status(400).json({
                success: false,
                message: 'Delete confirmation required. Set confirmDelete: true to proceed.'
            });
        }

        const user = await User.findByPk(id, {
            include: [
                {
                    model: Account,
                    as: 'Accounts'
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Store user data for email before deletion
        const userData = {
            id: user.id,
            firstName: user.firstName,
            surname: user.surname,
            email: user.email,
            role: user.role
        };

        // Send deletion notification email before deleting
        try {
            const emailHtml = getAccountDeletedEmail({
                user: userData,
                deletedBy: adminId
            });

            await sendMail({
                to: user.email,
                subject: 'NANA Portal - Account Deleted',
                html: emailHtml
            });

            console.log(`Deletion notification sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send deletion notification:', emailError);
        }

        // Delete related data if requested
        if (deleteData) {
            // Delete transactions related to user's accounts
            const accountIds = (user.Accounts || []).map(acc => acc.id);
            if (accountIds.length > 0) {
                await Transaction.destroy({
                    where: { accountId: { [Op.in]: accountIds } }
                });
            }

            // Delete user's accounts
            await Account.destroy({
                where: { userId: user.id }
            });
        }

        // Delete the user
        await user.destroy();

        res.json({
            success: true,
            message: 'User deleted successfully',
            data: {
                deletedUser: userData,
                dataDeleted: deleteData,
                deletedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'active' } });
        const blockedUsers = await User.count({ where: { status: 'blocked' } });
        const suspendedUsers = await User.count({ where: { status: 'suspended' } });
        const pendingUsers = await User.count({ where: { status: 'pending' } });

        // Users by role
        const funderCount = await User.count({ where: { role: 'funder' } });
        const caregiverCount = await User.count({ where: { role: 'caregiver' } });
        const dependentCount = await User.count({ where: { role: 'dependent' } });

        // Recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        res.json({
            success: true,
            data: {
                totals: {
                    totalUsers,
                    activeUsers,
                    blockedUsers,
                    suspendedUsers,
                    pendingUsers
                },
                byRole: {
                    funders: funderCount,
                    caregivers: caregiverCount,
                    dependents: dependentCount
                },
                recent: {
                    last30Days: recentRegistrations
                }
            }
        });

    } catch (error) { 
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: error.message
        });
    }
};

// Check and auto-unsuspend users whose suspension has expired
const checkExpiredSuspensions = async (req, res) => {
    try {
        const now = new Date();
        const expiredSuspensions = await User.findAll({
            where: {
                status: 'suspended',
                suspendedUntil: {
                    [Op.lte]: now
                }
            }
        });

        for (const user of expiredSuspensions) {
            await user.update({
                status: 'active',
                suspendedAt: null,
                suspendedUntil: null,
                suspendedBy: null,
                suspensionReason: null
            });

            // Send notification email
            try {
                const emailHtml = getUserUnsuspendedEmail({ user });
                await sendMail({
                    to: user.email,
                    subject: 'NANA Portal - Suspension Period Ended',
                    html: emailHtml
                });
            } catch (emailError) {
                console.error(`Failed to send auto-unsuspension notification to ${user.email}:`, emailError);
            }
        }

        res.json({
            success: true,
            message: `${expiredSuspensions.length} expired suspensions processed`,
            data: {
                processedUsers: expiredSuspensions.length,
                users: expiredSuspensions.map(u => ({
                    id: u.id,
                    email: u.email,
                    previousSuspensionEnd: u.suspendedUntil
                }))
            }
        });

    } catch (error) {
        console.error('Error checking expired suspensions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check expired suspensions',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    blockUser,
    unblockUser,
    suspendUser,
    unsuspendUser,
    deleteUser,
    getUserStats,
    checkExpiredSuspensions
};
