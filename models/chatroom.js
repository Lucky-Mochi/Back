'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
      // N:1 관계 설정
      ChatRoom.belongsTo(models.User, {
        foreignKey: 'mentoId', // 멘토 외래 키
        as: 'mentor' // 멘토 association 이름
      });
      ChatRoom.belongsTo(models.User, {
        foreignKey: 'menteeId', // 멘티 외래 키
        as: 'mentee' // 멘티 association 이름
      });
      ChatRoom.hasMany(models.ChatMessage, {
        foreignKey: 'idChatRoom', // 외래 키
        as: 'messages' // 채팅 메시지 association 이름
      });
    }
  }
  ChatRoom.init({
    matchStatus: DataTypes.STRING,
    mentoId: DataTypes.INTEGER,
    menteeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ChatRoom',
  });
  return ChatRoom;
};
