"use client"

import { useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Link2, Pin, Search } from "lucide-react"

import { useProjects } from "@/context/ProjectContext"
import ProjectHeader from "@/components/project/ProjectHeader"
import ProjectSubNav from "@/components/project/ProjectSubNav"
import ResourceForm from "@/components/resources/ResourceForm"
import ResourceCard from "@/components/resources/ResourceCard"
import WidgetCard from "@/components/widgets/WidgetCard"
import EmptyState from "@/components/ui/EmptyState"
import Input from "@/components/ui/Input"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export default function ProjectResourcesPage() {
  const params = useParams()
  const formRef = useRef(null)

  const { projects, setProjects, isLoaded } = useProjects()

  const projectId = params.id === "undefined" ? null : params.id
  const isOldProject = !isNaN(Number(projectId))
  const projectIndex = isOldProject ? Number(projectId) : projects.findIndex(p => p._id === projectId)
  const project = projects[projectIndex]

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("GitHub")
  const [description, setDescription] = useState("")
  const [search, setSearch] = useState("")
  const [editResourceId, setEditResourceId] = useState(null)
  const [showForm, setShowForm] = useState(true)

  const resources = useQuery(api.resources.getResources, project?._id ? { projectId: project._id } : "skip") || []
  const createResource = useMutation(api.resources.createResource)
  const updateResource = useMutation(api.resources.updateResource)
  const deleteResource = useMutation(api.resources.deleteResource)
  const togglePinned = useMutation(api.resources.togglePinned)

  if (!isLoaded) {
    return (
      <div className="h-full flex-1 p-6 transition bg-surface text-text-main">
        <div className="mb-8 animate-pulse">
          <div className="h-12 w-64 rounded-xl mb-3 bg-bg-active"></div>
          <div className="h-6 w-96 rounded-lg bg-bg-active"></div>
        </div>
        <div className="h-14 w-full rounded-2xl mb-8 animate-pulse bg-bg-active"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-bg-active"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div
        className="h-full flex-1 p-6 bg-surface text-text-main"
      >
        <h1 className="text-3xl font-bold">Project Not Found</h1>
      </div>
    )
  }



  const pinnedResources = resources.filter((r) => r.pinned)
  const totalResources = resources.length
  const pinnedCount = pinnedResources.length

  const resetForm = () => {
    setTitle("")
    setUrl("")
    setCategory("GitHub")
    setDescription("")
    setEditResourceId(null)
  }

  const handleSaveResource = async () => {
    if (!title.trim()) {
      alert("Title is required")
      return
    }

    if (!url.trim() || !isValidUrl(url.trim())) {
      alert("A valid URL is required")
      return
    }

    if (editResourceId) {
      await updateResource({
        id: editResourceId,
        title: title.trim(),
        url: url.trim(),
        category,
        description: description.trim()
      })
    } else {
      await createResource({
        projectId: project._id,
        title: title.trim(),
        url: url.trim(),
        category,
        description: description.trim(),
        pinned: false
      })

      setProjects([...projects])
    }

    resetForm()
    setShowForm(true)
  }

  const handleEditResource = (resource) => {
    setTitle(resource.title)
    setUrl(resource.url)
    setCategory(resource.category)
    setDescription(resource.description || "")
    setEditResourceId(resource._id)
    setShowForm(true)
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleDeleteResource = async (id) => {
    await deleteResource({ id })

    if (editResourceId === id) {
      resetForm()
    }
  }

  const handleTogglePin = async (id) => {
    const resource = resources.find(r => r._id === id)
    if (resource) {
      await togglePinned({ id, pinned: !resource.pinned })
    }
  }

  const handleOpenLink = (link) => {
    window.open(link, "_blank", "noopener,noreferrer")
  }

  const searchQuery = search.toLowerCase().trim()

  const filteredResources = resources
    .filter((r) => {
      if (!searchQuery) return true
      return (
        r.title.toLowerCase().includes(searchQuery) ||
        r.category.toLowerCase().includes(searchQuery) ||
        (r.description || "").toLowerCase().includes(searchQuery)
      )
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return b.pinned - a.pinned
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  const sectionClass = "border rounded-2xl p-5 bg-surface border-border-subtle"

  return (
    <div
      className="h-full flex-1 p-6 bg-surface text-text-main"
    >
      <ProjectHeader project={project} />
      <ProjectSubNav projectIndex={projectIndex} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <WidgetCard
          Icon={Link2}
          title="Total Resources"
          value={totalResources}
          color="bg-info-bg text-info-text"
        />
        <WidgetCard
          Icon={Pin}
          title="Pinned Resources"
          value={pinnedCount}
          color="bg-warning-bg text-warning-text"
        />
      </div>

      {pinnedResources.length > 0 && (
        <div className={`${sectionClass} mb-8`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Pin size={20} className="text-warning" />
            Pinned Resources
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {pinnedResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                compact
                onOpen={handleOpenLink}
                onEdit={handleEditResource}
                onDelete={handleDeleteResource}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        </div>
      )}

      <div className={`${sectionClass} mb-8`}>
        <div className="relative mb-6">
          <label htmlFor="search-resources" className="sr-only">Search resources</label>
          <Input
            id="search-resources"
            type="text"
            placeholder="Search by title, category, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={Search}
          />
        </div>

        <div ref={formRef}>
          {(showForm || totalResources === 0) && (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                {editResourceId ? "Edit Resource" : "Add Resource"}
              </h2>

              <ResourceForm
                title={title}
                setTitle={setTitle}
                url={url}
                setUrl={setUrl}
                category={category}
                setCategory={setCategory}
                description={description}
                setDescription={setDescription}
                editResourceId={editResourceId}
                onSubmit={handleSaveResource}
                onCancel={resetForm}
              />
            </>
          )}

          {totalResources > 0 && !showForm && !editResourceId && (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition focus-visible:ring-2 focus-visible:ring-primary outline-none"
            >
              Add Resource
            </button>
          )}
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-2xl font-semibold mb-4">
          All Resources
          {searchQuery && (
            <span
              className="ml-2 text-base font-normal text-text-secondary"
            >
              ({filteredResources.length} result
              {filteredResources.length !== 1 ? "s" : ""})
            </span>
          )}
        </h2>

        {totalResources === 0 ? (
          <EmptyState
            icon={Link2}
            title="No resources added"
            description="Use the form above to add your first resource."
          />
        ) : filteredResources.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching resources"
            description="No resources match your search."
            primaryAction={{ label: "Clear Search", onClick: () => setSearch("") }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onOpen={handleOpenLink}
                onEdit={handleEditResource}
                onDelete={handleDeleteResource}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
