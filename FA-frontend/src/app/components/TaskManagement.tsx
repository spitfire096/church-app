'use strict';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: string;
  firstTimerId?: number;
  createdAt: string;
  updatedAt: string;
}

const STATUSES = {
  todo: { label: 'To Do', color: 'bg-gray-100' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100' },
  completed: { label: 'Completed', color: 'bg-green-100' },
};

export default function TaskManagement() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
  });

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await api.tasks.list(filter);
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    try {
      const updatedTask = await api.tasks.updateStatus(
        parseInt(draggableId),
        destination.droppableId as Task['status']
      );

      setTasks(current =>
        current.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleTaskUpdate = async (task: Task) => {
    try {
      const updated = await api.tasks.update(task.id, task);
      setTasks(current =>
        current.map(t => t.id === updated.id ? updated : t)
      );
      setEditingTask(null);
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleTaskCreate = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await api.tasks.create(task);
      setTasks(current => [...current, created]);
      setEditingTask(null);
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Task Management</h2>
        <button
          onClick={() => setEditingTask({
            id: 0,
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            dueDate: new Date().toISOString().split('T')[0],
            assignedTo: session?.user?.email || '',
            createdAt: '',
            updatedAt: '',
          })}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUSES).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={filter.assignee}
          onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Assignees</option>
          <option value="me">My Tasks</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(STATUSES).map(([status, { label, color }]) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${color} p-4 rounded-lg min-h-[500px]`}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{label}</h3>
                    <div className="space-y-4">
                      {getTasksByStatus(status as Task['status']).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 rounded-md shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                                  <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  {
                                    low: 'bg-gray-100 text-gray-800',
                                    medium: 'bg-yellow-100 text-yellow-800',
                                    high: 'bg-red-100 text-red-800',
                                  }[task.priority]
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTask.id === 0 ? 'New Task' : 'Edit Task'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingTask.id === 0) {
                handleTaskCreate(editingTask);
              } else {
                handleTaskUpdate(editingTask);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      title: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      description: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({
                        ...editingTask,
                        priority: e.target.value as Task['priority']
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={editingTask.dueDate.split('T')[0]}
                      onChange={(e) => setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingTask.id === 0 ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 