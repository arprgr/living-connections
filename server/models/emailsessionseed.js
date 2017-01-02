'use strict';
module.exports = function(sequelize, DataTypes) {
  const random = require("../util/random");

  var EmailSessionSeed;

  function schema() {
    return {
      externalId: DataTypes.STRING,
      email: DataTypes.STRING,
      expiresAt: DataTypes.DATE
    }
  }

  function associate(models) {
    EmailSessionSeed.belongsTo(models.User, { as: "fromUser" });
    EmailSessionSeed.belongsTo(models.Asset, { as: "asset" });
  }

  function builder() {
    var values = {
      externalId: random.id()
    };
    return {
      email: function(email) {
        values.email = email;
        return this;
      },
      expiresAt: function(expiresAt) {
        values.expiresAt = expiresAt;
        return this;
      },
      fromUser: function(fromUser) {
        values.fromUserId = fromUser.id;
        return this;
      },
      assetId: function(assetId) {
        values.assetId = assetId;
        return this;
      },
      build: function() {
        return EmailSessionSeed.create(values);
      }
    }
  }

  function findCurrentByExternalId(externalId) {
    return EmailSessionSeed.find({
      where: {
        externalId: externalId,
        expiresAt: {
          "$gt": new Date()
        }
      }
    });
  }

  EmailSessionSeed = sequelize.define("EmailSessionSeed", schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      findCurrentByExternalId: findCurrentByExternalId
    }
  })

  return EmailSessionSeed;
};
