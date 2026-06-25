"use client"

import { useRouter } from "next/navigation"
import {
  formatProjectDate,
  getProjectCreatedAt,
  getProjectLastUpdated,
  getStatusStyles
} from "@/utils/projectOverview"

export default function ProjectHeader({ project, showBack = true }) {
  const router = useRouter()

  const createdAt = getProjectCreatedAt(project)
  const lastUpdated = getProjectLastUpdated(project)

  return (
    <>


      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-text-main">{project.title}</h1>

          <p
            className="mt-3 text-text-secondary"
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
            className="px-3 py-1 rounded-lg text-sm bg-bg-active text-text-main"
          >
            {tech}
          </span>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-6 mt-4 text-sm text-text-muted"
      >
        <p>
          <strong className="text-text-main">
            Created:
          </strong>{" "}
          {formatProjectDate(createdAt)}
        </p>
        <p>
          <strong className="text-text-main">
            Last Updated:
          </strong>{" "}
          {formatProjectDate(lastUpdated)}
        </p>
      </div>
    </>
  )
}
