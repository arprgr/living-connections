'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Videos')
    .then(function() {
      return queryInterface.removeColumn('Assets', 'size')
    }).then(function() {
      return queryInterface.removeColumn('Assets', 'UserId')
    }).then(function() {
      return queryInterface.removeColumn('Assets', 'StorageSystemId')
    }).then(function() {
      return queryInterface.addColumn('Assets', 'creatorId', {
        allowNull: false,
        type: Sequelize.INTEGER,
      });
    }).then(function() {
      return queryInterface.addColumn('Assets', 'storageSystemId', {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.INTEGER,
      });
    });
  },
  down: function(queryInterface, Sequelize) {
  }
};
