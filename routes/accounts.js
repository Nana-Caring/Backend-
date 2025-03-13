const express = require("express");
const { Account } = require("../models");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Create Accounts for a Child
router.post("/create", authenticate, authorize(["Funder"]), async (req, res) => {
  const { userId, type } = req.body;

  try {
    const account = await Account.create({ userId, type });
    res.json({ message: "Account created!", account });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
