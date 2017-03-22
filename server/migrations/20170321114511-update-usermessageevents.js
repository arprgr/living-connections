'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('UserMessageEvents', 'fromUserId', {
      allowNull: false,
      type: Sequelize.INTEGER
    }).then(function() {
      return queryInterface.addColumn('UserMessageEvents', 'toUserId', {
        allowNull: false,
        type: Sequelize.INTEGER
      });
    }).then(function() {
      return queryInterface.addColumn('UserMessageEvents', 'messageId', {
        allowNull: false,
        type: Sequelize.INTEGER
      });
    })
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('UserMessageEvents', 'fromUserId')
    .then(function() {
      return queryInterface.removeColumn('UserMessageEvents', 'toUserId');
    }).then(function() {
      return queryInterface.removeColumn('UserMessageEvents', 'messageId');
    })
  }
};
