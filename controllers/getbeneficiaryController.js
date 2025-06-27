const Beneficiary = require('../models/Beneficiary');
const User = require('../models/User');

exports.getMyBeneficiaries = async (req, res) => {
  try {
    // check if the user is logged in and has the role of 'funder'
    if (req.user.role !== 'funder') {
      return res.status(403).json({ error: 'Access denied. Only funders can view their beneficiaries.' });
    }

    // Get beneficiaries linked to the logged-in funder
    const beneficiaries = await Beneficiary.findAll({
      where: { funderId: req.user.id },
      include: [{
       model: User,
        as: 'user',
        attributes: ['idNumber', 'name', 'accountNumber']
      }]
    });

    res.json(beneficiaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};