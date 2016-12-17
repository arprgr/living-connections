'use strict';
module.exports = function(sequelize, DataTypes) {
  var StorageSystem = sequelize.define('StorageSystem', {
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    accessKey: DataTypes.STRING,
    secretKey: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return StorageSystem;
};
