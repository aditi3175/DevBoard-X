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
    compact: "bg-surface border-border-subtle p-4 sm:p-5 rounded-xl",
    nested: "bg-bg-active border-transparent p-4 rounded-xl",
  }

  const interactiveStyles = isInteractive
    ? "cursor-pointer hover:border-border-strong focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
    : ""

  const combinedStyles = `${baseStyles} ${variantStyles[variant] || variantStyles.standard} ${interactiveStyles} ${className}`.trim()

  return (
    <Component className={combinedStyles} {...props}>
      {children}
    </Component>
  )
}
