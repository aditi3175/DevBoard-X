"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/context/ThemeContext"

export default function NotesWidget() {

  const { theme } = useTheme()

  // NOTES STATE
  const [notes, setNotes] = useState("")

  // LOAD SAVED NOTES
  useEffect(() => {

    const savedNotes = localStorage.getItem(
      "devboard-notes"
    )

    if (savedNotes) {
      setNotes(savedNotes)
    }

  }, [])

  // SAVE NOTES
  useEffect(() => {

    localStorage.setItem(
      "devboard-notes",
      notes
    )

  }, [notes])

  return (

    <div
      className={`mt-6 w-full border rounded-2xl p-5 transition ${
        theme === "dark"
          ? "bg-zinc-900 border-zinc-800"
          : "bg-zinc-100 border-zinc-300"
      }`}
    >

      {/* HEADER */}
      <div className="mb-4">

        <h2
          className={`text-xl font-semibold ${
            theme === "dark"
              ? "text-white"
              : "text-black"
          }`}
        >
          Developer Notes
        </h2>

        <p
          className={`text-sm mt-1 ${
            theme === "dark"
              ? "text-zinc-500"
              : "text-zinc-600"
          }`}
        >
          Keep track of ideas, tasks and bugs.
        </p>

      </div>

      {/* TEXTAREA */}
      <textarea
        placeholder="Write your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={`w-full min-h-[200px] border rounded-xl p-4 outline-none resize-none transition ${
          theme === "dark"
            ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            : "bg-white border-zinc-300 text-black placeholder-zinc-400"
        }`}
      />

    </div>

  )

}