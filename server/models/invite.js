'use strict';
module.exports = function(sequelize, DataTypes) {
  var Invite;
  var models;

  const STATE_INIT = 0;
  const STATE_RECEIVED = 1;
  const STATE_ACCEPTED = 2;
  const STATE_REJECTED = 3;

  function schema() {
    return {
      fromUserId: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      toUserId: {
        type: DataTypes.INTEGER
      },
      recipientName: {
        type: DataTypes.STRING
      },
      ticketId: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      assetId: {
        type: DataTypes.INTEGER
      },
      messageId: {
        type: DataTypes.INTEGER
      },
      state: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }
  }

  function associate(_models) {
    models = _models;
    Invite.belongsTo(models.User, { as: "fromUser" });
    Invite.belongsTo(models.Asset, { as: "asset" });
    Invite.belongsTo(models.EmailSessionSeed, { as: "ticket" });
    Invite.belongsTo(models.Message, { as: "message" });
  }

  function builder() {
    var values = {
    };
    return {
      fromUser: function(fromUser) {
        values.fromUserId = fromUser.id;
        return this;
      },
      recipientName: function(recipientName) {
        values.recipientName = recipientName;
        return this;
      },
      ticket: function(ticket) {
        values.ticketId = ticket.id;
        return this;
      },
      asset: function(asset) {
        values.assetId = asset.id;
        return this;
      },
      build: function() {
        return Invite.create(values);
      }
    }
  }

  function addFindOptions(query, options) {
    options = options || {};
    if (options.deep) {
      query.include = [{
        model: models.Asset,
        as: "asset"
      }, {
        model: models.User,
        as: "fromUser"
      }]
    }
    if (options.excludeRejected) {
      if (!query.where) query.where = {};
      query.where.state = { "$ne": STATE_REJECTED };
    }
    return query;
  }

  function findById(id, options) {
    return Invite.findOne(addFindOptions({
      where: { id: id }
    }, options));
  }

 function findByTicketId(ticketId, options) {
    return Invite.findOne(addFindOptions({
      where: { ticketId: ticketId }
    }, options));
  }

  function findByFromUserId(fromUserId, options) {
    return Invite.findAll(addFindOptions({
      where: { fromUserId: fromUserId }
    }, options));
  }

  function findByToUserId(toUserId, options) {
    return Invite.findAll(addFindOptions({
      where: { toUserId: toUserId }
    }, options));
  }

  function destroyAll(id) {
    return Invite.destroy({ where: {} });
  }

  function destroyById(id) {
    return Invite.destroy({ where: { id: id }});
  }

  Invite = sequelize.define("Invite", schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      findById: findById,
      findByTicketId: findByTicketId,
      findByFromUserId: findByFromUserId,
      findByToUserId: findByToUserId,
      destroyAll: destroyAll,
      destroyById: destroyById
    }
  });
  return Invite;
};
