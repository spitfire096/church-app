import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { sequelize } from "./models"
import firstTimerRoutes from "./routes/firstTimer"
import authRoutes from "./routes/auth"
import followUpTaskRoutes from "./routes/followUpTask"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/first-timers", firstTimerRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/follow-up-tasks", followUpTaskRoutes)

app.get("/", (req, res) => {
  res.send("FA-Backend is running")
})

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
})

