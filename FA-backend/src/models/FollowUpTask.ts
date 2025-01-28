'use strict';

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class FollowUpTask extends Model {
  public id!: number;
  public firstTimerId!: number;
  public status!: 'pending' | 'in_progress' | 'completed';
  public notes?: string;
  public assignedTo?: string;
  public dueDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FollowUpTask.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstTimerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'FollowUpTask',
    tableName: 'follow_up_tasks',
  }
);

