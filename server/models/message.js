'use strict';
module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define('Message', {
    type: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Message.belongsTo(models.User, { as: "sender" });
        Message.belongsTo(models.User, { as: "recipient" });
        Message.belongsTo(models.Asset);
      }
    }
  });
  return Message;
};
