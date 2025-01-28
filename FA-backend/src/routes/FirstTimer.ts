'use strict';

import express from 'express';
import { FirstTimer, FollowUpTask } from '../models';
import { auth, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all first-timers (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const firstTimers = await FirstTimer.findAndCountAll({
      limit,
      offset,
      include: ['followUpTasks'],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      firstTimers: firstTimers.rows,
      total: firstTimers.count,
      currentPage: page,
      totalPages: Math.ceil(firstTimers.count / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch first-timers' });
  }
});

// Get single first-timer
router.get('/:id', auth, async (req, res) => {
  try {
    const firstTimer = await FirstTimer.findByPk(req.params.id, {
      include: ['followUpTasks'],
    });

    if (!firstTimer) {
      return res.status(404).json({ error: 'First-timer not found' });
    }

    res.json(firstTimer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch first-timer' });
  }
});

// Create first-timer
router.post('/', auth, async (req, res) => {
  try {
    const firstTimer = await FirstTimer.create(req.body);
    
    // Automatically create initial follow-up task
    await FollowUpTask.create({
      firstTimerId: firstTimer.id,
      status: 'pending',
      notes: 'Initial follow-up required',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    });

    const newFirstTimer = await FirstTimer.findByPk(firstTimer.id, {
      include: ['followUpTasks'],
    });

    res.status(201).json(newFirstTimer);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create first-timer' });
  }
});

// Update first-timer
router.put('/:id', auth, async (req, res) => {
  try {
    const firstTimer = await FirstTimer.findByPk(req.params.id);

    if (!firstTimer) {
      return res.status(404).json({ error: 'First-timer not found' });
    }

    await firstTimer.update(req.body);
    
    const updatedFirstTimer = await FirstTimer.findByPk(req.params.id, {
      include: ['followUpTasks'],
    });

    res.json(updatedFirstTimer);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update first-timer' });
  }
});

// Delete first-timer
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const firstTimer = await FirstTimer.findByPk(req.params.id);

    if (!firstTimer) {
      return res.status(404).json({ error: 'First-timer not found' });
    }

    await firstTimer.destroy();
    res.json({ message: 'First-timer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete first-timer' });
  }
});

// Add follow-up task
router.post('/:id/follow-up', auth, async (req, res) => {
  try {
    const firstTimer = await FirstTimer.findByPk(req.params.id);

    if (!firstTimer) {
      return res.status(404).json({ error: 'First-timer not found' });
    }

    const followUpTask = await FollowUpTask.create({
      ...req.body,
      firstTimerId: firstTimer.id,
    });

    res.status(201).json(followUpTask);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create follow-up task' });
  }
});

export default router;

