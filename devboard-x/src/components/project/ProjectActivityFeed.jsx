"use client"

import { getActivityIcon } from "@/utils/projectActivity"
import { formatProjectDate } from "@/utils/projectOverview"
import EmptyState from "@/components/ui/EmptyState"
import Card from "@/components/ui/Card"
import { Activity } from "lucide-react"

export default function ProjectActivityFeed({ activity = [] }) {
  const sorted = [...activity].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <Card className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-text-main">Recent Activity</h2>

      {sorted.length === 0 ? (
        <div className="flex-1 min-h-[300px]">
          <EmptyState 
            variant="compact"
            icon={Activity}
            title="No activity yet"
            description="Start by creating a task or adding a resource."
          />
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {sorted.map((entry, index) => (
            <div
              key={entry._id || entry.id || index}
              className="flex gap-3 p-3 rounded-xl bg-bg-active"
            >
              <span className="shrink-0 flex items-center justify-center">
                {(() => {
                  const Icon = getActivityIcon(entry.type)
                  return <Icon size={18} className="text-text-muted" />
                })()}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-main">{entry.message}</p>
                <p
                  className="text-xs mt-1 text-text-secondary"
                >
                  {formatProjectDate(entry.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
