"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Trash2, AlertTriangle, Search, ListTodo } from "lucide-react"
import { useProjects } from "@/context/ProjectContext"
import ProjectHeader from "@/components/project/ProjectHeader"
import ProjectSubNav from "@/components/project/ProjectSubNav"
import EmptyState from "@/components/ui/EmptyState"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Field from "@/components/ui/Field"
import Button from "@/components/ui/Button"

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

  const { projects, setProjects, isLoaded, createTask, updateTask, deleteTask } = useProjects()

  const projectId = params.id === "undefined" ? null : params.id
  const isOldProject = !isNaN(Number(projectId))
  const projectIndex = isOldProject ? Number(projectId) : projects.findIndex(p => p._id === projectId)
  const project = projects[projectIndex]

  const [now, setNow] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0)
    return () => clearTimeout(timer)
  }, [])

  const [taskTitle, setTaskTitle] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [dueDate, setDueDate] = useState("")
  const [filter, setFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Newest")
  const [editTaskId, setEditTaskId] = useState(null)
  const [projectTemplate, setProjectTemplate] = useState("HTML")
  const [errors, setErrors] = useState({})

  if (!isLoaded) {
    return (
      <div className="h-full flex-1 p-6 transition bg-surface text-text-main">
        <div className="mb-8 animate-pulse">
          <div className="h-12 w-64 rounded-xl mb-3 bg-bg-active"></div>
          <div className="h-6 w-96 rounded-lg bg-bg-active"></div>
        </div>
        <div className="h-14 w-full rounded-2xl mb-8 animate-pulse bg-bg-active"></div>
        <div className="h-40 w-full rounded-2xl mb-8 animate-pulse bg-bg-active"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-bg-active"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="h-full flex-1 p-6 bg-surface text-text-main flex flex-col items-center justify-center">
        <EmptyState 
          icon={AlertTriangle} 
          title="Project Not Found" 
          description="This project might have been deleted or you don't have access." 
        />
      </div>
    )
  }

  const handleAddTask = async () => {
    const newErrors = {}
    if (!taskTitle.trim()) newErrors.taskTitle = "Task Title is required."
    if (!dueDate) newErrors.dueDate = "Due Date is required."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (newErrors.taskTitle) document.getElementById("task-title")?.focus()
      else if (newErrors.dueDate) document.getElementById("task-date")?.focus()
      return
    }
    setErrors({})

    let updatedProjects = [...projects]

    if (!updatedProjects[projectIndex].tasks) {
      updatedProjects[projectIndex].tasks = []
    }

    if (editTaskId !== null) {
      await updateTask({
        id: editTaskId,
        title: taskTitle,
        priority,
        dueDate: dueDate || undefined,
        updatedAt: new Date().toISOString()
      })
      setEditTaskId(null)
      
      // Still need to clear form
      setTaskTitle("")
      setPriority("Medium")
      setDueDate("")
      setErrors({})
    } else {
      const files = getTemplateFiles(projectTemplate)
      const now = new Date().toISOString()

      const newTaskId = await createTask({
        projectId: project._id,
        title: taskTitle,
        priority,
        dueDate: dueDate || undefined,
        template: projectTemplate,
        completed: false,
        progress: 0,
        codeExecuted: false,
        userMarkedFinished: false,
        createdAt: now,
        updatedAt: now
      })

      updatedProjects[projectIndex].tasks.push({
        _id: newTaskId,
        files,
        terminalHistory: [],
        editorCode: "",
        consoleOutput: [],
        previewState: null
      })



      setProjects(updatedProjects)
      setTaskTitle("")
      setPriority("Medium")
      setDueDate("")
      setErrors({})
    }
    setProjectTemplate("HTML")
  }

  const handleEditTask = (task) => {
    setTaskTitle(task.title)
    setPriority(task.priority)
    setDueDate(task.dueDate || "")
    setEditTaskId(task._id)
  }

  const handleDeleteTask = async (task) => {
    await deleteTask({ id: task._id })
    let updatedProjects = [...projects]



    setProjects(updatedProjects)
  }

  const completedTasks = project.tasks.filter((task) => task.completed).length
  const totalTasks = project.tasks.length
  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100)

  const filteredTasks = project.tasks
    .map((task) => ({ task }))
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

  return (
    <div
      className="h-full flex-1 p-6 bg-page text-text-main"
    >
      <ProjectHeader project={project} />
      <ProjectSubNav projectIndex={projectIndex} />

      <Card className="mb-8 max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">Tasks</h2>

        <form 
          className="flex flex-col xl:flex-row gap-3 mb-6 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
        >
          <div className="flex-1 w-full">
            <Field label="Task Title" htmlFor="task-title" required error={errors.taskTitle}>
              <Input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(e) => {
                  setTaskTitle(e.target.value)
                  if (errors.taskTitle) setErrors({ ...errors, taskTitle: null })
                }}
                placeholder="Enter task..."
                error={errors.taskTitle}
                required
              />
            </Field>
          </div>

          <div className="w-full xl:w-auto">
            <Field label="Priority" htmlFor="task-priority">
              <Select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </Select>
            </Field>
          </div>

          <div className="w-full xl:w-auto">
            <Field label="Due Date" htmlFor="task-date" required error={errors.dueDate}>
              <Input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  if (errors.dueDate) setErrors({ ...errors, dueDate: null })
                }}
                error={errors.dueDate}
                required
              />
            </Field>
          </div>

          {editTaskId === null && (
            <div className="w-full xl:w-auto">
              <Field label="Template" htmlFor="task-template">
                <Select
                  id="task-template"
                  value={projectTemplate}
                  onChange={(e) => setProjectTemplate(e.target.value)}
                >
                  <option value="HTML">HTML/CSS/JS Starter</option>
                  <option value="React">React App Starter</option>
                  <option value="Next.js">Next.js Project Starter</option>
                  <option value="Node.js">Node.js Project Starter</option>
                  <option value="Express">Express Server Starter</option>
                  <option value="Blank">Blank Template</option>
                </Select>
              </Field>
            </div>
          )}

          <div className="flex gap-3 w-full xl:w-auto">
            <Button
              type="submit"
              variant="primary"
            >
              {editTaskId !== null ? "Update Task" : "Add Task"}
            </Button>

            {editTaskId !== null && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditTaskId(null)
                  setTaskTitle("")
                  setPriority("Medium")
                  setDueDate("")
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="mb-6">
          <div className="flex justify-between mb-2 text-text-main">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="w-full h-3 bg-bg-active rounded-full overflow-hidden border border-border-subtle">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-text-muted">
            {completedTasks} / {totalTasks} Tasks Completed
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {["All", "Pending", "Completed"].map((label) => (
            <Button
              key={label}
              variant={filter === label ? (label === "All" ? "primary" : label === "Pending" ? "warning" : "success") : "secondary"}
              onClick={() => setFilter(label)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm font-medium mb-6">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="hidden md:block w-48 lg:w-64"
            leftIcon={Search}
          />
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Sort:</span>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-32 py-2"
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Priority</option>
              <option>Due Date</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="max-w-4xl">
        <div className="space-y-3">
          {project.tasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="This project has no tasks"
              description="Use the form above to add your first task and start tracking progress."
            />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching tasks"
              description="No tasks match the current filter criteria."
            />
          ) : (
            filteredTasks.map(({ task }) => (
              <div
              key={task._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-bg-active"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-20 text-center px-2 py-1 text-xs rounded-full font-medium shrink-0 ${
                    task.priority === "High"
                      ? "bg-danger-bg text-danger-text"
                      : task.priority === "Medium"
                        ? "bg-warning-bg text-warning-text"
                        : "bg-neutral-bg text-neutral-text"
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
                  className={`min-w-0 ${task.completed ? "line-through text-text-muted" : "text-text-main"}`}
                >
                  <p
                    onClick={() =>
                      router.push(
                        `/projects/${project._id}/tasks/${task._id}`
                      )
                    }
                    className="cursor-pointer font-medium flex flex-wrap items-center gap-2 hover:text-primary transition-colors"
                  >
                    <span>{task.title}</span>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-text-secondary truncate">
                      {task.progress || 0}% Complete
                    </span>
                  </p>

                  <p
                    className="text-xs mt-1 text-text-secondary"
                  >
                    {task.dueDate &&
                    new Date(task.dueDate).setHours(23, 59, 59, 999) <
                      now &&
                    !task.completed
                      ? <span className="flex items-center gap-1 text-danger font-bold"><AlertTriangle size={14} /> Overdue</span>
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
                  onClick={() => handleEditTask(task)}
                  className="text-primary hover:text-primary-hover transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task)}
                  className="text-danger hover:brightness-110 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
