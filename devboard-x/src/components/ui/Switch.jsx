import { forwardRef } from "react"

export const Switch = forwardRef(({
  checked = false,
  onChange,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      onClick={(e) => {
        if (!disabled && onChange) onChange(!checked, e)
      }}
      ref={ref}
      className={`w-14 h-8 rounded-full transition-[background] duration-[120ms] flex items-center px-1 outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${
        checked ? "bg-accent justify-end" : "bg-border-strong justify-start"
      } ${className}`}
      {...props}
    >
      <div className="w-6 h-6 bg-white rounded-full"></div>
    </button>
  )
})

Switch.displayName = "Switch"
export default Switch
