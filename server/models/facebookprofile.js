'use strict';
module.exports = function(sequelize, DataTypes) {
  var FacebookProfile;
  var models;

  function schema() {
    return {
      facebookId: {
        type: DataTypes.INTEGER,
        unique: true
      },
      name: DataTypes.STRING,
      picture: DataTypes.STRING,
      email: DataTypes.STRING
    }
  }

  function builder() {
    var values = {};
    return {
      user: function(user) {
        values.userId = user.id;
        return this;
      },
      facebookId: function(facebookId) {
        values.facebookId = facebookId;
        return this;
      },
      email: function(email) {
        values.email = email;
        return this;
      },
      name: function(name) {
        values.name = name;
        return this;
      },
      picture: function(name) {
        values.picture = picture;
        return this;
      },
      build: function() {
        return FacebookProfile.create(values);
      }
    }
  }

  function findWhere(where) {
    return FacebookProfile.find({
      where: where,
      include: includes()
    });
  }

  function findById(id) {
    return findWhere({ id: id });
  }

  function findByFacebookId(facebookId) {
    return findWhere({ facebookId: facebookId });
  }

  function findByUser(user) {
    return findWhere({ userId: user.id });
  }

  function destroyWhere(where) {
    return FacebookProfile.destroy({ where: where });
  }

  function destroyAll(id) {
    return destroyWhere({});
  }

  function destroyById(id) {
    return destroyWhere({ id: id });
  }

  FacebookProfile = sequelize.define("FacebookProfile", schema(), {
    classMethods: {
      builder: builder,
      findById: findById,
      findByUser: findByUser,
      destroyAll: destroyAll,
      destroyById: destroyById
    }
  });
  return FacebookProfile;
};
