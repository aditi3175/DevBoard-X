"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"

import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"

export default function ProjectDetailsPage() {

  const router = useRouter()
  const params = useParams()

  const { theme } = useTheme()
  const { projects, setProjects } = useProjects()

  const projectIndex = Number(params.id)

  const project = projects[projectIndex]

  const [taskTitle, setTaskTitle] = useState("")
  const [priority, setPriority] = useState("Medium")

  const [dueDate, setDueDate] = useState("")
  const [editTaskIndex, setEditTaskIndex] = useState(null)
  const [filter, setFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Newest")

  if (!project) {

    return (

      <div
        className={`min-h-screen p-6 ${
          theme === "dark"
            ? "bg-zinc-950 text-white"
            : "bg-white text-black"
        }`}
      >
        <h1 className="text-3xl font-bold">
          Project Not Found
        </h1>
      </div>
    )
  }

  const handleAddTask = () => {

    if (!taskTitle.trim()) return

    const updatedProjects = [...projects]

    if (!updatedProjects[projectIndex].tasks) {
     updatedProjects[projectIndex].tasks = []
    }

    if (editTaskIndex !== null) {

      updatedProjects[projectIndex].tasks[
        editTaskIndex
      ] = {
        ...updatedProjects[projectIndex]
          .tasks[editTaskIndex],
        title: taskTitle,
        priority,
        dueDate,
        files: [{
          name: "index.js",
          code: "",
          output: ""
        }
      ]
      }

      setProjects(updatedProjects)

      setEditTaskIndex(null)
      setTaskTitle("")
      setPriority("Medium")
      setDueDate("")

    }

    else {
      updatedProjects[projectIndex].tasks.push({
        title: taskTitle,
        completed: false,
        priority,
        dueDate
      })
    }

    setProjects(updatedProjects)

    setTaskTitle("")
    setPriority("Medium")
    setDueDate("")

  }

  const handleToggleTask = (taskIndex) => {

    const updatedProjects = [...projects]

    updatedProjects[projectIndex].tasks[taskIndex].completed =
      !updatedProjects[projectIndex].tasks[taskIndex].completed

    setProjects(updatedProjects)

  }

  const handleEditTask = (index) => {
    const task =
      project.tasks[index]

    setTaskTitle(task.title)
    setPriority(task.priority)
    setDueDate(task.dueDate)
    setEditTaskIndex(index)

  }

  const handleDeleteTask = (taskIndex) => {

    const updatedProjects = [...projects]

    updatedProjects[projectIndex].tasks =
      updatedProjects[projectIndex].tasks.filter(
        (_, index) => index !== taskIndex
      )

    setProjects(updatedProjects)

  }

  const completedTasks =
    project.tasks.filter((task) => task.completed).length

  const totalTasks = project.tasks.length

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100)
  
  const filteredTasks =
    project.tasks
      .filter((task) => {

        if (filter === "Pending") {
          return !task.completed
        }

        if (filter === "Completed") {
          return task.completed
        }

        return true

      })
      .sort((a, b) => {

        if (sortBy === "Priority") {

          const priorities = {
            High: 3,
            Medium: 2,
            Low: 1
          }

          return (
            priorities[b.priority] -
            priorities[a.priority]
          )

        }

        if (sortBy === "Due Date") {

          if (!a.dueDate) return 1
          if (!b.dueDate) return -1

          return (
            new Date(a.dueDate) -
            new Date(b.dueDate)
          )

        }

        return 0

      })

  return (

    <div
      className={`min-h-screen p-6 ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
      }`}
    >

      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/projects")}
        className={`mb-8 flex items-center gap-2 px-4 py-2 rounded-xl ${
          theme === "dark"
            ? "bg-zinc-900 hover:bg-zinc-800"
            : "bg-zinc-100 hover:bg-zinc-200"
        }`}
      >

        <ArrowLeft size={18} />

        Back

      </button>

      {/* PROJECT INFO */}
      <h1 className="text-4xl font-bold">
        {project.title}
      </h1>

      <p
        className={`mt-3 ${
          theme === "dark"
            ? "text-zinc-400"
            : "text-zinc-600"
        }`}
      >
        {project.description}
      </p>

      <div className="mt-6">

        <p className="mb-2">
          <strong>Status:</strong> {project.status}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">

          {project.techStack.map((tech, index) => (

            <span
              key={index}
              className={`px-3 py-1 rounded-lg text-sm ${
                theme === "dark"
                  ? "bg-zinc-800"
                  : "bg-zinc-200"
              }`}
            >
              {tech}
            </span>

          ))}

        </div>

      </div>

      {/* TASK SECTION */}
      <div
        className={`mt-10 border rounded-2xl p-5 ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
        }`}
      >

        <h2 className="text-2xl font-semibold mb-4">
          Tasks
        </h2>

        {/* TASK INPUT */}
        <div className="flex gap-3 mb-6">

          <input
            type="text"
            value={taskTitle}
            onChange={(e) =>
              setTaskTitle(e.target.value)
            }
            placeholder="Enter task..."
            className={`flex-1 px-4 py-3 rounded-xl border outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
            className={`px-4 py-3 rounded-xl border ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          >

            <option>Low</option>
            <option>Medium</option>
            <option>High</option>

          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
            className={`px-4 py-3 rounded-xl border ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          />

          <div className="flex gap-3">

            <button
              onClick={handleAddTask}
              className="px-5 py-3 rounded-xl bg-green-500 text-white"
            >
              {
                editTaskIndex !== null
                  ? "Update Task"
                  : "Add Task"
              }
            </button>

            {
              editTaskIndex !== null && (

                <button
                  onClick={() => {

                    setEditTaskIndex(null)
                    setTaskTitle("")
                    setPriority("Medium")
                    setDueDate("")

                  }}
                  className="px-5 py-3 rounded-xl bg-zinc-700 text-white"
                >
                  Cancel
                </button>

              )
            }

          </div>

        </div>

        {/* PROGRESS */}
        <div className="mb-6">

          <div className="flex justify-between mb-2">

            <span>
              Progress
            </span>

            <span>
              {progress}%
            </span>

          </div>

          <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">

            <div
              className="h-full bg-green-500"
              style={{
                width: `${progress}%`
              }}
            />

          </div>

          <p className="mt-2 text-sm text-zinc-400">
            {completedTasks} / {totalTasks} Tasks Completed
          </p>

        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter("All")}
            className={`px-4 py-2 rounded-xl transition ${
              filter === "All"
                ? "bg-blue-500 text-white"
                : theme === "dark"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-200 text-black"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("Pending")}
            className={`px-4 py-2 rounded-xl transition ${
              filter === "Pending"
                ? "bg-yellow-500 text-white"
                : theme === "dark"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-200 text-black"
            }`}
          >
            Pending
          </button>

          <button
            onClick={() => setFilter("Completed")}
            className={`px-4 py-2 rounded-xl transition ${
              filter === "Completed"
                ? "bg-green-500 text-white"
                : theme === "dark"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-200 text-black" 
            }`}
          >
            Completed
          </button>

        </div>

        <div className="mb-6">

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
            className={`px-4 py-2 rounded-xl border ${
              theme === "dark"
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          >
            <option>Priority</option>
            <option>Due Date</option>

          </select>

        </div>

        {/* TASK LIST */}
        <div className="space-y-3">

          {filteredTasks.map((task, index) => (

            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-xl ${
                theme === "dark"
                  ? "bg-zinc-950"
                  : "bg-white"
              }`}
            >

              <div className="flex items-center gap-3">

                {/* PRIORITY BADGE FIRST */}
                <span
                  className={`w-20 text-center px-2 py-1 text-xs rounded-full font-medium ${
                    task.priority === "High"
                      ? "bg-red-500/20 text-red-400"
                      : task.priority === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {task.priority}
                </span>

                {/* CHECKBOX */}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() =>
                    handleToggleTask(index)
                  }
                />

                {/* TASK CONTENT */}
                <div
                  className={
                    task.completed
                      ? "line-through text-zinc-500"
                      : ""
                  }
                >
                  <p
                    onClick={() =>
                      router.push(
                        `/projects/${projectIndex}/tasks/${index}`
                      )
                    }
                    className="cursor-pointer font-medium"
                  >
                    {task.title}
                  </p>

                  <p
                    className={`text-xs mt-1 ${
                      theme === "dark"
                        ? "text-zinc-500"
                        : "text-zinc-600"
                    }`}
                  >

                    {
                      task.dueDate &&
                      new Date(task.dueDate).setHours(23,59,59,999) < Date.now() &&
                      !task.completed
                        ? "🔴 Overdue"
                        : task.dueDate
                        ? `Due ${new Date(task.dueDate).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            }
                          )}`
                        : "No deadline"
                    }

                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => handleEditTask(index)} className="text-blue-400 hover:text-blue-300">Edit</button>
                <button onClick={() => handleDeleteTask(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  )

}