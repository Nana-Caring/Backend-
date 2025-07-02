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
          attributes: ['id', 'firstName', 'middleName', 'email'],
          include:[
            {
              model: db.Account,
              as: 'accounts',
              attributes: ['accountNumber', 'accountType']
            }
          ]
        }
      ]
    });
    
   const beneficiaries = linkedDependents.map(entry => {
    const dep = entry.dependent;
    const account = dep.accounts && dep.accounts[0];
    return {
    id: dep.id,
    firstName: dep.firstName,
    middleName: dep.middleName,
    email: dep.email,
    accountNumber: account ? account.accountNumber : null,
    accountType: account ? account.accountType : null
  };
});

    res.status(200).json({ beneficiaries });
  } catch (error) {
    console.error('Error fetching linked beneficiaries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
