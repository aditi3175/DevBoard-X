"use client"

import {
  ExternalLink,
  Pencil,
  Trash2,
  Pin,
  PinOff
} from "lucide-react"
import { getCategoryBadgeStyle } from "@/constants/resourceCategories"
import Button from "@/components/ui/Button"

export default function ResourceCard({
  resource,
  compact = false,
  onOpen,
  onEdit,
  onDelete,
  onTogglePin
}) {
  const badgeStyle = getCategoryBadgeStyle(resource.category)

  return (
    <div
      className={`border rounded-xl p-5 transition hover:shadow-sm bg-surface border-border-subtle hover:border-border-strong ${compact ? "min-w-[280px] max-w-[320px] shrink-0" : ""}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold truncate text-text-main"
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
            className="text-yellow-500 dark:text-yellow-400 shrink-0 mt-1"
            fill="currentColor"
          />
        )}
      </div>

      {resource.description && (
        <p
          className="text-sm mb-3 line-clamp-2 text-text-secondary"
        >
          {resource.description}
        </p>
      )}

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-sm text-primary hover:text-primary-hover truncate block mb-4"
      >
        {resource.url}
      </a>

      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border-subtle">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={ExternalLink}
          onClick={() => onOpen(resource.url)}
          className="text-accent bg-accent/10 hover:bg-accent/20"
        >
          Open
        </Button>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={resource.pinned ? PinOff : Pin}
          onClick={() => onTogglePin(resource._id)}
          className={resource.pinned ? "text-warning hover:bg-warning/20 bg-warning/10" : "text-text-muted hover:bg-bg-hover bg-bg-active"}
        >
          {resource.pinned ? "Unpin" : "Pin"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={Pencil}
          onClick={() => onEdit(resource)}
          className="text-accent hover:bg-accent/10"
        >
          Edit
        </Button>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={Trash2}
          onClick={() => onDelete(resource._id)}
          className="text-danger-text hover:bg-danger/10"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
