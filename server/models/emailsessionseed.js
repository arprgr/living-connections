'use strict';
module.exports = function(sequelize, DataTypes) {
  const random = require("../util/random");

  var EmailSessionSeed;
  var models;

  function schema() {
    return {
      externalId: DataTypes.STRING,
      email: DataTypes.STRING,
      expiresAt: DataTypes.DATE
    }
  }

  function associate(_models) {
    models = _models;
    EmailSessionSeed.belongsTo(models.User, { as: "fromUser" });
    EmailSessionSeed.belongsTo(models.Message, { as: "message" });
  }

  function builder() {
    var values = {
      externalId: random.id()
    };
    return {
      externalId: function(externalId) {
        values.externalId = externalId;
        return this;
      },
      email: function(email) {
        values.email = email;
        return this;
      },
      expiresAt: function(expiresAt) {
        values.expiresAt = expiresAt;
        return this;
      },
      build: function() {
        return EmailSessionSeed.create(values);
      }
    }
  }

  function destroyWhere(where) {
    return EmailSessionSeed.destroy({ where: where });
  }

  function destroyAll(id) {
    return destroyWhere({});
  }

  function destroyById(id) {
    return destroyWhere({ id: id });
  }

  function findOne(where, options) {
    var query = {
      where: where
    };
    if (options && options.current) {
      query.where.expiresAt = { "$gt": new Date() };
    }
    return EmailSessionSeed.findOne(query);
  }

  function findById(id, options) {
    return findOne({ id: id }, options);
  }

  function findByExternalId(externalId, options) {
    return findOne({ externalId: externalId }, options);
  }

  EmailSessionSeed = sequelize.define("EmailSessionSeed", schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      destroyAll: destroyAll,
      destroyById: destroyById,
      findById: findById,
      findByExternalId: findByExternalId
    }
  })

  return EmailSessionSeed;
};
