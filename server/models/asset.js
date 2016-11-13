'use strict';
module.exports = function(sequelize, DataTypes) {
  var Asset = sequelize.define('Asset', {
    key: DataTypes.STRING,
    size: DataTypes.INTEGER,
    mime: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Asset.belongsTo(models.User);
        Asset.belongsTo(models.StorageSystem);
      }
    }
  });
  return Asset;
};
