'use strict';

module.exports = function(sequelize, DataTypes) {
  var Connection;
  var models;

  function schema() {
    return {
      grade: DataTypes.REAL,
      status: DataTypes.INTEGER
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

  function findByPeerId(peerId) {
    return Connection.findAll({
      where: { peerId: peerId },
      include: [{
        model: models.User,
        as: "user",
        required: true
      }],
      order: [ [ "grade", "DESC" ] ]
    })
  }

  Connection = sequelize.define("Connection", schema(), {
    classMethods: {
      associate: associate,
      builder: builder,
      findByUserId: findByUserId
    }
  })

  Connection.STATUS_BROKEN = -1;
  Connection.STATUS_TENTATIVE = 0;
  Connection.STATUS_CONFIRMED = 1;

  return Connection;
};
