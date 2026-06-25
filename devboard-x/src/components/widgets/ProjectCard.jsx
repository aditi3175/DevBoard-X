"use client"
import Button from "@/components/ui/Button"

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
      className="cursor-pointer border rounded-2xl p-5 transition bg-surface border-border-subtle hover:border-border-strong"
    >

      {/* TOP SECTION */}
      <div className="flex items-start justify-between mb-4">

        <div>

          <h2
            className="text-xl font-semibold text-text-main"
          >
            {title}
          </h2>

          <p
            className="text-sm mt-1 text-text-secondary"
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
            className="px-3 py-1 text-sm rounded-lg bg-bg-active text-text-main"
          >
            {tech}
          </span>

        ))}

      </div>

      <div className="mb-5">

        <div className="flex justify-between text-sm mb-2 text-text-main">

          <span>
            Progress
          </span>

          <span>
            {progress}%
          </span>

        </div>

        <div
          className="w-full h-2 rounded-full overflow-hidden bg-bg-active"
        >

          <div
            className={`h-full ${
              totalTasks === 0
                ? "bg-neutral"
                : progress === 100
                ? "bg-success"
                : progress >= 50
                ? "bg-warning"
                : "bg-primary"
            }`}
            style={{
              width: `${progress}%`
            }}
          />

        </div>

        <p
          className="text-sm mt-2 text-text-secondary"
        >
          {completedTasks} / {totalTasks} Tasks Complete
        </p>

      </div>

      {/* FOOTER */}
      <div
        className="flex items-center justify-between text-sm pt-4 border-t text-text-muted border-border-subtle"
      >

        <p>
          {updated}
        </p>

        <div className="flex items-center gap-2">

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            Edit
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            Delete
          </Button>

        </div>

      </div>

    </div>

  )

}