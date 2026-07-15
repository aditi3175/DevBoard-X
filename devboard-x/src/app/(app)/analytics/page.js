"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import {
  CheckCircle2, Circle, Clock, Code2, Play, FolderKanban, ListTodo,
  FileCode, Search, Activity, Sparkles, Folder, Archive, Save, Flame, Layout,
  Link2, Trophy, BarChart3, Database, CalendarDays
} from "lucide-react"
import { useRouter } from "next/navigation"
import EmptyState from "@/components/ui/EmptyState"
import Card from "@/components/ui/Card"

import { getActivityIcon, getActivityCategory, getCategoryEmoji } from "@/utils/projectActivity"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"

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
  primary: "var(--color-accent)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  neutral: "var(--color-text-muted)"
}

const CHART_COLORS = [
  "var(--color-accent)",    // Terminal green
  "var(--color-info)",      // Blue
  "var(--color-warning)",   // Yellow/Orange
  "#a855f7",                // Purple
  "var(--color-danger)",    // Red
  "#06b6d4",                // Cyan
  "#ec4899",                // Pink
]

const PRIORITY_COLORS = {
  High: COLORS.danger,
  Medium: COLORS.warning,
  Low: COLORS.neutral
}

const STATUS_COLORS = {
  Completed: COLORS.success,
  Pending: COLORS.neutral,
  "In Progress": COLORS.info
}

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-[var(--radius-md)] border text-sm font-medium bg-surface border-border-strong text-text-main">
        <p className="mb-2 font-mono text-xs text-text-muted">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.payload?.fill }} />
            <span className="text-text-sub capitalize">{p.name}:</span>
            <span className="font-bold">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 border-b border-border p-4">
      <Icon size={16} className="text-text-muted shrink-0" />
      <div>
        <span className="font-mono text-2xl font-bold text-text-main">{value}</span>
        <p className="eyebrow mt-0.5">{title}</p>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const router = useRouter()

  const analyticsData = useQuery(api.analytics.getWorkspaceMetrics)
  const fetchedActivities = useQuery(api.activity.getActivity)

  const isLoaded = analyticsData !== undefined && fetchedActivities !== undefined

  const { workspace, lifetime } = useMemo(() => {
    if (!analyticsData) return { workspace: null, lifetime: null }
    return analyticsData
  }, [analyticsData])

  const globalActivities = useMemo(() => fetchedActivities || [], [fetchedActivities])

  const statusData = useMemo(() => {
    if (!workspace) return []
    return [
      { name: "Completed", value: workspace.completedTasks, fill: STATUS_COLORS.Completed },
      { name: "In Progress", value: workspace.activeTasks, fill: STATUS_COLORS["In Progress"] },
      { name: "Pending", value: workspace.pendingTasks, fill: STATUS_COLORS.Pending },
    ].filter(d => d.value > 0)
  }, [workspace])

  const priorityData = useMemo(() => {
    if (!workspace) return []
    return [
      { name: "High", value: workspace.highPriority, fill: PRIORITY_COLORS.High },
      { name: "Medium", value: workspace.mediumPriority, fill: PRIORITY_COLORS.Medium },
      { name: "Low", value: workspace.lowPriority, fill: PRIORITY_COLORS.Low },
    ].filter(d => d.value > 0)
  }, [workspace])

  const weeklyActivityData = useMemo(() => {
    if (!workspace) return []
    const data = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0')
      ].join("-")

      const counts = workspace.activityByDate?.[dateStr] || { created: 0, completed: 0 }

      data.push({
        dateStr: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateObj: d,
        created: counts.created,
        completed: counts.completed
      })
    }
    return data
  }, [workspace])

  if (!isLoaded) {
    return (
      <div className="h-full flex-1 p-4 md:p-8 bg-page text-text-main">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 rounded-[var(--radius-md)] mb-2 bg-surface"></div>
          <div className="h-5 w-96 rounded-[var(--radius-md)] bg-surface"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-surface"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex-1 overflow-y-auto bg-page text-text-main">

      {/* SECTION 1: WORKSPACE ANALYTICS */}
      <div className="mb-12 p-4 md:p-8">
        <div className="mb-8">
          <span className="text-text-muted font-mono mb-3 block">~/analytics/workspace</span>
          <h1 className="flex items-center gap-3 text-3xl font-mono font-bold tracking-tight md:text-4xl">
            <span className="text-accent">~/</span>Workspace Performance
          </h1>
          <p className="mt-2 text-sm text-text-sub">
            Track project health, task progress, execution history, and activity trends.
          </p>
        </div>

        {/* METRICS STRIP */}
        <div className="mb-8 grid grid-cols-2 xl:grid-cols-4 border-t border-l border-border">
          <StatCard title="Active Projects" value={workspace.activeProjects} icon={FolderKanban} />
          <StatCard title="Active Tasks" value={workspace.activeTasks} icon={ListTodo} />
          <StatCard title="Completed" value={workspace.completedTasks} icon={CheckCircle2} />
          <StatCard title="Rate" value={`${workspace.completionRate}%`} icon={Activity} />
          <StatCard title="Files" value={workspace.activeFiles} icon={FileCode} />
          <StatCard title="Resources" value={workspace.activeResources} icon={Link2} />
          <StatCard title="Avg Exec" value={`${workspace.averageExecutionTime}ms`} icon={Clock} />
          <StatCard title="Pending" value={workspace.pendingTasks} icon={Circle} />
        </div>

        {/* WORKSPACE CHARTS GRID */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* TASK STATUS DOUGHNUT */}
          <Card className="relative md:col-span-6 xl:col-span-3 ">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Task Status</h2>
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
                <EmptyState variant="compact" icon={ListTodo} title="No tasks" description="Create tasks to visualize status." />
              )}
            </div>
          </Card>

          {/* PRIORITY DOUGHNUT */}
          <Card className="relative md:col-span-6 xl:col-span-3 ">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Priority Distribution</h2>
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
                <EmptyState variant="compact" icon={Activity} title="No priorities" description="Assign priorities to tasks." />
              )}
            </div>
          </Card>

          {/* WEEKLY ACTIVITY LINE CHART */}
          <Card className="relative md:col-span-12 xl:col-span-6 ">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Activity (Last 7 Days)</h2>
            <div className="h-[220px]">
              <SafeChartContainer>
                {(w, h) => (
                  <LineChart width={w} height={h} data={weeklyActivityData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
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

        {/* PROJECT HEALTH TABLE */}
        <Card className="!p-0 relative flex flex-col ">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold flex items-center gap-2">Current Project Health</h2>
          </div>
          <div className="overflow-x-auto flex-1" tabIndex={0}>
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-hover text-text-muted text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Project Name</th>
                  <th className="px-6 py-4 font-semibold text-center">Tasks</th>
                  <th className="px-6 py-4 font-semibold">Completion</th>
                  <th className="px-6 py-4 font-semibold text-center">Runs</th>
                  <th className="px-6 py-4 font-semibold">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(workspace.projectPerformance || []).length > 0 ? (
                  workspace.projectPerformance.map((proj) => (
                    <tr key={proj.id} className="transition-colors hover:bg-surface-hover">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        {proj.name}
                      </td>
                      <td className="px-6 py-4 text-center">{proj.tasks}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full max-w-[100px] h-2 bg-surface rounded-full overflow-hidden">
                            <div className="h-full bg-success rounded-full" style={{ width: `${proj.completion}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{proj.completion}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-surface text-text-sub">
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
      </div>

      <hr className="mb-12 border-border" />

      {/* ======================================================== */}
      {/* SECTION 2: DEVELOPER INSIGHTS */}
      {/* ======================================================== */}
      <div className="mb-12 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-mono font-bold tracking-tight md:text-4xl">
            <span className="text-accent">~/</span><Trophy className="text-warning" size={32} />
            Developer Insights
          </h1>
          <p className="mt-2 text-sm md:text-base text-text-sub">
            Your overall productivity and achievements.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Projects Created" value={lifetime.projectsCreated} icon={Folder} color="text-info" bg="bg-info-bg" />
          <StatCard title="Tasks Created" value={lifetime.tasksCreated} icon={ListTodo} color="text-accent" bg="bg-accent-dim" />
          <StatCard title="Tasks Completed" value={lifetime.tasksCompleted} icon={CheckCircle2} color="text-success" bg="bg-success-bg" />
          <StatCard title="Total Executions" value={lifetime.totalExecutions} icon={Play} color="text-danger" bg="bg-danger-bg" />

          <StatCard title="Files Ever Created" value={lifetime.filesCreated} icon={FileCode} color="text-warning" bg="bg-warning-bg" />
          <StatCard title="Resources Added" value={lifetime.resourcesAdded} icon={Link2} color="text-accent" bg="bg-accent-dim" />
          <StatCard title="Snippets Saved" value={lifetime.snippetsSaved} icon={Code2} color="text-info" bg="bg-info-bg" />
          <StatCard title="Total Activity Events" value={lifetime.totalActivityEvents} icon={Database} color="text-text-muted" bg="bg-surface" />
        </div>

        {/* EXTRA INSIGHT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="flex flex-col justify-center border-border bg-surface ">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-dim flex items-center justify-center text-accent">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-text-sub font-semibold uppercase tracking-wider">Avg Task Completion Time</p>
                <h3 className="text-2xl font-black">{lifetime.averageTaskCompletionTime > 0 ? `${Math.round(lifetime.averageTaskCompletionTime / (1000 * 60 * 60))} hrs` : "N/A"}</h3>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-center border-border bg-surface ">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning-bg flex items-center justify-center text-warning">
                <Code2 size={24} />
              </div>
              <div>
                <p className="text-sm text-text-sub font-semibold uppercase tracking-wider">Most Used Language</p>
                <h3 className="text-2xl font-black capitalize">{lifetime.mostUsedLanguage}</h3>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-center border-border bg-surface ">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center text-success">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-sm text-text-sub font-semibold uppercase tracking-wider">Most Used Snippet</p>
                <h3 className="text-2xl font-black truncate max-w-[200px]">{lifetime.mostUsedSnippet}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* LIFETIME CHARTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* MONTHLY ACTIVITY (PRODUCTIVITY TREND) */}
          <Card className="relative md:col-span-12 xl:col-span-6 ">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Monthly Activity</h2>
            <div className="h-[250px]">
              {lifetime.monthlyActivityData.length > 0 ? (
                <SafeChartContainer>
                  {(w, h) => (
                    <BarChart width={w} height={h} data={lifetime.monthlyActivityData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar name="Activity Events" dataKey="events" fill={COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  )}
                </SafeChartContainer>
              ) : (
                <EmptyState variant="compact" icon={CalendarDays} title="No data yet" description="Your lifetime activity will appear here over time." />
              )}
            </div>
          </Card>

          {/* EXECUTION HISTORY */}
          <Card className="relative md:col-span-12 xl:col-span-6 ">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Execution History</h2>
            <div className="h-[250px]">
              {lifetime.executionHistoryData.length > 0 ? (
                <SafeChartContainer>
                  {(w, h) => (
                    <LineChart width={w} height={h} data={lifetime.executionHistoryData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" name="Code Executions" dataKey="executions" stroke={COLORS.danger} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLORS.danger }} activeDot={{ r: 6 }} />
                    </LineChart>
                  )}
                </SafeChartContainer>
              ) : (
                <EmptyState variant="compact" icon={Play} title="No execution data" description="Run code in the editor to see your execution history." />
              )}
            </div>
          </Card>

          {/* LANGUAGE DISTRIBUTION */}
          <Card className="relative md:col-span-6 xl:col-span-6 ">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Language Distribution (Snippets)</h2>
            <div className="h-[220px]">
              {lifetime.languageDistribution.length > 0 ? (
                <SafeChartContainer>
                  {(w, h) => (
                    <PieChart width={w} height={h}>
                      <Pie data={lifetime.languageDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        {lifetime.languageDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  )}
                </SafeChartContainer>
              ) : (
                <EmptyState variant="compact" icon={Code2} title="No languages" description="Save snippets to populate this chart." />
              )}
            </div>
          </Card>

          {/* SNIPPET USAGE */}
          <Card className="relative md:col-span-6 xl:col-span-6 ">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Top Snippets Usage</h2>
            <div className="h-[220px]">
              {lifetime.snippetUsageData.length > 0 ? (
                <SafeChartContainer>
                  {(w, h) => (
                    <BarChart width={w} height={h} data={lifetime.snippetUsageData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-main)' }} width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar name="Uses" dataKey="uses" fill={COLORS.info} radius={[0, 4, 4, 0]} maxBarSize={30} />
                    </BarChart>
                  )}
                </SafeChartContainer>
              ) : (
                <EmptyState variant="compact" icon={Save} title="No snippet usage" description="Use your snippets across projects." />
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
