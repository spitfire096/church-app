import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"

interface FollowUpTask {
  id: number
  firstTimerId: number
  description: string
  dueDate: string
  completed: boolean
}

const FollowUpTasks: React.FC = () => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([])
  const [newTask, setNewTask] = useState({ firstTimerId: "", description: "", dueDate: "" })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/follow-up-tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setTasks(response.data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const handleNewTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/follow-up-tasks`, newTask, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setNewTask({ firstTimerId: "", description: "", dueDate: "" })
      fetchTasks()
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const handleTaskCompletion = async (id: number, completed: boolean) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/follow-up-tasks/${id}`,
        { completed },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      fetchTasks()
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Follow-up Tasks</h2>
      <form onSubmit={handleNewTaskSubmit} className="mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstTimerId">
            First Timer ID
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="firstTimerId"
            type="number"
            value={newTask.firstTimerId}
            onChange={(e) => setNewTask({ ...newTask, firstTimerId: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            type="text"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
            Due Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="dueDate"
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            required
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Add Task
        </button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="mb-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleTaskCompletion(task.id, !task.completed)}
              className="mr-2"
            />
            <span className={task.completed ? "line-through" : ""}>
              {task.description} - Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FollowUpTasks

