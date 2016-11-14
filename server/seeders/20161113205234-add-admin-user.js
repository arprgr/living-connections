'use strict';

const Promise = require("promise");

module.exports = {
  up: function (queryInterface, Sequelize) {

    const promises = []

console.log('well here we are 1');
    promises.push(queryInterface.insert(null, "Users", {
      name: "Admin",
      level: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {}).then(function(user) {
console.log('well here we are', user);
      promises.push(queryInterface.insert(null, "EmailProfiles", {
        email: "admin@example.com",
        //UserId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {}));
    }));

    return Promise.all(promises);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", null, {});
    return queryInterface.bulkDelete("EmailProfiles", null, {});
  }
};
