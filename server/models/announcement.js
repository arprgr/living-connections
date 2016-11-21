'use strict';
module.exports = function(sequelize, DataTypes) {
  var Announcement = sequelize.define('Announcement', {
    activationDate: DataTypes.DATE,
    expiryDate: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        Announcement.belongsTo(models.Asset);
        Announcement.belongsTo(models.User);
      }
    }
  });
  return Announcement;
};
