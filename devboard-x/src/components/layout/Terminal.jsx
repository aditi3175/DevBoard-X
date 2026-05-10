"use client"

import { useState } from "react"

export default function Terminal() {

  // INPUT STATE
  const [input, setInput] = useState("")

  // TERMINAL HISTORY
  const [history, setHistory] = useState([
    "Welcome to DevBoard Terminal",
    'Type "help" to see available commands.'
  ])

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setInput(e.target.value)
  }

  // HANDLE COMMAND SUBMIT
  const handleSubmit = (e) => {

    if (e.key === "Enter") {

      const command = input.trim().toLowerCase()

      // EMPTY INPUT
      if (command === "") return

      let newHistory = [...history]

      // HELP COMMAND
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

      // CLEAR COMMAND
      else if (command === "clear") {

        setHistory([])
        setInput("")
        return

      }

      // STATUS COMMAND
      else if (command === "status") {

        newHistory.push(
          `> ${command}`,
          "System Status: Online",
          "CPU Usage: 60%",
          "Memory Usage: 80%",
          "Active Projects: 12"
        )

      }

      // ABOUT COMMAND
      else if (command === "about") {

        newHistory.push(
          `> ${command}`,
          "DevBoard X",
          "A futuristic developer workspace/dashboard",
          "Built with Next.js, React & Tailwind CSS"
        )

      }

      // PROJECTS COMMAND
      else if (command === "projects") {

        newHistory.push(
          `> ${command}`,
          "Recent Projects:",
          "- DevBoard X",
          "- E-Commerce App",
          "- Blog Platform",
          "- Weather Dashboard"
        )

      }

      // DATE COMMAND
      else if (command === "date") {

        newHistory.push(
          `> ${command}`,
          new Date().toLocaleString()
        )

      }

      // UNKNOWN COMMAND
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

    /* TERMINAL CONTAINER */
    <div className="mt-6 w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">

        {/* LEFT SIDE DOTS */}
        <div className="flex items-center gap-2">

          <div className="w-3 h-3 rounded-full bg-red-500"></div>

          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>

          <div className="w-3 h-3 rounded-full bg-green-500"></div>

        </div>

        {/* TERMINAL TITLE */}
        <p className="text-sm text-zinc-400 font-mono">
          terminal
        </p>

      </div>

      {/* OUTPUT AREA */}
      <div className="p-4 font-mono text-sm space-y-2 min-h-[250px] max-h-[350px] overflow-y-auto">

        {history.map((entry, index) => {

          // COMMAND STYLE
          const isCommand = entry.startsWith(">")

          // ERROR STYLE
          const isError = entry.includes("not found")

          return (

            <p
              key={index}
              className={`
                ${isCommand ? "text-green-400" : ""}
                ${isError ? "text-red-400" : ""}
                ${!isCommand && !isError ? "text-zinc-300" : ""}
              `}
            >
              {entry}
            </p>

          )

        })}

      </div>

      {/* INPUT AREA */}
      <div className="border-t border-zinc-800 px-4 py-3 flex items-center gap-2 font-mono">

        <span className="text-green-400">{">"}</span>

        <input
          type="text"
          placeholder="Type command..."
          className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500"
          value={input}
          onChange={handleChange}
          onKeyDown={handleSubmit}
        />

      </div>

    </div>

  )

}