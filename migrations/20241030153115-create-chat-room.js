'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChatRooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      matchStatus: {
        type: Sequelize.STRING,
        defaultValue: 'unapplied', // applied(신청중) | accepted(수락됨) | declined(거절됨) | unapplied(아직신청x)
      },
      mentoId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Users 테이블을 참조
          key: 'id', // id 열을 외래 키로 사용
        },
        onUpdate: 'CASCADE', // User가 업데이트될 때 ChatRoom도 업데이트
        onDelete: 'CASCADE' // User가 삭제될 때 ChatRoom도 삭제
      },
      menteeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Users 테이블을 참조
          key: 'id', // id 열을 외래 키로 사용
        },
        onUpdate: 'CASCADE', // User가 업데이트될 때 ChatRoom도 업데이트
        onDelete: 'CASCADE' // User가 삭제될 때 ChatRoom도 삭제
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('Now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('Now'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChatRooms');
  }
};
