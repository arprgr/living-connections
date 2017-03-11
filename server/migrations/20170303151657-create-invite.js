'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Invites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticketId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      fromUserId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      toUserId: {
        type: Sequelize.INTEGER
      },
      recipientName: {
        type: Sequelize.STRING
      },
      assetId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      messageId: {
        type: Sequelize.INTEGER
      },
      state: {
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Invites');
  }
};
