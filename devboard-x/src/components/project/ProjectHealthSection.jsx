"use client"

import { useTheme } from "@/context/ThemeContext"
import { getProjectPhase } from "@/utils/projectOverview"

export default function ProjectHealthSection({ progressPercent, completedTasks, totalTasks }) {
  const { theme } = useTheme()
  const phase = getProjectPhase(progressPercent)

  return (
    <div
      className={`border rounded-2xl p-5 ${
        theme === "dark"
          ? "bg-zinc-900 border-zinc-800"
          : "bg-zinc-100 border-zinc-300"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Project Health</h2>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-zinc-800/50 ${phase.color}`}>
          {phase.label}
        </span>
      </div>

      <div className="flex justify-between mb-2 text-sm">
        <span className={theme === "dark" ? "text-zinc-400" : "text-zinc-600"}>
          Completion Progress
        </span>
        <span className="font-semibold">{progressPercent}%</span>
      </div>

      <div
        className={`w-full h-4 rounded-full overflow-hidden ${
          theme === "dark" ? "bg-zinc-800" : "bg-zinc-300"
        }`}
      >
        <div
          className={`h-full transition-all duration-500 ${phase.barColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p
        className={`mt-3 text-sm ${
          theme === "dark" ? "text-zinc-400" : "text-zinc-600"
        }`}
      >
        {completedTasks} of {totalTasks} tasks completed
      </p>
    </div>
  )
}
