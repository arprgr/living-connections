'use strict';
module.exports = function(sequelize, DataTypes) {
  const extend = require("extend");

  var Message;
  var models;

  function schema() {
    return {
      endDate: DataTypes.DATE,
      startDate: DataTypes.DATE,
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
      assetId: function(assetId) {
        values.assetId = assetId;
        return this;
      },
      fromUser: function(fromUser) {
        values.fromUserId = fromUser.id;
        associations.fromUser = fromUser;
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

  function findById(id, options) {
    var query = {
      where: { id: id }
    };
    if (options && options.deep) {
      query.include = [
        includeAsset(), 
        includeUser("toUser"),
        includeUser("fromUser")
      ]
    }
    return Message.find(query);
  }

  function findAllWhere(where, options) {
    var query = {
      where: where,
      order: [ [ "startDate", "DESC" ] ]
    };
    options = options || {};
    if (options.current) {
      var date = new Date();
      query.where.startDate = { "$lte": date };
      query.where.endDate = { "$gt": date };
    }
    if (options.limit) {
      query.limit = options.limit;
    }
    if (options.deep) {
      query.include = [
        includeAsset(), 
        includeUser("fromUser"),
        includeUser("toUser")
      ];
    }
    return Message.findAll(query);
  }

  function findAnnouncements(options) {
    return findAllWhere({
      "toUserId": null,
      "$or": [{
        "type": 3,
      }, {
        "type": 4,
      }],
    }, options);
  }

  function findByFromUserId(fromUserId, options) {
    return findAllWhere({ fromUserId: fromUserId }, options);
  }

  function findByToUserId(toUserId, options) {
    return findAllWhere({ toUserId: toUserId }, options);
  }

  function destroyWhere(where) {
    return Message.destroy({ where: where });
  }

  function destroyAll(id) {
    return destroyWhere({});
  }

  function destroyById(id) {
    return destroyWhere({ id: id });
  }

  Message = sequelize.define('Message', schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      destroyAll: destroyAll,
      destroyById: destroyById,
      findAnnouncements: findAnnouncements,
      findById: findById,
      findByFromUserId: findByFromUserId,
      findByToUserId: findByToUserId
    }
  });

  Message.GREETING_TYPE = 0;
  Message.INVITE_TYPE = 1;
  Message.PROFILE_TYPE = 2;
  Message.ANNOUNCEMENT_TO_ALL_TYPE = 3;
  Message.ANNOUNCEMENT_TO_NEW_TYPE = 4;
  Message.MAX_TYPE = 4;

  return Message;
};
