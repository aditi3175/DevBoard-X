"use client"

import { useEffect, useState } from "react"
import ProjectCard from "@/components/widgets/ProjectCard"
import { useProjects } from "@/context/ProjectContext"
import {
  ACTIVITY_TYPES,
  buildActivityEntry
} from "@/utils/projectActivity"
import { useRouter } from "next/navigation"
import { Trash2, Edit2, Play, Search, XCircle } from "lucide-react"

import EmptyState from "@/components/ui/EmptyState"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { FolderKanban } from "lucide-react"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import Field from "@/components/ui/Field"

export default function ProjectsPage() {

  const router = useRouter()

  // FORM STATES
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("Active")
  const [techStack, setTechStack] = useState("")
  const [search, setSearch] = useState("")
  const [editId, setEditId] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [errors, setErrors] = useState({})

  const { projects, setProjects, isLoaded, createProject, updateProject, deleteProject } = useProjects()

  // ADD / EDIT PROJECT
  const handleAddProject = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = "Project Title is required."
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      document.getElementById("project-title")?.focus()
      return
    }
    setErrors({})

    const now = new Date().toISOString()

    const newProject = {
      title,
      description,
      status,
      techStack: techStack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      updated: "Updated just now",
      createdAt: now,
      lastUpdatedAt: now,
      tasks: [],
      resources: [],
      activity: [
        buildActivityEntry(
          ACTIVITY_TYPES.PROJECT_CREATED,
          `Created project: ${title.trim()}`
        )
      ]
    }

    // EDIT EXISTING PROJECT
    if (editId !== null) {
      updateProject({
        id: editId,
        title,
        description,
        status,
        techStack: techStack.split(",").map((tech) => tech.trim()).filter(Boolean),
        lastUpdatedAt: now
      });

      setEditId(null)
    }

    // ADD NEW PROJECT
    else {
      createProject({
        title,
        description,
        status,
        techStack: techStack.split(",").map((tech) => tech.trim()).filter(Boolean),
        createdAt: now,
        lastUpdatedAt: now
      });
    }

    // CLEAR FORM
    setTitle("")
    setDescription("")
    setStatus("Active")
    setTechStack("")
    setErrors({})
  }

  // DELETE PROJECT
  const handleDeleteProject = (id, title) => {
    deleteProject({ id });
  }

  // EDIT PROJECT
  const handleEditProject = (project) => {
    setTitle(project.title)
    setDescription(project.description)
    setStatus(project.status)
    setTechStack(project.techStack.join(","))
    setEditId(project._id)
  }

  // FILTER PROJECTS
  const filteredProjects = projects.filter((project) =>
    project.title
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  if (!isLoaded) {
    return (
      <div className="h-full flex-1 p-6 transition bg-surface text-text-main">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-48 rounded-lg mb-2 bg-bg-active"></div>
          <div className="h-5 w-64 rounded-lg bg-bg-active"></div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
          <div className="w-full lg:w-1/3">
            <div className="h-[500px] rounded-3xl bg-bg-active"></div>
          </div>
          <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 rounded-3xl bg-bg-active"></div>
            <div className="h-48 rounded-3xl bg-bg-active"></div>
          </div>
        </div>
      </div>
    )
  }

  return (

    <div
      className="h-full flex-1 p-6 transition bg-page text-text-main font-mono"
    >


      {/* PAGE HEADER */}
      <div className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-mono font-bold">
          <span className="text-accent mr-3">~/</span>Projects
        </h1>
        <p className="mt-2 text-text-muted font-mono text-sm">
          // Create and manage your development projects.
        </p>
      </div>

      {/* PROJECT FORM */}
      <Card className="mb-8 max-w-4xl">

        <h2 className="text-2xl font-semibold mb-5">
          {editId !== null
            ? "Edit Project"
            : "Add New Project"}
        </h2>

        <form 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddProject();
          }}
        >

          {/* TITLE */}
          <Field label="Project Title" htmlFor="project-title" required error={errors.title}>
            <Input
              id="project-title"
              type="text"
              placeholder="e.g. My Awesome App"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors({ ...errors, title: null })
              }}
              error={errors.title}
              required
            />
          </Field>

          {/* STATUS */}
          <Field label="Status" htmlFor="project-status">
            <Select
              id="project-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Active</option>
              <option>Completed</option>
              <option>In Progress</option>
            </Select>
          </Field>

          {/* DESCRIPTION */}
          <Field label="Description" htmlFor="project-desc" hint="optional" className="col-span-1 md:col-span-2">
            <Textarea
              id="project-desc"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          {/* TECH STACK */}
          <Field label="Tech Stack" htmlFor="project-tech" hint="comma separated" className="col-span-1 md:col-span-2">
            <Input
              id="project-tech"
              type="text"
              placeholder="React, Node.js, Tailwind"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
            />
          </Field>

        </form>

        {/* BUTTON */}
        <Button
          type="submit"
          variant="primary"
          onClick={handleAddProject}
          className="mt-5"
        >
          {editId !== null
            ? "Update Project"
            : "Add Project"}
        </Button>

      </Card>

      {/* SEARCH */}
      <div className="mb-6">
        <label htmlFor="search-projects" className="sr-only">Search projects</label>
        <Input
          id="search-projects"
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={Search}
        />
      </div>

      {/* PROJECT GRID */}
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Start Your First Project"
          description="Use the form above to add a project and begin tracking tasks, resources, and executing code."
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching projects"
          description={`No results found for "${search}".`}
          primaryAction={{ label: "Clear Search", onClick: () => setSearch("") }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project._id}
              title={project.title}
              description={project.description}
              status={project.status}
              techStack={project.techStack}
              updated={project.updated}
              projectId={project._id}
              onDelete={() => handleDeleteProject(project._id, project.title)}
              onEdit={() => handleEditProject(project)}
              onOpen={() => router.push(`/projects/${project._id}`)}
            />
          ))}
        </div>
      )}

    </div>

  )

}