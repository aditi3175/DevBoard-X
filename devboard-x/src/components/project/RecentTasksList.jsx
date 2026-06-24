"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "@/context/ThemeContext"
import { getRecentTasks } from "@/utils/projectOverview"

export default function RecentTasksList({ project, projectIndex }) {
  const router = useRouter()
  const { theme } = useTheme()
  const recentTasks = getRecentTasks(project, 5)

  return (
    <div
      className={`border rounded-2xl p-5 ${theme === "dark"
          ? "bg-zinc-900 border-zinc-800"
          : "bg-zinc-100 border-zinc-300"
        }`}
    >
      <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>

      {recentTasks.length === 0 ? (
        <div className="text-center py-6">
          <p
            className={`mb-3 ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"
              }`}
          >
            No tasks yet.
          </p>
          <button
            onClick={() => router.push(`/projects/${projectIndex}/tasks`)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Create your first task →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentTasks.map((task) => (
            <button
              key={task.taskIndex}
              onClick={() =>
                router.push(
                  `/projects/${projectIndex}/tasks/${task.taskIndex}`
                )
              }
              className={`w-full text-left p-4 rounded-xl transition hover:scale-[1.01] ${theme === "dark"
                  ? "bg-zinc-950 hover:bg-zinc-900"
                  : "bg-white hover:bg-zinc-50"
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium truncate">{task.title}</p>
                <span
                  className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${task.priority === "High"
                      ? "bg-red-500/20 text-red-400"
                      : task.priority === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                >
                  {task.priority}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs">
                <span
                  className={
                    task.completed ? "text-green-400" : "text-yellow-400"
                  }
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
                <span className={theme === "dark" ? "text-zinc-400" : "text-zinc-600"}>
                  {task.progress || 0}% progress
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
