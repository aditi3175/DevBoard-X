import { forwardRef } from "react"
import { ChevronDown } from "lucide-react"

const Select = forwardRef(({ className = "", error, children, ...props }, ref) => {
  const baseClasses = "w-full border rounded-xl px-4 py-3 outline-none bg-surface text-text-main hover:border-border-strong transition-all duration-200 appearance-none pr-10"
  
  const errorClasses = error 
    ? "border-danger focus-visible:ring-2 focus-visible:ring-danger"
    : "border-border-subtle focus-visible:ring-2 focus-visible:ring-primary"
    
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed bg-bg-active hover:border-border-subtle" : ""
  
  return (
    <div className={`relative w-full ${className}`}>
      <select
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} w-full`}
        aria-invalid={!!error}
        aria-describedby={error && props.id ? `${props.id}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
    </div>
  )
})
Select.displayName = "Select"
export default Select
