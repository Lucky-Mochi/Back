'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      isMento: {
        type: Sequelize.BOOLEAN
      },
      mentoType: {
        type: Sequelize.STRING
      },
      nickName: {
        type: Sequelize.STRING
      },
      age: {
        type: Sequelize.INTEGER
      },
      country: {
        type: Sequelize.STRING
      },
      myInfo: {
        type: Sequelize.STRING
      },
      selfAuth: {
        type: Sequelize.BOOLEAN
      },
      schoolAuth: {
        type: Sequelize.BOOLEAN
      },
      googleId: {
        type: Sequelize.STRING
      },
      subjectTag: {
        type: Sequelize.STRING
      },
      etcTag: {
        type: Sequelize.STRING
      },
      temperature: {
        type: Sequelize.INTEGER
      },
      accessToken: {
        type: Sequelize.TEXT
      },
      profileImg: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Users');
  }
};
