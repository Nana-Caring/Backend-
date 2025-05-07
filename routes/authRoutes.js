const express = require("express");
const { check } = require("express-validator");
const { register, login, getUser, registerDependent } = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// LOGIN
router.post(
  "/login",
  [
    check("email", "Include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);

// REGISTER (Funder or Caregiver)
router.post(
  "/register",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("surname", "Surname is required").not().isEmpty(),
    check("email", "Include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("role", "Role must be either funder or caregiver").isIn(["funder", "caregiver"]),
    check("Idnumber", "Valid 13-digit numeric ID number required").isLength({ min: 13, max: 13 }).isNumeric(),
  ],
  register
);

// REGISTER DEPENDENT (by Caregiver)
router.post(
  "/register-dependent",
  [
    authMiddleware,
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("surname", "Surname is required").not().isEmpty(),
    check("Idnumber", "Valid 13-digit numeric ID number required").isLength({ min: 13, max: 13 }).isNumeric(),
    check("relation", "Relation is required").not().isEmpty(),
  ],
  registerDependent
);

// GET CURRENT USER
router.get("/me", authMiddleware, getUser);

module.exports = router;
