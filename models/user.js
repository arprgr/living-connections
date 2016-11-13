'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    description: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Asset);
      }
    }
  });
  return User;
};
