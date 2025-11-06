const { User } = require('../models');
const { Op } = require('sequelize');

/**
 * Comprehensive validation for dependent registration data
 * @param {Object} data - Registration data from request body
 * @returns {Object} - Validation result with errors array
 */
const validateDependentData = async (data) => {
  const errors = [];
  
  // Required fields validation
  if (!data.firstName?.trim()) {
    errors.push({
      field: 'firstName',
      message: 'First name is required'
    });
  }
  
  if (!data.surname?.trim()) {
    errors.push({
      field: 'surname', 
      message: 'Surname is required'
    });
  }
  
  if (!data.relation?.trim()) {
    errors.push({
      field: 'relation',
      message: 'Relation to registering user is required'
    });
  }

  // Email validation
  if (!data.email?.trim()) {
    errors.push({
      field: 'email',
      message: 'Email is required'
    });
  }
  
  // Password validation
  if (!data.password?.trim()) {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  } else if (data.password.length < 6) {
    errors.push({
        field: 'password',
        message: 'Password must be at least 6 characters'
      });
    }
    
    if (!data.Idnumber?.trim()) {
      errors.push({
        field: 'Idnumber',
        message: 'ID number is required'
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push({
        field: 'email',
        message: 'Valid email format required'
      });
    }
    
    // ID number format validation  
    const idRegex = /^[0-9]{13}$/;
    if (data.Idnumber && !idRegex.test(data.Idnumber)) {
      errors.push({
        field: 'Idnumber',
        message: 'ID number must be exactly 13 digits'
      });
    }
    
    // Check uniqueness (only if format is valid)
    if (data.email && emailRegex.test(data.email) || data.Idnumber && idRegex.test(data.Idnumber)) {
      try {
        const whereConditions = [];
        if (data.email && emailRegex.test(data.email)) {
          whereConditions.push({ email: data.email.toLowerCase() });
        }
        if (data.Idnumber && idRegex.test(data.Idnumber)) {
          whereConditions.push({ Idnumber: data.Idnumber });
        }

        const existingUser = await User.findOne({
          where: { [Op.or]: whereConditions }
        });
        
        if (existingUser) {
          if (existingUser.email === data.email?.toLowerCase()) {
            errors.push({
              field: 'email',
              message: 'Email already exists'
            });
          }
          if (existingUser.Idnumber === data.Idnumber) {
            errors.push({
              field: 'Idnumber',
              message: 'ID number already exists'
            });
          }
        }
      } catch (dbError) {
        console.error('Database validation error:', dbError);
        errors.push({
          field: 'database',
          message: 'Unable to validate uniqueness at this time'
        });
      }
    }
  }

  // Validate relation options
  const validRelations = [
    'child', 'son', 'daughter', 'parent', 'mother', 'father', 
    'sibling', 'brother', 'sister', 'grandparent', 'grandchild',
    'uncle', 'aunt', 'nephew', 'niece', 'cousin', 'spouse', 'other'
  ];
  
  if (data.relation && !validRelations.includes(data.relation.toLowerCase())) {
    errors.push({
      field: 'relation',
      message: `Relation must be one of: ${validRelations.join(', ')}`
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    errorCount: errors.length
  };
};

/**
 * Validate user authorization for dependent registration (caregiver or funder)
 * @param {number} userId - ID of the user (caregiver or funder)
 * @returns {Object} - Validation result
 */
const validateUserAuthForDependent = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'role', 'status', 'isBlocked']
    });

    if (!user) {
      return {
        isValid: false,
        error: {
          message: 'User not found',
          statusCode: 404
        }
      };
    }

    if (user.role !== 'caregiver' && user.role !== 'funder') {
      return {
        isValid: false,
        error: {
          message: 'Only users with caregiver or funder role can register dependents',
          statusCode: 403
        }
      };
    }

    if (user.isBlocked || user.status !== 'active') {
      return {
        isValid: false,
        error: {
          message: 'User account is blocked or inactive',
          statusCode: 403
        }
      };
    }

    return {
      isValid: true,
      user
    };
  } catch (error) {
    console.error('User authorization validation error:', error);
    return {
      isValid: false,
      error: {
        message: 'Unable to validate user authorization',
        statusCode: 500
      }
    };
  }
};

module.exports = {
  validateDependentData,
  validateUserAuthForDependent,
  // Keep old function name for backward compatibility
  validateCaregiverAuth: validateUserAuthForDependent
};