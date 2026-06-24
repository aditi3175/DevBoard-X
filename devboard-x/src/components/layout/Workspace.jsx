"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Cpu,
  Activity,
  Folder,
  CheckCircle,
  FileCode,
  FileText,
  Play,
  Clock,
  AlertCircle
} from "lucide-react"

import WidgetCard from "@/components/widgets/WidgetCard"
import NotesWidget from "@/components/widgets/NotesWidget"
import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"
import { useActivity } from "@/context/ActivityContext"
import { getActivityIcon } from "@/utils/projectActivity"
import { formatProjectDate } from "@/utils/projectOverview"

// Recursion helper to traverse file tree nodes
const getAllFilesWithMeta = (nodes, pIdx, tIdx, taskTitle, parentPath = "") => {
  if (!nodes) return []
  let list = []
  nodes.forEach(node => {
    const currentPath = `${parentPath}/${node.name}`
    if (!node.isFolder) {
      list.push({
        name: node.name,
        path: currentPath,
        projectId: pIdx,
        taskId: tIdx,
        taskTitle
      })
    } else if (node.children) {
      list = [...list, ...getAllFilesWithMeta(node.children, pIdx, tIdx, taskTitle, currentPath)]
    }
  })
  return list
}

// Mini extension-based file icon generator
const getFileIconMini = (filename) => {
  const name = filename.toLowerCase()
  const ext = name.split(".").pop()
  if (name === "tailwind.config.js" || name === "tailwind.config.ts") {
    return <span className="text-[10px] text-cyan-400 shrink-0 select-none">💨</span>
  }
  switch (ext) {
    case "js":
    case "mjs":
      return <span className="bg-yellow-500 text-black text-[8px] px-1 py-0.5 rounded font-black shrink-0 select-none">JS</span>
    case "jsx":
    case "tsx":
      return <span className="text-cyan-400 text-xs shrink-0 select-none">⚛️</span>
    case "css":
      return <span className="bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded font-black shrink-0 select-none">CSS</span>
    case "json":
      return <span className="text-orange-400 text-xs shrink-0 select-none">{ }</span>
    case "md":
      return <span className="text-indigo-400 text-xs shrink-0 select-none">📝</span>
    default:
      return <span className="text-zinc-400 text-xs shrink-0 select-none">📄</span>
  }
}

