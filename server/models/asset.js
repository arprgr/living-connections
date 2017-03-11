'use strict';
module.exports = function(sequelize, DataTypes) {
  var Asset;

  function schema() {
    return {
      key: DataTypes.STRING,
      url: DataTypes.STRING,
      mime: DataTypes.STRING
    }
  }

  function associate(models) {
    Asset.belongsTo(models.StorageSystem, { as: "storageSystem" });
    Asset.belongsTo(models.User, { as: "creator" });
  }

  function includeMe(as) {
    return {
      model: Asset,
      as: as || "asset",
      attributes: [ "url" ]
    }
  }

  function findById(id) {
    return Asset.findOne({ where: { id: id }});
  }

  function destroyAll() {
    return Asset.destroy({ where: {}});
  }

  function destroyById(id) {
    return Asset.destroy({ where: { id: id }});
  }

  Asset = sequelize.define('Asset', schema(), {
    classMethods: {
      associate: associate,
      findById: findById,
      destroyAll: destroyAll,
      destroyById: destroyById,
      includeMe: includeMe
    }
  });

  return Asset;
};
