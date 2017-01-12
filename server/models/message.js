'use strict';
module.exports = function(sequelize, DataTypes) {
  const extend = require("extend");

  var Message;
  var models;

  function schema() {
    return {
      type: DataTypes.INTEGER,
      status: DataTypes.INTEGER
    }
  }

  function includeAsset() {
    return {
      model: models.Asset,
      as: "asset",
      attributes: [ "url" ]
    }
  }

  function includeUser(associationName) {
    return {
      model: models.User,
      as: associationName,
      attributes: [ "id", "name" ],
      include: [ includeAsset() ]
    }
  }

  function includes() {
  }

  function associate(_models) {
    models = _models;
    Message.belongsTo(models.User, { as: "toUser" });
    Message.belongsTo(models.User, { as: "fromUser" });
    Message.belongsTo(models.Asset, { as: "asset" });
  }

  function builder() {
    var values = {};
    var associations = {};
    return {
      seed: function(seed) {
        values.fromUserId = seed.fromUserId;
        values.assetId = seed.assetId;
        if ("toUserId" in seed) {
          values.toUserId = seed.toUserId;
        }
        return this;
      },
      toUser: function(toUser) {
        values.toUserId = toUser.id;
        associations.toUser = toUser;
        return this;
      },
      type: function(type) {
        values.type = type;
        return this;
      },
      build: function() {
        return Message.create(values)
        .then(function(model) {
          extend(model, associations);
          return model;
        });
      }
    }
  }

  function findById(id) {
    return Message.find({ where: { id: id } });
  }

  function findAllWhere(where, includes) {
    return Message.findAll({
      where: where,
      include: includes,
      order: [ [ "createdAt", "DESC" ] ]
    });
  }

  function findByFromUserId(fromUserId) {
    return findAllWhere({ fromUserId: fromUserId }, [
      includeAsset(), 
      includeUser("toUser")
    ]);
  }

  function findByToUserId(toUserId) {
    return findAllWhere({ toUserId: toUserId }, [
      includeAsset(), 
      includeUser("fromUser")
    ]);
  }

  function destroyWhere(where) {
    return Message.destroy({ where: where });
  }
  
  function destroyAll() {
    return destroyWhere({});
  }

  function destroyById(id) {
    return destroyWhere({ id: id });
  }

  Message = sequelize.define('Message', schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      findById: findById,
      findByFromUserId: findByFromUserId,
      findByToUserId: findByToUserId,
      findByFromUserId: findByFromUserId,
      destroyById: destroyById,
      destroyAll: destroyAll
    }
  });

  Message.GREETING_TYPE = 0;
  Message.INVITE_TYPE = 1;
  Message.ANNOUNCEMENT_TYPE = 2;

  return Message;
};
