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
      },
      findById: function(id) {
        return EmailProfile.find({
          where: { id: id }
        });
      },
      findByEmail: function(email) {
        models.EmailProfile.findOne({
          where: { email: email }
        });
      }
    }
  });
  return EmailProfile;
};
