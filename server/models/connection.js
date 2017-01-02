'use strict';

module.exports = function(sequelize, DataTypes) {
  var Connection;
  var models;

  const LIMIT = 10;

  function schema() {
    return {
      grade: DataTypes.REAL
    }
  }

  function associate(_models) {
    models = _models;
    Connection.belongsTo(models.User, { as: "user" });
    Connection.belongsTo(models.User, { as: "peer" });
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

  Connection = sequelize.define("Connection", schema(), {
    classMethods: {
      associate: associate,
      findByUserId: findByUserId
    }
  })

  return Connection;
};
