'use strict';

import { FirstTimer } from './FirstTimer';
import { FollowUpTask } from './FollowUpTask';
import { User } from './User';
import { sequelize } from '../config/database';

// Define associations
export function initializeModels() {
  FirstTimer.hasMany(FollowUpTask, {
    foreignKey: 'firstTimerId',
    as: 'followUpTasks',
  });

  FollowUpTask.belongsTo(FirstTimer, {
    foreignKey: 'firstTimerId',
    as: 'firstTimer',
  });

  // Add User associations if needed
  User.hasMany(FollowUpTask, {
    foreignKey: 'assignedTo',
    as: 'tasks',
  });

  return {
    sequelize,
    FirstTimer,
    FollowUpTask,
    User,
  };
}

export const models = initializeModels();

