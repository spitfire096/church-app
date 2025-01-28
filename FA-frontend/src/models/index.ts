import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DIALECT } = process.env

export const sequelize = new Sequelize(DB_NAME!, DB_USER!, DB_PASSWORD!, {
  host: DB_HOST,
  port: parseInt(DB_PORT || '5432'),
  dialect: DB_DIALECT as 'postgres',
  logging: false,
})