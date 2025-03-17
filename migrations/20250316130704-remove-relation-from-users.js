module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'relation');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'relation', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
