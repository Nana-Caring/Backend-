module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Accounts', 'name');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Accounts', 'name', {
      type: Sequelize.STRING,
      allowNull: false, // Set to true if the column can be null
      // Add other column properties as needed
    });
  }
};
