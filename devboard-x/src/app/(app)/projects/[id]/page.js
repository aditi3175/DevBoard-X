"use client"

import { useParams } from "next/navigation"
import {
  CheckCircle,
  Clock,
  Code2,
  Link2,
  ListTodo,
  TrendingUp,
  AlertTriangle
} from "lucide-react"

import EmptyState from "@/components/ui/EmptyState"

import { useProjects } from "@/context/ProjectContext"
import ProjectHeader from "@/components/project/ProjectHeader"
import ProjectSubNav from "@/components/project/ProjectSubNav"
import QuickActionsBar from "@/components/project/QuickActionsBar"
import ProjectHealthSection from "@/components/project/ProjectHealthSection"
import ProjectActivityFeed from "@/components/project/ProjectActivityFeed"
import RecentTasksList from "@/components/project/RecentTasksList"
import RecentResourcesList from "@/components/project/RecentResourcesList"
import WidgetCard from "@/components/widgets/WidgetCard"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

export default function ProjectOverviewPage() {
  const params = useParams()
  const { projects, isLoaded } = useProjects()

  const projectId = params.id === "undefined" ? null : params.id
  const isOldProject = !isNaN(Number(projectId))
  const projectIndex = isOldProject ? Number(projectId) : projects.findIndex(p => p._id === projectId)
  const project = projects[projectIndex]

  const tasks = useQuery(api.tasks.getTasks, project?._id ? { projectId: project._id } : "skip") || []
  const resources = useQuery(api.resources.getResources, project?._id ? { projectId: project._id } : "skip") || []
  const fetchedActivity = useQuery(api.activity.getProjectActivity, project?._id ? { projectId: project._id } : "skip")

  if (!isLoaded) {
    return (
      <div className="h-full flex-1 p-6 transition bg-surface text-text-main">
        <div className="mb-8 animate-pulse">
          <div className="h-12 w-64 rounded-xl mb-3 bg-bg-active"></div>
          <div className="h-6 w-96 rounded-lg bg-bg-active"></div>
        </div>
        <div className="h-14 w-full rounded-2xl mb-8 animate-pulse bg-bg-active"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
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

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const totalResources = resources.length
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
  
  const metrics = {
    totalTasks,
    completedTasks,
    pendingTasks,
    totalResources,
    totalSnippets: 0, // Snippets are now global
    progressPercent
  }

  const activity = fetchedActivity || []

  return (
    <div
      className="workspace-canvas h-full flex-1 p-6 text-text-main overflow-y-auto"
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
          color="bg-info-bg text-info-text"
        />
        <WidgetCard
          Icon={CheckCircle}
          title="Completed Tasks"
          value={metrics.completedTasks}
          color="bg-success-bg text-success-text"
        />
        <WidgetCard
          Icon={Clock}
          title="Pending Tasks"
          value={metrics.pendingTasks}
          color="bg-warning-bg text-warning-text"
        />
        <WidgetCard
          Icon={Code2}
          title="Total Snippets"
          value={metrics.totalSnippets}
          color="bg-accent/10 text-accent"
        />
        <WidgetCard
          Icon={Link2}
          title="Total Resources"
          value={metrics.totalResources}
          color="bg-info-bg text-info-text"
        />
        <WidgetCard
          Icon={TrendingUp}
          title="Project Progress"
          value={`${metrics.progressPercent}%`}
          color="bg-warning-bg text-warning-text"
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
          <RecentTasksList project={project} />
          <RecentResourcesList project={project} resources={resources} />
        </div>
      </div>
    </div>
  )
}
