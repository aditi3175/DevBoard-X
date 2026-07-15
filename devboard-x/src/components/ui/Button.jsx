import React from "react"
import { Loader2 } from "lucide-react"

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  isLoading = false,
  disabled = false,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider transition-colors outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed rounded-none"

  const variants = {
    primary: "bg-accent text-text-on-lime hover:bg-accent-hover",
    secondary: "bg-surface border border-border text-text-main hover:bg-surface-hover hover:border-border-strong",
    ghost: "bg-transparent text-text-muted hover:text-text-main hover:bg-surface",
    destructive: "bg-danger text-page hover:bg-danger/90",
    success: "bg-success text-page hover:bg-success/90",
    warning: "bg-warning text-page hover:bg-warning/90",
    info: "bg-info text-page hover:bg-info/90",
  }

  const sizes = {
    sm: "h-8 px-3 text-[10px]",
    md: "h-10 px-4 text-xs",
    lg: "h-12 px-6 text-sm",
    iconSm: "h-8 w-8",
    iconMd: "h-10 w-10",
  }

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim()

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && LeftIcon && <LeftIcon size={16} className="mr-2 shrink-0" />}
      
      {/* For terminal aesthetic, surround text with brackets if not icon-only */}
      <span className="truncate flex items-center gap-1">
        {!size.startsWith('icon') && variant === 'primary' && <span className="opacity-50 mr-1">[</span>}
        {children}
        {!size.startsWith('icon') && variant === 'primary' && <span className="opacity-50 ml-1">]</span>}
      </span>

      {!isLoading && RightIcon && <RightIcon size={16} className="ml-2 shrink-0" />}
    </button>
  )
}
