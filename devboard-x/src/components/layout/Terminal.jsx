"use client"

import {
  useEffect,
  useRef,
  useState
} from "react"

import { useProjects } from "@/context/ProjectContext"

export default function Terminal() {


  const { projects } = useProjects()

  // INPUT STATE
  const [input, setInput] = useState("")

  // TERMINAL HISTORY
  const [history, setHistory] = useState([
    "Welcome to DevBoard Terminal",
    'Type "help" to see available commands.'
  ])

  // TERMINAL REF
  const terminalRef = useRef(null)

  // AUTO SCROLL
  useEffect(() => {

    if (terminalRef.current) {

      terminalRef.current.scrollTop =
        terminalRef.current.scrollHeight

    }

  }, [history])

  // ANALYTICS
  const activeProjects = projects.filter(
    (project) => project.status === "Active"
  ).length

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length

  const inProgressProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length

  // HANDLE INPUT
  const handleChange = (e) => {
    setInput(e.target.value)
  }

  // HANDLE COMMAND
  const handleSubmit = (e) => {

    if (e.key === "Enter") {

      const command = input.trim().toLowerCase()

      if (command === "") return

      let newHistory = [...history]

      // HELP
      if (command === "help") {

        newHistory.push(
          `> ${command}`,
          "Available commands:",
          "- help",
          "- clear",
          "- status",
          "- about",
          "- projects",
          "- date"
        )

      }

      // CLEAR
      else if (command === "clear") {

        setHistory([])
        setInput("")
        return

      }

      // STATUS
      else if (command === "status") {

        newHistory.push(
          `> ${command}`,
          "System Status: Online",
          `Total Projects: ${projects.length}`,
          `Active Projects: ${activeProjects}`,
          `Completed Projects: ${completedProjects}`,
          `In Progress Projects: ${inProgressProjects}`
        )

      }

      // ABOUT
      else if (command === "about") {

        newHistory.push(
          `> ${command}`,
          "DevBoard X",
          "A futuristic developer workspace/dashboard",
          "Built with Next.js, React & Tailwind CSS"
        )

      }

      // PROJECTS
      else if (command === "projects") {

        newHistory.push(
          `> ${command}`,
          "Recent Projects:"
        )

        if (projects.length === 0) {

          newHistory.push(
            "No projects found."
          )

        }

        else {

          projects.forEach((project) => {

            newHistory.push(
              `- ${project.title}`
            )

          })

        }

      }

      // DATE
      else if (command === "date") {

        newHistory.push(
          `> ${command}`,
          new Date().toLocaleString()
        )

      }

      // UNKNOWN
      else {

        newHistory.push(
          `> ${command}`,
          `command not found: ${command}`
        )

      }

      // UPDATE HISTORY
      setHistory(newHistory)

      // CLEAR INPUT
      setInput("")

    }

  }

  return (

    <div
      className="mt-6 w-full border rounded-xl overflow-hidden transition bg-surface border-border-subtle"
    >

      {/* HEADER */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-active"
      >

        {/* DOTS */}
        <div className="flex items-center gap-2">

          <div className="w-3 h-3 rounded-full bg-danger"></div>

          <div className="w-3 h-3 rounded-full bg-warning"></div>

          <div className="w-3 h-3 rounded-full bg-success"></div>

        </div>

        {/* TITLE */}
        <p
          className="text-sm font-mono text-text-secondary"
        >
          terminal
        </p>

      </div>

      {/* OUTPUT */}
      <div
        ref={terminalRef}
        className="p-4 font-mono text-sm space-y-2 h-[400px] overflow-y-auto bg-surface text-text-main"
      >

        {history.map((entry, index) => {

          const isCommand = entry.startsWith(">")
          const isError = entry.includes("not found")

          return (

            <p
              key={index}
              className={`
                ${isCommand ? "text-success" : ""}
                ${isError ? "text-danger" : ""}
              `}
            >
              {entry}
            </p>

          )

        })}

      </div>

      {/* INPUT */}
      <div
        className="border-t px-4 py-3 flex items-center gap-2 font-mono border-border-subtle bg-surface"
      >

        <span className="text-green-500 dark:text-green-400">
          {">"}
        </span>

        <input
          type="text"
          placeholder="Type command..."
          className="flex-1 bg-transparent outline-none text-text-main placeholder-text-muted"
          value={input}
          onChange={handleChange}
          onKeyDown={handleSubmit}
        />

      </div>

    </div>

  )

}