export default function Workspace() {

  const router = useRouter()
  const { theme } = useTheme()
  const { projects } = useProjects()
  const { globalActivities } = useActivity()

  const [globalSnippets, setGlobalSnippets] = useState([])

  // Load global snippets
  useEffect(() => {
    const saved = localStorage.getItem("devboard-snippets")
    if (saved) {
      setGlobalSnippets(JSON.parse(saved))
    }
  }, [])

  // Flattened tasks across all projects
  const allTasks = projects.flatMap((p, pIdx) =>
    (p.tasks || []).map((t, tIdx) => ({
      ...t,
      projectId: pIdx,
      taskId: tIdx,
      projectTitle: p.title
    }))
  )

  // Active incomplete tasks
  const activeTasks = allTasks.filter(t => !t.completed)

  // Flattened files from all task trees
  const allFiles = projects.flatMap((p, pIdx) =>
    (p.tasks || []).flatMap((t, tIdx) =>
      getAllFilesWithMeta(t.files || [], pIdx, tIdx, t.title)
    )
  )

  // Flattened execution runs
  const allExecutions = projects.flatMap((p, pIdx) =>
    (p.tasks || []).flatMap((t, tIdx) =>
      (t.terminalHistory || []).map(log => ({
        ...log,
        projectId: pIdx,
        taskId: tIdx,
        taskTitle: t.title,
        projectTitle: p.title
      }))
    )
  ).sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return (

    <div
      className={`flex-1 flex flex-col p-6 overflow-y-auto h-screen transition ${theme === "dark"
        ? "bg-zinc-950 text-white"
        : "bg-white text-black"
        }`}
    >

      {/* HEADER */}
      <h1 className="text-4xl font-bold tracking-tight">
        Developer OS
      </h1>

      <p
        className={`mt-2 text-sm ${theme === "dark"
          ? "text-zinc-400"
          : "text-zinc-600"
          }`}
      >
        Integrated developer environment controls and workspace metrics dashboard.
      </p>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">

        <WidgetCard
          Icon={Activity}
          title="Active Tasks"
          value={activeTasks.length}
          color="bg-blue-500"
        />

        <WidgetCard
          Icon={FileCode}
          title="Created Files"
          value={allFiles.length}
          color="bg-cyan-500"
        />

        <WidgetCard
          Icon={FileText}
          title="Recent Snippets"
          value={globalSnippets.length}
          color="bg-purple-500"
        />

        <WidgetCard
          Icon={Play}
          title="Total Executions"
          value={allExecutions.length}
          color="bg-green-500"
        />

      </div>

      {/* WIDGET PANELS ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

        {/* LEFT COLUMN (2 spans): Main widgets */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Recent Files & Recent Snippets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Recent Files */}
            <div className={`border rounded-2xl p-5 flex flex-col ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300"}`}>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                📂 Recent Files
              </h3>
              <div className="flex flex-col gap-2">
                {allFiles.length > 0 ? (
                  allFiles.slice(-5).reverse().map((file, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(`/projects/${file.projectId}/tasks/${file.taskId}`)}
                      aria-label={`Open file ${file.name} in task ${file.taskTitle}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-left w-full ${theme === "dark" ? "bg-zinc-950 hover:bg-zinc-800" : "bg-white hover:bg-zinc-200"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                        {getFileIconMini(file.name)}
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <span className="text-[10px] text-zinc-400 truncate">({file.path})</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded truncate shrink-0 max-w-[80px]">
                        {file.taskTitle}
                      </span>
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-zinc-400 italic p-4 text-center">No files created yet.</span>
                )}
              </div>
            </div>

            {/* Recent Snippets */}
            <div className={`border rounded-2xl p-5 flex flex-col ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300"}`}>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                📝 Recent Snippets
              </h3>
              <div className="flex flex-col gap-2">
                {globalSnippets.length > 0 ? (
                  globalSnippets.slice(0, 5).map((snippet, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition ${theme === "dark" ? "bg-zinc-950 hover:bg-zinc-800" : "bg-white hover:bg-zinc-200"
                        }`}
                    >
                      <div className="flex flex-col overflow-hidden mr-2">
                        <span className="text-sm font-medium truncate text-zinc-200">{snippet.title}</span>
                        <span className="text-[10px] text-zinc-400">Saved: {snippet.createdAt}</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded shrink-0">
                        {snippet.language}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-zinc-400 italic p-4 text-center">No snippets saved yet.</span>
                )}
              </div>
            </div>

          </div>

          {/* Recent Tasks */}
          <div className={`border rounded-2xl p-5 ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300"}`}>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              📋 Recent Tasks
            </h3>
            <div className="flex flex-col gap-3">
              {allTasks.length > 0 ? (
                allTasks.slice(-4).reverse().map((t, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(`/projects/${t.projectId}/tasks/${t.taskId}`)}
                    aria-label={`Open task ${t.title} in project ${t.projectTitle}`}
                    className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl cursor-pointer gap-3 transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-left w-full ${theme === "dark" ? "bg-zinc-950 hover:bg-zinc-800" : "bg-white hover:bg-zinc-200"
                      }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-center shrink-0 w-16 ${t.priority === "High"
                        ? "bg-red-500/20 text-red-400"
                        : t.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                        }`}>
                        {t.priority}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate text-zinc-200">{t.title}</span>
                        <span className="text-[10px] text-zinc-400">{t.projectTitle}</span>
                      </div>
                    </div>

                    {/* Task Progress Bar */}
                    <div className="flex items-center gap-3 w-full md:w-48 shrink-0">
                      <div className="flex-grow h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${t.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-zinc-400 w-8 shrink-0">
                        {t.progress || 0}%
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <span className="text-sm text-zinc-400 italic p-4 text-center">No tasks created yet.</span>
              )}
            </div>
          </div>

          {/* Project Health Widget */}
          <div className={`border rounded-2xl p-5 ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300"}`}>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              ❤️ Project Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.length > 0 ? (
                projects.map((p, i) => {
                  const tasks = p.tasks || []
                  const total = tasks.length
                  const completed = tasks.filter(t => t.completed).length
                  const overdue = tasks.filter(t =>
                    !t.completed && t.dueDate && new Date(t.dueDate).setHours(23, 59, 59, 999) < Date.now()
                  ).length
                  const rate = total === 0 ? 0 : Math.round((completed / total) * 100)

                  let healthText = "Healthy"
                  let healthColor = "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  if (total === 0) {
                    healthText = "No Tasks"
                    healthColor = "bg-zinc-850 text-zinc-400 border border-zinc-800/40"
                  } else if (overdue > 0) {
                    healthText = "Needs Attention"
                    healthColor = "bg-red-500/15 text-red-400 border border-red-500/25"
                  } else if (completed === total) {
                    healthText = "Completed"
                    healthColor = "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => router.push(`/projects/${i}`)}
                      aria-label={`Open project ${p.title}`}
                      className={`p-3 rounded-xl cursor-pointer border transition flex flex-col gap-2.5 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-left w-full ${theme === "dark"
                        ? "bg-zinc-950 hover:bg-zinc-800 border-zinc-800/50"
                        : "bg-white hover:bg-zinc-200 border-zinc-300"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold truncate text-zinc-200">{p.title}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${healthColor}`}>
                          {healthText}
                        </span>
                      </div>

                      {/* Project stats */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Tasks: {completed}/{total}</span>
                        {overdue > 0 && <span className="text-red-400 font-bold">⚠️ {overdue} Overdue</span>}
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${overdue > 0 ? "bg-yellow-500" : "bg-blue-500"}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </button>
                  )
                })
              ) : (
                <span className="text-sm text-zinc-400 italic p-4 text-center md:col-span-2">No projects created yet.</span>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1 span): Workspace activity & notes */}
        <div className="flex flex-col gap-6">

          {/* Workspace Activity Feed */}
          <div className={`border rounded-2xl p-5 flex flex-col ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300"}`}>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              ⚡ Workspace Activity
            </h3>

            <div className="flex flex-col gap-4">
              {globalActivities && globalActivities.length > 0 ? (
                globalActivities.slice(0, 10).map((log) => {
                  const isClickable = log.projectId !== null && log.projectId !== undefined;
                  const CardElement = isClickable ? "button" : "div";
                  
                  return (
                  <CardElement
                    key={log.id}
                    onClick={() => {
                      if (isClickable) {
                        if (log.taskId !== null && log.taskId !== undefined) {
                          router.push(`/projects/${log.projectId}/tasks/${log.taskId}`)
                        } else {
                          router.push(`/projects/${log.projectId}`)
                        }
                      }
                    }}
                    aria-label={isClickable ? `View activity: ${log.message}` : undefined}
                    className={`flex gap-3 p-3 rounded-xl border transition text-xs w-full text-left outline-none ${isClickable ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500" : ""
                      } ${theme === "dark"
                        ? `bg-zinc-950 border-zinc-800 ${isClickable ? "hover:bg-zinc-800" : ""}`
                        : `bg-white border-zinc-200 ${isClickable ? "hover:bg-zinc-200" : ""}`
                      }`}
                  >
                    <span className="shrink-0 select-none flex items-center justify-center">
                      {(() => {
                        const Icon = getActivityIcon(log.type)
                        return <Icon size={16} className={theme === "dark" ? "text-zinc-400" : "text-zinc-400"} />
                      })()}
                    </span>
                    <div className="flex flex-col gap-1 overflow-hidden w-full">
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 gap-2">
                        <span className="font-semibold truncate text-zinc-300">
                          {log.projectTitle || "Global"}
                        </span>
                        <span className="shrink-0">{formatProjectDate(log.timestamp)}</span>
                      </div>
                      <span className={`truncate text-zinc-200`}>
                        {log.message}
                      </span>
                    </div>
                  </CardElement>
                );
              })
              ) : (
                <span className="text-sm text-zinc-400 italic p-4 text-center">No recent activity.</span>
              )}
            </div>
          </div>

          {/* Notes Widget */}
          <NotesWidget />

        </div>

      </div>

    </div>

  )

}