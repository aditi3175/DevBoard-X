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
  AlertCircle,
  Wind,
  FileJson,
  File,
  FolderOpen,
  ClipboardList,
  Heart,
  AlertTriangle
} from "lucide-react"

import WidgetCard from "@/components/widgets/WidgetCard"
import NotesWidget from "@/components/widgets/NotesWidget"
import EmptyState from "@/components/ui/EmptyState"
import Link from "next/link"
import Card from "@/components/ui/Card"
import { useProjects } from "@/context/ProjectContext"

import { getActivityIcon, getActivityCategory, getCategoryEmoji } from "@/utils/projectActivity"
import { formatProjectDate } from "@/utils/projectOverview"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

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
    return <Wind size={14} className="text-cyan-400 shrink-0" aria-hidden="true" />
  }
  switch (ext) {
    case "js":
    case "mjs":
    case "jsx":
    case "tsx":
      return <FileCode size={14} className="text-yellow-500 shrink-0" aria-hidden="true" />
    case "css":
      return <FileCode size={14} className="text-blue-500 shrink-0" aria-hidden="true" />
    case "json":
      return <FileJson size={14} className="text-orange-400 shrink-0" aria-hidden="true" />
    case "md":
      return <FileText size={14} className="text-indigo-400 shrink-0" aria-hidden="true" />
    default:
      return <File size={14} className="text-text-muted shrink-0" aria-hidden="true" />
  }
}

