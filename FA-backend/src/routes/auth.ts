'use strict';

import express from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { auth } from '../middleware/auth'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const user = await User.create(req.body)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!)
    res.status(201).json({ user, token })
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })

    if (!user || !(await user.validatePassword(password))) {
      throw new Error()
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!)
    res.json({ user, token })
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

// Get current user
router.get('/me', auth, (req: any, res) => {
  res.json(req.user)
})

export default router

