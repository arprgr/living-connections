'use strict';
module.exports = function(sequelize, DataTypes) {
  var EmailProfile = sequelize.define('EmailProfile', {
    email: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        EmailProfile.belongsTo(models.User);
      }
    }
  });
  return EmailProfile;
};
