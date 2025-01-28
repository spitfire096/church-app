const express = require('express');
const router = express.Router();
const db = require('../models/index');
const FirstTimer = db.FirstTimer;

// GET all first timers
router.get('/', async (req, res) => {
  try {
    const firstTimers = await FirstTimer.findAll();
    res.json(firstTimers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single first timer by ID
router.get('/:id', async (req, res) => {
  try {
    const firstTimer = await FirstTimer.findByPk(req.params.id);
    if (!firstTimer) {
      return res.status(404).json({ message: 'First timer not found' });
    }
    res.json(firstTimer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new first timer
router.post('/', async (req, res) => {
  try {
    const firstTimer = await FirstTimer.create(req.body);
    res.status(201).json(firstTimer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update first timer
router.put('/:id', async (req, res) => {
  try {
    const firstTimer = await FirstTimer.findByPk(req.params.id);
    if (!firstTimer) {
      return res.status(404).json({ message: 'First timer not found' });
    }
    await firstTimer.update(req.body);
    res.json(firstTimer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE first timer
router.delete('/:id', async (req, res) => {
  try {
    const firstTimer = await FirstTimer.findByPk(req.params.id);
    if (!firstTimer) {
      return res.status(404).json({ message: 'First timer not found' });
    }
    await firstTimer.destroy();
    res.json({ message: 'First timer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 