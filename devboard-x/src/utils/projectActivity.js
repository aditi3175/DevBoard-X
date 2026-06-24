import { 
  ClipboardList, 
  CheckCircle2, 
  Trash2, 
  Link2, 
  Scissors, 
  Save, 
  Flame, 
  FileEdit, 
  FileX, 
  Rocket, 
  PackageOpen, 
  Download, 
  Zap, 
  Activity 
} from "lucide-react"

export const ACTIVITY_TYPES = {
  PROJECT_CREATED: "project_created",
  TASK_CREATED: "task_created",
  TASK_COMPLETED: "task_completed",
  TASK_DELETED: "task_deleted",
  RESOURCE_ADDED: "resource_added",
  RESOURCE_DELETED: "resource_deleted",
  SNIPPET_SAVED: "snippet_saved",
  SNIPPET_DELETED: "snippet_deleted",
  PROJECT_EXPORTED: "project_exported",
  PROJECT_IMPORTED: "project_imported",
  FILE_CREATED: "file_created",
  FILE_DELETED: "file_deleted",
  FILE_RENAMED: "file_renamed",
  CODE_EXECUTED: "code_executed"
}

const MAX_ACTIVITY = 50

export function buildActivityEntry(type, message, meta = {}) {
  return {
    id: crypto.randomUUID(),
    type,
    message,
    timestamp: new Date().toISOString(),
    meta
  }
}

export function appendProjectActivity(projects, projectIndex, entry) {
  const updated = [...projects]
  const project = updated[projectIndex]

  updated[projectIndex] = {
    ...project,
    activity: [entry, ...(project.activity || [])].slice(0, MAX_ACTIVITY),
    lastUpdatedAt: new Date().toISOString(),
    updated: "Updated just now"
  }

  return updated
}

export function getActivityIcon(type) {
  switch (type) {
    case ACTIVITY_TYPES.TASK_CREATED:
      return ClipboardList
    case ACTIVITY_TYPES.TASK_COMPLETED:
      return CheckCircle2
    case ACTIVITY_TYPES.TASK_DELETED:
      return Trash2
    case ACTIVITY_TYPES.RESOURCE_ADDED:
      return Link2
    case ACTIVITY_TYPES.RESOURCE_DELETED:
      return Scissors
    case ACTIVITY_TYPES.SNIPPET_SAVED:
      return Save
    case ACTIVITY_TYPES.SNIPPET_DELETED:
      return Flame
    case ACTIVITY_TYPES.FILE_CREATED:
    case ACTIVITY_TYPES.FILE_RENAMED:
      return FileEdit
    case ACTIVITY_TYPES.FILE_DELETED:
      return FileX
    case ACTIVITY_TYPES.PROJECT_CREATED:
      return Rocket
    case ACTIVITY_TYPES.PROJECT_EXPORTED:
      return PackageOpen
    case ACTIVITY_TYPES.PROJECT_IMPORTED:
      return Download
    case ACTIVITY_TYPES.CODE_EXECUTED:
      return Zap
    default:
      return Activity
  }
}
