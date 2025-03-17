module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First rename the column
    await queryInterface.renameColumn('Users', 'birthDate', 'Idnumber');
    
    // Then modify the column type
    await queryInterface.changeColumn('Users', 'Idnumber', {
      type: Sequelize.STRING(12),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse the process:
    // 1. Change column type back first
    await queryInterface.changeColumn('Users', 'Idnumber', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
    
    // 2. Rename back to original
    await queryInterface.renameColumn('Users', 'Idnumber', 'birthDate');
  }
};
