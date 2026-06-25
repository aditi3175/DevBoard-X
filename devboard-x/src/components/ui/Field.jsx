import Label from "./Label"

export default function Field({ label, htmlFor, required, hint, error, children, className = "" }) {
  return (
    <div className={`w-full flex flex-col ${className}`}>
      {label && (
        <Label htmlFor={htmlFor} required={required} hint={hint}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-danger font-medium animate-in fade-in slide-in-from-top-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
