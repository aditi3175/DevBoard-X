import React from "react"

export default function Card({
  children,
  className = "",
  variant = "standard", // standard | compact | nested
  isInteractive = false,
  as: Component = "div",
  ...props
}) {
  const baseStyles = "border transition overflow-hidden"

  const variantStyles = {
    standard: "bg-surface border-border-subtle p-5 sm:p-6 rounded-xl",
    compact: "bg-surface border-border-subtle p-4 sm:p-5 rounded-lg",
    nested: "bg-bg-active border-transparent p-4 rounded-lg",
  }

  const interactiveStyles = isInteractive
    ? "cursor-pointer hover:-translate-y-0.5 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-primary outline-none"
    : ""

  const combinedStyles = `${baseStyles} ${variantStyles[variant] || variantStyles.standard} ${interactiveStyles} ${className}`.trim()

  return (
    <Component className={combinedStyles} {...props}>
      {children}
    </Component>
  )
}
