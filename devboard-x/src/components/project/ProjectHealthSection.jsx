"use client"

import { getProjectPhase } from "@/utils/projectOverview"
import Card from "@/components/ui/Card"

export default function ProjectHealthSection({ progressPercent, completedTasks, totalTasks }) {
  const phase = getProjectPhase(progressPercent)

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-text-main">Project Health</h2>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-bg-active ${phase.color}`}>
          {phase.label}
        </span>
      </div>

      <div className="flex justify-between mb-2 text-sm text-text-main">
        <span className="text-text-secondary">
          Completion Progress
        </span>
        <span className="font-semibold">{progressPercent}%</span>
      </div>

      <div
        className="w-full h-4 rounded-full overflow-hidden bg-bg-active"
      >
        <div
          className={`h-full transition-all duration-500 ${phase.barColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p
        className="mt-3 text-sm text-text-secondary"
      >
        {completedTasks} of {totalTasks} tasks completed
      </p>
    </Card>
  )
}
