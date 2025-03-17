module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Accounts', 'accountName');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Accounts', 'accountName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
