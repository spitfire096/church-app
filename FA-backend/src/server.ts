'use strict';

import express from 'express'
import cors from 'cors'
import { findAvailablePort } from './utils/portConfig'
import { logger } from './utils/logger'
import { sequelize } from './config/database'
import { models } from './models'
import firstTimerRoutes from './routes/firstTimer'
import authRoutes from './routes/auth'
import followUpTaskRoutes from './routes/followUpTask'

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

app.use("/api/first-timers", firstTimerRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/follow-up-tasks", followUpTaskRoutes)

app.get("/health", (req, res) => {
  res.json({ status: 'healthy' });
})

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Sync database (in development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced successfully');
    }

    const port = await findAvailablePort(parseInt(process.env.PORT || '5000'));
    
    app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`Health check available at http://localhost:${port}/health`);
      
      // Update the port in environment for other parts of the application
      process.env.CURRENT_PORT = port.toString();
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

