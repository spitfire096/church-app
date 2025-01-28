'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("first_timers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      serviceDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      visitingMember: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      heardFrom: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      prayerRequest: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isStudent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      school: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("first_timers");
  }
};

