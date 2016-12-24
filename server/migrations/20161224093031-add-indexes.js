'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addIndex("Messages", [ "fromUserId" ], {
      indexName: "indexMessagesFromUserId"
    });
    queryInterface.addIndex("Messages", [ "toUserId" ], {
      indexName: "indexMessagesToUserId"
    });
    queryInterface.addIndex("Announcements", [ "startDate" ], {
      indexName: "indexAnnouncementsStartDate"
    });
    queryInterface.addIndex("Announcements", [ "endDate" ], {
      indexName: "indexAnnouncementsEndDate"
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeIndex("Messages", [ "fromUserId" ]);
    queryInterface.removeIndex("Messages", [ "toUserId" ]);
    queryInterface.removeIndex("Announcements", [ "startDate" ]);
    queryInterface.removeIndex("Announcements", [ "endDate" ]);
  }
};
