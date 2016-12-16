'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Asset);
      },
      findById: function(id) {
        return User.findOne({
          where: { id: id }
        });
      },
      findByLevel: function(level) {
        return User.findAll({
          where: { level: level }
        });
      }
    }
  });
  return User;
};
