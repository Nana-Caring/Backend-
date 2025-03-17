module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Accounts', 'accountName', {
      type: Sequelize.STRING,
      allowNull: false, // Set to true if the column can be null
      defaultValue: 'Default Account Name', // Set a default value if necessary
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Accounts', 'accountName');
  }
};
