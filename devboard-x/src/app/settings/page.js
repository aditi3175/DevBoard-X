"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"
import { useActivity } from "@/context/ActivityContext"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
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

import ToastNotification from "@/components/layout/ToastNotification"
import ImportConflictModal from "@/components/layout/ImportConflictModal"

export default function SettingsPage() {
  const router = useRouter()

  // SETTINGS STATE
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const { theme, setTheme } = useTheme()
  const { projects, setProjects } = useProjects()
  const { logActivity } = useActivity()
  const [notifications, setNotifications] = useState(true)
  const [animations, setAnimations] = useState(true)

  // MOUNTED STATE
  const [mounted, setMounted] = useState(false)

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

  // FIX HYDRATION
  useEffect(() => {
    setMounted(true)
  }, [])

  // LOAD SETTINGS
  useEffect(() => {
    const savedSettings = localStorage.getItem("devboard-settings")

    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      setUsername(parsedSettings.username || "")
      setEmail(parsedSettings.email || "")
      setTheme(parsedSettings.theme || "dark")
      setNotifications(parsedSettings.notifications)
      setAnimations(parsedSettings.animations)
    }
  }, [])

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
    const settingsData = {
      username,
      email,
      theme,
      notifications,
      animations
    }

    localStorage.setItem(
      "devboard-settings",
      JSON.stringify(settingsData)
    )

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
  }, [projects, setProjects])

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
  const isDark = theme === "dark"
  const cardClass = `border rounded-2xl p-6 ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300"
    }`
  const subtitleClass = isDark ? "text-zinc-400" : "text-zinc-600"
  const inputClass = `w-full rounded-xl px-4 py-3 outline-none border ${isDark
      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
      : "bg-white border-zinc-300 text-black placeholder-zinc-400"
    }`

  if (!mounted) {
    return (
      <div className={`min-h-screen p-6 transition ${theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-black"}`}>
        <div className="mb-8 animate-pulse">
          <div className={`h-10 w-48 rounded-lg mb-2 ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
          <div className={`h-5 w-64 rounded-lg ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
          <div className="w-full lg:w-1/4">
            <div className={`h-64 rounded-2xl ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
          </div>
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            <div className={`h-64 rounded-2xl ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
            <div className={`h-64 rounded-2xl ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
          </div>
        </div>
      </div>
    )
  }

  return (

    <div
      className={`min-h-screen p-6 transition ${isDark
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
        }`}
    >



      {/* PAGE HEADER */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Settings
        </h1>

        <p
          className={`mt-2 ${subtitleClass}`}
        >
          Manage your dashboard preferences.
        </p>

      </div>

      {/* SETTINGS CONTAINER */}
      <div className="space-y-6 max-w-3xl">

        {/* PROFILE SECTION */}
        <div className={cardClass}>

          <h2 className="text-2xl font-semibold mb-5">
            Profile Settings
          </h2>

          <div className="space-y-4">

            <div>
              <label htmlFor="profile-username" className={`block mb-1.5 text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Username</label>
              <input
                id="profile-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`${inputClass} focus-visible:ring-2 focus-visible:ring-blue-500 outline-none`}
              />
            </div>

            <div>
              <label htmlFor="profile-email" className={`block mb-1.5 text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Email</label>
              <input
                id="profile-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} focus-visible:ring-2 focus-visible:ring-blue-500 outline-none`}
              />
            </div>

          </div>

        </div>

        {/* THEME SECTION */}
        <div className={cardClass}>

          <h2 className="text-2xl font-semibold mb-5">
            Appearance
          </h2>

          <label htmlFor="appearance-theme" className={`block mb-1.5 text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Theme</label>
          <select
            id="appearance-theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none border ${isDark
                ? "bg-zinc-950 border-zinc-800 text-white"
                : "bg-white border-zinc-300 text-black"
              }`}
          >

            <option value="dark">Dark</option>
            <option value="light">Light</option>

          </select>

        </div>

        {/* PREFERENCES */}
        <div className={cardClass}>

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

              <button
                role="switch"
                aria-checked={notifications}
                aria-labelledby="label-notifications"
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full transition flex items-center px-1 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${notifications
                    ? "bg-green-500 justify-end"
                    : "bg-zinc-500 justify-start"
                  }`}
              >

                <div className="w-6 h-6 bg-white rounded-full"></div>

              </button>

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

              <button
                role="switch"
                aria-checked={animations}
                aria-labelledby="label-animations"
                onClick={() => setAnimations(!animations)}
                className={`w-14 h-8 rounded-full transition flex items-center px-1 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${animations
                    ? "bg-green-500 justify-end"
                    : "bg-zinc-500 justify-start"
                  }`}
              >

                <div className="w-6 h-6 bg-white rounded-full"></div>

              </button>

            </div>

          </div>

        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSaveSettings}
          className={`px-6 py-3 rounded-xl font-medium transition ${isDark
              ? "bg-white text-black"
              : "bg-black text-white"
            }`}
        >
          Save Settings
        </button>

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
          <div className={cardClass}>
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

            <button
              onClick={handleExportAll}
              disabled={projects.length === 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${projects.length === 0
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              id="export-all-btn"
            >
              <HardDriveDownload size={16} />
              Export All
            </button>
          </div>

          {/* EXPORT SINGLE PROJECT */}
          <div className={cardClass}>
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
              <button
                onClick={() => setExportDropdown(!exportDropdown)}
                disabled={projects.length === 0}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${projects.length === 0
                    ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
                id="export-single-btn"
              >
                <FolderKanban size={16} />
                Select Project
                <ChevronDown size={14} className={`transition ${exportDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {exportDropdown && projects.length > 0 && (
                <div
                  className={`absolute left-0 right-0 mt-2 rounded-xl border overflow-hidden z-50 max-h-[240px] overflow-y-auto shadow-lg ${isDark
                      ? "bg-zinc-900 border-zinc-700"
                      : "bg-white border-zinc-300"
                    }`}
                >
                  {projects.map((project, index) => (
                    <button
                      key={index}
                      onClick={() => handleExportSingle(index)}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition ${isDark
                          ? "hover:bg-zinc-800 text-zinc-200"
                          : "hover:bg-zinc-100 text-zinc-800"
                        }`}
                    >
                      <FolderKanban size={14} className="text-amber-400 shrink-0" />
                      <span className="truncate">{project.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* IMPORT PROJECT */}
          <div className={cardClass}>
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

            <button
              onClick={() => importInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition bg-emerald-500 hover:bg-emerald-600 text-white"
              id="import-project-btn"
            >
              <Upload size={16} />
              Choose File
            </button>
          </div>

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