'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn("Connections", "status", {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }).then(function() {
      return queryInterface.addIndex("Connections", [ "userId" ], {
        indexName: "indexConnectionsUserId"
      });
    }).then(function() {
      return queryInterface.addIndex("Connections", [ "peerId" ], {
        indexName: "indexConnectionsPeerId"
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn("Connections", "status")
    .then(function() {
      return queryInterface.removeIndex("Connections", [ "userId" ]);
    }).then(function() {
      return queryInterface.removeIndex("Connections", [ "peerId" ]);
    });
  }
};
