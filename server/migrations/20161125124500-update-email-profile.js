'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn('EmailProfiles', 'email', {
      allowNull: false,
      type: Sequelize.STRING,
      unique: true
    });
  },
  down: function(queryInterface, Sequelize) {
  }
};
