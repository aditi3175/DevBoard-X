"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  Copy,
  Replace,
  XCircle
} from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

/**
 * Modal shown when an imported project title already exists.
 *
 * Props:
 *   visible       {boolean}
 *   projectTitle  {string}         — The conflicting project name
 *   conflictCount {number}         — Total number of conflicts (for bulk imports)
 *   onKeepBoth    {() => void}     — Rename imported project to "Title (Imported)"
 *   onReplace     {() => void}     — Replace the existing project
 *   onCancel      {() => void}     — Cancel the import
 */
export default function ImportConflictModal({
  visible = false,
  projectTitle = "",
  conflictCount = 1,
  onKeepBoth,
  onReplace,
  onCancel
}) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const panelBg = isDark
    ? "bg-zinc-900/95 border-zinc-700/50 shadow-2xl shadow-black/40"
    : "bg-white/95 border-zinc-300/80 shadow-2xl shadow-zinc-400/20"

  const subtitleColor = isDark ? "text-zinc-400" : "text-zinc-600"
  const cardBg = isDark ? "bg-zinc-800/60" : "bg-zinc-100"

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
        >
          <motion.div
            className={`w-full max-w-[480px] mx-4 rounded-2xl border overflow-hidden ${panelBg}`}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-amber-400" />
                </div>
                <div>
                  <h2
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    Duplicate Project Found
                  </h2>
                  <p className={`text-xs ${subtitleColor}`}>
                    {conflictCount > 1
                      ? `${conflictCount} projects already exist`
                      : "A project with this name already exists"}
                  </p>
                </div>
              </div>

              {/* Conflict detail */}
              <div className={`rounded-xl p-4 mt-2 ${cardBg}`}>
                <p className={`text-sm font-medium ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                  &ldquo;{projectTitle}&rdquo;
                  {conflictCount > 1 && (
                    <span className={`ml-2 text-xs ${subtitleColor}`}>
                      +{conflictCount - 1} more
                    </span>
                  )}
                </p>
                <p className={`text-xs mt-1 ${subtitleColor}`}>
                  Choose how to handle the conflict
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className={`px-6 pb-6 pt-2 flex flex-col gap-2.5`}>
              {/* Keep Both */}
              <button
                onClick={onKeepBoth}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition"
                id="conflict-keep-both"
              >
                <Copy size={18} />
                <div className="text-left">
                  <p className="text-sm font-medium">Keep Both</p>
                  <p className="text-[11px] text-blue-200">
                    Import as &ldquo;{projectTitle} (Imported)&rdquo;
                  </p>
                </div>
              </button>

              {/* Replace */}
              <button
                onClick={onReplace}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition ${
                  isDark
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                    : "bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
                }`}
                id="conflict-replace"
              >
                <Replace size={18} />
                <div className="text-left">
                  <p className="text-sm font-medium">Replace Existing</p>
                  <p className={`text-[11px] ${subtitleColor}`}>
                    Overwrite the existing project data
                  </p>
                </div>
              </button>

              {/* Cancel */}
              <button
                onClick={onCancel}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition ${
                  isDark
                    ? "bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                }`}
                id="conflict-cancel"
              >
                <XCircle size={18} />
                <p className="text-sm">Cancel Import</p>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
