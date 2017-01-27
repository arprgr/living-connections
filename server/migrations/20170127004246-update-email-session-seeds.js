'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn("EmailSessionSeeds", "assetId", "messageId")
    .then(function() {
      return queryInterface.addIndex("EmailSessionSeeds", [ "fromUserId" ], {
        indexName: "indexEmailSessionSeedsFromUserId"
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn("EmailSessionSeeds", "messageId", "assetId")
    .then(function() {
      return queryInterface.removeIndex("EmailSessionSeeds", "indexEmailSessionSeedsFromUserId");
    });
  }
};
