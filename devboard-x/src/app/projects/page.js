"use client"

import { useEffect, useState } from "react"
import ProjectCard from "@/components/widgets/ProjectCard"
import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"
import {
  ACTIVITY_TYPES,
  appendProjectActivity,
  buildActivityEntry
} from "@/utils/projectActivity"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActivity } from "@/context/ActivityContext"

export default function ProjectsPage() {

  const router = useRouter()

  // FORM STATES
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("Active")
  const [techStack, setTechStack] = useState("")
  const [search, setSearch] = useState("")
  const [editIndex, setEditIndex] = useState(null)
  const [mounted, setMounted] = useState(false)

  const { theme } = useTheme()
  const { projects, setProjects } = useProjects()
  const { logActivity } = useActivity()

  // FIX HYDRATION
  useEffect(() => {
    setMounted(true)
  }, [])

  // ADD / EDIT PROJECT
  const handleAddProject = () => {

    if (!title || !description) return

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
    if (editIndex !== null) {

      const updatedProjects = [...projects]

      const existingTasks =
        updatedProjects[editIndex].tasks || []

      const existingResources =
        updatedProjects[editIndex].resources || []

      const existingActivity =
        updatedProjects[editIndex].activity || []

      const existingCreatedAt =
        updatedProjects[editIndex].createdAt || now

      updatedProjects[editIndex] = {
        ...newProject,
        tasks: existingTasks,
        resources: existingResources,
        activity: existingActivity,
        createdAt: existingCreatedAt,
        lastUpdatedAt: now
      }

      setProjects(updatedProjects)

      setEditIndex(null)

    }

    // ADD NEW PROJECT
    else {

      setProjects([newProject, ...projects])

      logActivity({
        type: "project_created",
        message: `Created project: ${title.trim()}`,
        projectId: 0,
        projectTitle: title.trim()
      })

    }

    // CLEAR FORM
    setTitle("")
    setDescription("")
    setStatus("Active")
    setTechStack("")

  }

  // DELETE PROJECT
  const handleDeleteProject = (indexToDelete) => {
    const projectToDelete = projects[indexToDelete]

    const updatedProjects = projects.filter(
      (_, index) => index !== indexToDelete
    )

    setProjects(updatedProjects)

    if (projectToDelete) {
      logActivity({
        type: "project_deleted",
        message: `Deleted project "${projectToDelete.title}"`,
        projectId: indexToDelete,
        projectTitle: projectToDelete.title
      })
    }
  }

  // EDIT PROJECT
  const handleEditProject = (project, index) => {

    setTitle(project.title)
    setDescription(project.description)
    setStatus(project.status)
    setTechStack(project.techStack.join(","))

    setEditIndex(index)

  }

  // FILTER PROJECTS
  const filteredProjects = projects.filter((project) =>
    project.title
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  if (!mounted) {
    return (
      <div className={`min-h-screen p-6 transition ${theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-black"}`}>
        <div className="mb-8 animate-pulse">
          <div className={`h-10 w-48 rounded-lg mb-2 ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
          <div className={`h-5 w-64 rounded-lg ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
          <div className="w-full lg:w-1/3">
            <div className={`h-[500px] rounded-3xl ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
          </div>
          <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`h-48 rounded-3xl ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
            <div className={`h-48 rounded-3xl ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-200"}`}></div>
          </div>
        </div>
      </div>
    )
  }

  return (

    <div
      className={`min-h-screen p-6 transition ${theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
        }`}
    >


      {/* PAGE HEADER */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Projects
        </h1>

        <p
          className={`mt-2 ${theme === "dark"
              ? "text-zinc-400"
              : "text-zinc-600"
            }`}
        >
          Create and manage your development projects.
        </p>

      </div>

      {/* PROJECT FORM */}
      <div
        className={`border rounded-2xl p-5 mb-8 ${theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
          }`}
      >

        <h2 className="text-2xl font-semibold mb-5">
          {editIndex !== null
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
          <div>
            <label htmlFor="project-title" className={`block mb-1.5 text-sm font-semibold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>
              Project Title <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="project-title"
              type="text"
              placeholder="e.g. My Awesome App"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                  : "bg-white border-zinc-300 text-black placeholder-zinc-400"
                }`}
              required
              aria-required="true"
            />
          </div>

          {/* STATUS */}
          <div>
            <label htmlFor="project-status" className={`block mb-1.5 text-sm font-semibold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>Status</label>
            <select
              id="project-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white"
                  : "bg-white border-zinc-300 text-black"
                }`}
            >

            <option>Active</option>
            <option>Completed</option>
            <option>In Progress</option>

            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="project-desc" className={`block mb-1.5 text-sm font-semibold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>
              Description <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <textarea
              id="project-desc"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none min-h-[120px] resize-none ${theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                  : "bg-white border-zinc-300 text-black placeholder-zinc-400"
                }`}
            />
          </div>

          {/* TECH STACK */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="project-tech" className={`block mb-1.5 text-sm font-semibold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>
              Tech Stack <span className="font-normal text-zinc-400">(comma separated)</span>
            </label>
            <input
              id="project-tech"
              type="text"
              placeholder="React, Node.js, Tailwind"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                  : "bg-white border-zinc-300 text-black placeholder-zinc-400"
                }`}
            />
          </div>

        </form>

        {/* BUTTON */}
        <button
          type="submit"
          onClick={handleAddProject}
          className={`mt-5 px-5 py-2.5 rounded-xl font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${theme === "dark"
              ? "bg-white text-black hover:bg-zinc-200"
              : "bg-black text-white hover:bg-zinc-800"
            }`}
        >
          {editIndex !== null
            ? "Update Project"
            : "Add Project"}
        </button>

      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <label htmlFor="search-projects" className="sr-only">Search projects</label>
        <input
          id="search-projects"
          type="text"
          placeholder="Search projects..."
          aria-label="Search projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full max-w-md border rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${theme === "dark"
              ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
              : "bg-white border-zinc-300 text-black placeholder-zinc-400"
            }`}
        />

      </div>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {filteredProjects.map((project, index) => (

          <ProjectCard
            key={index}
            title={project.title}
            description={project.description}
            status={project.status}
            techStack={project.techStack}
            updated={project.updated}
            tasks={project.tasks}
            onDelete={() => handleDeleteProject(index)}
            onEdit={() => handleEditProject(project, index)}
            onOpen={() => router.push(`/projects/${index}`)}
          />

        ))}

      </div>

    </div>

  )

}