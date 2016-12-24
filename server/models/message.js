'use strict';
module.exports = function(sequelize, DataTypes) {
  const extend = require("extend");

  var Message = sequelize.define('Message', {
    type: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Message.belongsTo(models.User, { as: "toUser" });
        Message.belongsTo(models.User, { as: "fromUser" });
        Message.belongsTo(models.Asset, { as: "asset" });
      },
      findById: function(id, options) {
        return Message.find(extend({ where: { id: id } }, options));
      },
      findByFromUserId: function(fromUserId, options) {
        return Message.findAll(extend({ where: { fromUserId: fromUserId } }, options));
      },
      findByToUserId: function(toUserId, options) {
        return Message.findAll(extend({ where: { toUserId: toUserId } }, options));
      },
      destroyById: function(id) {
        return Message.destroy({ where: { id: id } });
      },
      destroyAll: function() {
        return Message.destroy({ where: {} });
      }
    }
  });

  return Message;
};
