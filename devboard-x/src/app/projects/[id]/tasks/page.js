"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"
import ProjectHeader from "@/components/project/ProjectHeader"
import ProjectSubNav from "@/components/project/ProjectSubNav"
import {
  ACTIVITY_TYPES,
  appendProjectActivity,
  buildActivityEntry
} from "@/utils/projectActivity"
import { useActivity } from "@/context/ActivityContext"
import { getTemplateFiles } from "../starterTemplates"

const getFilePaths = (nodes, parentPath = "") => {
  if (!nodes) return []
  let paths = []
  nodes.forEach((node) => {
    const currentPath = `${parentPath}/${node.name}`
    if (!node.isFolder) {
      paths.push(currentPath)
    } else if (node.children) {
      paths = [...paths, ...getFilePaths(node.children, currentPath)]
    }
  })
  return paths
}

export default function ProjectTasksPage() {
  const router = useRouter()
  const params = useParams()

  const { theme } = useTheme()
  const { projects, setProjects } = useProjects()
  const { logActivity } = useActivity()

  const projectIndex = Number(params.id)
  const project = projects[projectIndex]

  const [taskTitle, setTaskTitle] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [dueDate, setDueDate] = useState("")
  const [editTaskIndex, setEditTaskIndex] = useState(null)
  const [filter, setFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Newest")
  const [projectTemplate, setProjectTemplate] = useState("HTML")

  if (!project) {
    return (
      <div
        className={`min-h-screen p-6 ${
          theme === "dark"
            ? "bg-zinc-950 text-white"
            : "bg-white text-black"
        }`}
      >
        <h1 className="text-3xl font-bold">Project Not Found</h1>
      </div>
    )
  }

  const handleAddTask = () => {
    if (!taskTitle.trim()) return

    let updatedProjects = [...projects]

    if (!updatedProjects[projectIndex].tasks) {
      updatedProjects[projectIndex].tasks = []
    }

    if (editTaskIndex !== null) {
      updatedProjects[projectIndex].tasks[editTaskIndex] = {
        ...updatedProjects[projectIndex].tasks[editTaskIndex],
        title: taskTitle,
        priority,
        dueDate
      }

      setProjects(updatedProjects)
      setEditTaskIndex(null)
    } else {
      const files = getTemplateFiles(projectTemplate)
      const reqFiles = getFilePaths(files)

      updatedProjects[projectIndex].tasks.push({
        title: taskTitle,
        completed: false,
        priority,
        dueDate,
        files,
        requiredFiles: reqFiles,
        requiredSnippetsCount: 1,
        codeExecuted: false,
        userMarkedFinished: false,
        progress: 0,
        template: projectTemplate,
        createdAt: new Date().toISOString()
      })

      updatedProjects = appendProjectActivity(
        updatedProjects,
        projectIndex,
        buildActivityEntry(
          ACTIVITY_TYPES.TASK_CREATED,
          `Created task: ${taskTitle.trim()}`,
          { taskIndex: updatedProjects[projectIndex].tasks.length - 1 }
        )
      )

      logActivity({
        type: "task_created",
        message: `Created task "${taskTitle.trim()}"`,
        projectId: projectIndex,
        projectTitle: updatedProjects[projectIndex].title,
        taskId: updatedProjects[projectIndex].tasks.length - 1
      })

      setProjects(updatedProjects)
    }

    setTaskTitle("")
    setPriority("Medium")
    setDueDate("")
    setProjectTemplate("HTML")
  }

  const handleEditTask = (index) => {
    const task = project.tasks[index]
    setTaskTitle(task.title)
    setPriority(task.priority)
    setDueDate(task.dueDate || "")
    setEditTaskIndex(index)
  }

  const handleDeleteTask = (taskIndex) => {
    const task = project.tasks[taskIndex]
    let updatedProjects = [...projects]

    updatedProjects[projectIndex].tasks =
      updatedProjects[projectIndex].tasks.filter(
        (_, index) => index !== taskIndex
      )

    updatedProjects = appendProjectActivity(
      updatedProjects,
      projectIndex,
      buildActivityEntry(
        ACTIVITY_TYPES.TASK_DELETED,
        `Deleted task: ${task.title}`
      )
    )

    logActivity({
      type: "task_deleted",
      message: `Deleted task "${task.title}"`,
      projectId: projectIndex,
      projectTitle: updatedProjects[projectIndex].title
    })

    setProjects(updatedProjects)
  }

  const completedTasks = project.tasks.filter((task) => task.completed).length
  const totalTasks = project.tasks.length
  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100)

  const filteredTasks = project.tasks
    .map((task, taskIndex) => ({ task, taskIndex }))
    .filter(({ task }) => {
      if (filter === "Pending") return !task.completed
      if (filter === "Completed") return task.completed
      return true
    })
    .sort((a, b) => {
      if (sortBy === "Priority") {
        const priorities = { High: 3, Medium: 2, Low: 1 }
        return priorities[b.task.priority] - priorities[a.task.priority]
      }

      if (sortBy === "Due Date") {
        if (!a.task.dueDate) return 1
        if (!b.task.dueDate) return -1
        return new Date(a.task.dueDate) - new Date(b.task.dueDate)
      }

      return 0
    })

  const sectionClass = `border rounded-2xl p-5 ${
    theme === "dark"
      ? "bg-zinc-900 border-zinc-800"
      : "bg-zinc-100 border-zinc-300"
  }`

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
      }`}
    >
      <ProjectHeader project={project} />
      <ProjectSubNav projectIndex={projectIndex} />

      <div className={sectionClass}>
        <h2 className="text-2xl font-semibold mb-4">Tasks</h2>

        <form 
          className="flex flex-col xl:flex-row gap-3 mb-6 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
        >
          <div className="flex-1 w-full">
            <label htmlFor="task-title" className={`block mb-1.5 text-sm font-semibold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>
              Task Title <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Enter task..."
              className={`w-full border px-4 py-3 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                  : "bg-white border-zinc-300 text-black placeholder-zinc-400"
              }`}
              required
            aria-required="true"
          />
          </div>

          <div className="w-full xl:w-auto">
            <label htmlFor="task-priority" className={`block mb-1.5 text-sm font-semibold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          </div>

          <div className="w-full xl:w-auto">
            <label htmlFor="task-date" className={`block mb-1.5 text-sm font-semibold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>Due Date <span className="text-red-500" aria-hidden="true">*</span></label>
            <input
              id="task-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                : "bg-white border-zinc-300 text-zinc-700"
            }`}
            required
            aria-required="true"
          />
          </div>

          {editTaskIndex === null && (
            <div className="w-full xl:w-auto">
              <label htmlFor="task-template" className={`block mb-1.5 text-sm font-semibold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>Template</label>
              <select
                id="task-template"
                value={projectTemplate}
                onChange={(e) => setProjectTemplate(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                  : "bg-white border-zinc-300 text-zinc-700"
              }`}
            >
              <option value="HTML">HTML/CSS/JS Starter</option>
              <option value="React">React App Starter</option>
              <option value="Next.js">Next.js Project Starter</option>
              <option value="Node.js">Node.js Project Starter</option>
              <option value="Express">Express Server Starter</option>
            </select>
            </div>
          )}

          <div className="flex gap-3 w-full xl:w-auto">
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-green-500 text-white whitespace-nowrap font-medium hover:bg-green-600 transition focus-visible:ring-2 focus-visible:ring-green-500 outline-none"
            >
              {editTaskIndex !== null ? "Update Task" : "Add Task"}
            </button>

            {editTaskIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditTaskIndex(null)
                  setTaskTitle("")
                  setPriority("Medium")
                  setDueDate("")
                }}
                className="px-5 py-3 rounded-xl bg-zinc-700 text-white whitespace-nowrap font-medium hover:bg-zinc-600 transition focus-visible:ring-2 focus-visible:ring-zinc-500 outline-none"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-zinc-400">
            {completedTasks} / {totalTasks} Tasks Completed
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {["All", "Pending", "Completed"].map((label) => (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`px-4 py-2 rounded-xl transition ${
                filter === label
                  ? label === "All"
                    ? "bg-blue-500 text-white"
                    : label === "Pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-green-500 text-white"
                  : theme === "dark"
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-200 text-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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

        <div className="space-y-3">
          {filteredTasks.map(({ task, taskIndex }) => (
            <div
              key={taskIndex}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl ${
                theme === "dark" ? "bg-zinc-950" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-20 text-center px-2 py-1 text-xs rounded-full font-medium shrink-0 ${
                    task.priority === "High"
                      ? "bg-red-500/20 text-red-400"
                      : task.priority === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {task.priority}
                </span>

                <input
                  type="checkbox"
                  checked={task.completed}
                  disabled
                  className="cursor-not-allowed opacity-80 shrink-0"
                />

                <div
                  className={`min-w-0 ${task.completed ? "line-through text-zinc-400" : ""}`}
                >
                  <p
                    onClick={() =>
                      router.push(
                        `/projects/${projectIndex}/tasks/${taskIndex}`
                      )
                    }
                    className="cursor-pointer font-medium flex flex-wrap items-center gap-2"
                  >
                    <span>{task.title}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {task.progress || 0}% Complete
                    </span>
                  </p>

                  <p
                    className={`text-xs mt-1 ${
                      theme === "dark" ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    {task.dueDate &&
                    new Date(task.dueDate).setHours(23, 59, 59, 999) <
                      Date.now() &&
                    !task.completed
                      ? "🔴 Overdue"
                      : task.dueDate
                        ? `Due ${new Date(task.dueDate).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}`
                        : "No deadline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => handleEditTask(taskIndex)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(taskIndex)}
                  className="text-red-400 hover:text-red-300"
                >
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
