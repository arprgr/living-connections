'use strict';
module.exports = function(sequelize, DataTypes) {
  const extend = require("extend");

  var EmailSessionSeed = sequelize.define('EmailSessionSeed', {
    externalId: DataTypes.STRING,
    email: DataTypes.STRING,
    expiresAt: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      findByExternalId: function(externalId, options) {
        return EmailSessionSeed.find(extend({
          where: { externalId: externalId }
        }, options));
      }
    }
  });
  return EmailSessionSeed;
};
