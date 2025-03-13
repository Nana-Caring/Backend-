const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = await User.create({ name, email, password: hashedPassword, role });

    // Remove password from user object before sending response
    user = user.get({ plain: true });
    delete user.password;

    // Return success response
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Remove password from user object before sending response
    const userData = user.get({ plain: true });
    delete userData.password;

    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user (for the "me" route)
exports.getUser = (req, res) => {
  res.json({ user: req.user }); // Return the user attached to the request object
};
