'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.dropTable("FacebookProfiles").then(function() {
      return queryInterface.createTable('FacebookProfiles', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        facebookId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          unique: true
        },
        name: {
          type: Sequelize.STRING
        },
        picture: {
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING
        },
        userId: {
          allowNull: true,
          type: Sequelize.INTEGER,
          unique: true
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
    })
  },
  down: function(queryInterface, Sequelize) {
  }
};
