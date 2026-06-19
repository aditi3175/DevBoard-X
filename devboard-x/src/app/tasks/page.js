"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Trash2,
  Pencil
} from "lucide-react"

import { useRouter } from "next/navigation"
import { useTheme } from "@/context/ThemeContext"

export default function TasksPage() {

  const router = useRouter()
  const { theme } = useTheme()

  const [title, setTitle] = useState("")
  const [project, setProject] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [search, setSearch] = useState("")

  const [tasks, setTasks] = useState([])
  const [editIndex, setEditIndex] = useState(null)

  // LOAD TASKS
  useEffect(() => {

    const savedTasks =
      localStorage.getItem("devboard-tasks")

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }

  }, [])

  // SAVE TASKS
  useEffect(() => {

    localStorage.setItem(
      "devboard-tasks",
      JSON.stringify(tasks)
    )

  }, [tasks])

  // ADD / UPDATE TASK
  const handleSaveTask = () => {

    if (
      !title.trim() ||
      !project.trim() ||
      !status ||
      !priority
    ) {
      alert("Please fill all fields")
      return
    }

    if (editIndex !== null) {

      const updatedTasks = [...tasks]

      updatedTasks[editIndex] = {
        title,
        project,
        status,
        priority,
        createdAt:
          tasks[editIndex].createdAt
      }

      setTasks(updatedTasks)

      setEditIndex(null)

    }

    else {

      const newTask = {
        title,
        project,
        status,
        priority,
        createdAt:
          new Date().toLocaleDateString()
      }

      setTasks([
        newTask,
        ...tasks
      ])

    }

    setTitle("")
    setProject("")
    setStatus("")
    setPriority("")

  }

  // DELETE TASK
  const handleDeleteTask = (index) => {

    const updatedTasks =
      tasks.filter((_, i) => i !== index)

    setTasks(updatedTasks)

  }

  // EDIT TASK
  const handleEditTask = (index) => {

    const task = tasks[index]

    setTitle(task.title)
    setProject(task.project)
    setStatus(task.status)
    setPriority(task.priority)

    setEditIndex(index)

  }

  // SEARCH
  const filteredTasks = tasks.filter((task) =>
    task.title
      .toLowerCase()
      .includes(search.toLowerCase())
    ||
    task.project
      .toLowerCase()
      .includes(search.toLowerCase())
    ||
    task.status
      .toLowerCase()
      .includes(search.toLowerCase())
    ||
    task.priority
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (

    <div
      className={`min-h-screen p-6 transition ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
      }`}
    >

      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/")}
        className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-xl transition ${
          theme === "dark"
            ? "bg-zinc-900 hover:bg-zinc-800 text-white"
            : "bg-zinc-100 hover:bg-zinc-200 text-black"
        }`}
      >

        <ArrowLeft size={18} />

        Back

      </button>

      {/* HEADER */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Tasks
        </h1>

        <p
          className={`mt-2 ${
            theme === "dark"
              ? "text-zinc-500"
              : "text-zinc-600"
          }`}
        >
          Manage your development workflow.
        </p>

      </div>

      {/* FORM */}
      <div
        className={`border rounded-2xl p-5 mb-8 ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
        }`}
      >

        <h2 className="text-2xl font-semibold mb-5">

          {
            editIndex !== null
              ? "Edit Task"
              : "Add New Task"
          }

        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className={`w-full border rounded-xl px-4 py-3 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          />

          <input
            type="text"
            placeholder="Project name"
            value={project}
            onChange={(e) =>
              setProject(e.target.value)
            }
            className={`w-full border rounded-xl px-4 py-3 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className={`w-full border rounded-xl px-4 py-3 ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          >

            <option value="" disabled>
              Select Status
            </option>

            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>

          </select>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
            className={`w-full border rounded-xl px-4 py-3 ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          >

            <option value="" disabled>
              Select Priority
            </option>

            <option>Low</option>
            <option>Medium</option>
            <option>High</option>

          </select>

          <button
            onClick={handleSaveTask}
            className={`px-5 py-3 rounded-xl font-medium ${
              theme === "dark"
                ? "bg-white text-black"
                : "bg-black text-white"
            }`}
          >

            {
              editIndex !== null
                ? "Update Task"
                : "Save Task"
            }

          </button>

        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-6">

        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className={`w-full max-w-md border rounded-xl px-4 py-3 ${
            theme === "dark"
              ? "bg-zinc-900 border-zinc-800"
              : "bg-white border-zinc-300"
          }`}
        />

      </div>

      {/* EMPTY STATE */}
      {filteredTasks.length === 0 && (

        <div
          className={`border rounded-2xl p-10 text-center ${
            theme === "dark"
              ? "bg-zinc-900 border-zinc-800"
              : "bg-zinc-100 border-zinc-300"
          }`}
        >

          <h3 className="text-xl font-semibold">
            No Tasks Found
          </h3>

          <p className="mt-2 text-zinc-500">
            Create your first task.
          </p>

        </div>

      )}

      {/* TASKS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {filteredTasks.map((task, index) => (

          <div
            key={index}
            className={`border rounded-2xl p-5 ${
              theme === "dark"
                ? "bg-zinc-900 border-zinc-800"
                : "bg-zinc-100 border-zinc-300"
            }`}
          >

            <div className="flex justify-between">

              <div>

                <h3 className="text-xl font-semibold">
                  {task.title}
                </h3>

                <p className="mt-2">
                  Project: {task.project}
                </p>

                <div className="flex gap-2 mt-3">

                  <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                    {task.status}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                    {task.priority}
                  </span>

                </div>

              </div>

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    handleEditTask(index)
                  }
                  className="text-blue-400"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() =>
                    handleDeleteTask(index)
                  }
                  className="text-red-400"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>

            <p className="text-xs mt-4 text-zinc-500">
              Created: {task.createdAt}
            </p>

          </div>

        ))}

      </div>

    </div>

  )

}