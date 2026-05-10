"use client"

import { useEffect, useState } from "react"

export default function NotesWidget() {

  // NOTES STATE
  const [notes, setNotes] = useState("")

  // LOAD SAVED NOTES
  useEffect(() => {

    const savedNotes = localStorage.getItem("devboard-notes")

    if (savedNotes) {
      setNotes(savedNotes)
    }

  }, [])

  // SAVE NOTES
  useEffect(() => {

    localStorage.setItem("devboard-notes", notes)

  }, [notes])

  return (

    <div className="mt-6 w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

      {/* HEADER */}
      <div className="mb-4">

        <h2 className="text-xl font-semibold text-white">
          Developer Notes
        </h2>

        <p className="text-sm text-zinc-500 mt-1">
          Keep track of ideas, tasks and bugs.
        </p>

      </div>

      {/* TEXTAREA */}
      <textarea
        placeholder="Write your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full min-h-[200px] bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-500 outline-none resize-none"
      />

    </div>

  )

}