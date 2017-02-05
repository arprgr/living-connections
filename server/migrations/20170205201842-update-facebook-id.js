'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn("FacebookProfiles", "facebookId", {
      allowNull: false,
      type: Sequelize.STRING,
      unique: true
    });
  },

  down: function (queryInterface, Sequelize) {
  }
};
