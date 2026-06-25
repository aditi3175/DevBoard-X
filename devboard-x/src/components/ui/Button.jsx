import { forwardRef } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
  secondary: "bg-surface border border-border-subtle text-text-main hover:bg-bg-hover hover:border-border-strong",
  ghost: "text-text-main hover:bg-bg-hover",
  destructive: "bg-danger-bg text-danger-text hover:bg-danger/20",
  outline: "border border-border-subtle bg-transparent text-text-main hover:bg-bg-hover hover:border-border-strong",
  link: "text-primary hover:underline underline-offset-4",
}

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 py-2 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 shrink-0",
  iconSm: "h-8 w-8 shrink-0",
  none: "", // For custom sizing
}

export const Button = forwardRef(({
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  children,
  href,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = "button",
  ...props
}, ref) => {
  const compStyles = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] === undefined ? sizes.md : sizes[size]} ${className}`.trim()
  
  const innerContent = (
    <>
      {isLoading && size !== "icon" && size !== "iconSm" && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
      )}
      {isLoading && (size === "icon" || size === "iconSm") ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : (
        <>
          {LeftIcon && <LeftIcon className="mr-2 h-4 w-4 shrink-0" />}
          {children}
          {RightIcon && <RightIcon className="ml-2 h-4 w-4 shrink-0" />}
        </>
      )}
    </>
  )

  if (href) {
    return (
      <Link 
        href={href} 
        className={compStyles} 
        ref={ref}
        aria-disabled={disabled || isLoading}
        tabIndex={disabled || isLoading ? -1 : undefined}
        onClick={(e) => {
          if (disabled || isLoading) e.preventDefault()
          if (props.onClick) props.onClick(e)
        }}
        {...props}
      >
        {innerContent}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={compStyles}
      disabled={disabled || isLoading}
      ref={ref}
      {...props}
    >
      {innerContent}
    </button>
  )
})

Button.displayName = "Button"
export default Button
