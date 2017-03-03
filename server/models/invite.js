'use strict';
module.exports = function(sequelize, DataTypes) {
  var Invite;
  var models;

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

  function findById(id) {
    var query = {
      where: { id: id }
    };
    return Invite.findOne(query);
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
      destroyAll: destroyAll,
      destroyById: destroyById
    }
  });
  return Invite;
};
