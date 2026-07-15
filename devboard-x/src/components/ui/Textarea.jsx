import { forwardRef } from "react"

const Textarea = forwardRef(({ className = "", error, ...props }, ref) => {
  const baseClasses = "w-full border border-border rounded-none px-4 py-3 outline-none bg-page text-text-main placeholder-text-muted hover:border-border-strong transition-colors font-mono text-sm resize-y min-h-[100px]"
  
  const errorClasses = error 
    ? "border-danger focus-visible:border-danger"
    : "focus-visible:border-accent"
    
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed bg-page-raised" : ""
  
  return (
    <div className={`relative w-full ${className}`}>
      <span className="absolute left-3 top-3.5 text-accent font-bold pointer-events-none">{`>`}</span>
      <textarea
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} pl-8`}
        aria-invalid={!!error}
        aria-describedby={error && props.id ? `${props.id}-error` : undefined}
        {...props}
      />
    </div>
  )
})

Textarea.displayName = "Textarea"
export default Textarea
