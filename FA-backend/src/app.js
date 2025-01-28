const express = require('express');
const cors = require('cors');
const firstTimerRoutes = require('./routes/firstTimer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/first-timers', firstTimerRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Church App API' });
});

module.exports = app; 