'use strict';
module.exports = function(sequelize, DataTypes) {
  var Announcement;
  var models;

  const LIMIT = 10;

  function schema() {
    return {
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE
    }
  }

  function associate(_models) {
    models = _models;
    Announcement.belongsTo(models.Asset, { as: "asset" });
    Announcement.belongsTo(models.User, { as: "creator" });
  }

  function findById(id) {
    return Announcement.findOne({ where: { id: id } });
  }

  function findCurrent() {
    var date = new Date();
    return Announcement.findAll({
      where: {
        startDate: { "$lte": date },
        endDate: { "$gt": date }
      },
      include: [
        models.Asset.includeMe(),
        models.User.includeMe("creator")
      ],
      limit: LIMIT,
      order: [ [ "startDate", "DESC" ] ]
    });
  }

  function destroyAll() {
    return Announcement.destroy({ where: {} });
  }

  function destroyById(id) {
    return Announcement.destroy({ where: { id: id } });
  }

  Announcement = sequelize.define("Announcement", schema(), {
    classMethods: {
      associate: associate,
      destroyAll: destroyAll,
      destroyById: destroyById,
      findById: findById,
      findCurrent: findCurrent
    }
  });

  return Announcement;
};
