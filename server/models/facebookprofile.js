'use strict';
module.exports = function(sequelize, DataTypes) {
  var FacebookProfile = sequelize.define('FacebookProfile', {
    externalId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    picture: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return FacebookProfile;
};