'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Announcements')
    .then(function() {
      return queryInterface.createTable('Announcements', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        creatorId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        assetId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        startDate: {
          allowNull: false,
          type: Sequelize.DATE
        },
        endDate: {
          allowNull: false,
          type: Sequelize.DATE
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Announcements');
  }
};
