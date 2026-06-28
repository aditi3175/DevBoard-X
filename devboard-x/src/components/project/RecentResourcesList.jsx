"use client"

import { useRouter } from "next/navigation"
import { ExternalLink, Link2 } from "lucide-react"
import EmptyState from "@/components/ui/EmptyState"
import Card from "@/components/ui/Card"
import { getRecentResources } from "@/utils/projectOverview"
import { getCategoryBadgeStyle } from "@/constants/resourceCategories"

export default function RecentResourcesList({ project, projectIndex, resources = [] }) {
  const router = useRouter()
  const recentResources = getRecentResources(resources, 5)

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4 text-text-main">Recent Resources</h2>

      {recentResources.length === 0 ? (
        <EmptyState 
          variant="compact"
          icon={Link2}
          title="No resources yet"
          description="Add links to documentation, design files, or repositories."
          primaryAction={{ label: "Add Resource", onClick: () => router.push(`/projects/${projectIndex}/resources`) }}
        />
      ) : (
        <div className="space-y-3">
          {recentResources.map((resource) => (
            <a
              key={resource._id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left p-4 rounded-xl transition bg-bg-active hover:bg-bg-hover outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium truncate text-text-main">{resource.title}</p>
                <ExternalLink size={14} className="text-blue-500 dark:text-blue-400 shrink-0 mt-1" />
              </div>

              <span
                className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full border ${getCategoryBadgeStyle(resource.category)}`}
              >
                {resource.category}
              </span>

              <p className="text-xs text-blue-500 dark:text-blue-400 truncate mt-2">
                {resource.url}
              </p>
            </a>
          ))}
        </div>
      )}
    </Card>
  )
}
