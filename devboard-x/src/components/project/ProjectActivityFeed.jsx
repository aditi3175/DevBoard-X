"use client"

import { useTheme } from "@/context/ThemeContext"
import { getActivityIcon } from "@/utils/projectActivity"
import { formatProjectDate } from "@/utils/projectOverview"

export default function ProjectActivityFeed({ activity = [] }) {
  const { theme } = useTheme()

  const sorted = [...activity].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div
      className={`border rounded-2xl p-5 h-full ${theme === "dark"
          ? "bg-zinc-900 border-zinc-800"
          : "bg-zinc-100 border-zinc-300"
        }`}
    >
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

      {sorted.length === 0 ? (
        <p
          className={`text-center py-10 ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"
            }`}
        >
          No activity yet. Start by creating a task or adding a resource.
        </p>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {sorted.map((entry) => (
            <div
              key={entry.id}
              className={`flex gap-3 p-3 rounded-xl ${theme === "dark" ? "bg-zinc-950" : "bg-white"
                }`}
            >
              <span className="shrink-0 flex items-center justify-center">
                {(() => {
                  const Icon = getActivityIcon(entry.type)
                  return <Icon size={18} className={theme === "dark" ? "text-zinc-400" : "text-zinc-400"} />
                })()}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{entry.message}</p>
                <p
                  className={`text-xs mt-1 ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"
                    }`}
                >
                  {formatProjectDate(entry.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
