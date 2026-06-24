"use client"

import { useTheme } from "@/context/ThemeContext"
import { RESOURCE_CATEGORIES } from "@/constants/resourceCategories"

export default function ResourceForm({
  title,
  setTitle,
  url,
  setUrl,
  category,
  setCategory,
  description,
  setDescription,
  editResourceId,
  onSubmit,
  onCancel
}) {
  const { theme } = useTheme()

  const inputClass = `w-full px-4 py-3 rounded-xl border focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
    theme === "dark"
      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
      : "bg-white border-zinc-300 text-black placeholder-zinc-400"
  }`
  
  const labelClass = `block mb-1.5 text-sm font-semibold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`

  return (
    <form 
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label htmlFor="resource-title" className={labelClass}>Title <span className="text-red-500" aria-hidden="true">*</span></label>
        <input
          id="resource-title"
          type="text"
          placeholder="e.g. Next.js Docs"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="resource-url" className={labelClass}>URL <span className="text-red-500" aria-hidden="true">*</span></label>
        <input
          id="resource-url"
          type="url"
          placeholder="https://"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="resource-category" className={labelClass}>Category</label>
        <select
          id="resource-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          {RESOURCE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="resource-description" className={labelClass}>Description <span className="text-zinc-400 font-normal">(optional)</span></label>
        <textarea
          id="resource-description"
          placeholder="Add some notes about this resource..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="md:col-span-2 flex flex-wrap gap-3 mt-2">
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition focus-visible:ring-2 focus-visible:ring-green-500 outline-none"
        >
          {editResourceId ? "Update Resource" : "Add Resource"}
        </button>

        {editResourceId && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-zinc-700 text-white font-medium hover:bg-zinc-600 transition focus-visible:ring-2 focus-visible:ring-zinc-500 outline-none"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
