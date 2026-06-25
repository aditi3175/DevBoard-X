import { forwardRef } from "react"

const Textarea = forwardRef(({ className = "", error, ...props }, ref) => {
  const baseClasses = "w-full border rounded-xl px-4 py-3 outline-none bg-surface text-text-main placeholder-text-muted hover:border-border-strong transition-all duration-200 resize-none min-h-[120px]"
  
  const errorClasses = error 
    ? "border-danger focus-visible:ring-2 focus-visible:ring-danger"
    : "border-border-subtle focus-visible:ring-2 focus-visible:ring-primary"
    
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed bg-bg-active hover:border-border-subtle" : ""
  
  return (
    <textarea
      ref={ref}
      className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
      aria-invalid={!!error}
      aria-describedby={error && props.id ? `${props.id}-error` : undefined}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"
export default Textarea
