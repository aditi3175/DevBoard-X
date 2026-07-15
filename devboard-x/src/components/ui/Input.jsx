import { forwardRef } from "react"

const Input = forwardRef(({ className = "", error, leftIcon: LeftIcon, rightIcon: RightIcon, ...props }, ref) => {
  const baseClasses = "w-full border border-border rounded-none px-4 py-2 outline-none bg-page text-text-main placeholder-text-muted hover:border-border-strong transition-colors font-mono text-sm"
  
  const errorClasses = error 
    ? "border-danger focus-visible:border-danger"
    : "focus-visible:border-accent"
    
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed bg-page-raised" : ""
  
  const plClasses = LeftIcon ? "pl-10" : "pl-8"
  const prClasses = RightIcon ? "pr-10" : ""
  
  return (
    <div className={`relative w-full ${className}`}>
      {LeftIcon ? (
        <LeftIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent pointer-events-none" />
      ) : (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent font-bold pointer-events-none">{`>`}</span>
      )}
      <input
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${plClasses} ${prClasses}`}
        aria-invalid={!!error}
        aria-describedby={error && props.id ? `${props.id}-error` : undefined}
        {...props}
      />
      {RightIcon && (
        <RightIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      )}
    </div>
  )
})
Input.displayName = "Input"
export default Input
