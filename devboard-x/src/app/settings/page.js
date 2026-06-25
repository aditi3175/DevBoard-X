"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useTheme } from "@/context/ThemeContext"
import { usePersistentState } from "@/utils/storage"
import { useProjects } from "@/context/ProjectContext"
import { useActivity } from "@/context/ActivityContext"
import { useRouter } from "next/navigation"
import {

  DatabaseBackup,
  Download,
  Upload,
  HardDriveDownload,
  ShieldCheck,
  FolderKanban,
  ChevronDown
} from "lucide-react"

import {
  exportProject,
  exportAllProjects,
  downloadJSON,
  slugify,
  parseImportFile,
  findConflicts,
  buildSafeTitle
} from "@/utils/projectExportImport"

import Button from "@/components/ui/Button"
import Switch from "@/components/ui/Switch"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Field from "@/components/ui/Field"
import ToastNotification from "@/components/layout/ToastNotification"
import ImportConflictModal from "@/components/layout/ImportConflictModal"

export default function SettingsPage() {
  const router = useRouter()

  // SETTINGS STATE
  const { theme, setTheme, isLoaded: themeLoaded } = useTheme()
  const { projects, setProjects, isLoaded: projectsLoaded } = useProjects()
  const { logActivity, isLoaded: activitiesLoaded } = useActivity()

  const [settings, setSettings, settingsLoaded] = usePersistentState("devboard-settings", {
    username: "",
    email: "",
    notifications: true,
    animations: true
  })

  const isLoaded = themeLoaded && projectsLoaded && activitiesLoaded && settingsLoaded

  // BACKUP & RESTORE STATE
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" })
  const [exportDropdown, setExportDropdown] = useState(false)
  const [conflictModal, setConflictModal] = useState({
    visible: false,
    projectTitle: "",
    conflictCount: 0
  })
  const [pendingImport, setPendingImport] = useState(null) // { projects, conflicts, safe }

  const importInputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // SAVE SETTINGS
  const handleSaveSettings = () => {
    // With usePersistentState, the settings are already saved on change.
    // The explicit save button just shows the success toast.
    setToast({ visible: true, message: "Settings saved successfully!", type: "success" })
  }

  // ─── EXPORT ALL PROJECTS ────────────────────────────────────────
  const handleExportAll = () => {
    if (projects.length === 0) {
      setToast({ visible: true, message: "No projects to export.", type: "error" })
      return
    }

    try {
      const jsonString = exportAllProjects(projects)
      downloadJSON(jsonString, "devboardx-backup.json")

      logActivity({
        type: "project_exported",
        message: `Exported all ${projects.length} projects`
      })

      setToast({
        visible: true,
        message: `Exported all ${projects.length} project${projects.length > 1 ? "s" : ""} successfully!`,
        type: "success"
      })
    } catch {
      setToast({ visible: true, message: "Failed to export projects.", type: "error" })
    }
  }

  // ─── EXPORT SINGLE PROJECT ─────────────────────────────────────
  const handleExportSingle = (projectIndex) => {
    const project = projects[projectIndex]
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
      setToast({ visible: true, message: "Failed to export project.", type: "error" })
    }

    setExportDropdown(false)
  }

  // ─── IMPORT PROJECT ────────────────────────────────────────────
  const handleImportFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await parseImportFile(file)

    // Reset input so the same file can be selected again
    if (importInputRef.current) {
      importInputRef.current.value = ""
    }

    if (!result.valid) {
      setToast({ visible: true, message: result.error, type: "error" })
      return
    }

    const importedProjects = result.projects
    const { conflicts, safe } = findConflicts(importedProjects, projects)

    if (conflicts.length > 0) {
      // Store pending data and show conflict modal
      setPendingImport({ projects: importedProjects, conflicts, safe })
      setConflictModal({
        visible: true,
        projectTitle: conflicts[0].imported.title,
        conflictCount: conflicts.length
      })
    } else {
      // No conflicts — import all directly
      const updatedProjects = [...safe, ...projects]
      setProjects(updatedProjects)

      logActivity({
        type: "project_imported",
        message: `Imported ${importedProjects.length} project${importedProjects.length > 1 ? "s" : ""}`
      })

      setToast({
        visible: true,
        message: `Imported ${importedProjects.length} project${importedProjects.length > 1 ? "s" : ""} successfully!`,
        type: "success"
      })
    }
  }, [projects, setProjects, logActivity])

  // ─── CONFLICT RESOLUTION ───────────────────────────────────────
  const handleKeepBoth = () => {
    if (!pendingImport) return

    const existingTitles = projects.map((p) => p.title)
    const renamedConflicts = pendingImport.conflicts.map((c) => ({
      ...c.imported,
      title: buildSafeTitle(c.imported.title, existingTitles)
    }))

    const updatedProjects = [...renamedConflicts, ...pendingImport.safe, ...projects]
    setProjects(updatedProjects)

    const totalImported = pendingImport.projects.length

    logActivity({
      type: "project_imported",
      message: `Imported ${totalImported} project${totalImported > 1 ? "s" : ""} (kept both)`
    })

    setToast({
      visible: true,
      message: `Imported ${totalImported} project${totalImported > 1 ? "s" : ""} successfully!`,
      type: "success"
    })

    setConflictModal({ visible: false, projectTitle: "", conflictCount: 0 })
    setPendingImport(null)
  }

  const handleReplace = () => {
    if (!pendingImport) return

    let updatedProjects = [...projects]

    // Replace each conflicting project
    for (const conflict of pendingImport.conflicts) {
      updatedProjects[conflict.existingIndex] = conflict.imported
    }

    // Add safe (non-conflicting) projects
    updatedProjects = [...pendingImport.safe, ...updatedProjects]
    setProjects(updatedProjects)

    const totalImported = pendingImport.projects.length

    logActivity({
      type: "project_imported",
      message: `Imported ${totalImported} project${totalImported > 1 ? "s" : ""} (replaced existing)`
    })

    setToast({
      visible: true,
      message: `Imported ${totalImported} project${totalImported > 1 ? "s" : ""} (replaced existing).`,
      type: "success"
    })

    setConflictModal({ visible: false, projectTitle: "", conflictCount: 0 })
    setPendingImport(null)
  }

  const handleCancelImport = () => {
    setConflictModal({ visible: false, projectTitle: "", conflictCount: 0 })
    setPendingImport(null)
  }

  // ─── THEME TOKENS ──────────────────────────────────────────────
  const subtitleClass = "text-text-muted"

  if (!isLoaded) {
    return (
      <div className="h-full flex-1 p-6 transition bg-page text-text-main">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-48 rounded-lg mb-2 bg-bg-active"></div>
          <div className="h-5 w-64 rounded-lg bg-bg-active"></div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
          <div className="w-full lg:w-1/4">
            <div className="h-64 rounded-2xl bg-bg-active"></div>
          </div>
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            <div className="h-64 rounded-2xl bg-bg-active"></div>
            <div className="h-64 rounded-2xl bg-bg-active"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex-1 p-6 transition bg-page text-text-main">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Settings
        </h1>
        <p className={`mt-2 ${subtitleClass}`}>
          Manage your dashboard preferences.
        </p>
      </div>

      {/* SETTINGS CONTAINER */}
      <div className="space-y-6 max-w-3xl">

        {/* PROFILE SECTION */}
        <Card>
          <h2 className="text-2xl font-semibold mb-5">
            Profile Settings
          </h2>
          <div className="space-y-4">
            <Field label="Username" htmlFor="profile-username">
              <Input
                id="profile-username"
                type="text"
                placeholder="Username"
                value={settings.username}
                onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              />
            </Field>
            <Field label="Email" htmlFor="profile-email">
              <Input
                id="profile-email"
                type="email"
                placeholder="Email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </Field>
          </div>
        </Card>

        {/* THEME SECTION */}
        <Card>
          <h2 className="text-2xl font-semibold mb-5">
            Appearance
          </h2>
          <Field label="Theme" htmlFor="appearance-theme">
            <Select
              id="appearance-theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </Select>
          </Field>
        </Card>

        {/* PREFERENCES */}
        <Card>
          <h2 className="text-2xl font-semibold mb-5">
            Preferences
          </h2>
          <div className="space-y-5">
            {/* NOTIFICATIONS */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium" id="label-notifications">
                  Notifications
                </h3>
                <p className={`text-sm ${subtitleClass}`}>
                  Receive dashboard notifications.
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onChange={(checked) => setSettings({ ...settings, notifications: checked })}
                aria-label="Toggle notifications"
              />
            </div>

            {/* ANIMATIONS */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium" id="label-animations">
                  Animations
                </h3>
                <p className={`text-sm ${subtitleClass}`}>
                  Enable UI animations.
                </p>
              </div>
              <Switch
                checked={settings.animations}
                onChange={(checked) => setSettings({ ...settings, animations: checked })}
                aria-label="Toggle animations"
              />
            </div>
          </div>
        </Card>

        {/* SAVE BUTTON */}
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          className="w-full sm:w-auto px-8"
        >
          Save Settings
        </Button>

        {/* ─── BACKUP & RESTORE SECTION ──────────────────────────── */}
        <div className="pt-4">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <ShieldCheck size={24} className="text-blue-400" />
            Backup & Restore
          </h2>
          <p className={`text-sm mb-6 ${subtitleClass}`}>
            Export your projects for backup or transfer them between devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* EXPORT ALL PROJECTS */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <DatabaseBackup size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Full Backup</h3>
                <p className={`text-xs ${subtitleClass}`}>All projects</p>
              </div>
            </div>

            <p className={`text-xs mb-4 ${subtitleClass}`}>
              Export all {projects.length} project{projects.length !== 1 ? "s" : ""} into a single backup file.
            </p>

            <Button
              variant="secondary"
              onClick={handleExportAll}
              disabled={projects.length === 0}
              className="w-full py-3 h-auto"
              id="export-all-btn"
              leftIcon={HardDriveDownload}
            >
              Export All
            </Button>
          </Card>

          {/* EXPORT SINGLE PROJECT */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Download size={20} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Export Project</h3>
                <p className={`text-xs ${subtitleClass}`}>Single project</p>
              </div>
            </div>

            <p className={`text-xs mb-4 ${subtitleClass}`}>
              Choose a specific project to export as JSON.
            </p>

            <div className="relative" ref={dropdownRef}>
              <Button
                variant="secondary"
                onClick={() => setExportDropdown(!exportDropdown)}
                disabled={projects.length === 0}
                className="w-full py-3 h-auto"
                id="export-single-btn"
                leftIcon={FolderKanban}
              >
                Select Project
                <ChevronDown size={14} className={`ml-2 transition ${exportDropdown ? "rotate-180" : ""}`} />
              </Button>

              {/* Dropdown */}
              {exportDropdown && projects.length > 0 && (
                <div
                  className="absolute left-0 right-0 mt-2 rounded-xl border overflow-hidden z-50 max-h-[240px] overflow-y-auto shadow-lg bg-surface border-border-subtle"
                >
                  {projects.map((project, index) => (
                    <button
                      key={index}
                      onClick={() => handleExportSingle(index)}
                      className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition hover:bg-bg-hover text-text-main"
                    >
                      <FolderKanban size={14} className="text-amber-400 shrink-0" />
                      <span className="truncate">{project.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* IMPORT PROJECT */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Upload size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Import</h3>
                <p className={`text-xs ${subtitleClass}`}>Project or backup</p>
              </div>
            </div>

            <p className={`text-xs mb-4 ${subtitleClass}`}>
              Import a project export or a full DevBoard backup file.
            </p>

            <input
              type="file"
              accept=".json"
              ref={importInputRef}
              onChange={handleImportFile}
              className="hidden"
              id="import-file-input"
            />

            <Button
              variant="secondary"
              onClick={() => importInputRef.current?.click()}
              className="w-full py-3 h-auto"
              id="import-project-btn"
              leftIcon={Upload}
            >
              Choose File
            </Button>
          </Card>

        </div>

      </div>

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Import Conflict Modal */}
      <ImportConflictModal
        visible={conflictModal.visible}
        projectTitle={conflictModal.projectTitle}
        conflictCount={conflictModal.conflictCount}
        onKeepBoth={handleKeepBoth}
        onReplace={handleReplace}
        onCancel={handleCancelImport}
      />

    </div>

  )

}