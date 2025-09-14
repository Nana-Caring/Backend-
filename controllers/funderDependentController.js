// Add this to funderController.js or create new endpoint

const { FunderDependent, User } = require('../models');

// Link funder to dependent
const linkDependent = async (req, res) => {
  try {
    const funderId = req.user.id;
    const { dependentId } = req.body;

    // Verify dependent exists
    const dependent = await User.findOne({
      where: { id: dependentId, role: 'dependent' }
    });

    if (!dependent) {
      return res.status(404).json({ error: 'Dependent not found' });
    }

    // Check if already linked
    const existing = await FunderDependent.findOne({
      where: { funderId, dependentId }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already linked to this dependent' });
    }

    // Create link
    await FunderDependent.create({ funderId, dependentId });

    res.json({
      message: 'Successfully linked to dependent',
      funder: req.user.id,
      dependent: dependentId
    });

  } catch (error) {
    console.error('Link dependent error:', error);
    res.status(500).json({ error: 'Failed to link dependent' });
  }
};

// Get linked dependents for funder
const getLinkedDependents = async (req, res) => {
  try {
    const funderId = req.user.id;

    const linkedDependents = await User.findAll({
      where: { role: 'dependent' },
      include: [
        {
          model: User,
          as: 'Funders',
          where: { id: funderId },
          through: { attributes: [] }
        },
        {
          model: Account,
          as: 'accounts',
          attributes: ['id', 'accountNumber', 'accountType', 'balance', 'currency']
        }
      ]
    });

    res.json({
      message: 'Linked dependents retrieved',
      dependents: linkedDependents
    });

  } catch (error) {
    console.error('Get linked dependents error:', error);
    res.status(500).json({ error: 'Failed to get linked dependents' });
  }
};

module.exports = {
  linkDependent,
  getLinkedDependents
};
