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
import { useProjects } from "@/context/ProjectContext"
import {
  exportProject,
  downloadJSON,
  slugify
} from "@/utils/projectExportImport"
import ToastNotification from "@/components/layout/ToastNotification"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

export default function QuickActionsBar({ projectIndex }) {
  const router = useRouter()
  const { projects } = useProjects()

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" })

  const project = projects[projectIndex]

  const handleExportProject = () => {
    if (!project) return

    try {
      const jsonString = exportProject(project)
      const filename = `${slugify(project.title)}-export.json`
      downloadJSON(jsonString, filename)

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
      variant: "primary"
    },
    {
      label: "Open Workspace",
      icon: FolderCode,
      href: `/projects/${projectIndex}/workspace`,
      variant: "secondary"
    },
    {
      label: "Add Resource",
      icon: Link2,
      href: `/projects/${projectIndex}/resources`,
      variant: "secondary"
    }
  ]

  return (
    <>
      <Card>
        <h2 className="text-lg font-semibold mb-4 text-text-main">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            return (
              <Button
                key={action.label}
                variant={action.variant}
                onClick={() => router.push(action.href)}
                className="w-full h-auto py-3.5"
                leftIcon={action.icon}
              >
                {action.label}
              </Button>
            )
          })}

          {/* Export Project Button */}
          <Button
            variant="secondary"
            onClick={handleExportProject}
            className="w-full h-auto py-3.5"
            id="export-project-btn"
            leftIcon={Download}
          >
            Export Project
          </Button>
        </div>
      </Card>

      <ToastNotification
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </>
  )
}
