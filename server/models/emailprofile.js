'use strict';
module.exports = function(sequelize, DataTypes) {
  var EmailProfile;
  var models;

  function schema() {
    return {
      email: {
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
      }]
    }]
  }

  function associate(_models) {
    models = _models;
    EmailProfile.belongsTo(models.User, { "as": "user" });
  }

  function builder() {
    var values = {};
    return {
      user: function(user) {
        values.userId = user.id;
        return this;
      },
      email: function(email) {
        values.email = email;
        return this;
      },
      build: function() {
        return EmailProfile.create(values);
      }
    }
  }

  function findWhere(where) {
    return EmailProfile.find({
      where: where,
      include: includes()
    });
  }

  function findById(id) {
    return findWhere({ id: id });
  }

  function findByEmail(email) {
    return findWhere({ email: email });
  }

  function findByUser(user) {
    return findWhere({ userId: user.id });
  }

  function destroyWhere(where) {
    return EmailProfile.destroy({ where: where });
  }

  function destroyAll(id) {
    return destroyWhere({});
  }

  function destroyById(id) {
    return destroyWhere({ id: id });
  }

  EmailProfile = sequelize.define("EmailProfile", schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      findById: findById,
      findByEmail: findByEmail,
      findByUser: findByUser,
      destroyAll: destroyAll,
      destroyById: destroyById
    }
  })

  return EmailProfile;
};
