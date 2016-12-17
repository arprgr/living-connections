'use strict';
module.exports = function(sequelize, DataTypes) {
  const extend = require("extend");

  var EmailProfile = sequelize.define('EmailProfile', {
    email: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        EmailProfile.belongsTo(models.User, { "as": "user" });
      },
      findById: function(id) {
        return EmailProfile.find({
          where: { id: id }
        });
      },
      findByEmail: function(email, options) {
        return EmailProfile.findOne(extend({
          where: { email: email }
        }, options));
      }
    }
  });
  return EmailProfile;
};
