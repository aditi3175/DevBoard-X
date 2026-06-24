"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/context/ThemeContext"
import {
  formatProjectDate,
  getProjectCreatedAt,
  getProjectLastUpdated,
  getStatusStyles
} from "@/utils/projectOverview"

export default function ProjectHeader({ project, showBack = true }) {
  const router = useRouter()
  const { theme } = useTheme()

  const createdAt = getProjectCreatedAt(project)
  const lastUpdated = getProjectLastUpdated(project)

  return (
    <>
      {showBack && (
        <button
          onClick={() => router.push("/projects")}
          className={`mb-8 flex items-center gap-2 px-4 py-2 rounded-xl ${
            theme === "dark"
              ? "bg-zinc-900 hover:bg-zinc-800"
              : "bg-zinc-100 hover:bg-zinc-200"
          }`}
        >
          <ArrowLeft size={18} />
          Back
        </button>
      )}

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold">{project.title}</h1>

          <p
            className={`mt-3 ${
              theme === "dark" ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            {project.description}
          </p>
        </div>

        <span
          className={`self-start px-4 py-1.5 text-sm font-medium rounded-full ${getStatusStyles(project.status)}`}
        >
          {project.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {(project.techStack || []).map((tech, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-lg text-sm ${
              theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"
            }`}
          >
            {tech}
          </span>
        ))}
      </div>

      <div
        className={`flex flex-wrap gap-6 mt-4 text-sm ${
          theme === "dark" ? "text-zinc-400" : "text-zinc-600"
        }`}
      >
        <p>
          <strong className={theme === "dark" ? "text-zinc-300" : "text-zinc-800"}>
            Created:
          </strong>{" "}
          {formatProjectDate(createdAt)}
        </p>
        <p>
          <strong className={theme === "dark" ? "text-zinc-300" : "text-zinc-800"}>
            Last Updated:
          </strong>{" "}
          {formatProjectDate(lastUpdated)}
        </p>
      </div>
    </>
  )
}
