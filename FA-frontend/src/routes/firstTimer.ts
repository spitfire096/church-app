import express from "express"
import FirstTimer from "../models/FirstTimer"
import { sendEmail } from "../utils/emailService"

const router = express.Router()

// Create a new first timer
router.post("/", async (req, res) => {
  try {
    const firstTimer = await FirstTimer.create(req.body)

    // Send email notification
    await sendEmail(
      process.env.ADMIN_EMAIL!,
      "New First Timer Registered",
      `A new first timer has registered:\n\nName: ${firstTimer.firstName} ${firstTimer.lastName}\nEmail: ${firstTimer.email}`,
    )

    res.status(201).json(firstTimer)
  } catch (error) {
    res.status(400).json({ error: "Failed to create first timer" })
  }
})

// Get all first timers
router.get("/", async (req, res) => {
  try {
    const firstTimers = await FirstTimer.findAll()
    res.json(firstTimers)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch first timers" })
  }
})

// Get a specific first timer
router.get("/:id", async (req, res) => {
  try {
    const firstTimer = await FirstTimer.findByPk(req.params.id)
    if (firstTimer) {
      res.json(firstTimer)
    } else {
      res.status(404).json({ error: "First timer not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch first timer" })
  }
})

// Update a first timer
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await FirstTimer.update(req.body, {
      where: { id: req.params.id },
    })
    if (updated) {
      const updatedFirstTimer = await FirstTimer.findByPk(req.params.id)
      res.json(updatedFirstTimer)
    } else {
      res.status(404).json({ error: "First timer not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update first timer" })
  }
})

// Delete a first timer
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await FirstTimer.destroy({
      where: { id: req.params.id },
    })
    if (deleted) {
      res.status(204).send()
    } else {
      res.status(404).json({ error: "First timer not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete first timer" })
  }
})

export default router

