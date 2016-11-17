'use strict';
module.exports = function(sequelize, DataTypes) {
  var Session = sequelize.define('Session', {
    externalId: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        Session.belongsTo(models.User);
      },
      findByExternalId: function(externalId) {
        return Session.find({
          where: { externalId: externalId }
        });
      },
      findByUserId: function(userId) {
        return Session.findAll({
          where: { UserId: userId }
        });
      }
    }
  });
  return Session;
};
