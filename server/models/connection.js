'use strict';

module.exports = function(sequelize, DataTypes) {
  var Connection;
  var models;

  function schema() {
    return {
      grade: DataTypes.REAL,
      peerId: {
        type: DataTypes.INTEGER,
        unique: "indexConnectionsUserAndPeer"
      },
      status: DataTypes.INTEGER,
      userId: {
        type: DataTypes.INTEGER,
        unique: "indexConnectionsUserAndPeer"
      }
    }
  }

  function associate(_models) {
    models = _models;
    Connection.belongsTo(models.User, { as: "user" });
    Connection.belongsTo(models.User, { as: "peer" });
  }

  function builder() {
    var values = {
    };
    return {
      user: function(user) {
        values.userId = user.id;
        return this;
      },
      userId: function(userId) {
        values.userId = userId;
        return this;
      },
      peerId: function(peerId) {
        values.peerId = peerId;
        return this;
      },
      status: function(status) {
        values.status = status;
        return this;
      },
      build: function() {
        return Connection.create(values);
      }
    }
  }

  function destroyAll() {
    return Connection.destroy({ where: {} });
  }

  function destroyByUserAndPeerIds(userId, peerId) {
    return Connection.destroy({
      where: {
        userId: userId,
        peerId: peerId
      },
    })
  }

  function findByUserId(userId) {
    return Connection.findAll({
      where: { userId: userId },
      include: [{
        model: models.User,
        as: "peer",
        required: true
      }],
      order: [ [ "grade", "DESC" ] ]
    })
  }

  function findByUserAndPeerIds(userId, peerId) {
    return Connection.findOne({
      where: {
        userId: userId,
        peerId: peerId
      },
    })
  }

  function regrade(userId, peerId, grade) {
    return Connection.upsert({
      userId: userId,
      peerId: peerId,
      grade: grade
    })
  }

  Connection = sequelize.define("Connection", schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      destroyAll: destroyAll,
      destroyByUserAndPeerIds: destroyByUserAndPeerIds,
      findByUserId: findByUserId,
      findByUserAndPeerIds: findByUserAndPeerIds,
      regrade: regrade
    }
  })

  Connection.STATUS_BROKEN = -1;
  Connection.STATUS_TENTATIVE = 0;
  Connection.STATUS_CONFIRMED = 1;

  return Connection;
};
