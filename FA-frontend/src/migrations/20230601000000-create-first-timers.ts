import { type QueryInterface, DataTypes } from "sequelize"

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("first_timers", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      serviceDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      visitingMember: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      heardFrom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prayerRequest: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isStudent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      school: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    })
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("first_timers")
  },
}

