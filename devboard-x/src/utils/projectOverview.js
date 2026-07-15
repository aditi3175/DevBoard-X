export function getProjectMetrics(project, resources = []) {
  const tasks = project.tasks || []
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const totalSnippets = tasks.reduce(
    (sum, t) => sum + (t.snippets?.length || 0),
    0
  )
  const totalResources = resources.length
  const progressPercent =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100)

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    totalSnippets,
    totalResources,
    progressPercent
  }
}

export function getProjectPhase(progressPercent) {
  if (progressPercent >= 100) {
    return {
      label: "Completed",
      color: "text-success",
      barColor: "bg-success"
    }
  }
  if (progressPercent >= 76) {
    return {
      label: "Finalizing",
      color: "text-primary",
      barColor: "bg-accent"
    }
  }
  if (progressPercent >= 51) {
    return {
      label: "Developing",
      color: "text-info",
      barColor: "bg-info"
    }
  }
  if (progressPercent >= 26) {
    return {
      label: "Building",
      color: "text-warning",
      barColor: "bg-warning"
    }
  }
  return {
    label: "Planning",
    color: "text-text-muted",
    barColor: "bg-bg-active"
  }
}

export function getRecentTasks(project, limit = 5) {
  const tasks = project.tasks || []

  return tasks
    .map((task, taskIndex) => ({ ...task, taskIndex }))
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.taskIndex
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.taskIndex
      return bTime - aTime
    })
    .slice(0, limit)
}

export function getRecentResources(resources = [], limit = 5) {
  return [...resources]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, limit)
}

export function formatProjectDate(value) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

export function getProjectCreatedAt(project) {
  return project.createdAt || null
}

export function getProjectLastUpdated(project) {
  return project.lastUpdatedAt || null
}

export function getStatusStyles(status) {
  if (status === "Active") {
    return "bg-success-bg text-success border-success/30"
  }
  if (status === "Completed") {
    return "bg-info-bg text-info border-info/30"
  }
  if (status === "In Progress") {
    return "bg-warning-bg text-warning border-warning/30"
  }
  return "bg-bg-active text-text-muted border-border-strong"
}
