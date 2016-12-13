'use strict';
module.exports = function(sequelize, DataTypes) {
  var Video = sequelize.define('Video', {
    externalId: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Video.belongsTo(models.StorageSystem, { as: "storageSystem" });
        Video.belongsTo(models.User, { as: "creator" });
      },
      findById: function(id) {
        return Video.findAll({
          where: { id: id }
        });
      },
      destroyById: function(id) {
        return Video.destroy({
          where: {
            id: id
          }
        });
      }
    }
  });
  return Video;
};
