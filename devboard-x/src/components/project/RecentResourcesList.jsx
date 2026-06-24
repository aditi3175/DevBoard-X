"use client"

import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { getRecentResources } from "@/utils/projectOverview"
import { getCategoryBadgeStyle } from "@/constants/resourceCategories"

export default function RecentResourcesList({ project, projectIndex }) {
  const router = useRouter()
  const { theme } = useTheme()
  const recentResources = getRecentResources(project, 5)

  const handleOpen = (url) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      className={`border rounded-2xl p-5 ${theme === "dark"
          ? "bg-zinc-900 border-zinc-800"
          : "bg-zinc-100 border-zinc-300"
        }`}
    >
      <h2 className="text-xl font-semibold mb-4">Recent Resources</h2>

      {recentResources.length === 0 ? (
        <div className="text-center py-6">
          <p
            className={`mb-3 ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"
              }`}
          >
            No resources yet.
          </p>
          <button
            onClick={() => router.push(`/projects/${projectIndex}/resources`)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Add your first resource →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentResources.map((resource) => (
            <button
              key={resource.id}
              onClick={() => handleOpen(resource.url)}
              className={`w-full text-left p-4 rounded-xl transition hover:scale-[1.01] ${theme === "dark"
                  ? "bg-zinc-950 hover:bg-zinc-900"
                  : "bg-white hover:bg-zinc-50"
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium truncate">{resource.title}</p>
                <ExternalLink size={14} className="text-blue-400 shrink-0 mt-1" />
              </div>

              <span
                className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full border ${getCategoryBadgeStyle(resource.category)}`}
              >
                {resource.category}
              </span>

              <p className="text-xs text-blue-400 truncate mt-2">
                {resource.url}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
