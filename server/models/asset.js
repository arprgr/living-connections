'use strict';
module.exports = function(sequelize, DataTypes) {
  var Asset = sequelize.define('Asset', {
    key: DataTypes.STRING,
    url: DataTypes.STRING,
    mime: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Asset.belongsTo(models.StorageSystem, { as: "storageSystem" });
        Asset.belongsTo(models.User, { as: "creator" });
      },
      findById: function(id) {
        return Asset.findOne({
          where: { id: id }
        });
      },
      destroyById: function(id) {
        return Asset.destroy({
          where: { id: id }
        });
      }
    }
  });
  return Asset;
};
