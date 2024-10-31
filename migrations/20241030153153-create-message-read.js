'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MessageReads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idChatMessage: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ChatMessages', // ChatMessages 테이블을 참조
          key: 'id', // id 열을 외래 키로 사용
        },
        onUpdate: 'CASCADE', // ChatMessage가 업데이트될 때 MessageRead도 업데이트
        onDelete: 'CASCADE' // ChatMessage가 삭제될 때 MessageRead도 삭제
      },
      idUser: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Users 테이블을 참조
          key: 'id', // id 열을 외래 키로 사용
        },
        onUpdate: 'CASCADE', // User가 업데이트될 때 MessageRead도 업데이트
        onDelete: 'CASCADE' // User가 삭제될 때 MessageRead도 삭제
      },
      isRead: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MessageReads');
  }
};
