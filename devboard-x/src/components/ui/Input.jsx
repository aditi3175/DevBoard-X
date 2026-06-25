import { forwardRef } from "react"

const Input = forwardRef(({ className = "", error, leftIcon: LeftIcon, rightIcon: RightIcon, ...props }, ref) => {
  const baseClasses = "w-full border rounded-xl px-4 py-3 outline-none bg-surface text-text-main placeholder-text-muted hover:border-border-strong transition-all duration-200"
  
  const errorClasses = error 
    ? "border-danger focus-visible:ring-2 focus-visible:ring-danger"
    : "border-border-subtle focus-visible:ring-2 focus-visible:ring-primary"
    
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed bg-bg-active hover:border-border-subtle" : ""
  
  const plClasses = LeftIcon ? "pl-11" : ""
  const prClasses = RightIcon ? "pr-11" : ""
  
  return (
    <div className={`relative w-full ${className}`}>
      {LeftIcon && (
        <LeftIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      )}
      <input
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${plClasses} ${prClasses}`}
        aria-invalid={!!error}
        aria-describedby={error && props.id ? `${props.id}-error` : undefined}
        {...props}
      />
      {RightIcon && (
        <RightIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      )}
    </div>
  )
})
Input.displayName = "Input"
export default Input
