const db = require('../models');
const sequelize = db.sequelize;

exports.linkDependent = async (req, res) => {
  try {
    const funderId = req.user.id;
    console.log("Request body:", req.body);
    
    const { dependentName, accountNumber } = req.body;
    console.log("Dependent name:", dependentName);
    console.log("Account number:", accountNumber);
    
    // Find dependent by name and account number
    const dependent = await db.User.findOne({
      where: { firstName: dependentName, role: 'dependent' },
      include: [{
        model: db.Account,
        as: 'accounts',
        where: { accountNumber }
      }]
    });

    if (!dependent) {
      return res.status(404).json({ message: 'Dependent not found' });
    }

    // Create link in FunderDependent table
    await sequelize.query(
      'INSERT INTO "FunderDependents" ("funderId", "dependentId", "createdAt", "updatedAt") VALUES (?, ?, NOW(), NOW())',
      {
        replacements: [funderId, dependent.id],
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.json({ message: 'Dependent linked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};