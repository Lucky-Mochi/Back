'use strict';

const { ChatRoom } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE ChatRooms AUTO_INCREMENT = 1;');
    await queryInterface.bulkInsert('ChatRooms', [
      {
        matchStatus: 'unapplied', // applied(신청중) | accepted(수락됨) | declined(거절됨) | unapplied(아직신청x)
        mentoId: 1, // LuckyMochi의 ID
        menteedId: 2, // 이헌도2의 ID
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        matchStatus: 'unapplied', // applied(신청중) | accepted(수락됨) | declined(거절됨) | unapplied(아직신청x)
        mentoId: 2, // 이헌도2의 ID
        menteedId: 1, // LuckyMochi의 ID
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ChatRooms', null, {});
  },
};
