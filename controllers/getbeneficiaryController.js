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
          attributes: ['id', 'firstName', 'middleName', 'surname', 'email', 'phoneNumber'],
          include: [
            {
              model: db.Account,
              as: 'Accounts',
              attributes: ['id', 'accountType', 'accountNumber', 'balance', 'caregiverId']
            }
          ]
        }
      ]
    });
    
   const beneficiaries = linkedDependents.map(entry => {
    const dep = entry.dependent;
    return {
      id: dep.id,
      name: `${dep.firstName} ${dep.middleName || ''} ${dep.surname || ''}`.trim(),
      firstName: dep.firstName,
      middleName: dep.middleName,
      surname: dep.surname,
      email: dep.email,
      phoneNumber: dep.phoneNumber,
      // Include custom name from relationship
      customName: entry.customName,
      displayName: entry.customName || `${dep.firstName} ${dep.surname}`,
      Accounts: (dep.Accounts || []).map(account => ({
        id: account.id,
        accountName: account.accountType,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: `ZAR ${parseFloat(account.balance || 0).toFixed(2)}`,
        caregiverId: account.caregiverId
      }))
    };
  });

    res.status(200).json({ beneficiaries });
  } catch (error) {
    console.error('Error fetching linked beneficiaries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
