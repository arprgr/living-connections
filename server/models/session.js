'use strict';
module.exports = function(sequelize, DataTypes) {
  var extend = require("extend");

  var Session = sequelize.define('Session', {
    externalId: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        Session.belongsTo(models.User, { as: "user" });
      },
      findByExternalId: function(externalId, options) {
        return Session.find(extend({
          where: { externalId: externalId }
        }, options));
      },
      findByUserId: function(userId) {
        return Session.findAll({
          where: { userId: userId }
        });
      },
      destroyByExternalId: function(externalId) {
        return Session.destroy({
          where: {
            externalId: externalId
          }
        });
      }
    }
  });
  return Session;
};
