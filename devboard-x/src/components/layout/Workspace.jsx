"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Code2,
  File,
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  Play,
  Sparkles,
  Wind
} from "lucide-react"

import NotesWidget from "@/components/widgets/NotesWidget"
import EmptyState from "@/components/ui/EmptyState"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { getActivityCategory } from "@/utils/projectActivity"
import { formatProjectDate } from "@/utils/projectOverview"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

const getFileIconMini = (filename) => {
  const name = filename.toLowerCase()
  const ext = name.split(".").pop()
  if (name === "tailwind.config.js" || name === "tailwind.config.ts") {
    return <Wind size={15} className="text-info shrink-0" aria-hidden="true" />
  }

  switch (ext) {
    case "js":
    case "mjs":
    case "jsx":
    case "tsx":
      return <FileCode size={15} className="text-warning shrink-0" aria-hidden="true" />
    case "css":
      return <FileCode size={15} className="text-info shrink-0" aria-hidden="true" />
    case "json":
      return <FileJson size={15} className="text-danger shrink-0" aria-hidden="true" />
    case "md":
      return <FileText size={15} className="text-primary shrink-0" aria-hidden="true" />
    default:
      return <File size={15} className="text-text-muted shrink-0" aria-hidden="true" />
  }
}

const SummaryTile = ({ icon: Icon, label, value, tone = "primary" }) => {
  const toneStyles = {
    primary: "bg-primary text-white",
    info: "bg-info-bg text-info-text",
    success: "bg-success-bg text-success-text",
    warning: "bg-warning-bg text-warning-text"
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface/90 px-4 py-3 panel-shadow">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          {label}
        </p>
        <p className="text-2xl font-black leading-tight text-text-main">
          {value}
        </p>
      </div>
    </div>
  )
}

const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="flex items-center gap-2 text-base font-black tracking-tight text-text-main">
      <Icon size={18} className="text-primary" />
      {title}
    </h2>
    {action}
  </div>
)

