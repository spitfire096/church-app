import { Model, DataTypes } from "sequelize"
import { sequelize } from "./index"
import FirstTimer from "./FirstTimer"

class FollowUpTask extends Model {
  public id!: number
  public firstTimerId!: number
  public description!: string
  public dueDate!: Date
  public completed!: boolean
}

FollowUpTask.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstTimerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: FirstTimer,
        key: "id",
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "follow_up_tasks",
  },
)

FirstTimer.hasMany(FollowUpTask)
FollowUpTask.belongsTo(FirstTimer)

export default FollowUpTask

