'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.renameColumn('Connections', 'connectionId', 'peerId');
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.renameColumn('Connections', 'peerId', 'connectionId');
  }
};
