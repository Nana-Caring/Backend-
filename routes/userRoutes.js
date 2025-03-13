const express = require("express");
const { getUser } = require("../controllers/userController"); // Assuming you have userController for logic
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Define your user-related routes
router.get("/me", authMiddleware, getUser); // Get current logged-in user

module.exports = router;
