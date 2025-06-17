const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); // <-- Import your auth middleware
const { FunderBeneficiary, Beneficiary } = require('../models');

// Get beneficiaries linked to a funder
router.get('/:funderId/beneficiaries',auth, async (req, res) => {
    const { funderId } = req.params;
    try {
        const associations = await FunderBeneficiary.findAll({
            where: { funderId },
            include: [{ model: Beneficiary }]
        });
        res.json(associations.map(a => a.Beneficiary));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch funder beneficiaries' });
    }
});

module.exports = router;