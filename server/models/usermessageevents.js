'use strict';
module.exports = function(sequelize, DataTypes) {
  const extend = require("extend");

  var UserMessageEvents;
  var models;



  function schema() {
    return {
      clientTime: DataTypes.DATE,
      type: DataTypes.STRING,
    }
  }
  
   function includeMessage(associationName) {
    return {
      model: models.Message,
      as: associationName,
      attributes: [ "id" ]
    }
  }
 
  function includeUser(associationName) {
    return {
      model: models.User,
      as: associationName,
      attributes: [ "id", "name" ]
    }
  }

  function associate(_models) {
    models = _models;
    UserMessageEvents.belongsTo(models.User, { as: "toUser" });
    UserMessageEvents.belongsTo(models.User, { as: "fromUser" });
    UserMessageEvents.belongsTo(models.Message, { as: "message" });
  }

  function builder() {
    var values = {};
    var associations = {};
    return {
      seed: function(seed) {
        values.fromUserId = seed.fromUserId;
        if ("toUserId" in seed) {
          values.toUserId = seed.toUserId;
        }
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
        return UserMessageEvents.create(values)
        .then(function(model) {
          extend(model, associations);
          return model;
        });
      }
    }
  }

  function includes(options) {
    var includes = [];
    if (options && options.deep) {
      includes.push(includeUser("toUser"));
      includes.push(includeUser("fromUser"));
      includes.push(includeMessage("message"));
    }
    return includes;
  }

  function findById(id, options) {
    return UserMessageEvents.find({
      where: { id: id },
      include: includes(options)
    });
  }

  function findAllWhere(where, options) {
    var query = {
      where: where,
      include: includes(options),
      order: [ [ "updatedAt"] ]
    };
    return UserMessageEvents.findAll(query);
  }

 function findReadMessageEventsForUser(toUserId) {
     return UserMessageEvents.findAll({
      where: { toUserId: toUserId, type: 'open' },
      include: [{
        model: models.User,
        as: "fromUser",
        required: true
      }],
      include: [{
        model: models.User,
        as: "toUser",
        required: true
      },
      {
        model: models.Message,
        as: "message"
      }],
      order: [ [ "createdAt", "ASC" ] ]
    })
 }

 function findReadMessageEventsForSender(fromUserId) {
     return UserMessageEvents.findAll({
      where: { fromUserId: fromUserId, type: 'open' },
      include: [{
        model: models.User,
        as: "fromUser",
        required: true
      }],
      include: [{
        model: models.User,
        as: "toUser",
        required: true
      },
      {
        model: models.Message,
        as: "message"
      }],
      order: [ [ "createdAt", "ASC" ] ]
    })
 }

  function findByReceiver(toUserId, options) {
    return findAllWhere({
      "toUserId": toUserId
    }, options);
  }


  function destroyWhere(where) {
    return UserMessageEvents.destroy({ where: where });
  }

  function destroyAll() {
    return destroyWhere({});
  }

  function destroyById(id) {
    return destroyWhere({ id: id });
  }

  UserMessageEvents = sequelize.define('UserMessageEvents', schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      destroyAll: destroyAll,
      destroyById: destroyById,
      findReadMessageEventsForUser: findReadMessageEventsForUser,
      findReadMessageEventsForSender: findReadMessageEventsForSender,
      findById: findById,
      findByReceiver: findByReceiver
    }
  });


  return UserMessageEvents;
};
