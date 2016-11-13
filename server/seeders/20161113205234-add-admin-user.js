'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Users", [{
      name: "Admin",
      level: 0
    }], {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
