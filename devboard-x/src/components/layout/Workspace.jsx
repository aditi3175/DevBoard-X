"use client"

import { useEffect, useState } from "react"

import {
  Cpu,
  Activity,
  Folder,
  CheckCircle
} from "lucide-react"

import WidgetCard from "@/components/widgets/WidgetCard"
import NotesWidget from "@/components/widgets/NotesWidget"
import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"

export default function Workspace() {

  const { theme } = useTheme()
  const { projects } = useProjects()

  // PROJECT COUNTS
  const totalProjects = projects.length

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length

  return (

    <div
      className={`flex-1 flex flex-col p-6 transition ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
      }`}
    >

      {/* HEADER */}
      <h1 className="text-4xl font-bold">
        Welcome to DevBoard-X
      </h1>

      <p
        className={`mt-2 ${
          theme === "dark"
            ? "text-zinc-500"
            : "text-zinc-600"
        }`}
      >
        Start by creating a new project
      </p>

      {/* WIDGET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">

        {/* CPU */}
        <WidgetCard
          Icon={Cpu}
          title="CPU Usage"
          value="60%"
          color="bg-blue-500"
        />

        {/* MEMORY */}
        <WidgetCard
          Icon={Activity}
          title="Memory Usage"
          value="80%"
          color="bg-red-500"
        />

        {/* TOTAL PROJECTS */}
        <WidgetCard
          Icon={Folder}
          title="Projects"
          value={totalProjects}
          color="bg-green-500"
        />

        {/* COMPLETED */}
        <WidgetCard
          Icon={CheckCircle}
          title="Completed"
          value={completedProjects}
          color="bg-yellow-500"
        />

      </div>

      {/* NOTES */}
      <div className="mt-6">

        <NotesWidget />

      </div>

    </div>

  )

}