const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Account = require("../models/Account");
const { Sequelize, Op } = require('sequelize');
// Email service removed - frontend handles UI
// const generateUniqueAccountNumber = require('../utils/generateUniqueAccountNumber');
const { generateUniqueAccountNumber } = require('../utils/generateUniqueAccountNumber');

// Register new user (funder or caregiver)
exports.register = async (req, res) => {
  try {
    const { firstName, middleName, surname, email, password, role, Idnumber } = req.body;

    // Validate role
    if (!["funder", "caregiver"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user already exists (by email or ID number)
    let existingUser = await User.findOne({ 
      where: {
        [Op.or]: [
          { email },
          { Idnumber }
        ]
      } 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (existingUser.Idnumber === Idnumber) {
        return res.status(400).json({ message: "ID number already exists" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with explicit null values for optional fields
    const user = await User.create({ 
      firstName, 
      middleName: middleName || null, 
      surname, 
      email, 
      password: hashedPassword, 
      role,
      Idnumber,
      // Explicitly set personal details to null until user edits them
      phoneNumber: null,
      postalAddressLine1: null,
      postalAddressLine2: null,
      postalCity: null,
      postalProvince: null,
      postalCode: null,
      homeAddressLine1: null,
      homeAddressLine2: null,
      homeCity: null,
      homeProvince: null,
      homeCode: null
    });

    // If the user is a funder, create an account for them
    let account = null;
    if (role === 'funder') {
      const accountNumber = await generateUniqueAccountNumber();
      account = await Account.create({
        userId: user.id,
        accountType: 'Main',
        balance: 0,
        parentAccountId: null,
        accountNumber: accountNumber,
      });
    }

    // Remove sensitive data from response
    const userResponse = user.get({ plain: true });
    delete userResponse.password;

    // Attach account info if funder
    if (account) {
      userResponse.account = account;
    }

    res.status(201).json({ 
      message: "User registered successfully", 
      user: userResponse 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Register dependent (called by caregiver)
exports.registerDependent = async (req, res) => {
  try {
    const { firstName, middleName, surname, email, password, Idnumber, relation } = req.body;
    const caregiverId = req.user.id;

    // Validate required fields (middleName is now optional)
    if (!firstName || !email || !password || !Idnumber || !relation) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Valid email address required' });
    }

    // Validate email uniqueness
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists){
      return res.status(400).json({message:'Email already exists'});
    }

    // Validate ID number format
    const IdnumberRegex = /^[0-9]{13}$/;
    if (!IdnumberRegex.test(Idnumber)) {
      return res.status(400).json({ message: 'Valid 13-digit numeric ID number required' });
    }
    
    // Validate ID number uniqueness
    const idNumberExists = await User.findOne({ where: { Idnumber } });
    if (idNumberExists) {
      return res.status(400).json({ message: 'ID number already exists' });
    }



    // Verify caregiver status
    const caregiver = await User.findByPk(caregiverId);
    if (!caregiver || caregiver.role !== 'caregiver') {
      return res.status(403).json({ message: 'Only caregivers can register dependents' });
    }
    
    
    // Check if email or ID number already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { Idnumber }],
      },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or ID number already in use' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create dependent with explicit null values for optional fields
    const dependent = await User.create({
      firstName,
      middleName: middleName || null,  // Optional field
      surname,
      email,
      password: hashedPassword,
      Idnumber,
      relation,
      role: 'dependent',
      // Explicitly set personal details to null until user edits them
      phoneNumber: null,
      postalAddressLine1: null,
      postalAddressLine2: null,
      postalCity: null,
      postalProvince: null,
      postalCode: null,
      homeAddressLine1: null,
      homeAddressLine2: null,
      homeCity: null,
      homeProvince: null,
      homeCode: null
    });

    // Generate unique account number for main account
    const mainAccountNumber = await generateUniqueAccountNumber();

    // Create main account for dependent
    const mainAccount = await Account.create({
      userId: dependent.id,
      accountType: 'Main',
      balance: 0,
      parentAccountId: null,
      accountNumber: mainAccountNumber,
    });
// main account, baby care account, entertainment account, clothing account,
//  savings account, pregnancy account (no restrictions)

    // Create sub-accounts for dependent
    const subAccountTypes = ['Education', 'Healthcare', 'Clothing', 'Entertainment','Baby Care','Pregnancy' ,'Savings' ];
    const subAccounts = await Promise.all(
      subAccountTypes.map(async (type) => {
        const subAccountNumber = await generateUniqueAccountNumber();
        return Account.create({
          userId: dependent.id,
          accountType: type,
          balance: 0,
          parentAccountId: mainAccount.id,
          accountNumber: subAccountNumber,
        });
      })
    );

    // Mirror savings balance to main account
    const savingsAccount = subAccounts.find(acc => acc.accountType === 'Savings');
    if (savingsAccount) {
      mainAccount.balance = savingsAccount.balance;
      await mainAccount.save();
    }

    res.status(201).json({
      message: 'Dependent registered successfully',
      dependent: {
        ...dependent.get({ plain: true }),
        password: undefined,
        accounts: [mainAccount, ...subAccounts].map(acc => acc.get ? acc.get({ plain: true }) : acc)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Updated getUser and getDependents endpoints
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Account,
          as: "accounts",
          attributes: ["id", "accountType", "balance", "parentAccountId"]
        }
      ]
    });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDependents = async (req, res) => {
  try {
    const caregiver = await User.findByPk(req.user.id);
    if (!caregiver || caregiver.role !== 'caregiver') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const dependents = await User.findAll({
      where: { role: 'dependent' },
      attributes: { exclude: ["password"] },
      include: [{
        model: Account,
        as: "accounts",
        attributes: ["id", "accountType", "balance", "parentAccountId"]
      }]
    });

    res.json({ dependents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin login
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate JWT token for admin
      const accessToken = jwt.sign(
        { id: 0, role: 'admin' },
        process.env.JWT_SECRET
      );
      const refreshToken = jwt.sign(
        { id: 0, role: 'admin' },
        process.env.JWT_REFRESH_SECRET
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        accessToken,
        jwt: accessToken,
        user: {
          id: 0,
          firstName: 'Admin',
          surname: '',
          email: process.env.ADMIN_EMAIL,
          role: 'admin'
        }
      });
    }

    // Find user by email with associated accounts using the alias
    const user = await User.findOne({ 
        where: { email },
        include: [{
            model: Account,
            as: 'accounts', // Use the alias defined in associations
            attributes: ['id', 'accountNumber', 'accountType', 'balance', 'status', 'currency']
        }]
    });

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is blocked or suspended
    if (user.isBlocked || user.status === 'blocked') {
        return res.status(403).json({ 
            error: 'Account blocked',
            message: 'Your account has been blocked. Please contact support.',
            code: 'ACCOUNT_BLOCKED',
            details: {
                blockedAt: user.blockedAt,
                reason: user.blockReason || 'No reason provided'
            }
        });
    }

    if (user.status === 'suspended') {
        return res.status(403).json({ 
            error: 'Account suspended',
            message: 'Your account has been suspended. Please contact support.',
            code: 'ACCOUNT_SUSPENDED',
            details: {
                blockedAt: user.blockedAt,
                reason: user.blockReason || 'No reason provided'
            }
        });
    }

    if (user.status === 'pending') {
        return res.status(403).json({ 
            error: 'Account pending',
            message: 'Your account is pending activation. Please contact support.',
            code: 'ACCOUNT_PENDING'
        });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
     
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
    
    );

    // Set refresh token in httpOnly, secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // set to true in production (requires HTTPS)
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Format response
    const response = {
        accessToken, // JWT token
        jwt: accessToken, // Optional: alias for clarity
        user: {
            id: user.id,
            firstName: user.firstName,
            middleName: user.middleName,
            surname: user.surname,
            email: user.email,
            role: user.role,
            Idnumber: user.Idnumber,
            relation: user.relation,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    };

    // Add accounts for funder or dependent
    if ((user.role === 'funder' || user.role === 'dependent') && user.accounts) {
        response.accounts = user.accounts;
    }

    res.json(response);
} catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
}
};

exports.refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password, firstName, surname, middleName } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate JWT token for admin
      const accessToken = jwt.sign(
        { id: 0, role: 'admin' },
        process.env.JWT_SECRET
      );
      const refreshToken = jwt.sign(
        { id: 0, role: 'admin' },
        process.env.JWT_REFRESH_SECRET
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        accessToken,
        jwt: accessToken,
        user: {
          id: 0,
          firstName: firstName || 'Admin',
          middleName: middleName || '',
          surname: surname || '',
          email: process.env.ADMIN_EMAIL,
          role: 'admin'
        }
      });
    } else {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists or not for security
        return res.status(200).json({ 
          message: 'If that email address is in our system, we have sent you an email with instructions to reset your password.',
          email: email,
          user: null
        });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token and expiration (15 minutes)
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    // Update user with reset token
    await user.update({
      resetToken: resetToken,
      resetTokenExpires: resetTokenExpiry
    });

    // Send password reset email
    try {
      const { sendMail, getPasswordResetEmail } = require('../utils/emailService');
      
      // Create reset URL - point to frontend reset password page
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}?email=${encodeURIComponent(email)}`;
      
      const emailHtml = getPasswordResetEmail({ user, resetUrl });
      
      await sendMail({
        to: email,
        subject: 'NANA Portal - Password Reset Request',
        html: emailHtml
      });

      console.log(`Password reset email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Don't fail the request if email fails - still return success for security
    }

    res.status(200).json({ 
      message: 'If that email address is in our system, we have sent you an email with instructions to reset your password.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Verify Reset Token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ message: 'Token and email are required' });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        email: email,
        resetToken: token,
        resetTokenExpires: {
          [Op.gt]: Date.now() // Token hasn't expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token',
        valid: false 
      });
    }

    res.status(200).json({ 
      message: 'Token is valid',
      valid: true,
      email: user.email,
      firstName: user.firstName
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: 'Token, email, and new password are required' });
    }

    if (newPassword.length < 10) {
      return res.status(400).json({ message: 'Password must be at least 10 characters long' });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        email: email,
        resetToken: token,
        resetTokenExpires: {
          [Op.gt]: Date.now() // Token hasn't expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token (single-use token)
      await user.update({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      });

    // Send password reset success email
    try {
      const { sendMail, getPasswordResetSuccessEmail } = require('../utils/emailService');
      
      const emailHtml = getPasswordResetSuccessEmail({ user });
      
      await sendMail({
        to: email,
        subject: 'NANA Portal - Password Reset Successful',
        html: emailHtml
      });

      console.log(`Password reset success email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send success email:', emailError);
      // Don't fail the request if email fails
    }

      res.status(200).json({ 
        message: 'Password has been reset successfully.',
        email: user.email,
        user: {
          id: user.id,
          firstName: user.firstName,
          middleName: user.middleName,
          surname: user.surname,
          email: user.email,
          role: user.role,
          Idnumber: user.Idnumber,
          relation: user.relation,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
