const express = require("express");
const { check } = require("express-validator");
const { register, login, getUser } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// REGISTER
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("role", "Role must be either funder, caregiver, or dependent").isIn(["funder", "caregiver", "dependent"]),
  ],
  register
);

// LOGIN
router.post(
  "/login",
  [
    check("email", "Include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);

// GET CURRENT USER
router.get("/me", authMiddleware, getUser);

module.exports = router;
