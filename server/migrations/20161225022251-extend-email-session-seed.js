'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn("EmailSessionSeeds", "assetId", {
      type: Sequelize.INTEGER
    })
    .then(function() {
      return queryInterface.addColumn("EmailSessionSeeds", "fromUserId", {
        type: Sequelize.INTEGER
      })
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn("EmailSessionSeeds", "assetId")
    .then(function() {
      return queryInterface.removeColumn("EmailSessionSeeds", "fromUserId")
    });
  }
};
