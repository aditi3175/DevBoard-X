"use client"

import React from "react"
import Button from "@/components/ui/Button"

export default function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "full", // "full" | "compact"
  className = ""
}) {
  const isCompact = variant === "compact"
  
  return (
    <div className={`flex flex-col items-center justify-center text-center ${isCompact ? "p-4 h-full min-h-[120px]" : "p-8 h-full min-h-[250px] border border-dashed rounded-2xl border-border-strong bg-surface/50"} ${className}`}>
      {Icon && (
        <div className={`mb-3 flex items-center justify-center rounded-full bg-bg-active text-text-muted ${isCompact ? "w-10 h-10" : "w-16 h-16"}`}>
          <Icon size={isCompact ? 20 : 32} />
        </div>
      )}
      <h3 className={`font-semibold text-text-main ${isCompact ? "text-sm" : "text-xl"}`}>{title}</h3>
      {description && (
        <p className={`mt-1 text-text-secondary ${isCompact ? "text-xs max-w-[250px]" : "text-sm max-w-md"}`}>{description}</p>
      )}
      
      {(primaryAction || secondaryAction) && (
        <div className={`flex flex-wrap items-center justify-center gap-3 ${isCompact ? "mt-3" : "mt-5"}`}>
          {secondaryAction && (
            <Button
              variant="secondary"
              size={isCompact ? "sm" : "md"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant="primary"
              size={isCompact ? "sm" : "md"}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
