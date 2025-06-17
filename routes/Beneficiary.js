const express = require('express');
const router = express.Router();
const { Beneficiary } = require('../models');

// fetching all beneficiaries
router.get('/', async (req, res) => {
    try {
        const beneficiaries = await Beneficiary.findAll();
        res.json(beneficiaries);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch beneficiaries' });
    }
});

module.exports = router;