'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // 1:N 관계 설정
      User.hasMany(models.ChatMessage, {
        foreignKey: 'idUser', // 외래 키
        as: 'chatMessages' // association 이름
      });
      User.hasMany(models.ChatRoom, {
        foreignKey: 'mentoId', // 멘토 외래 키
        as: 'mentorRooms' // association 이름
      });
      User.hasMany(models.ChatRoom, {
        foreignKey: 'menteeId', // 멘티 외래 키
        as: 'menteeRooms' // association 이름
      });
    }
  }
  User.init({
    isMento: DataTypes.BOOLEAN,
    mentoType: DataTypes.STRING,
    nickName: DataTypes.STRING,
    age: DataTypes.INTEGER,
    country: DataTypes.STRING,
    myInfo: DataTypes.STRING,
    selfAuth: DataTypes.BOOLEAN,
    schoolAuth: DataTypes.BOOLEAN,
    googleId: DataTypes.STRING,
    subjectTag: DataTypes.STRING,
    etcTag: DataTypes.STRING,
    temperature: DataTypes.INTEGER,
    accessToken: DataTypes.TEXT,
    profileImg: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
