'use strict';

import FirstTimer from './FirstTimer';
import FollowUpTask from './FollowUpTask';

export function initializeAssociations() {
  // Define associations
  FirstTimer.hasMany(FollowUpTask, {
    sourceKey: 'id',
    foreignKey: 'firstTimerId',
    as: 'followUpTasks',
  });

  FollowUpTask.belongsTo(FirstTimer, {
    targetKey: 'id',
    foreignKey: 'firstTimerId',
    as: 'firstTimer',
  });
} 