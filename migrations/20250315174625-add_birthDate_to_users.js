module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename column first
    await queryInterface.renameColumn('Users', 'birthDate', 'Idnumber');
    
    // Then modify the column type
    await queryInterface.changeColumn('Users', 'Idnumber', {
      type: Sequelize.STRING(13),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse order for rollback:
    // 1. Change back to original type first
    await queryInterface.changeColumn('Users', 'Idnumber', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
    
    // 2. Then rename back to original column name
    await queryInterface.renameColumn('Users', 'Idnumber', 'birthDate');
  }
};
