import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User"

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.create({ username, password })
    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    res.status(400).json({ error: "Failed to register user" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ where: { username } })

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "1d" })
    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: "Login failed" })
  }
})

export default router

