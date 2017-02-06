'use strict';
module.exports = function(sequelize, DataTypes) {
  const random = require("../util/random");

  var Session;
  var models;

  function schema() {
    return {
      externalId: {
        type: DataTypes.STRING,
        unique: true
      }
    }
  }

  function includes() {
    return [{
      model: models.User,
      as: "user",
      required: true,
      include: [{
        model: models.Asset,
        as: "asset"
      }, {
        model: models.FacebookProfile,
        as: "facebookProfile"
      }]
    }]
  }

  function associate(_models) {
    models = _models;
    Session.belongsTo(models.User, { as: "user" });
  }

  function builder() {
    var values = {
      externalId: random.id()
    }
    var associations = {};
    return {
      user: function(user) {
        values.userId = user.id;
        associations.user = user;
        return this;
      },
      build: function() {
        return Session.create(values)
        .then(function(session) {
          session.user = associations.user;   // decorate the session with the user, just as findWhere does.
          return session;
        });
      }
    }
  }

  function findWhere(where) {
    return Session.find({
      where: where,
      include: includes()
    });
  }

  function findByExternalId(externalId) {
    return findWhere({ externalId: externalId });
  }

  function destroyWhere(where) {
    return Session.destroy({ where: where });
  }

  function destroyAll() {
    return destroyWhere({});
  }

  function destroyById(id) {
    return destroyWhere({ id: id });
  }

  function destroyByExternalId(externalId) {
    return destroyWhere({ externalId: externalId });
  }

  Session = sequelize.define("Session", schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      findByExternalId: findByExternalId,
      destroyAll: destroyAll,
      destroyById: destroyById,
      destroyByExternalId: destroyByExternalId
    }
  })

  return Session;
};
