'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FirstTimer extends Model {
    static associate(models) {
      // define associations here if needed
    }
  }
  
  FirstTimer.init({
    serviceDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    visitingMember: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false
    },
    heardFrom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prayerRequest: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isStudent: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    school: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'FirstTimer',
    tableName: 'first_timers'
  });

  return FirstTimer;
}; 