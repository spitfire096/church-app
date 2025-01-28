import { Model, DataTypes } from "sequelize"
import { sequelize } from "./index"
import bcrypt from "bcrypt"

class User extends Model {
  public id!: number
  public username!: string
  public password!: string

  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    hooks: {
      beforeCreate: async (user: User) => {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      },
    },
  },
)

export default User

