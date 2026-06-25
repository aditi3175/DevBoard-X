"use client"

import { RESOURCE_CATEGORIES } from "@/constants/resourceCategories"
import { useState } from "react"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import Field from "@/components/ui/Field"
import Button from "@/components/ui/Button"

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

  const [errors, setErrors] = useState({})

  const handleSubmit = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = "Title is required."
    if (!url.trim()) newErrors.url = "URL is required."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (newErrors.title) document.getElementById("resource-title")?.focus()
      else if (newErrors.url) document.getElementById("resource-url")?.focus()
      return
    }
    setErrors({})
    onSubmit()
  }

  return (
    <form 
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Field label="Title" htmlFor="resource-title" required error={errors.title}>
        <Input
          id="resource-title"
          type="text"
          placeholder="e.g. Next.js Docs"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) setErrors({ ...errors, title: null })
          }}
          error={errors.title}
          required
        />
      </Field>

      <Field label="URL" htmlFor="resource-url" required error={errors.url}>
        <Input
          id="resource-url"
          type="url"
          placeholder="https://"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (errors.url) setErrors({ ...errors, url: null })
          }}
          error={errors.url}
          required
        />
      </Field>

      <Field label="Category" htmlFor="resource-category">
        <Select
          id="resource-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {RESOURCE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Description" htmlFor="resource-description" hint="optional" className="md:col-span-2">
        <Textarea
          id="resource-description"
          placeholder="Add some notes about this resource..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </Field>

      <div className="md:col-span-2 flex flex-wrap gap-3 mt-2">
        <Button
          type="submit"
          variant="success"
        >
          {editResourceId ? "Update Resource" : "Add Resource"}
        </Button>

        {editResourceId && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
