'use strict';
module.exports = function(sequelize, DataTypes) {
  var User;
  var models;

  function schema() {
    return {
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    }
  }

  function associate(_models) {
    models = _models;
    User.belongsTo(models.Asset, { as: "asset" });
  }

  function builder() {
    var values = {};
    return {
      name: function(name) {
        values.name = name;
        return this;
      },
      level: function(level) {
        values.level = level;
        return this;
      },
      build: function() {
        return User.create(values);
      }
    }
  }

  function includeMe(as) {
    return {
      model: User,
      as: as || "user",
      attributes: [ "id", "name" ],
      include: [ models.Asset.includeMe() ]
    }
  }

  function findById(id) {
    return User.findOne({ where: { id: id }});
  }

  function superuser() {
    return {
      id: 0,
      name: "Root",
      level: 0
    }
  }

  User = sequelize.define("User", schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      findById: findById,
      includeMe: includeMe,
      superuser: superuser
    }
  })

  return User;
};
