import React from "react"
import Button from "./Button"

export default function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "standard"
}) {
  if (variant === "compact") {
    return (
      <div className="flex flex-col text-left py-4 px-2 border border-dashed border-border bg-page">
        <div className="flex items-center gap-2 mb-2 font-mono text-sm text-text-muted">
          <span className="text-accent">~</span>
          <span className="text-text-main">$</span>
          <span>{title.toLowerCase().replace(/\s+/g, '_')}</span>
        </div>
        <p className="text-xs text-text-muted font-mono pl-6 mb-4 max-w-sm">
          // {description}
        </p>
        
        {primaryAction && (
          <div className="pl-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border bg-page">
      <div className="flex items-center justify-center w-16 h-16 rounded-none bg-surface border border-border text-accent mb-6">
        {Icon && <Icon size={24} />}
        {!Icon && <span className="font-mono text-2xl animate-pulse">_</span>}
      </div>
      
      <h3 className="text-lg font-mono font-bold text-text-main mb-2">
        <span className="text-accent mr-2">{'>'}</span>{title}
      </h3>
      
      <p className="text-sm text-text-muted font-mono max-w-md mb-8">
        /* {description} */
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {primaryAction && (
          <Button
            variant="primary"
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            variant="ghost"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}
