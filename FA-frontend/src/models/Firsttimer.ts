import { Model, DataTypes } from "sequelize"
import { sequelize } from "./index"

class FirstTimer extends Model {
  public id!: number
  public serviceDate!: Date
  public firstName!: string
  public lastName!: string
  public email!: string
  public phoneNumber!: string
  public address!: string
  public city!: string
  public visitingMember!: boolean
  public gender!: string
  public heardFrom!: string
  public prayerRequest!: string
  public isStudent!: boolean
  public school?: string
}

FirstTimer.init(
  {
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
  },
  {
    sequelize,
    tableName: "first_timers",
  },
)

export default FirstTimer

