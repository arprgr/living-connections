'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn("Messages", "toUserId", {
      allowNull: true,
      type: Sequelize.INTEGER
    }).then(function() {
      return queryInterface.addColumn("Messages", "startDate", {
        allowNull: true,
        type: Sequelize.DATE
      });
    }).then(function() {
      return queryInterface.addColumn("Messages", "endDate", {
        allowNull: true,
        type: Sequelize.DATE
      });
    });
  },

  down: function (queryInterface, Sequelize) {
  }
};
