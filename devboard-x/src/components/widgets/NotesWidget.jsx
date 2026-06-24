"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Plus, Trash2, Edit2, ChevronLeft, Eye, Clock, Type } from "lucide-react"

export default function NotesWidget() {
  const { theme } = useTheme()

  // STATE
  const [notes, setNotes] = useState([])
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [isEditing, setIsEditing] = useState(true)
  const [mounted, setMounted] = useState(false)

  // FIX HYDRATION
  useEffect(() => {
    setMounted(true)
  }, [])

  // LOAD SAVED NOTES (migrate old string notes to new array format if needed)
  useEffect(() => {
    const savedNotes = localStorage.getItem("devboard-notes")
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes)
        if (Array.isArray(parsed)) {
          setNotes(parsed)
        } else {
          // Migration from string
          setNotes([
            {
              id: Date.now().toString(),
              title: "Legacy Note",
              content: savedNotes,
              lastEdited: new Date().toISOString()
            }
          ])
        }
      } catch (e) {
        // Migration from string
        setNotes([
          {
            id: Date.now().toString(),
            title: "Legacy Note",
            content: savedNotes,
            lastEdited: new Date().toISOString()
          }
        ])
      }
    }
  }, [])

  // AUTO SAVE
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("devboard-notes", JSON.stringify(notes))
    }
  }, [notes, mounted])

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      lastEdited: new Date().toISOString()
    }
    setNotes([newNote, ...notes])
    setActiveNoteId(newNote.id)
    setIsEditing(true)
  }

  const handleDeleteNote = (id, e) => {
    e?.stopPropagation()
    const updated = notes.filter((n) => n.id !== id)
    setNotes(updated)
    if (activeNoteId === id) {
      setActiveNoteId(null)
    }
  }

  const handleUpdateActiveNote = (updates) => {
    setNotes(
      notes.map((n) =>
        n.id === activeNoteId
          ? { ...n, ...updates, lastEdited: new Date().toISOString() }
          : n
      )
    )
  }

  const activeNote = notes.find((n) => n.id === activeNoteId)

  if (!mounted) {
    return (
      <div className={`mt-6 w-full border rounded-2xl transition overflow-hidden flex flex-col min-h-[400px] animate-pulse ${theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300"}`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${theme === "dark" ? "border-zinc-800 bg-zinc-900" : "border-zinc-300 bg-zinc-100"}`}>
          <div className={`h-6 w-32 rounded ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
          <div className={`h-8 w-24 rounded-lg ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-40 rounded-xl ${theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
          ))}
        </div>
      </div>
    )
  }

  const isDark = theme === "dark"
  const cardClass = `mt-6 w-full border rounded-2xl transition overflow-hidden flex flex-col ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300"
    }`

  return (
    <div className={cardClass} style={{ minHeight: "400px" }}>
      {/* HEADER */}
      <div
        className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-300 bg-zinc-100"
          }`}
      >
        <div className="flex items-center gap-3">
          {activeNoteId && (
            <button
              onClick={() => setActiveNoteId(null)}
              className={`p-1.5 rounded-lg transition ${isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-200 text-zinc-600"
                }`}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}>
              {activeNoteId ? "Edit Note" : "Developer Notes"}
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              {activeNoteId
                ? "Notion-style workspace"
                : "Keep track of ideas, tasks and bugs."}
            </p>
          </div>
        </div>

        {!activeNoteId && (
          <button
            onClick={handleCreateNote}
            aria-label="Create new note"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${isDark
                ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                : "bg-white hover:bg-zinc-100 border border-zinc-200 text-black shadow-sm"
              }`}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Note</span>
          </button>
        )}

        {activeNoteId && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${isEditing
                  ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                  : isDark
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                    : "bg-white hover:bg-zinc-200 text-black border border-zinc-300"
                }`}
            >
              {isEditing ? <Eye size={16} /> : <Edit2 size={16} />}
              {isEditing ? "Preview" : "Edit"}
            </button>
            <button
              onClick={(e) => handleDeleteNote(activeNoteId, e)}
              className={`p-2 rounded-xl transition ${isDark ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-100 text-red-500"
                }`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="p-5 flex-1 flex flex-col relative">
        {!activeNoteId ? (
          /* NOTES GRID */
          notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60">
              <Type size={48} className="mb-4 text-zinc-400" />
              <p className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                No notes yet. Create one to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`group relative p-4 rounded-xl border transition flex flex-col h-[160px] ${isDark
                      ? "bg-zinc-950 border-zinc-800 hover:border-zinc-600"
                      : "bg-white border-zinc-200 hover:border-zinc-400"
                    }`}
                >
                  <button
                    onClick={() => setActiveNoteId(note.id)}
                    aria-label={`Open note ${note.title || "Untitled"}`}
                    className="absolute inset-0 z-0 w-full h-full rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                  />
                  <div className="relative z-10 pointer-events-none flex-1 flex flex-col">
                    <h3 className={`font-bold text-lg mb-2 truncate ${isDark ? "text-white" : "text-black"}`}>
                      {note.title || "Untitled Note"}
                    </h3>
                    <p
                      className={`text-sm line-clamp-3 mb-auto ${isDark ? "text-zinc-400" : "text-zinc-600"
                        }`}
                    >
                      {note.content || "Empty note..."}
                    </p>
                  </div>
                  <div className={`relative z-10 mt-3 pt-3 border-t flex items-center justify-between text-[10px] uppercase font-bold ${isDark ? "border-zinc-800 text-zinc-600" : "border-zinc-100 text-zinc-400"
                    }`}>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(note.lastEdited).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      aria-label={`Delete note ${note.title || "Untitled"}`}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 outline-none rounded px-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ACTIVE NOTE EDITOR */
          <div className="flex flex-col flex-1 h-full">
            <label htmlFor="note-title-input" className="sr-only">Note Title</label>
            <input
              id="note-title-input"
              type="text"
              value={activeNote?.title || ""}
              onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
              placeholder="Note Title"
              className={`text-2xl font-black mb-4 outline-none bg-transparent rounded focus-visible:ring-2 focus-visible:ring-blue-500 ${isDark ? "text-white placeholder-zinc-700" : "text-black placeholder-zinc-400"
                }`}
            />

            {isEditing ? (
              <>
                <label htmlFor="note-content-input" className="sr-only">Note Content</label>
                <textarea
                  id="note-content-input"
                  value={activeNote?.content || ""}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder="Start typing your markdown notes here..."
                  className={`flex-1 w-full min-h-[300px] outline-none resize-none bg-transparent rounded p-2 focus-visible:ring-2 focus-visible:ring-blue-500 ${isDark ? "text-zinc-300 placeholder-zinc-700" : "text-zinc-700 placeholder-zinc-400"
                    }`}
                />
              </>
            ) : (
              <div
                className={`flex-1 w-full min-h-[300px] prose prose-sm max-w-none overflow-y-auto ${isDark ? "prose-invert text-zinc-300" : "text-zinc-700"
                  }`}
              >
                {activeNote?.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeNote.content}
                  </ReactMarkdown>
                ) : (
                  <p className="opacity-50 italic">Nothing to preview.</p>
                )}
              </div>
            )}

            {/* STATUS BAR */}
            <div
              className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-medium ${isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-300 text-zinc-400"
                }`}
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  Last edited: {new Date(activeNote?.lastEdited).toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Type size={14} />
                  {activeNote?.content.length || 0} characters
                </span>
              </div>
              <span className="text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Auto-saved
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}