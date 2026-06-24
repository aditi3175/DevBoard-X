"use client"

import {
  ExternalLink,
  Pencil,
  Trash2,
  Pin,
  PinOff
} from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { getCategoryBadgeStyle } from "@/constants/resourceCategories"

export default function ResourceCard({
  resource,
  compact = false,
  onOpen,
  onEdit,
  onDelete,
  onTogglePin
}) {
  const { theme } = useTheme()
  const badgeStyle = getCategoryBadgeStyle(resource.category)

  return (
    <div
      className={`border rounded-2xl p-5 transition hover:shadow-lg ${
        theme === "dark"
          ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
          : "bg-white border-zinc-300 hover:border-zinc-400"
      } ${compact ? "min-w-[280px] max-w-[320px] shrink-0" : ""}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3
            className={`font-semibold truncate ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            {resource.title}
          </h3>

          <span
            className={`inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full border ${badgeStyle}`}
          >
            {resource.category}
          </span>
        </div>

        {resource.pinned && (
          <Pin
            size={16}
            className="text-yellow-400 shrink-0 mt-1"
            fill="currentColor"
          />
        )}
      </div>

      {resource.description && (
        <p
          className={`text-sm mb-3 line-clamp-2 ${
            theme === "dark" ? "text-zinc-400" : "text-zinc-600"
          }`}
        >
          {resource.description}
        </p>
      )}

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-sm text-blue-400 hover:text-blue-300 truncate block mb-4"
      >
        {resource.url}
      </a>

      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800/30">
        <button
          onClick={() => onOpen(resource.url)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
        >
          <ExternalLink size={14} />
          Open
        </button>

        <button
          onClick={() => onTogglePin(resource.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
            resource.pinned
              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
              : theme === "dark"
                ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
          }`}
        >
          {resource.pinned ? <PinOff size={14} /> : <Pin size={14} />}
          {resource.pinned ? "Unpin" : "Pin"}
        </button>

        <button
          onClick={() => onEdit(resource)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-blue-400 hover:bg-blue-500/10 transition"
        >
          <Pencil size={14} />
          Edit
        </button>

        <button
          onClick={() => onDelete(resource.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  )
}
