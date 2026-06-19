"use client"

import { useEffect, useState } from "react"
import ProjectCard from "@/components/widgets/ProjectCard"
import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

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

  // FIX HYDRATION
  useEffect(() => {
    setMounted(true)
  }, [])

  // ADD / EDIT PROJECT
  const handleAddProject = () => {

    if (!title || !description) return

    const newProject = {
      title,
      description,
      status,
      techStack: techStack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      updated: "Updated just now",
      tasks: []
    }

    // EDIT EXISTING PROJECT
    if (editIndex !== null) {

      const updatedProjects = [...projects]

      const existingTasks =
        updatedProjects[editIndex].tasks || []

      updatedProjects[editIndex] = {
        ...newProject,
        tasks: existingTasks
      }

      setProjects(updatedProjects)

      setEditIndex(null)

    }

    // ADD NEW PROJECT
    else {

      setProjects([newProject, ...projects])

    }

    // CLEAR FORM
    setTitle("")
    setDescription("")
    setStatus("Active")
    setTechStack("")

  }

  // DELETE PROJECT
  const handleDeleteProject = (indexToDelete) => {

    const updatedProjects = projects.filter(
      (_, index) => index !== indexToDelete
    )

    setProjects(updatedProjects)

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

  if (!mounted) return null

  return (

    <div
      className={`min-h-screen p-6 transition ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
      }`}
    >
      <button
        onClick={() => router.push("/")}
        className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-xl transition ${
          theme === "dark"
            ? "bg-zinc-900 hover:bg-zinc-800 text-white"
            : "bg-zinc-100 hover:bg-zinc-200 text-black"
        }`}
      >

        <ArrowLeft size={18} />

        <span>
          Back
        </span>

      </button>

      {/* PAGE HEADER */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Projects
        </h1>

        <p
          className={`mt-2 ${
            theme === "dark"
              ? "text-zinc-500"
              : "text-zinc-600"
          }`}
        >
          Create and manage your development projects.
        </p>

      </div>

      {/* PROJECT FORM */}
      <div
        className={`border rounded-2xl p-5 mb-8 ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
        }`}
      >

        <h2 className="text-2xl font-semibold mb-5">
          {editIndex !== null
            ? "Edit Project"
            : "Add New Project"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* TITLE */}
          <input
            type="text"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`border rounded-xl px-4 py-3 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                : "bg-white border-zinc-300 text-black placeholder-zinc-400"
            }`}
          />

          {/* STATUS */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`border rounded-xl px-4 py-3 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white"
                : "bg-white border-zinc-300 text-black"
            }`}
          >

            <option>Active</option>
            <option>Completed</option>
            <option>In Progress</option>

          </select>

          {/* DESCRIPTION */}
          <textarea
            placeholder="Project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`col-span-1 md:col-span-2 border rounded-xl px-4 py-3 outline-none min-h-[120px] resize-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                : "bg-white border-zinc-300 text-black placeholder-zinc-400"
            }`}
          />

          {/* TECH STACK */}
          <input
            type="text"
            placeholder="Tech stack (comma separated)"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            className={`col-span-1 md:col-span-2 border rounded-xl px-4 py-3 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                : "bg-white border-zinc-300 text-black placeholder-zinc-400"
            }`}
          />

        </div>

        {/* BUTTON */}
        <button
          onClick={handleAddProject}
          className={`mt-5 px-5 py-3 rounded-xl font-medium transition ${
            theme === "dark"
              ? "bg-white text-black"
              : "bg-black text-white"
          }`}
        >
          {editIndex !== null
            ? "Update Project"
            : "Add Project"}
        </button>

      </div>

      {/* SEARCH */}
      <div className="mb-6">

        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full max-w-md border rounded-xl px-4 py-3 outline-none ${
            theme === "dark"
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