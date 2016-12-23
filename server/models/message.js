'use strict';
module.exports = function(sequelize, DataTypes) {
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
      findById: function(id) {
        return Message.find({ where: { id: id } })
      },
      destroyById: function(id) {
        return Message.destroy({ where: { id: id } })
      },
      destroyAll: function() {
        return Message.destroy({ where: {} })
      }
    }
  });
  return Message;
};
