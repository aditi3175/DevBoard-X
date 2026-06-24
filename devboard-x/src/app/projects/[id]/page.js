"use client"

import { useParams } from "next/navigation"
import {
  CheckCircle,
  Clock,
  Code2,
  Link2,
  ListTodo,
  TrendingUp
} from "lucide-react"

import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"
import ProjectHeader from "@/components/project/ProjectHeader"
import ProjectSubNav from "@/components/project/ProjectSubNav"
import QuickActionsBar from "@/components/project/QuickActionsBar"
import ProjectHealthSection from "@/components/project/ProjectHealthSection"
import ProjectActivityFeed from "@/components/project/ProjectActivityFeed"
import RecentTasksList from "@/components/project/RecentTasksList"
import RecentResourcesList from "@/components/project/RecentResourcesList"
import WidgetCard from "@/components/widgets/WidgetCard"
import { getProjectMetrics } from "@/utils/projectOverview"

export default function ProjectOverviewPage() {
  const params = useParams()
  const { theme } = useTheme()
  const { projects } = useProjects()

  const projectIndex = Number(params.id)
  const project = projects[projectIndex]

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

  const metrics = getProjectMetrics(project)
  const activity = project.activity || []

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

      <div className="mb-8">
        <QuickActionsBar projectIndex={projectIndex} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <WidgetCard
          Icon={ListTodo}
          title="Total Tasks"
          value={metrics.totalTasks}
          color="bg-blue-500/20 text-blue-400"
        />
        <WidgetCard
          Icon={CheckCircle}
          title="Completed Tasks"
          value={metrics.completedTasks}
          color="bg-green-500/20 text-green-400"
        />
        <WidgetCard
          Icon={Clock}
          title="Pending Tasks"
          value={metrics.pendingTasks}
          color="bg-yellow-500/20 text-yellow-400"
        />
        <WidgetCard
          Icon={Code2}
          title="Total Snippets"
          value={metrics.totalSnippets}
          color="bg-purple-500/20 text-purple-400"
        />
        <WidgetCard
          Icon={Link2}
          title="Total Resources"
          value={metrics.totalResources}
          color="bg-cyan-500/20 text-cyan-400"
        />
        <WidgetCard
          Icon={TrendingUp}
          title="Project Progress"
          value={`${metrics.progressPercent}%`}
          color="bg-orange-500/20 text-orange-400"
        />
      </div>

      <div className="mb-8">
        <ProjectHealthSection
          progressPercent={metrics.progressPercent}
          completedTasks={metrics.completedTasks}
          totalTasks={metrics.totalTasks}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectActivityFeed activity={activity} />
        </div>

        <div className="space-y-6">
          <RecentTasksList project={project} projectIndex={projectIndex} />
          <RecentResourcesList project={project} projectIndex={projectIndex} />
        </div>
      </div>
    </div>
  )
}
