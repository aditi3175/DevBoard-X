"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, XCircle, X } from "lucide-react"

/**
 * Lightweight toast notification component.
 *
 * Props:
 *   message  {string}  — Text to display
 *   type     {"success"|"error"}  — Variant
 *   visible  {boolean} — Controls visibility
 *   onClose  {() => void} — Called to dismiss
 *   duration {number}  — Auto-dismiss ms (default 4000, 0 to disable)
 */
export default function ToastNotification({
  message,
  type = "success",
  visible = false,
  onClose,
  duration = 4000
}) {

  // Auto-dismiss
  useEffect(() => {
    if (!visible || duration <= 0) return

    const timer = setTimeout(() => {
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [visible, duration, onClose])

  const isSuccess = type === "success"

  const bgClass = isSuccess
    ? "bg-surface border-success/30"
    : "bg-surface border-danger/30"

  const iconColor = isSuccess ? "text-success-text" : "text-danger-text"
  const accentBar = isSuccess ? "bg-success" : "bg-danger"

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-6 right-6 z-[9998]"
          id="toast-notification"
        >
          <div
            role="status"
            aria-live="polite"
            className={`relative overflow-hidden flex items-center gap-3 pl-5 pr-4 py-4 rounded-xl border shadow-lg min-w-[320px] max-w-[440px] ${bgClass}`}
          >
            {/* Accent bar on left edge */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar}`} />

            {/* Icon */}
            {isSuccess ? (
              <CheckCircle size={20} className={iconColor} aria-hidden="true" />
            ) : (
              <XCircle size={20} className={iconColor} aria-hidden="true" />
            )}

            {/* Message */}
            <p
              className="flex-1 text-sm font-medium text-text-main"
            >
              {message}
            </p>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close notification"
              className="p-1 rounded-lg transition focus-visible:ring-2 focus-visible:ring-primary outline-none hover:bg-bg-hover text-text-muted hover:text-text-secondary"
              id="toast-close-btn"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
