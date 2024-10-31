'use strict';

const { MessageRead } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE MessageReads AUTO_INCREMENT = 1;');
    await queryInterface.bulkInsert('MessageReads', [
      {
        idChatMessage: 1, // 첫 번째 채팅 메시지의 ID
        idUser: 2, // LuckyMochi의 ID
        isRead: false,
      },
      {
        idChatMessage: 2, // 두 번째 채팅 메시지의 ID
        idUser: 1, // 이헌도2의 ID
        isRead: false,
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('MessageReads', null, {});
  },
};
