import { forwardRef } from "react"
import { ChevronDown } from "lucide-react"

const Select = forwardRef(({ className = "", error, children, leftIcon: LeftIcon, ...props }, ref) => {
  const baseClasses = "w-full border border-border rounded-none pl-8 pr-10 py-2 outline-none bg-page text-text-main hover:border-border-strong transition-colors font-mono text-sm appearance-none cursor-pointer"
  
  const errorClasses = error 
    ? "border-danger focus-visible:border-danger"
    : "focus-visible:border-accent"
    
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed bg-page-raised" : ""
  
  return (
    <div className={`relative w-full ${className}`}>
      {LeftIcon ? (
        <LeftIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent pointer-events-none" />
      ) : (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent font-bold pointer-events-none">{`>`}</span>
      )}
      
      <select
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${LeftIcon ? "pl-10" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error && props.id ? `${props.id}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
    </div>
  )
})

Select.displayName = "Select"
export default Select
