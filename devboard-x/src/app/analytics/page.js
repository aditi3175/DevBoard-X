"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function AnalyticsPage() {

  const router = useRouter()

  const { theme } = useTheme()
  const { projects } = useProjects()

  const [selectedProjectIndex, setSelectedProjectIndex] =
    useState(0)

  // PROJECT ANALYTICS
  const totalProjects = projects.length

  const activeProjects = projects.filter(
    (project) => project.status === "Active"
  ).length

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length

  const inProgressProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length

  // SELECTED PROJECT
  const selectedProject =
    projects[selectedProjectIndex]

  // TASK ANALYTICS
  const totalTasks =
    selectedProject?.tasks?.length || 0

  const completedTasks =
    selectedProject?.tasks?.filter(
      (task) => task.completed
    ).length || 0

  const pendingTasks =
    totalTasks - completedTasks

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
      )
  
  const highPriorityTasks =
    selectedProject?.tasks?.filter(
      (task) => task.priority === "High"
    ).length || 0

  const mediumPriorityTasks =
    selectedProject?.tasks?.filter(
      (task) => task.priority === "Medium"
    ).length || 0

  const lowPriorityTasks =
    selectedProject?.tasks?.filter(
      (task) => task.priority === "Low"
    ).length || 0

  // PROJECT CHART DATA
  const projectData = [
    {
      name: "Active",
      projects: activeProjects
    },
    {
      name: "Completed",
      projects: completedProjects
    },
    {
      name: "In Progress",
      projects: inProgressProjects
    }
  ]

  // TASK CHART DATA
  const taskData = [
    {
      name: "Pending",
      tasks: pendingTasks
    },
    {
      name: "Completed",
      tasks: completedTasks
    },
    {
      name: "High",
      tasks: highPriorityTasks
    },
    {
      name: "Medium",
      tasks: mediumPriorityTasks
    },
    {
      name: "Low",
      tasks: lowPriorityTasks
    }
  ]

  return (

    <div
      className={`min-h-screen p-6 transition ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
      }`}
    >

      {/* BACK BUTTON */}
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

      {/* HEADER */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Analytics
        </h1>

        <p
          className={`mt-2 ${
            theme === "dark"
              ? "text-zinc-500"
              : "text-zinc-600"
          }`}
        >
          Track project and task activity.
        </p>

      </div>

      {/* PROJECT ANALYTICS */}
      <h2 className="text-2xl font-semibold mb-4">
        Project Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        <StatCard
          theme={theme}
          title="Total Projects"
          value={totalProjects}
        />

        <StatCard
          theme={theme}
          title="Active Projects"
          value={activeProjects}
          color="text-green-400"
        />

        <StatCard
          theme={theme}
          title="Completed Projects"
          value={completedProjects}
          color="text-blue-400"
        />

        <StatCard
          theme={theme}
          title="In Progress"
          value={inProgressProjects}
          color="text-yellow-400"
        />

      </div>

      {/* PROJECT CHART */}
      <div
        className={`border rounded-2xl p-6 mb-8 ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
        }`}
      >

        <h2 className="text-2xl font-semibold mb-6">
          Project Activity
        </h2>

        <div className="h-[350px]">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart data={projectData}>

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="projects"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* TASK ANALYTICS */}
      <div className="mb-6">

        <h2 className="text-2xl font-semibold mb-4">
          Task Analytics
        </h2>

        {
          projects.length === 0 && (
            <p
              className={`mb-6 ${
                theme === "dark"
                  ? "text-zinc-500"
                  : "text-zinc-600"
              }`}
            >
              No projects available.
            </p>
          )
        }

        {projects.length > 0 && (

          <select
            value={selectedProjectIndex}
            onChange={(e) =>
              setSelectedProjectIndex(
                Number(e.target.value)
              )
            }
            className={`px-4 py-3 rounded-xl border ${
              theme === "dark"
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          >

            {projects.map((project, index) => (

              <option
                key={index}
                value={index}
              >
                {project.title}
              </option>

            ))}

          </select>

        )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        <StatCard
          theme={theme}
          title="Total Tasks"
          value={totalTasks}
        />

        <StatCard
          theme={theme}
          title="Pending Tasks"
          value={pendingTasks}
          color="text-yellow-400"
        />

        <StatCard
          theme={theme}
          title="Completed Tasks"
          value={completedTasks}
          color="text-green-400"
        />

        <StatCard
          theme={theme}
          title="Completion Rate"
          value={`${completionRate}%`}
          color="text-blue-400"
        />

        <StatCard
          theme={theme}
          title="High Priority"
          value={highPriorityTasks}
          color="text-red-400"
        />

        <StatCard
          theme={theme}
          title="Medium Priority"
          value={mediumPriorityTasks}
          color="text-yellow-400"
        />

        <StatCard
          theme={theme}
          title="Low Priority"
          value={lowPriorityTasks}
          color="text-green-400"
        />

      </div>

      {/* TASK CHART */}
      <div
        className={`border rounded-2xl p-6 ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
        }`}
      >

        <h2 className="text-2xl font-semibold mb-6">
          Task Activity
        </h2>

        <div className="h-[350px]">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart data={taskData}>

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="tasks"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  )

}

function StatCard({
  theme,
  title,
  value,
  color = ""
}) {

  return (

    <div
      className={`border rounded-2xl p-5 ${
        theme === "dark"
          ? "bg-zinc-900 border-zinc-800"
          : "bg-zinc-100 border-zinc-300"
      }`}
    >

      <h3
        className={`text-sm mb-2 ${
          theme === "dark"
            ? "text-zinc-400"
            : "text-zinc-600"
        }`}
      >
        {title}
      </h3>

      <p className={`text-3xl font-bold ${color}`}>
        {value}
      </p>

    </div>

  )

}