export default function Label({ htmlFor, children, required, hint, className = "" }) {
  return (
    <label htmlFor={htmlFor} className={`block mb-1.5 text-sm font-semibold text-text-secondary ${className}`}>
      {children}
      {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
      {hint && <span className="font-normal text-text-muted ml-1">{hint}</span>}
    </label>
  )
}
