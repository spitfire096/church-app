import express from "express"
import FollowUpTask from "../models/FollowUpTask"
import { authMiddleware } from "../middleware/auth"

const router = express.Router()

router.use(authMiddleware)

router.post("/", async (req, res) => {
  try {
    const task = await FollowUpTask.create(req.body)
    res.status(201).json(task)
  } catch (error) {
    res.status(400).json({ error: "Failed to create follow-up task" })
  }
})

router.get("/", async (req, res) => {
  try {
    const tasks = await FollowUpTask.findAll()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch follow-up tasks" })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const [updated] = await FollowUpTask.update(req.body, {
      where: { id: req.params.id },
    })
    if (updated) {
      const updatedTask = await FollowUpTask.findByPk(req.params.id)
      res.json(updatedTask)
    } else {
      res.status(404).json({ error: "Follow-up task not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update follow-up task" })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await FollowUpTask.destroy({
      where: { id: req.params.id },
    })
    if (deleted) {
      res.status(204).send()
    } else {
      res.status(404).json({ error: "Follow-up task not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete follow-up task" })
  }
})

export default router