export default function Workspace() {
  const router = useRouter()
  
  const dashboardData = useQuery(api.dashboard.getDashboardMetrics)
  const analyticsData = useQuery(api.analytics.getWorkspaceMetrics)
  
  const globalSnippets = useQuery(api.snippets.getSnippets) || []
  const globalActivities = dashboardData?.recentActivity || []
  const upcomingTasks = dashboardData?.upcomingTasks || []
  const recentFiles = dashboardData?.recentFiles || []

  const metrics = analyticsData?.workspace || {
    activeTasks: 0,
    activeFiles: 0,
    totalSnippets: 0,
    totalExecutions: 0
  }

  const recentProjects = dashboardData?.recentProjects || []

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto h-screen transition bg-page text-text-main">
      {/* HEADER */}
      <h1 className="text-4xl font-bold tracking-tight">
        Developer OS
      </h1>

      <p className="mt-2 text-sm text-text-secondary">
        Integrated developer environment controls and workspace metrics dashboard.
      </p>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
        <WidgetCard
          Icon={Activity}
          title="Active Tasks"
          value={metrics.activeTasks}
          color="bg-blue-500"
        />
        <WidgetCard
          Icon={FileCode}
          title="Created Files"
          value={metrics.activeFiles}
          color="bg-cyan-500"
        />
        <WidgetCard
          Icon={FileText}
          title="Total Snippets"
          value={metrics.totalSnippets}
          color="bg-purple-500"
        />
        <WidgetCard
          Icon={Play}
          title="Total Executions"
          value={metrics.totalExecutions}
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
            <Card className="flex flex-col">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FolderOpen size={20} className="text-zinc-400" aria-hidden="true" /> Recent Files
              </h3>
              <div className="flex flex-col gap-2">
                {recentFiles.length > 0 ? (
                  recentFiles.map((file, i) => (
                    <Link
                      key={file._id || i}
                      href={`/projects/${file.projectId}/tasks/${file.taskId}`}
                      aria-label={`Open file ${file.name} in task ${file.taskTitle}`}
                      className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-left w-full hover:bg-bg-hover"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                        {getFileIconMini(file.name)}
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                      <span className="text-xs font-semibold bg-bg-active text-text-secondary px-2 py-0.5 rounded truncate shrink-0 max-w-[80px]">
                        {file.taskTitle}
                      </span>
                    </Link>
                  ))
                ) : (
                  <EmptyState 
                    variant="compact"
                    icon={FileCode}
                    title="No tracked files"
                    description="Execute code or create files within tasks to see them here."
                    primaryAction={{ label: "Go to Projects", onClick: () => router.push("/projects") }}
                  />
                )}
              </div>
            </Card>

            {/* Recent Snippets */}
            <Card className="flex flex-col">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText size={20} className="text-zinc-400" aria-hidden="true" /> Recent Snippets
              </h3>
              <div className="flex flex-col gap-2">
                {globalSnippets.length > 0 ? (
                  globalSnippets.slice(0, 5).map((snippet, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl transition hover:bg-bg-hover"
                    >
                      <div className="flex flex-col overflow-hidden mr-2">
                        <span className="text-sm font-medium truncate text-text-main">{snippet.title}</span>
                        <span className="text-xs text-text-muted">Saved: {snippet.createdAt}</span>
                      </div>
                      <span className="text-xs font-semibold bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded shrink-0">
                        {snippet.language}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState 
                    variant="compact"
                    icon={FileText}
                    title="Your library is empty"
                    description="Save useful code snippets from the editor to reuse them."
                  />
                )}
              </div>
            </Card>

          </div>

          {/* Recent Tasks */}
          <Card>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ClipboardList size={20} className="text-zinc-400" aria-hidden="true" /> Recent Tasks
            </h3>
            <div className="flex flex-col gap-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((t, i) => (
                  <Link
                    key={t._id || i}
                    href={`/projects/${t.projectId}/tasks/${t._id}`}
                    aria-label={`Open task ${t.title} in project ${t.projectTitle}`}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl cursor-pointer gap-3 transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-left w-full hover:bg-bg-hover"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold text-center shrink-0 w-16 ${t.priority === "High"
                        ? "bg-danger-bg text-danger-text"
                        : t.priority === "Medium"
                          ? "bg-warning-bg text-warning-text"
                          : "bg-neutral-bg text-neutral-text"
                        }`}>
                        {t.priority}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate text-text-main">{t.title}</span>
                        <span className="text-xs text-text-muted">{t.projectTitle}</span>
                      </div>
                    </div>

                    {/* Task Progress Bar */}
                    <div className="flex items-center gap-3 w-full md:w-48 shrink-0">
                      <div className="flex-grow h-1.5 bg-bg-active rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success"
                          style={{ width: `${t.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-text-muted w-8 shrink-0">
                        {t.progress || 0}%
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState 
                  variant="compact"
                  icon={CheckCircle}
                  title="No active tasks"
                  description="Start tracking your work by creating a project task."
                  primaryAction={{ label: "View Projects", onClick: () => router.push("/projects") }}
                />
              )}
            </div>
          </Card>

          {/* Project Health Widget */}
          <Card>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Heart size={20} className="text-zinc-400" aria-hidden="true" /> Project Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((p, i) => {
                  const total = p.taskStats?.total || 0;
                  const completed = p.taskStats?.completed || 0;
                  const overdue = p.taskStats?.overdue || 0;
                  const rate = total === 0 ? 0 : Math.round((completed / total) * 100)

                  let healthText = "Healthy"
                  let healthColor = "bg-info-bg text-info-text border border-info/20"
                  if (total === 0) {
                    healthText = "No Tasks"
                    healthColor = "bg-neutral-bg text-neutral-text border border-border-subtle"
                  } else if (overdue > 0) {
                    healthText = "Needs Attention"
                    healthColor = "bg-danger-bg text-danger-text border border-danger/25"
                  } else if (completed === total) {
                    healthText = "Completed"
                    healthColor = "bg-success-bg text-success-text border border-success/25"
                  }

                  return (
                    <Link
                      key={p._id || i}
                      href={`/projects/${p._id}`}
                      aria-label={`Open project ${p.title}`}
                      className="block p-3 rounded-xl cursor-pointer transition flex flex-col gap-2.5 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-left w-full hover:bg-bg-hover border border-border-subtle hover:border-border-strong bg-transparent"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold truncate text-text-main">{p.title}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${healthColor}`}>
                          {healthText}
                        </span>
                      </div>

                      {/* Project stats */}
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>Tasks: {completed}/{total}</span>
                        {overdue > 0 && <span className="flex items-center gap-1 text-danger font-bold"><AlertTriangle size={14} /> {overdue} Overdue</span>}
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full h-1 bg-bg-active rounded-full overflow-hidden">
                        <div
                          className={`h-full ${completed === total && total > 0 ? "bg-success" : overdue > 0 ? "bg-warning" : "bg-primary"}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="md:col-span-2">
                  <EmptyState 
                    variant="compact"
                    icon={Folder}
                    title="No project data"
                    description="Initialize a project to monitor its health and progress."
                    primaryAction={{ label: "Create Project", onClick: () => router.push("/projects") }}
                  />
                </div>
              )}
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN (1 span): Workspace activity & notes */}
        <div className="flex flex-col gap-6">

          {/* Workspace Activity Feed */}
          <Card>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity size={20} className="text-zinc-400" aria-hidden="true" /> Workspace Activity
            </h3>

            <div className="flex flex-col gap-4">
              {globalActivities && globalActivities.length > 0 ? (
                globalActivities.slice(0, 10).map((log, i) => {
                  const isClickable = log.projectId !== null && log.projectId !== undefined;
                  const CardElement = isClickable ? "button" : "div";
                  
                  return (
                  <CardElement
                    key={log._id || log.id || i}
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
                    className={`flex gap-3 p-3 rounded-xl border border-border-subtle transition text-xs w-full text-left outline-none ${
                      isClickable ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 hover:bg-bg-hover" : ""
                    }`}
                  >
                    <span className="shrink-0 select-none flex items-center justify-center">
                      {(() => {
                        const Icon = getActivityIcon(log.type)
                        return <Icon size={16} className="text-text-muted" />
                      })()}
                    </span>
                    <div className="flex flex-col gap-1 overflow-hidden w-full">
                      <div className="flex justify-between items-center text-xs text-text-muted gap-2">
                        <span className="font-semibold truncate text-text-secondary flex items-center gap-1.5">
                          {(() => {
                            const category = getActivityCategory(log.type);
                            const emoji = getCategoryEmoji(category);
                            const title = log.taskTitle || log.projectTitle;
                            
                            return (
                              <>
                                <span>{emoji} {category}</span>
                                {title && (
                                  <>
                                    <span className="text-text-muted/50 text-[10px]">•</span>
                                    <span className="truncate">{title}</span>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </span>
                        <span className="shrink-0">{formatProjectDate(log.timestamp)}</span>
                      </div>
                      <span className="truncate text-text-main">
                        {log.message}
                      </span>
                    </div>
                  </CardElement>
                );
              })
              ) : (
                <EmptyState 
                  variant="compact"
                  icon={Activity}
                  title="Quiet workspace"
                  description="Activity will automatically log as you manage projects and run code."
                />
              )}
            </div>
          </Card>

          {/* Notes Widget */}
          <NotesWidget />

        </div>

      </div>

    </div>
  )
}