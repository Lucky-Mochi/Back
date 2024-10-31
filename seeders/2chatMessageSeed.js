'use strict';

const { ChatMessage } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE ChatMessages AUTO_INCREMENT = 1;');
    await queryInterface.bulkInsert('ChatMessages', [
      {
        messageContent: '안녕하세요!',
        idUser: 1, // LuckyMochi의 ID
        idChatRoom: 1, // 첫 번째 채팅방의 ID
      },
      {
        messageContent: '안녕하세요, 반갑습니다!',
        idUser: 2, // 이헌도2의 ID
        idChatRoom: 1, // 첫 번째 채팅방의 ID
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ChatMessages', null, {});
  },
};
