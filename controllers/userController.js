// controllers/userController.js
const { User } = require('../models');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.getUser = async (req, res) => {
    try {
      // Assuming the user's ID is stored in `req.user.id` by the `authMiddleware`
      const userId = req.user.id;
  
      // Fetch user from the database (adjust based on your model and ORM)
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Return the user data without sensitive fields like password
      const userData = user.get({ plain: true });
      delete userData.password;
  
      res.json(userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  //retrieve all the users
  exports.getUsers = async (req, res) => {
    try {
        // Fetch all users, excluding passwords
        const users = await User.findAll({
            attributes: { exclude: ["password"] }
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update user profile - personal details
exports.updateProfile = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: "Validation failed", 
                errors: errors.array() 
            });
        }

        const userId = req.user.id;
        const {
            firstName,
            middleName,
            surname,
            phoneNumber,
            postalAddressLine1,
            postalAddressLine2,
            postalCity,
            postalProvince,
            postalCode,
            homeAddressLine1,
            homeAddressLine2,
            homeCity,
            homeProvince,
            homeCode
        } = req.body;

        // Find the user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Helper function to handle null/empty values
        const handleOptionalField = (value, currentValue) => {
            if (value === undefined) return currentValue; // Don't update if not provided
            if (value === '' || value === null) return null; // Convert empty strings to null
            return value;
        };

        // Update user profile with explicit null handling
        await user.update({
            firstName: firstName || user.firstName,
            middleName: handleOptionalField(middleName, user.middleName),
            surname: surname || user.surname,
            phoneNumber: handleOptionalField(phoneNumber, user.phoneNumber),
            postalAddressLine1: handleOptionalField(postalAddressLine1, user.postalAddressLine1),
            postalAddressLine2: handleOptionalField(postalAddressLine2, user.postalAddressLine2),
            postalCity: handleOptionalField(postalCity, user.postalCity),
            postalProvince: handleOptionalField(postalProvince, user.postalProvince),
            postalCode: handleOptionalField(postalCode, user.postalCode),
            homeAddressLine1: handleOptionalField(homeAddressLine1, user.homeAddressLine1),
            homeAddressLine2: handleOptionalField(homeAddressLine2, user.homeAddressLine2),
            homeCity: handleOptionalField(homeCity, user.homeCity),
            homeProvince: handleOptionalField(homeProvince, user.homeProvince),
            homeCode: handleOptionalField(homeCode, user.homeCode)
        });

        // Return updated user data without password
        const updatedUser = user.get({ plain: true });
        delete updatedUser.password;

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        // Handle validation errors from Sequelize
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Get user profile with all details
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compute ID number validation status to help frontend surface issues early
        let idNumberValid = false;
        let idValidationError = null;
        try {
            const { calculateAgeFromSAId } = require('../utils/ageCalculator');
            const info = user?.Idnumber ? calculateAgeFromSAId(String(user.Idnumber).trim()) : { isValid: false, error: 'Missing ID number' };
            idNumberValid = !!info.isValid;
            idValidationError = info.isValid ? null : (info.error || 'Invalid ID number');
        } catch (e) {
            idNumberValid = false;
            idValidationError = 'Validation failed';
        }

        res.status(200).json({
            message: "Profile retrieved successfully",
            user: user,
            idNumberValid,
            idValidationError
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Get user profile completion status
exports.getProfileCompletionStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check which personal details are completed (not null)
        const personalDetailsFields = [
            'phoneNumber',
            'postalAddressLine1',
            'postalCity',
            'postalProvince',
            'postalCode',
            'homeAddressLine1',
            'homeCity',
            'homeProvince',
            'homeCode'
        ];

        const completedFields = personalDetailsFields.filter(field => 
            user[field] !== null && user[field] !== undefined && user[field] !== ''
        );

        const completionStatus = {
            totalFields: personalDetailsFields.length,
            completedFields: completedFields.length,
            completionPercentage: Math.round((completedFields.length / personalDetailsFields.length) * 100),
            missingFields: personalDetailsFields.filter(field => 
                user[field] === null || user[field] === undefined || user[field] === ''
            ),
            isProfileComplete: completedFields.length === personalDetailsFields.length
        };

        res.status(200).json({
            message: "Profile completion status retrieved successfully",
            user: user,
            completionStatus: completionStatus
        });

    } catch (error) {
        console.error('Get profile completion status error:', error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Block a user (Admin only)
exports.blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        // Check if admin is trying to block themselves
        if (parseInt(userId) === adminId) {
            return res.status(400).json({ 
                message: "You cannot block yourself" 
            });
        }

        // Find the user to block
        const userToBlock = await User.findByPk(userId);
        if (!userToBlock) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is already blocked
        if (userToBlock.isBlocked || userToBlock.status === 'blocked') {
            return res.status(400).json({ 
                message: "User is already blocked" 
            });
        }

        // Block the user
        await userToBlock.update({
            isBlocked: true,
            status: 'blocked',
            blockedAt: new Date(),
            blockedBy: adminId,
            blockReason: reason || 'No reason provided'
        });

        res.status(200).json({
            message: "User blocked successfully",
            user: {
                id: userToBlock.id,
                email: userToBlock.email,
                firstName: userToBlock.firstName,
                surname: userToBlock.surname,
                isBlocked: true,
                status: 'blocked',
                blockedAt: userToBlock.blockedAt,
                blockReason: userToBlock.blockReason
            }
        });

    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Unblock a user (Admin only)
exports.unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user to unblock
        const userToUnblock = await User.findByPk(userId);
        if (!userToUnblock) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is not blocked
        if (!userToUnblock.isBlocked && userToUnblock.status !== 'blocked') {
            return res.status(400).json({ 
                message: "User is not blocked" 
            });
        }

        // Unblock the user
        await userToUnblock.update({
            isBlocked: false,
            status: 'active',
            blockedAt: null,
            blockedBy: null,
            blockReason: null
        });

        res.status(200).json({
            message: "User unblocked successfully",
            user: {
                id: userToUnblock.id,
                email: userToUnblock.email,
                firstName: userToUnblock.firstName,
                surname: userToUnblock.surname,
                isBlocked: false,
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Suspend a user (Admin only)
exports.suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        // Check if admin is trying to suspend themselves
        if (parseInt(userId) === adminId) {
            return res.status(400).json({ 
                message: "You cannot suspend yourself" 
            });
        }

        // Find the user to suspend
        const userToSuspend = await User.findByPk(userId);
        if (!userToSuspend) {
            return res.status(404).json({ message: "User not found" });
        }

        // Suspend the user
        await userToSuspend.update({
            status: 'suspended',
            blockedAt: new Date(),
            blockedBy: adminId,
            blockReason: reason || 'No reason provided'
        });

        res.status(200).json({
            message: "User suspended successfully",
            user: {
                id: userToSuspend.id,
                email: userToSuspend.email,
                firstName: userToSuspend.firstName,
                surname: userToSuspend.surname,
                status: 'suspended',
                blockedAt: userToSuspend.blockedAt,
                blockReason: userToSuspend.blockReason
            }
        });

    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Get blocked/suspended users (Admin only)
exports.getBlockedUsers = async (req, res) => {
    try {
        const { status } = req.query; // 'blocked', 'suspended', or 'all'

        let whereClause = {};
        if (status === 'blocked') {
            whereClause = { status: 'blocked' };
        } else if (status === 'suspended') {
            whereClause = { status: 'suspended' };
        } else if (status === 'all') {
            whereClause = { 
                status: { [Op.in]: ['blocked', 'suspended'] }
            };
        } else {
            // Default to blocked users
            whereClause = { 
                [Op.or]: [
                    { isBlocked: true },
                    { status: { [Op.in]: ['blocked', 'suspended'] }}
                ]
            };
        }

        const blockedUsers = await User.findAll({
            where: whereClause,
            attributes: [
                'id', 'firstName', 'middleName', 'surname', 'email', 'role',
                'isBlocked', 'status', 'blockedAt', 'blockedBy', 'blockReason',
                'createdAt'
            ],
            include: [
                {
                    model: User,
                    as: 'BlockedByUser',
                    attributes: ['id', 'firstName', 'surname', 'email'],
                    required: false
                }
            ],
            order: [['blockedAt', 'DESC']]
        });

        res.status(200).json({
            message: "Blocked users retrieved successfully",
            count: blockedUsers.length,
            users: blockedUsers
        });

    } catch (error) {
        console.error('Get blocked users error:', error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Validation middleware for profile updates
exports.validateProfileUpdate = [
    body('firstName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),
    
    body('middleName')
        .optional({ nullable: true })
        .isLength({ max: 50 })
        .withMessage('Middle name must be less than 50 characters')
        .matches(/^[a-zA-Z\s]*$/)
        .withMessage('Middle name can only contain letters and spaces'),
    
    body('surname')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Surname must be between 1 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Surname can only contain letters and spaces'),
    
    body('phoneNumber')
        .optional({ nullable: true })
        .matches(/^(\+27|0)[0-9]{9}$/)
        .withMessage('Phone number must be a valid South African number (e.g., +27821234567 or 0821234567)'),
    
    body('postalAddressLine1')
        .optional({ nullable: true })
        .isLength({ max: 100 })
        .withMessage('Postal address line 1 must be less than 100 characters'),
    
    body('postalAddressLine2')
        .optional({ nullable: true })
        .isLength({ max: 100 })
        .withMessage('Postal address line 2 must be less than 100 characters'),
    
    body('postalCity')
        .optional({ nullable: true })
        .isLength({ max: 50 })
        .withMessage('Postal city must be less than 50 characters')
        .matches(/^[a-zA-Z\s]*$/)
        .withMessage('Postal city can only contain letters and spaces'),
    
    body('postalProvince')
        .optional({ nullable: true })
        .isIn(['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'])
        .withMessage('Postal province must be a valid South African province'),
    
    body('postalCode')
        .optional({ nullable: true })
        .matches(/^[0-9]{4}$/)
        .withMessage('Postal code must be a 4-digit number'),
    
    body('homeAddressLine1')
        .optional({ nullable: true })
        .isLength({ max: 100 })
        .withMessage('Home address line 1 must be less than 100 characters'),
    
    body('homeAddressLine2')
        .optional({ nullable: true })
        .isLength({ max: 100 })
        .withMessage('Home address line 2 must be less than 100 characters'),
    
    body('homeCity')
        .optional({ nullable: true })
        .isLength({ max: 50 })
        .withMessage('Home city must be less than 50 characters')
        .matches(/^[a-zA-Z\s]*$/)
        .withMessage('Home city can only contain letters and spaces'),
    
    body('homeProvince')
        .optional({ nullable: true })
        .isIn(['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'])
        .withMessage('Home province must be a valid South African province'),
    
    body('homeCode')
        .optional({ nullable: true })
        .matches(/^[0-9]{4}$/)
        .withMessage('Home code must be a 4-digit number')
];
