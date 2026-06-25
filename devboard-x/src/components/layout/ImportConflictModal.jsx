"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  Copy,
  Replace,
  XCircle
} from "lucide-react"
import Button from "@/components/ui/Button"

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
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[480px] mx-4 rounded-2xl border overflow-hidden bg-surface border-border-subtle shadow-2xl shadow-black/20 dark:shadow-black/40"
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
                    className="text-lg font-semibold text-text-main"
                  >
                    Duplicate Project Found
                  </h2>
                  <p className="text-xs text-text-muted">
                    {conflictCount > 1
                      ? `${conflictCount} projects already exist`
                      : "A project with this name already exists"}
                  </p>
                </div>
              </div>

              {/* Conflict detail */}
              <div className="rounded-xl p-4 mt-2 bg-bg-active">
                <p className="text-sm font-medium text-text-main">
                  &ldquo;{projectTitle}&rdquo;
                  {conflictCount > 1 && (
                    <span className="ml-2 text-xs text-text-muted">
                      +{conflictCount - 1} more
                    </span>
                  )}
                </p>
                <p className="text-xs mt-1 text-text-muted">
                  Choose how to handle the conflict
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 flex flex-col gap-2.5">
              {/* Keep Both */}
              <Button
                variant="primary"
                onClick={onKeepBoth}
                className="h-auto justify-start py-3 w-full"
                id="conflict-keep-both"
                leftIcon={Copy}
              >
                <div className="text-left flex flex-col gap-0.5">
                  <p className="text-sm font-medium">Keep Both</p>
                  <p className="text-xs text-blue-200 font-normal">
                    Import as &ldquo;{projectTitle} (Imported)&rdquo;
                  </p>
                </div>
              </Button>

              {/* Replace */}
              <Button
                variant="ghost"
                onClick={onReplace}
                className="h-auto justify-start py-3 w-full bg-bg-active"
                id="conflict-replace"
                leftIcon={Replace}
              >
                <div className="text-left flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-text-main">Replace Existing</p>
                  <p className="text-xs text-text-muted font-normal">
                    Overwrite the existing project data
                  </p>
                </div>
              </Button>

              {/* Cancel */}
              <Button
                variant="ghost"
                onClick={onCancel}
                className="h-auto justify-start py-3 w-full text-text-muted"
                id="conflict-cancel"
                leftIcon={XCircle}
              >
                <span className="text-sm">Cancel Import</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
