'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChatMessages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      messageContent: {
        type: Sequelize.STRING
      },
      idUser: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Users 테이블을 참조
          key: 'id', // id 열을 외래 키로 사용
        },
        onUpdate: 'CASCADE', // User가 업데이트될 때 ChatMessage도 업데이트
        onDelete: 'SET NULL' // User가 삭제될 때 ChatMessage의 idUser를 NULL로 설정
      },
      idChatRoom: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ChatRooms', // ChatRooms 테이블을 참조
          key: 'id', // id 열을 외래 키로 사용
        },
        onUpdate: 'CASCADE', // ChatRoom이 업데이트될 때 ChatMessage도 업데이트
        onDelete: 'CASCADE' // ChatRoom이 삭제될 때 ChatMessage도 삭제
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChatMessages');
  }
};
