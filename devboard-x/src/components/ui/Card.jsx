import React from "react"

export default function Card({
  children,
  className = "",
  variant = "standard",
  isInteractive = false,
  title = "",
  as: Component = "div",
  ...props
}) {
  const interactiveStyles = isInteractive
    ? "cursor-pointer hover:border-accent hover:bg-surface-hover focus-visible:ring-1 focus-visible:ring-accent outline-none"
    : ""

  return (
    <Component 
      className={`bg-page border border-border rounded-none sm:rounded-[8px] overflow-hidden z-10 flex flex-col font-mono text-sm ${interactiveStyles} ${className}`.trim()} 
      {...props}
    >
      <div className="flex items-center gap-2 px-4 py-2 sm:py-3 border-b border-border bg-page-raised shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-danger" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning" />
        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
        <span className="ml-4 text-xs text-text-muted font-mono">{title || "~/devboard/module"}</span>
      </div>
      <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </Component>
  )
}
