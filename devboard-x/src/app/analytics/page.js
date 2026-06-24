"use client"

import { useEffect, useState, useMemo } from "react"
import { ArrowLeft, CheckCircle2, Circle, Clock, Code2, Play, FolderKanban, ListTodo, FileCode, Search, Activity, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

import { useTheme } from "@/context/ThemeContext"
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
  ResponsiveContainer,
  Legend
} from "recharts"

const COLORS = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  rose: "#f43f5e",
  purple: "#a855f7",
  cyan: "#06b6d4",
  emerald: "#10b981",
  zinc: "#71717a"
}

const PRIORITY_COLORS = {
  High: COLORS.rose,
  Medium: COLORS.amber,
  Low: COLORS.emerald
}

const STATUS_COLORS = {
  Completed: COLORS.green,
  Pending: COLORS.zinc,
  "In Progress": COLORS.blue
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
const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    const isDark = theme === "dark"
    return (
      <div className={`p-3 rounded-lg border shadow-xl text-sm font-medium ${isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-800"}`}>
        <p className="mb-2 text-xs opacity-70">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.payload?.fill }} />
            <span className="opacity-80 capitalize">{p.name}:</span>
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
  const { theme } = useTheme()
  const { projects } = useProjects()
  const { globalActivities } = useActivity()

  const [mounted, setMounted] = useState(false)
  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

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
    try {
      const savedSnippets = localStorage.getItem("devboard-snippets")
      if (savedSnippets) totalSnippetsCount = JSON.parse(savedSnippets).length
    } catch (e) { }

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

    if (aggregatedData.highPriority > aggregatedData.mediumPriority + aggregatedData.lowPriority) {
      out.push("Your workload is heavily weighted towards High Priority tasks.")
    } else if (aggregatedData.mediumPriority > 0) {
      out.push("Most of your tasks are Medium Priority.")
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

  if (!mounted) {
    return (
      <div className={`min-h-screen p-4 md:p-8 transition-colors ${isDark ? "bg-[#09090b] text-white" : "bg-zinc-50 text-black"}`}>
        <div className="mb-8 animate-pulse">
          <div className={`h-10 w-64 rounded-lg mb-2 ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
          <div className={`h-5 w-96 rounded-lg ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-32 rounded-2xl ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className={`h-96 rounded-2xl lg:col-span-2 ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
          <div className={`h-96 rounded-2xl ${isDark ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
        </div>
      </div>
    )
  }

  const cardBase = `border rounded-2xl p-6 transition-all duration-300 relative overflow-hidden group ${isDark ? "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700/80 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]" : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.03)]"
    }`

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors ${isDark ? "bg-[#09090b] text-white" : "bg-zinc-50 text-black"}`}>



      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Activity className="text-blue-500" size={32} />
          Workspace Analytics
        </h1>
        <p className={`mt-2 text-sm md:text-base ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
          Actionable insights and comprehensive performance metrics.
        </p>
      </div>

      {/* 1. PRODUCTIVITY OVERVIEW (STAT CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard isDark={isDark} title="Total Projects" value={aggregatedData.totalProjects} icon={FolderKanban} color="text-blue-500" bg="bg-blue-500/10" trend="+2" />
        <StatCard isDark={isDark} title="Total Tasks" value={aggregatedData.totalTasks} icon={ListTodo} color="text-indigo-500" bg="bg-indigo-500/10" trend="+12" />
        <StatCard isDark={isDark} title="Completed Tasks" value={aggregatedData.completedTasks} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-500/10" trend="+5" />
        <StatCard isDark={isDark} title="Completion Rate" value={`${aggregatedData.completionRate}%`} icon={Activity} color="text-cyan-500" bg="bg-cyan-500/10" trend="+3%" />

        <StatCard isDark={isDark} title="Files Created" value={aggregatedData.totalFilesCount} icon={FileCode} color="text-amber-500" bg="bg-amber-500/10" />
        <StatCard isDark={isDark} title="Snippets Saved" value={aggregatedData.totalSnippetsCount} icon={Code2} color="text-purple-500" bg="bg-purple-500/10" />
        <StatCard isDark={isDark} title="Project Runs" value={aggregatedData.projectRunsCount} icon={Play} color="text-rose-500" bg="bg-rose-500/10" />
      </div>

      {/* CHARTS GRID (12 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">

        {/* TASK STATUS DOUGHNUT */}
        <div className={`md:col-span-6 xl:col-span-3 ${cardBase}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            Task Status
          </h2>
          <div className="h-[220px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip theme={theme} />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState isDark={isDark} />
            )}
          </div>
        </div>

        {/* PRIORITY DOUGHNUT */}
        <div className={`md:col-span-6 xl:col-span-3 ${cardBase}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] rounded-full pointer-events-none" />
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            Priority Distribution
          </h2>
          <div className="h-[220px]">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip theme={theme} />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState isDark={isDark} />
            )}
          </div>
        </div>

        {/* WEEKLY ACTIVITY LINE CHART */}
        <div className={`md:col-span-12 xl:col-span-6 ${cardBase}`}>
          <div className="absolute top-0 left-1/2 w-64 h-32 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none -translate-x-1/2" />
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            Weekly Activity
          </h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivityData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#3f3f46" : "#e4e4e7"} />
                <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#a1a1aa' : '#52525b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#a1a1aa' : '#52525b' }} />
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" name="Tasks Created" dataKey="created" stroke={COLORS.blue} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Tasks Completed" dataKey="completed" stroke={COLORS.green} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* TABLES AND TIMELINE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">

        {/* PROJECT PERFORMANCE TABLE */}
        <div className={`xl:col-span-8 ${cardBase} p-0 overflow-hidden flex flex-col`}>
          <div className="p-6 border-b border-zinc-800/30">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Project Performance
            </h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className={`${isDark ? "bg-zinc-900/50 text-zinc-400" : "bg-zinc-50 text-zinc-400"} text-xs uppercase tracking-wider`}>
                <tr>
                  <th className="px-6 py-4 font-semibold">Project Name</th>
                  <th className="px-6 py-4 font-semibold text-center">Tasks</th>
                  <th className="px-6 py-4 font-semibold">Completion</th>
                  <th className="px-6 py-4 font-semibold text-center">Runs</th>
                  <th className="px-6 py-4 font-semibold">Last Activity</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-zinc-800/50" : "divide-zinc-200"}`}>
                {aggregatedData.projectPerformance.length > 0 ? (
                  aggregatedData.projectPerformance.map((proj) => (
                    <tr key={proj.id} className={`transition-colors ${isDark ? "hover:bg-zinc-800/30" : "hover:bg-zinc-50"}`}>
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {proj.name}
                      </td>
                      <td className="px-6 py-4 text-center">{proj.tasks}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full max-w-[100px] h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proj.completion}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{proj.completion}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"}`}>
                          {proj.runs}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-xs ${isDark ? "text-zinc-400" : "text-zinc-400"}`}>
                        {formatRelativeTime(proj.lastActivity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-400 italic">No projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIVITY TIMELINE */}
        <div className={`xl:col-span-4 ${cardBase} flex flex-col h-[500px]`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            Activity Timeline
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-300 dark:before:via-zinc-800 before:to-transparent">
            {globalActivities.length > 0 ? (
              globalActivities.slice(0, 10).map((activity, i) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${isDark ? "bg-zinc-900 border-zinc-950 text-blue-400" : "bg-white border-zinc-50 text-blue-500"
                      }`}>
                      <Icon size={16} />
                    </div>
                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-sm transition-all ${isDark ? "bg-zinc-900/50 border-zinc-800 group-hover:border-zinc-700" : "bg-white border-zinc-200 group-hover:border-zinc-300"
                      }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-400"}`}>
                          {activity.projectTitle || "Global"}
                        </span>
                        <time className={`text-[10px] font-medium ${isDark ? "text-zinc-400" : "text-zinc-400"}`}>
                          {formatRelativeTime(activity.timestamp)}
                        </time>
                      </div>
                      <p className={`text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                        {activity.message}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <Clock size={32} className="mb-3 text-zinc-400" />
                <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>No activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* WORKSPACE INSIGHTS */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 px-2">
          <Sparkles className="text-amber-500" size={20} />
          Workspace Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border flex flex-col justify-center min-h-[100px] relative overflow-hidden group ${isDark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"
                }`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                <p className={`text-sm font-medium relative z-10 leading-relaxed ${isDark ? "text-amber-200/90" : "text-amber-900"}`}>
                  {insight}
                </p>
              </div>
            ))
          ) : (
            <div className={`col-span-full p-6 rounded-2xl border text-center ${isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
              <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-400"}`}>Not enough data to generate insights yet. Keep working!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

function StatCard({ isDark, title, value, icon: Icon, color, bg, trend }) {
  return (
    <div className={`border rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 ${isDark ? "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md"
      }`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[40px] rounded-full pointer-events-none transition-all duration-500 opacity-50 group-hover:opacity-100 ${bg}`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon size={20} className={color} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className={`text-3xl font-black tracking-tight mb-1 ${isDark ? "text-white" : "text-zinc-900"}`}>
          {value}
        </h3>
        <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-400"}`}>
          {title}
        </p>
      </div>
    </div>
  )
}

function EmptyChartState({ isDark }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className={`w-24 h-24 rounded-full border-4 border-dashed flex items-center justify-center ${isDark ? "border-zinc-800 text-zinc-700" : "border-zinc-200 text-zinc-300"}`}>
        <Search size={32} />
      </div>
      <p className={`text-xs mt-4 font-medium ${isDark ? "text-zinc-400" : "text-zinc-400"}`}>Not enough data</p>
    </div>
  )
}