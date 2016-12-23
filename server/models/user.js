'use strict';
module.exports = function(sequelize, DataTypes) {
  const extend = require("extend");

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
        User.belongsTo(models.Asset, { as: "asset" });
      },
      findById: function(id, options) {
        return User.findOne(extend({
          where: { id: id }
        }, options));
      }
    }
  });
  return User;
};