export default function Workspace() {
  const router = useRouter()

  const dashboardData = useQuery(api.dashboard.getDashboardMetrics)
  const analyticsData = useQuery(api.analytics.getWorkspaceMetrics)
  const globalSnippets = useQuery(api.snippets.getSnippets) || []

  const globalActivities = dashboardData?.recentActivity || []
  const upcomingTasks = dashboardData?.upcomingTasks || []
  const recentFiles = dashboardData?.recentFiles || []
  const recentProjects = dashboardData?.recentProjects || []

  const metrics = analyticsData?.workspace || {
    activeTasks: 0,
    activeFiles: 0,
    totalSnippets: 0,
    totalExecutions: 0
  }

  return (
    <div className="workspace-canvas flex h-screen flex-1 flex-col overflow-y-auto p-4 text-text-main md:p-6 xl:p-8">
      <section className="mb-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface/95 panel-shadow">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Sparkles size={14} />
              Live Workspace
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Build board
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary md:text-base">
              A quick view of active work, changed files, reusable snippets, and recent workspace movement.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:min-w-[520px]">
            <SummaryTile icon={Activity} label="Tasks" value={metrics.activeTasks} />
            <SummaryTile icon={FileCode} label="Files" value={metrics.activeFiles} tone="info" />
            <SummaryTile icon={Code2} label="Snips" value={metrics.totalSnippets} tone="warning" />
            <SummaryTile icon={Play} label="Runs" value={metrics.totalExecutions} tone="success" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.85fr)]">
        <div className="flex flex-col gap-6">
          <Card className="panel-shadow">
            <SectionHeader
              icon={ClipboardList}
              title="Active Work"
              action={
                <Button variant="secondary" size="sm" onClick={() => router.push("/projects")}>
                  View projects
                </Button>
              }
            />

            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.slice(0, 6).map((task, index) => (
                  <Link
                    key={task._id || index}
                    href={`/projects/${task.projectId}/tasks/${task._id}`}
                    className="group grid gap-3 rounded-xl border border-border-subtle bg-page/60 p-3 transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface md:grid-cols-[minmax(0,1fr)_180px]"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        task.priority === "High" ? "bg-danger" : task.priority === "Medium" ? "bg-warning" : "bg-success"
                      }`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-text-main">{task.title}</p>
                        <p className="truncate text-xs text-text-muted">{task.projectTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-active">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${task.progress || 0}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs font-black text-text-secondary">{task.progress || 0}%</span>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState
                  variant="compact"
                  icon={CheckCircle}
                  title="No active tasks"
                  description="Create a project task and it will appear in this work queue."
                  primaryAction={{ label: "View Projects", onClick: () => router.push("/projects") }}
                />
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="panel-shadow">
              <SectionHeader icon={FolderOpen} title="Recent Files" />
              <div className="divide-y divide-border-subtle">
                {recentFiles.length > 0 ? (
                  recentFiles.slice(0, 6).map((file, index) => (
                    <Link
                      key={file._id || index}
                      href={`/projects/${file.projectId}/tasks/${file.taskId}`}
                      className="flex items-center justify-between gap-3 py-3 transition hover:px-2 hover:text-primary"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        {getFileIconMini(file.name)}
                        <span className="truncate text-sm font-semibold">{file.name}</span>
                      </span>
                      <span className="max-w-[90px] shrink-0 truncate rounded-md bg-bg-active px-2 py-1 text-[11px] font-bold text-text-secondary">
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
                  />
                )}
              </div>
            </Card>

            <Card className="panel-shadow">
              <SectionHeader icon={Code2} title="Snippet Shelf" />
              <div className="space-y-2">
                {globalSnippets.length > 0 ? (
                  globalSnippets.slice(0, 5).map((snippet, index) => (
                    <div key={snippet._id || index} className="rounded-xl border border-border-subtle bg-page/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-bold">{snippet.title}</p>
                        <span className="shrink-0 rounded-md bg-info-bg px-2 py-1 text-[11px] font-black text-info-text">
                          {snippet.language}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">Saved: {snippet.createdAt}</p>
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

          <Card className="panel-shadow">
            <SectionHeader icon={Folder} title="Project Health" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {recentProjects.length > 0 ? (
                recentProjects.slice(0, 4).map((project, index) => {
                  const total = project.taskStats?.total || 0
                  const completed = project.taskStats?.completed || 0
                  const overdue = project.taskStats?.overdue || 0
                  const rate = total === 0 ? 0 : Math.round((completed / total) * 100)

                  return (
                    <Link
                      key={project._id || index}
                      href={`/projects/${project._id}`}
                      className="rounded-xl border border-border-subtle bg-page/60 p-4 transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-black">{project.title}</p>
                        {overdue > 0 ? (
                          <span className="flex items-center gap-1 rounded-full bg-danger-bg px-2 py-1 text-[11px] font-bold text-danger-text">
                            <AlertTriangle size={12} /> {overdue}
                          </span>
                        ) : (
                          <span className="rounded-full bg-success-bg px-2 py-1 text-[11px] font-bold text-success-text">
                            steady
                          </span>
                        )}
                      </div>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-bg-active">
                        <div className="h-full rounded-full bg-success" style={{ width: `${rate}%` }} />
                      </div>
                      <p className="text-xs text-text-muted">{completed}/{total} tasks completed</p>
                    </Link>
                  )
                })
              ) : (
                <div className="md:col-span-2">
                  <EmptyState
                    variant="compact"
                    icon={Folder}
                    title="No project data"
                    description="Initialize a project to monitor health and progress."
                    primaryAction={{ label: "Create Project", onClick: () => router.push("/projects") }}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card className="panel-shadow xl:sticky xl:top-6">
            <SectionHeader icon={Activity} title="Activity Log" />
            <div className="relative space-y-0 border-l border-border-subtle pl-4">
              {globalActivities && globalActivities.length > 0 ? (
                globalActivities.slice(0, 10).map((log, index) => {
                  const isClickable = log.projectId !== null && log.projectId !== undefined
                  const LogElement = isClickable ? "button" : "div"

                  return (
                    <LogElement
                      key={log._id || log.id || index}
                      onClick={() => {
                        if (!isClickable) return
                        if (log.taskId !== null && log.taskId !== undefined) {
                          router.push(`/projects/${log.projectId}/tasks/${log.taskId}`)
                        } else {
                          router.push(`/projects/${log.projectId}`)
                        }
                      }}
                      className={`relative w-full py-3 text-left text-xs outline-none transition ${
                        isClickable ? "cursor-pointer hover:text-primary focus-visible:text-primary" : ""
                      }`}
                    >
                      <span className="absolute -left-[21px] top-4 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary" />
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black uppercase tracking-[0.12em] text-text-secondary">
                          {getActivityCategory(log.type)}
                        </span>
                        <span className="shrink-0 text-text-muted">{formatProjectDate(log.timestamp)}</span>
                      </div>
                      <p className="mt-1 truncate font-semibold text-text-main">{log.message}</p>
                    </LogElement>
                  )
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

          <NotesWidget />
        </aside>
      </div>
    </div>
  )
}
