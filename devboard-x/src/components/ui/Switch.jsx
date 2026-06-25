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
      className={`w-14 h-8 rounded-full transition flex items-center px-1 outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${
        checked ? "bg-success justify-end" : "bg-bg-active justify-start"
      } ${className}`}
      {...props}
    >
      <div className="w-6 h-6 bg-white dark:bg-white rounded-full shadow-sm"></div>
    </button>
  )
})

Switch.displayName = "Switch"
export default Switch
