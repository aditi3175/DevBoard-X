"use client"

import { useTheme } from "@/context/ThemeContext"

export default function ProjectCard({
  title,
  description,
  status,
  techStack,
  updated,
  tasks = [],
  onDelete,
  onEdit,
  onOpen
}) {

  const { theme } = useTheme()

  const totalTasks = tasks.length

    const completedTasks =
      tasks.filter(
        (task) => task.completed
      ).length

    const progress =
      totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks / totalTasks) * 100
          )

  let statusStyles = ""

  if (status === "Active") {
    statusStyles =
      "bg-green-500/20 text-green-400 border border-green-500/30"
  }

  else if (status === "Completed") {
    statusStyles =
      "bg-blue-500/20 text-blue-400 border border-blue-500/30"
  }

  else if (status === "In Progress") {
    statusStyles =
      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
  }

  return (

    <div
      onClick={onOpen}
      className={`cursor-pointer border rounded-2xl p-5 transition ${
        theme === "dark"
          ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
          : "bg-zinc-100 border-zinc-300 hover:border-zinc-400"
      }`}
    >

      {/* TOP SECTION */}
      <div className="flex items-start justify-between mb-4">

        <div>

          <h2
            className={`text-xl font-semibold ${
              theme === "dark"
                ? "text-white"
                : "text-black"
            }`}
          >
            {title}
          </h2>

          <p
            className={`text-sm mt-1 ${
              theme === "dark"
                ? "text-zinc-400"
                : "text-zinc-600"
            }`}
          >
            {description}
          </p>

        </div>

        {/* STATUS BADGE */}
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles}`}
        >
          {status}
        </span>

      </div>

      {/* TECH STACK */}
      <div className="flex flex-wrap gap-2 mb-5">

        {techStack.map((tech, index) => (

          <span
            key={index}
            className={`px-3 py-1 text-sm rounded-lg ${
              theme === "dark"
                ? "bg-zinc-800 text-zinc-300"
                : "bg-zinc-200 text-zinc-700"
            }`}
          >
            {tech}
          </span>

        ))}

      </div>

      <div className="mb-5">

        <div className="flex justify-between text-sm mb-2">

          <span>
            Progress
          </span>

          <span>
            {progress}%
          </span>

        </div>

        <div
          className={`w-full h-2 rounded-full overflow-hidden ${
            theme === "dark"
              ? "bg-zinc-800"
              : "bg-zinc-300"
          }`}
        >

          <div
            className={`h-full ${
              progress === 100
                ? "bg-green-500"
                : progress >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${progress}%`
            }}
          />

        </div>

        <p
          className={`text-sm mt-2 ${
            theme === "dark"
              ? "text-zinc-400"
              : "text-zinc-600"
          }`}
        >
          {completedTasks} / {totalTasks} Tasks Complete
        </p>

      </div>

      {/* FOOTER */}
      <div
        className={`flex items-center justify-between text-sm pt-4 border-t ${
          theme === "dark"
            ? "text-zinc-400 border-zinc-800"
            : "text-zinc-600 border-zinc-300"
        }`}
      >

        <p>
          {updated}
        </p>

        <div className="flex items-center gap-4">

          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-red-400 hover:text-red-300 transition"
          >
            Delete
          </button>

        </div>

      </div>

    </div>

  )

}