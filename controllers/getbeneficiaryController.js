const db = require('../models');

exports.getMyBeneficiaries = async (req, res) => {
  try {
    const funderId = req.user.id;

    const linkedDependents = await db.FunderDependent.findAll({
      where: { funderId },
      include: [
        {
          model: db.User,
          as: 'dependent',
          attributes: ['id', 'firstName', 'middleName', 'email']
        }
      ]
    });
    
    const beneficiaries = linkedDependents.map(entry => entry.dependent);

    res.status(200).json({ beneficiaries });
  } catch (error) {
    console.error('Error fetching linked beneficiaries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
