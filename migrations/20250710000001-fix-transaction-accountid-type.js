module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration was already handled - no changes needed
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not needed for this fix
    return Promise.resolve();
  }
};