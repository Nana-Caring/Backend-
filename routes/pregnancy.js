const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('../middlewares/auth');

// Simple role check middleware
const requireCaregiver = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'User not authenticated' 
    });
  }

  if (req.user.role !== 'caregiver') {
    return res.status(403).json({ 
      success: false, 
      message: `Access denied. Required role: caregiver. Your role: ${req.user.role}` 
    });
  }

  next();
};

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
}

/**
 * @route   POST /api/pregnancy/register
 * @desc    Register caregiver as pregnant
 * @access  Private (Caregiver only)
 */
router.post('/register', authenticate, requireCaregiver, async (req, res) => {
  try {
    const { expectedDueDate } = req.body;
  const caregiverId = req.user.id;

    if (!expectedDueDate) {
      return res.status(400).json({
        success: false,
        message: 'Expected due date is required'
      });
    }

    // Validate due date is in the future
    const dueDate = new Date(expectedDueDate);
    const today = new Date();
    
    if (dueDate <= today) {
      return res.status(400).json({
        success: false,
        message: 'Expected due date must be in the future'
      });
    }

    // Update caregiver's pregnancy status
    const [updatedRows] = await User.update({
      isPregnant: true,
      expectedDueDate: dueDate
    }, {
      where: { id: caregiverId, role: 'caregiver' }
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    const updatedCaregiver = await User.findByPk(caregiverId, {
      attributes: ['id', 'firstName', 'surname', 'isPregnant', 'expectedDueDate']
    });

    res.status(200).json({
      success: true,
      message: 'Pregnancy registered successfully',
      data: {
        caregiver: updatedCaregiver,
        dueDate: expectedDueDate,
        weeksPregnant: Math.floor((dueDate - today) / (7 * 24 * 60 * 60 * 1000))
      }
    });

  } catch (error) {
    console.error('Error registering pregnancy:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/pregnancy/register-unborn
 * @desc    Register unborn baby as dependent
 * @access  Private (Pregnant Caregiver only)
 */
router.post('/register-unborn', authenticate, requireCaregiver, async (req, res) => {
  try {
    const { firstName, surname, expectedDueDate } = req.body;
  const caregiverId = req.user.id;

    if (!firstName || !surname) {
      return res.status(400).json({
        success: false,
        message: 'First name and surname are required'
      });
    }

    // Verify caregiver is pregnant
    const caregiver = await User.findByPk(caregiverId);
    if (!caregiver || !caregiver.isPregnant) {
      return res.status(400).json({
        success: false,
        message: 'Only pregnant caregivers can register unborn babies'
      });
    }

    const dueDate = expectedDueDate || caregiver.expectedDueDate;

    // Generate unique temporary ID for unborn baby
    const timestamp = Date.now().toString().slice(-8);
    const temporaryId = `0000${timestamp}`.slice(-13);

    // Create unborn baby dependent
    const unbornBaby = await User.create({
      firstName,
      surname,
      email: `${firstName.toLowerCase()}.${surname.toLowerCase()}@unborn.system`,
      password: await bcrypt.hash('temporary-password', 10),
      role: 'dependent',
      Idnumber: temporaryId,
      isUnborn: true,
      isInfant: true,
      expectedDueDate: dueDate,
      parentCaregiverId: caregiverId
    });

    res.status(201).json({
      success: true,
      message: 'Unborn baby registered successfully',
      data: {
        baby: {
          id: unbornBaby.id,
          firstName: unbornBaby.firstName,
          surname: unbornBaby.surname,
          isUnborn: true,
          isInfant: true,
          expectedDueDate: dueDate,
          parentCaregiverId: caregiverId
        },
        note: 'This registration will be updated when the baby is born'
      }
    });

  } catch (error) {
    console.error('Error registering unborn baby:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/pregnancy/register-infant
 * @desc    Register newborn infant (0 years) as dependent
 * @access  Private (Caregiver only)
 */
router.post('/register-infant', authenticate, requireCaregiver, async (req, res) => {
  try {
    const { firstName, surname, dateOfBirth, idNumber } = req.body;
  const caregiverId = req.user.id;

    if (!firstName || !surname || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'First name, surname, and date of birth are required'
      });
    }

    // Calculate age
    const age = calculateAge(dateOfBirth);
    
    if (age > 1) {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is for infants (0-1 years old). Use regular dependent registration for older children.'
      });
    }

    // Generate temporary ID if not provided (for newborns without official ID yet)
    let finalIdNumber = idNumber;
    if (!idNumber) {
      const birthDate = new Date(dateOfBirth);
      const yearStr = birthDate.getFullYear().toString();
      const monthStr = (birthDate.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = birthDate.getDate().toString().padStart(2, '0');
      const randomStr = Math.random().toString().slice(-5);
      finalIdNumber = `${yearStr}${monthStr}${dayStr}${randomStr}`;
    }

    // Create infant dependent
    const infant = await User.create({
      firstName,
      surname,
      email: `${firstName.toLowerCase()}.${surname.toLowerCase()}@infant.system`,
      password: await bcrypt.hash('temporary-password', 10),
      role: 'dependent',
      Idnumber: finalIdNumber,
      dateOfBirth: new Date(dateOfBirth),
      isInfant: true,
      isUnborn: false,
      parentCaregiverId: caregiverId
    });

    res.status(201).json({
      success: true,
      message: 'Infant registered successfully',
      data: {
        infant: {
          id: infant.id,
          firstName: infant.firstName,
          surname: infant.surname,
          dateOfBirth: infant.dateOfBirth,
          age: age,
          isInfant: true,
          parentCaregiverId: caregiverId,
          temporaryId: !idNumber
        },
        note: idNumber ? 'Registered with official ID number' : 'Registered with temporary ID - update when official ID is available'
      }
    });

  } catch (error) {
    console.error('Error registering infant:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'An infant with this ID number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/pregnancy/birth-update/:unbornId
 * @desc    Update unborn baby registration when baby is born
 * @access  Private (Caregiver only)
 */
router.put('/birth-update/:unbornId', authenticate, requireCaregiver, async (req, res) => {
  try {
    const { unbornId } = req.params;
    const { dateOfBirth, idNumber } = req.body;
  const caregiverId = req.user.id;

    if (!dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth is required'
      });
    }

    // Find unborn baby
    const unbornBaby = await User.findOne({
      where: {
        id: unbornId,
        parentCaregiverId: caregiverId,
        isUnborn: true,
        role: 'dependent'
      }
    });

    if (!unbornBaby) {
      return res.status(404).json({
        success: false,
        message: 'Unborn baby not found or not associated with your account'
      });
    }

    // Generate new ID if official one not provided
    let finalIdNumber = idNumber || unbornBaby.Idnumber;
    if (!idNumber) {
      const birthDate = new Date(dateOfBirth);
      const yearStr = birthDate.getFullYear().toString();
      const monthStr = (birthDate.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = birthDate.getDate().toString().padStart(2, '0');
      const randomStr = Math.random().toString().slice(-5);
      finalIdNumber = `${yearStr}${monthStr}${dayStr}${randomStr}`;
    }

    // Update unborn baby to born infant
    const updatedBaby = await unbornBaby.update({
      dateOfBirth: new Date(dateOfBirth),
      Idnumber: finalIdNumber,
      isUnborn: false,
      isInfant: true,
      email: `${unbornBaby.firstName.toLowerCase()}.${unbornBaby.surname.toLowerCase()}@infant.system`
    });

    res.status(200).json({
      success: true,
      message: 'Baby birth information updated successfully',
      data: {
        baby: {
          id: updatedBaby.id,
          firstName: updatedBaby.firstName,
          surname: updatedBaby.surname,
          dateOfBirth: updatedBaby.dateOfBirth,
          age: calculateAge(updatedBaby.dateOfBirth),
          isInfant: true,
          isUnborn: false,
          parentCaregiverId: caregiverId
        }
      }
    });

  } catch (error) {
    console.error('Error updating birth information:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/pregnancy/my-family
 * @desc    Get caregiver's pregnancy status and associated infants/unborn babies
 * @access  Private (Caregiver only)
 */
router.get('/my-family', authenticate, requireCaregiver, async (req, res) => {
  try {
    const caregiverId = req.user.userId;

    // Get caregiver with pregnancy info
    const caregiver = await User.findByPk(caregiverId, {
      attributes: ['id', 'firstName', 'surname', 'isPregnant', 'expectedDueDate']
    });

    // Get all associated infants and unborn babies
    const children = await User.findAll({
      where: {
        parentCaregiverId: caregiverId,
        role: 'dependent'
      },
      attributes: [
        'id', 'firstName', 'surname', 'dateOfBirth', 'calculatedAge',
        'isInfant', 'isUnborn', 'expectedDueDate'
      ],
      order: [['createdAt', 'DESC']]
    });

    const pregnancyInfo = caregiver.isPregnant ? {
      isPregnant: true,
      expectedDueDate: caregiver.expectedDueDate,
      weeksPregnant: caregiver.expectedDueDate ? 
        Math.floor((new Date(caregiver.expectedDueDate) - new Date()) / (7 * 24 * 60 * 60 * 1000)) : null
    } : { isPregnant: false };

    res.status(200).json({
      success: true,
      data: {
        caregiver: {
          id: caregiver.id,
          firstName: caregiver.firstName,
          surname: caregiver.surname,
          ...pregnancyInfo
        },
        children: children.map(child => ({
          id: child.id,
          firstName: child.firstName,
          surname: child.surname,
          age: child.calculatedAge,
          dateOfBirth: child.dateOfBirth,
          isInfant: child.isInfant,
          isUnborn: child.isUnborn,
          expectedDueDate: child.expectedDueDate,
          status: child.isUnborn ? 'Unborn' : child.isInfant ? 'Infant' : 'Child'
        })),
        summary: {
          totalChildren: children.length,
          infants: children.filter(c => c.isInfant && !c.isUnborn).length,
          unbornBabies: children.filter(c => c.isUnborn).length,
          isExpectingMother: caregiver.isPregnant
        }
      }
    });

  } catch (error) {
    console.error('Error fetching family information:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;