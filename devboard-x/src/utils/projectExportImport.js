// ─── PROJECT EXPORT / IMPORT UTILITIES ───────────────────────────
// Pure functions — no React, no UI.
// Designed for reuse by future cloud sync / GitHub integrations.

const EXPORT_VERSION = "1.0"

// ─── EXPORT ──────────────────────────────────────────────────────

/**
 * Wraps a single project in the export envelope.
 * @param {Object} project - The project object to export.
 * @returns {string} JSON string ready for download.
 */
export function exportProject(project) {
  const envelope = {
    exportType: "devboardx-project",
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    project: structuredClone(project)
  }
  return JSON.stringify(envelope, null, 2)
}

/**
 * Wraps all projects in the backup envelope.
 * @param {Array} projects - Array of all project objects.
 * @returns {string} JSON string ready for download.
 */
export function exportAllProjects(projects) {
  const envelope = {
    exportType: "devboardx-backup",
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    projects: structuredClone(projects)
  }
  return JSON.stringify(envelope, null, 2)
}

// ─── DOWNLOAD ────────────────────────────────────────────────────

/**
 * Triggers a browser download of a JSON string as a file.
 * Uses the anchor-click trick — no backend needed.
 * @param {string} jsonString - The JSON content.
 * @param {string} filename - The download filename (e.g. "my-project-export.json").
 */
export function downloadJSON(jsonString, filename) {
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()

  // Cleanup
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

// ─── SANITIZE FILENAME ───────────────────────────────────────────

/**
 * Converts a project title to a safe filename slug.
 * @param {string} title
 * @returns {string}
 */
export function slugify(title) {
  return title
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    || "project"
}

// ─── VALIDATION ──────────────────────────────────────────────────

/**
 * Validates a parsed JSON import object.
 * @param {any} data - The parsed JSON data.
 * @returns {{ valid: boolean, type: string|null, projects: Array|null, error: string|null }}
 */
export function validateImportData(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, type: null, projects: null, error: "The selected file is not valid JSON." }
  }

  const { exportType } = data

  if (!exportType) {
    return { valid: false, type: null, projects: null, error: "Invalid DevBoard X export file." }
  }

  // ─── Single Project ─────────────────────────────────────
  if (exportType === "devboardx-project") {
    const { project } = data

    if (!project || typeof project !== "object") {
      return { valid: false, type: null, projects: null, error: "Invalid DevBoard X export file." }
    }

    if (!project.title || typeof project.title !== "string") {
      return { valid: false, type: "project", projects: null, error: "Exported project is missing a title." }
    }

    if (!Array.isArray(project.tasks)) {
      return { valid: false, type: "project", projects: null, error: "Exported project has invalid task data." }
    }

    if (!Array.isArray(project.resources)) {
      return { valid: false, type: "project", projects: null, error: "Exported project has invalid resource data." }
    }

    return { valid: true, type: "project", projects: [project], error: null }
  }

  // ─── Full Backup ────────────────────────────────────────
  if (exportType === "devboardx-backup") {
    const { projects } = data

    if (!Array.isArray(projects)) {
      return { valid: false, type: null, projects: null, error: "Invalid DevBoard X backup file." }
    }

    // Validate each project in the backup
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i]
      if (!p || typeof p !== "object") {
        return { valid: false, type: "backup", projects: null, error: `Project at index ${i} is invalid.` }
      }
      if (!p.title || typeof p.title !== "string") {
        return { valid: false, type: "backup", projects: null, error: `Project at index ${i} is missing a title.` }
      }
      if (!Array.isArray(p.tasks)) {
        return { valid: false, type: "backup", projects: null, error: `Project "${p.title}" has invalid task data.` }
      }
      if (!Array.isArray(p.resources)) {
        return { valid: false, type: "backup", projects: null, error: `Project "${p.title}" has invalid resource data.` }
      }
    }

    return { valid: true, type: "backup", projects, error: null }
  }

  return { valid: false, type: null, projects: null, error: "Invalid DevBoard X export file." }
}

// ─── FILE READER ─────────────────────────────────────────────────

/**
 * Reads a File object, parses JSON, and validates.
 * @param {File} file - The selected file from an <input type="file">.
 * @returns {Promise<{ valid: boolean, type: string|null, projects: Array|null, error: string|null }>}
 */
export function parseImportFile(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ valid: false, type: null, projects: null, error: "No file selected." })
      return
    }

    if (!file.name.endsWith(".json")) {
      resolve({ valid: false, type: null, projects: null, error: "Please select a .json file." })
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(validateImportData(data))
      } catch {
        resolve({ valid: false, type: null, projects: null, error: "The selected file is not valid JSON." })
      }
    }

    reader.onerror = () => {
      resolve({ valid: false, type: null, projects: null, error: "Failed to read the file." })
    }

    reader.readAsText(file)
  })
}

// ─── DUPLICATE HANDLING ──────────────────────────────────────────

/**
 * Builds a safe title that doesn't collide with existing project titles.
 * Appends " (Imported)", " (Imported 2)", etc. if needed.
 * @param {string} title - The incoming project title.
 * @param {string[]} existingTitles - Array of existing project titles.
 * @returns {string} A unique title.
 */
export function buildSafeTitle(title, existingTitles) {
  const lowerExisting = existingTitles.map((t) => t.toLowerCase())

  if (!lowerExisting.includes(title.toLowerCase())) {
    return title
  }

  // Try "(Imported)", "(Imported 2)", etc.
  let suffix = 1
  let candidate = `${title} (Imported)`

  while (lowerExisting.includes(candidate.toLowerCase())) {
    suffix++
    candidate = `${title} (Imported ${suffix})`
  }

  return candidate
}

/**
 * Checks which imported projects conflict with existing ones.
 * @param {Array} importedProjects - Projects to import.
 * @param {Array} existingProjects - Current projects in state.
 * @returns {{ conflicts: Array<{ imported: Object, existingIndex: number }>, safe: Array<Object> }}
 */
export function findConflicts(importedProjects, existingProjects) {
  const existingTitles = existingProjects.map((p) => p.title.toLowerCase())

  const conflicts = []
  const safe = []

  for (const project of importedProjects) {
    const matchIndex = existingTitles.indexOf(project.title.toLowerCase())
    if (matchIndex !== -1) {
      conflicts.push({ imported: project, existingIndex: matchIndex })
    } else {
      safe.push(project)
    }
  }

  return { conflicts, safe }
}
