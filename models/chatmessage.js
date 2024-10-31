'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    static associate(models) {
      // N:1 관계 설정
      ChatMessage.belongsTo(models.User, {
        foreignKey: 'idUser', // 외래 키
        as: 'user' // association 이름
      });
      ChatMessage.belongsTo(models.ChatRoom, {
        foreignKey: 'idChatRoom', // 외래 키
        as: 'chatRoom' // association 이름
      });
    }
  }
  ChatMessage.init({
    messageContent: DataTypes.STRING,
    idUser: DataTypes.INTEGER,
    idChatRoom: DataTypes.INTEGER,
    isRead: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ChatMessage',
  });
  return ChatMessage;
};
