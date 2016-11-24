'use strict';
module.exports = function(sequelize, DataTypes) {
  var Connection = sequelize.define('Connection', {
    grade: DataTypes.REAL
  }, {
    classMethods: {
      associate: function(models) {
        Connection.belongsTo(models.User);
        Connection.belongsTo(models.User, { as: "connection" });
      }
    }
  });
  return Connection;
};
