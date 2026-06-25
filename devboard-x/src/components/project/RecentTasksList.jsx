"use client"

import { getRecentTasks } from "@/utils/projectOverview"
import EmptyState from "@/components/ui/EmptyState"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import Card from "@/components/ui/Card"
import { useRouter } from "next/navigation"

export default function RecentTasksList({ project, projectIndex }) {
  const router = useRouter()
  const recentTasks = getRecentTasks(project, 5)

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4 text-text-main">Recent Tasks</h2>

      {recentTasks.length === 0 ? (
        <EmptyState 
          variant="compact"
          icon={CheckCircle}
          title="No tasks yet"
          description="Create your first task to track progress."
          primaryAction={{ label: "Create Task", onClick: () => router.push(`/projects/${projectIndex}/tasks`) }}
        />
      ) : (
        <div className="space-y-3">
          {recentTasks.map((task) => (
            <Link
              key={task.taskIndex}
              href={`/projects/${projectIndex}/tasks/${task.taskIndex}`}
              className="block w-full text-left p-4 rounded-xl transition bg-bg-active hover:bg-bg-hover outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium truncate text-text-main">{task.title}</p>
                <span
                  className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${task.priority === "High"
                      ? "bg-danger-bg text-danger-text"
                      : task.priority === "Medium"
                        ? "bg-warning-bg text-warning-text"
                        : "bg-neutral-bg text-neutral-text"
                    }`}
                >
                  {task.priority}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs">
                <span
                  className={
                    task.completed ? "text-success-text" : "text-warning-text"
                  }
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
                <span className="text-text-secondary">
                  {task.progress || 0}% progress
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
