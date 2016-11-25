'use strict';

module.exports = function(sequelize, DataTypes) {
  var extend = require("extend");

  var Connection = sequelize.define('Connection', {
    grade: DataTypes.REAL
  }, {
    classMethods: {
      associate: function(models) {
        Connection.belongsTo(models.User);
        Connection.belongsTo(models.User, { as: "peer" });
      },
      findByUserId: function(userId, options) {
        return Connection.findAll(extend({
          where: { UserId: userId }
        }, options));
      }
    }
  });
  return Connection;
};
