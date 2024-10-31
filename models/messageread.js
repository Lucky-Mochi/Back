'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MessageRead extends Model {
    static associate(models) {
      // N:1 관계 설정
      MessageRead.belongsTo(models.ChatMessage, {
        foreignKey: 'idChatMessage', // 외래 키
        as: 'chatMessage' // association 이름
      });
      MessageRead.belongsTo(models.User, {
        foreignKey: 'idUser', // 외래 키
        as: 'user' // association 이름
      });
    }
  }
  MessageRead.init({
    idChatMessage: DataTypes.INTEGER,
    idUser: DataTypes.INTEGER,
    isRead: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MessageRead',
  });
  return MessageRead;
};
