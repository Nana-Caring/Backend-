// migrations/XXXXXXXXXXXXXX-add-idnumber-unique-constraint.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Users', {
      type: 'unique',
      fields: ['Idnumber'],
      name: 'unique_idnumber'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Users', 'unique_idnumber');
  }
};
