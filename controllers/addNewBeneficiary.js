const Beneficiary = require('../models/Beneficiary');

exports.addBeneficiary = async (req, res) => {
  try {
    if (req.user.role !== 'funder') {
      return res.status(403).json({ error: 'Only funders can add beneficiaries.' });
    }
    const { name, accountNumber } = req.body;
    const beneficiary = await Beneficiary.create({
      name,
      accountNumber,
      funderId: req.user.id // Link to the logged-in funder
    });
    res.status(201).json(beneficiary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};