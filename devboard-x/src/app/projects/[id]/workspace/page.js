"use client"

import { useParams, useRouter } from "next/navigation"
import { ExternalLink, FolderCode } from "lucide-react"
import { useProjects } from "@/context/ProjectContext"
import EmptyState from "@/components/ui/EmptyState"
import ProjectHeader from "@/components/project/ProjectHeader"
import ProjectSubNav from "@/components/project/ProjectSubNav"

export default function ProjectWorkspaceHubPage() {
  const router = useRouter()
  const params = useParams()
  const { projects, isLoaded } = useProjects()

  const projectId = params.id === "undefined" ? null : params.id
  const isOldProject = !isNaN(Number(projectId))
  const projectIndex = isOldProject ? Number(projectId) : projects.findIndex(p => p._id === projectId)
  const project = projects[projectIndex]

  if (!isLoaded) {
    return (
      <div className="h-full flex-1 p-6 transition bg-surface text-text-main">
        <div className="mb-8 animate-pulse">
          <div className="h-12 w-64 rounded-xl mb-3 bg-bg-active"></div>
          <div className="h-6 w-96 rounded-lg bg-bg-active"></div>
        </div>
        <div className="h-14 w-full rounded-2xl mb-8 animate-pulse bg-bg-active"></div>
        <div className="h-64 w-full rounded-2xl animate-pulse bg-bg-active"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div
        className="h-full flex-1 p-6 bg-surface text-text-main"
      >
        <h1 className="text-3xl font-bold">Project Not Found</h1>
      </div>
    )
  }

  const tasks = project.tasks || []

  const sectionClass = "border rounded-2xl p-5 bg-surface border-border-subtle"

  return (
    <div
      className="h-full flex-1 p-6 bg-surface text-text-main"
    >
      <ProjectHeader project={project} />
      <ProjectSubNav projectIndex={projectIndex} />

      <div className={sectionClass}>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <FolderCode size={24} className="text-primary" />
          Workspace Hub
        </h2>

        <p
          className="mb-6 text-text-secondary"
        >
          Each task has its own code workspace. Open a task below to start
          coding.
        </p>

        {tasks.length === 0 ? (
          <EmptyState
            icon={FolderCode}
            title="Workspace unavailable"
            description="Select or create a task to launch the IDE environment."
            primaryAction={{ label: "Go to Tasks", onClick: () => router.push(`/projects/${projectIndex}/tasks`) }}
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-bg-active"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p
                    className="text-sm mt-1 text-text-secondary"
                  >
                    {task.template || "HTML"} • {task.progress || 0}% complete
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/projects/${projectIndex}/tasks/${index}`
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition"
                >
                  <ExternalLink size={16} />
                  Open Workspace
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
