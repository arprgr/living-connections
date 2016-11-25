'use strict';
module.exports = function(sequelize, DataTypes) {
  var Connection = sequelize.define('Connection', {
    grade: DataTypes.REAL
  }, {
    classMethods: {
      associate: function(models) {
        Connection.belongsTo(models.User);
        Connection.belongsTo(models.User, { as: "connection" });
      },
      findByUserId: function(userId, options) {
        return Connection.findAll({
          where: { UserId: userId },
          limit: options && options.limit,
          order: "grade DESC"
        });
      }
    }
  });
  return Connection;
};
