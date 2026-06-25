"use client"

import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { CheckCircle2, Circle, Clock, Code2, Play, FolderKanban, ListTodo, FileCode, Search, Activity, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import EmptyState from "@/components/ui/EmptyState"
import Card from "@/components/ui/Card"

import { useProjects } from "@/context/ProjectContext"
import { useActivity } from "@/context/ActivityContext"
import { getActivityIcon } from "@/utils/projectActivity"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts"

// Custom replacement for ResponsiveContainer that avoids the
// "width(-1) and height(-1)" warning by only rendering children
// once the container has been measured with positive dimensions.
function SafeChartContainer({ children }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setSize({ width: Math.floor(width), height: Math.floor(height) })
        }
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {size && typeof children === "function"
        ? children(size.width, size.height)
        : null}
    </div>
  )
}

const COLORS = {
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  neutral: "var(--color-neutral)"
}

const PRIORITY_COLORS = {
  High: COLORS.danger,
  Medium: COLORS.warning,
  Low: COLORS.neutral
}

const STATUS_COLORS = {
  Completed: COLORS.success,
  Pending: COLORS.neutral,
  "In Progress": COLORS.primary
}

// Helper to format dates
const formatRelativeTime = (isoString) => {
  if (!isoString) return "Never"
  const date = new Date(isoString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return "Just now"
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}

// Recharts Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-lg border shadow-xl text-sm font-medium bg-surface border-border-subtle text-text-main">
        <p className="mb-2 text-xs text-text-secondary">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.payload?.fill }} />
            <span className="text-text-secondary capitalize">{p.name}:</span>
            <span className="font-bold">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { projects, isLoaded: projectsLoaded } = useProjects()
  const { globalActivities, isLoaded: activitiesLoaded } = useActivity()

  const isLoaded = projectsLoaded && activitiesLoaded

  // ────────────────────────────────────────────────────────
  // DATA AGGREGATION
  // ────────────────────────────────────────────────────────

  const aggregatedData = useMemo(() => {
    let totalTasks = 0
    let completedTasks = 0
    let inProgressTasks = 0
    let pendingTasks = 0

    let highPriority = 0
    let mediumPriority = 0
    let lowPriority = 0

    let totalFilesCount = 0

    const projectPerformance = []

    projects.forEach((proj, idx) => {
      const pTasks = proj.tasks || []
      const pTotal = pTasks.length
      const pCompleted = pTasks.filter(t => t.completed).length

      let pInProgress = 0
      let pPending = 0

      pTasks.forEach(t => {
        if (!t.completed) {
          if (t.progress > 0) pInProgress++
          else pPending++
        }

        if (t.priority === "High") highPriority++
        else if (t.priority === "Medium") mediumPriority++
        else lowPriority++

        // Count files
        const countFiles = (nodes) => {
          if (!nodes) return 0
          return nodes.reduce((acc, n) => acc + (n.isFolder ? countFiles(n.children) : 1), 0)
        }
        totalFilesCount += countFiles(t.files)
      })

      totalTasks += pTotal
      completedTasks += pCompleted
      inProgressTasks += pInProgress
      pendingTasks += pPending

      // Find terminal runs
      let runCount = 0
      pTasks.forEach(t => {
        if (t.terminalHistory) runCount += t.terminalHistory.filter(h => h.type === "success").length
      })

      const pProgress = pTotal === 0 ? 0 : Math.round((pCompleted / pTotal) * 100)

      projectPerformance.push({
        id: idx,
        name: proj.title,
        tasks: pTotal,
        completion: pProgress,
        runs: runCount,
        lastActivity: proj.lastUpdatedAt || proj.createdAt || new Date().toISOString()
      })
    })

    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

    let totalSnippetsCount = 0
    projects.forEach((proj) => {
      (proj.tasks || []).forEach((t) => {
        if (t.snippets) totalSnippetsCount += t.snippets.length
      })
    })

    const projectRunsCount = globalActivities.filter(a => a.type === "code_executed").length

    return {
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      completionRate,
      inProgressTasks,
      pendingTasks,
      highPriority,
      mediumPriority,
      lowPriority,
      totalFilesCount,
      totalSnippetsCount,
      projectRunsCount,
      projectPerformance: projectPerformance.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
    }
  }, [projects, globalActivities])

  // ────────────────────────────────────────────────────────
  // CHART DATA GENERATION
  // ────────────────────────────────────────────────────────

  const statusData = useMemo(() => [
    { name: "Completed", value: aggregatedData.completedTasks, fill: STATUS_COLORS.Completed },
    { name: "In Progress", value: aggregatedData.inProgressTasks, fill: STATUS_COLORS["In Progress"] },
    { name: "Pending", value: aggregatedData.pendingTasks, fill: STATUS_COLORS.Pending },
  ].filter(d => d.value > 0), [aggregatedData])

  const priorityData = useMemo(() => [
    { name: "High", value: aggregatedData.highPriority, fill: PRIORITY_COLORS.High },
    { name: "Medium", value: aggregatedData.mediumPriority, fill: PRIORITY_COLORS.Medium },
    { name: "Low", value: aggregatedData.lowPriority, fill: PRIORITY_COLORS.Low },
  ].filter(d => d.value > 0), [aggregatedData])

  const weeklyActivityData = useMemo(() => {
    const data = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      data.push({
        dateStr: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateObj: d,
        created: 0,
        completed: 0
      })
    }

    globalActivities.forEach(act => {
      const actDate = new Date(act.timestamp)
      actDate.setHours(0, 0, 0, 0)

      const dayData = data.find(d => d.dateObj.getTime() === actDate.getTime())
      if (dayData) {
        if (act.type === "task_created") dayData.created++
        if (act.type === "task_completed") dayData.completed++
      }
    })

    return data
  }, [globalActivities])

  // ────────────────────────────────────────────────────────
  // INSIGHTS GENERATION
  // ────────────────────────────────────────────────────────

  const insights = useMemo(() => {
    const out = []
    if (aggregatedData.pendingTasks > 0) {
      out.push(`You have ${aggregatedData.pendingTasks} pending tasks across all projects.`)
    }

    const maxPriorityVal = Math.max(aggregatedData.highPriority, aggregatedData.mediumPriority, aggregatedData.lowPriority)
    if (maxPriorityVal > 0) {
      if (aggregatedData.highPriority === maxPriorityVal && maxPriorityVal > aggregatedData.mediumPriority + aggregatedData.lowPriority) {
        out.push("Your workload is heavily weighted towards High Priority tasks.")
      } else if (aggregatedData.mediumPriority === maxPriorityVal) {
        out.push("Most of your tasks are Medium Priority.")
      } else if (aggregatedData.lowPriority === maxPriorityVal) {
        out.push("Most of your tasks are Low Priority.")
      } else {
        out.push("Your tasks are evenly distributed across priorities.")
      }
    }

    const completedLast7Days = weeklyActivityData.reduce((sum, d) => sum + d.completed, 0)
    if (completedLast7Days === 0 && aggregatedData.totalTasks > 0) {
      out.push("No tasks were completed in the last 7 days.")
    } else if (completedLast7Days > 5) {
      out.push(`Great productivity! You completed ${completedLast7Days} tasks this week.`)
    }

    if (aggregatedData.projectPerformance.length > 0) {
      const activeProj = aggregatedData.projectPerformance[0]
      out.push(`"${activeProj.name}" is your most recently active project.`)
    }

    return out
  }, [aggregatedData, weeklyActivityData])

  // ────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <div className="h-full flex-1 p-4 md:p-8 transition-colors bg-page text-text-main">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 rounded-lg mb-2 bg-bg-active"></div>
          <div className="h-5 w-96 rounded-lg bg-bg-active"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-bg-active"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-96 rounded-2xl lg:col-span-2 bg-bg-active"></div>
          <div className="h-96 rounded-2xl bg-bg-active"></div>
        </div>
      </div>
    )
  }

  const subtitleClass = "text-text-muted"

  return (
    <div className="h-full flex-1 p-4 md:p-8 transition-colors bg-page text-text-main">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Activity className="text-primary" size={32} />
          Workspace Analytics
        </h1>
        <p className="mt-2 text-sm md:text-base text-text-secondary">
          Actionable insights and comprehensive performance metrics.
        </p>
      </div>

      {/* 1. PRODUCTIVITY OVERVIEW (STAT CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Projects" value={aggregatedData.totalProjects} icon={FolderKanban} color="text-info-text" bg="bg-info-bg" />
        <StatCard title="Total Tasks" value={aggregatedData.totalTasks} icon={ListTodo} color="text-primary" bg="bg-primary/10" />
        <StatCard title="Completed Tasks" value={aggregatedData.completedTasks} icon={CheckCircle2} color="text-success" bg="bg-success-bg" />
        <StatCard title="Completion Rate" value={`${aggregatedData.completionRate}%`} icon={Activity} color="text-info-text" bg="bg-info-bg" />

        <StatCard title="Files Created" value={aggregatedData.totalFilesCount} icon={FileCode} color="text-warning" bg="bg-warning-bg" />
        <StatCard title="Snippets Saved" value={aggregatedData.totalSnippetsCount} icon={Code2} color="text-primary" bg="bg-primary/10" />
        <StatCard title="Project Runs" value={aggregatedData.projectRunsCount} icon={Play} color="text-danger" bg="bg-danger-bg" />
      </div>

      {/* CHARTS GRID (12 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">

        {/* TASK STATUS DOUGHNUT */}
        <Card className="md:col-span-6 xl:col-span-3 relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            Task Status
          </h2>
          <div className="h-[220px]">
            {statusData.length > 0 ? (
              <SafeChartContainer>
                {(w, h) => (
                  <PieChart width={w} height={h}>
                    <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                )}
              </SafeChartContainer>
            ) : (
              <EmptyState variant="compact" icon={ListTodo} title="No tasks to chart" description="Create tasks within projects to visualize their status." />
            )}
          </div>
        </Card>

        {/* PRIORITY DOUGHNUT */}
        <Card className="md:col-span-6 xl:col-span-3 relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-danger-bg blur-[50px] rounded-full pointer-events-none" />
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            Priority Distribution
          </h2>
          <div className="h-[220px]">
            {priorityData.length > 0 ? (
              <SafeChartContainer>
                {(w, h) => (
                  <PieChart width={w} height={h}>
                    <Pie data={priorityData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                )}
              </SafeChartContainer>
            ) : (
              <EmptyState variant="compact" icon={Activity} title="No priority data" description="Assign priorities to your tasks to see this breakdown." />
            )}
          </div>
        </Card>

        {/* WEEKLY ACTIVITY LINE CHART */}
        <Card className="md:col-span-12 xl:col-span-6 relative group">
          <div className="absolute top-0 left-1/2 w-64 h-32 bg-info/5 blur-[60px] rounded-full pointer-events-none -translate-x-1/2" />
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            Weekly Activity
          </h2>
          <div className="h-[220px]">
            <SafeChartContainer>
              {(w, h) => (
                <LineChart width={w} height={h} data={weeklyActivityData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" name="Tasks Created" dataKey="created" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Tasks Completed" dataKey="completed" stroke={COLORS.success} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </SafeChartContainer>
          </div>
        </Card>

      </div>

      {/* TABLES AND TIMELINE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">

        {/* PROJECT PERFORMANCE TABLE */}
        <Card className="xl:col-span-8 !p-0 flex flex-col relative group">
          <div className="p-6 border-b border-border-subtle">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Project Performance
            </h2>
          </div>
          <div className="overflow-x-auto flex-1" tabIndex={0} aria-label="Project performance table">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-hover text-text-muted text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Project Name</th>
                  <th className="px-6 py-4 font-semibold text-center">Tasks</th>
                  <th className="px-6 py-4 font-semibold">Completion</th>
                  <th className="px-6 py-4 font-semibold text-center">Runs</th>
                  <th className="px-6 py-4 font-semibold">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {aggregatedData.projectPerformance.length > 0 ? (
                  aggregatedData.projectPerformance.map((proj) => (
                    <tr key={proj.id} className="transition-colors hover:bg-bg-hover">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {proj.name}
                      </td>
                      <td className="px-6 py-4 text-center">{proj.tasks}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full max-w-[100px] h-2 bg-bg-active rounded-full overflow-hidden">
                            <div className="h-full bg-success rounded-full" style={{ width: `${proj.completion}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{proj.completion}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-bg-active text-text-secondary">
                          {proj.runs}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">
                        {formatRelativeTime(proj.lastActivity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8">
                      <EmptyState variant="compact" icon={FolderKanban} title="No projects found" description="Create a project to monitor its performance." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ACTIVITY TIMELINE */}
        <Card className="xl:col-span-4 flex flex-col h-[500px] relative group">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            Activity Timeline
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-strong before:to-transparent">
            {globalActivities.length > 0 ? (
              globalActivities.slice(0, 10).map((activity, i) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm bg-surface border-border-subtle text-primary">
                      <Icon size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm transition-all bg-surface border-border-subtle group-hover:border-border-strong">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-text-muted truncate mr-2">
                          {activity.projectTitle || "Global"}
                        </span>
                        <time className="text-xs font-medium text-text-muted shrink-0">
                          {formatRelativeTime(activity.timestamp)}
                        </time>
                      </div>
                      <p className="text-sm font-medium text-text-main">
                        {activity.message}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <Clock size={32} className="mb-3 text-text-muted" />
                <p className="text-sm text-text-secondary">No activity recorded yet.</p>
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* WORKSPACE INSIGHTS */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 px-2">
          <Sparkles className="text-warning" size={20} />
          Workspace Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div key={idx} className="p-5 rounded-2xl border flex flex-col justify-center min-h-[100px] relative overflow-hidden group bg-warning-bg border-warning/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-warning/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-warning/20 transition-all" />
                <p className="text-sm font-medium relative z-10 leading-relaxed text-warning">
                  {insight}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState variant="compact" icon={Sparkles} title="No insights yet" description="Keep managing your projects and executing tasks to generate actionable workspace insights." />
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <Card isInteractive className="relative overflow-hidden group transition-all duration-200">
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[40px] rounded-full pointer-events-none transition-all duration-200 opacity-50 group-hover:opacity-100 ${bg}`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon size={20} className={color} />
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-3xl font-black tracking-tight mb-1 text-text-main">
          {value}
        </h3>
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </p>
      </div>
    </Card>
  )
}
