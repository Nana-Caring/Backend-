module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Accounts', 'accountNumber', {
      type: Sequelize.STRING,
      allowNull: false, // Set to true if the column can be null
      unique: true, // Ensures account numbers are unique
      defaultValue: Sequelize.UUIDV4, // Generates a unique identifier by default
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Accounts', 'accountNumber');
  }
};
