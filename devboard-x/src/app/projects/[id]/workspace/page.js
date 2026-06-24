"use client"

import { useParams, useRouter } from "next/navigation"
import { ExternalLink, FolderCode } from "lucide-react"

import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"
import ProjectHeader from "@/components/project/ProjectHeader"
import ProjectSubNav from "@/components/project/ProjectSubNav"

export default function ProjectWorkspaceHubPage() {
  const router = useRouter()
  const params = useParams()
  const { theme } = useTheme()
  const { projects } = useProjects()

  const projectIndex = Number(params.id)
  const project = projects[projectIndex]

  if (!project) {
    return (
      <div
        className={`min-h-screen p-6 ${theme === "dark"
            ? "bg-zinc-950 text-white"
            : "bg-white text-black"
          }`}
      >
        <h1 className="text-3xl font-bold">Project Not Found</h1>
      </div>
    )
  }

  const tasks = project.tasks || []

  const sectionClass = `border rounded-2xl p-5 ${theme === "dark"
      ? "bg-zinc-900 border-zinc-800"
      : "bg-zinc-100 border-zinc-300"
    }`

  return (
    <div
      className={`min-h-screen p-6 ${theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
        }`}
    >
      <ProjectHeader project={project} />
      <ProjectSubNav projectIndex={projectIndex} />

      <div className={sectionClass}>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <FolderCode size={24} className="text-blue-400" />
          Workspace Hub
        </h2>

        <p
          className={`mb-6 ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"
            }`}
        >
          Each task has its own code workspace. Open a task below to start
          coding.
        </p>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p
              className={`text-lg mb-4 ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"
                }`}
            >
              No tasks yet. Create a task first to open a workspace.
            </p>
            <button
              onClick={() => router.push(`/projects/${projectIndex}/tasks`)}
              className="px-5 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
            >
              Go to Tasks
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl ${theme === "dark" ? "bg-zinc-950" : "bg-white"
                  }`}
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p
                    className={`text-sm mt-1 ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"
                      }`}
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
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
