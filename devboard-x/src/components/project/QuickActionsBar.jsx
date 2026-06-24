"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  FolderCode,
  Link2,
  Code2,
  Download
} from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"
import { useActivity } from "@/context/ActivityContext"
import {
  exportProject,
  downloadJSON,
  slugify
} from "@/utils/projectExportImport"
import ToastNotification from "@/components/layout/ToastNotification"

export default function QuickActionsBar({ projectIndex }) {
  const router = useRouter()
  const { theme } = useTheme()
  const { projects } = useProjects()
  const { logActivity } = useActivity()

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" })

  const project = projects[projectIndex]

  const handleExportProject = () => {
    if (!project) return

    try {
      const jsonString = exportProject(project)
      const filename = `${slugify(project.title)}-export.json`
      downloadJSON(jsonString, filename)
      
      logActivity({
        type: "project_exported",
        message: `Exported project "${project.title}"`,
        projectId: projectIndex,
        projectTitle: project.title
      })

      setToast({
        visible: true,
        message: `Exported "${project.title}" successfully!`,
        type: "success"
      })
    } catch {
      setToast({
        visible: true,
        message: "Failed to export project.",
        type: "error"
      })
    }
  }

  const actions = [
    {
      label: "Create Task",
      icon: Plus,
      href: `/projects/${projectIndex}/tasks`,
      color: "bg-green-500 hover:bg-green-600 text-white"
    },
    {
      label: "Open Workspace",
      icon: FolderCode,
      href: `/projects/${projectIndex}/workspace`,
      color: "bg-blue-500 hover:bg-blue-600 text-white"
    },
    {
      label: "Add Resource",
      icon: Link2,
      href: `/projects/${projectIndex}/resources`,
      color: "bg-purple-500 hover:bg-purple-600 text-white"
    }
  ]

  return (
    <>
      <div
        className={`border rounded-2xl p-5 ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium transition ${action.color}`}
              >
                <Icon size={18} />
                {action.label}
              </button>
            )
          })}

          {/* Export Project Button */}
          <button
            onClick={handleExportProject}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium transition bg-amber-500 hover:bg-amber-600 text-white"
            id="export-project-btn"
          >
            <Download size={18} />
            Export Project
          </button>
        </div>
      </div>

      <ToastNotification
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  )
}
