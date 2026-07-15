"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Plus, Trash2, Edit2, ChevronLeft, Eye, Clock, Type } from "lucide-react"
import { usePersistentState } from "@/utils/storage"

// Terminal Window Wrapper for Notes
const NotesTerminalWindow = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-page border border-border rounded-[8px] overflow-hidden z-10 w-full ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-page-raised">
        <div className="w-2.5 h-2.5 rounded-full bg-danger" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning" />
        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
        <span className="ml-4 text-xs text-text-muted font-mono">{title}</span>
      </div>
      <div className="p-5 font-mono h-full flex flex-col">
        {children}
      </div>
    </div>
  )
}

export default function NotesWidget() {
  const [notes, setNotes, isLoaded] = usePersistentState("devboard-notes", [
    {
      id: "default-note",
      title: "Quick Note",
      content: "",
      lastEdited: "1970-01-01T00:00:00.000Z"
    }
  ])
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [isEditing, setIsEditing] = useState(true)

  const activeNoteId = selectedNoteId

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      lastEdited: new Date().toISOString()
    }
    setNotes([newNote, ...notes])
    setSelectedNoteId(newNote.id)
    setIsEditing(true)
  }

  const handleDeleteNote = (id, e) => {
    e?.stopPropagation()
    const updated = notes.filter((n) => n.id !== id)
    setNotes(updated)
    if (activeNoteId === id) {
      setSelectedNoteId(null)
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

  if (!isLoaded) {
    return (
      <NotesTerminalWindow title="~/workspace/notes.sh" className="min-h-[400px]">
        <div className="flex gap-2 mb-6 text-sm">
          <span className="text-accent">~</span>
          <span className="text-text-main">$</span>
          <span className="text-text-muted">Loading note buffers...</span>
        </div>
        <div className="text-text-main animate-pulse pt-2">_</div>
      </NotesTerminalWindow>
    )
  }

  return (
    <NotesTerminalWindow title={activeNoteId ? `~/workspace/notes/${activeNote?.title.replace(/\s+/g, '-').toLowerCase() || 'untitled'}.md` : "~/workspace/notes.md"} className="min-h-[400px]">
      
      {/* TOOLBAR */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 text-sm">
          {activeNoteId && (
            <button
              onClick={() => setSelectedNoteId(null)}
              className="text-text-muted hover:text-text-main transition-colors flex items-center gap-1 outline-none focus-visible:text-accent"
            >
              <ChevronLeft size={16} /> cd ..
            </button>
          )}
          {!activeNoteId && (
            <span className="text-text-main font-bold">ls -l ./notes</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!activeNoteId ? (
            <button
              onClick={handleCreateNote}
              className="text-accent hover:text-text-main transition-colors text-xs flex items-center gap-1 uppercase tracking-wider font-bold outline-none"
            >
              <Plus size={14} /> touch new_note.md
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`${isEditing ? 'text-info' : 'text-text-muted hover:text-text-main'} transition-colors text-xs flex items-center gap-1 uppercase tracking-wider font-bold outline-none`}
              >
                {isEditing ? <Eye size={14} /> : <Edit2 size={14} />} 
                {isEditing ? "cat" : "nano"}
              </button>
              <button
                onClick={(e) => handleDeleteNote(activeNoteId, e)}
                className="text-danger hover:text-danger-bg transition-colors text-xs flex items-center gap-1 uppercase tracking-wider font-bold outline-none"
              >
                <Trash2 size={14} /> rm -rf
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col relative text-sm">
        {!activeNoteId ? (
          /* NOTES LIST */
          notes.length === 0 ? (
            <div className="text-text-muted mt-4">Total 0. Directory empty.</div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center text-text-muted border-b border-border pb-2 mb-2 uppercase text-[10px] font-bold tracking-wider">
                <div className="flex-1">Filename</div>
                <div className="w-32 text-right">Modified</div>
                <div className="w-12 text-center">Action</div>
              </div>
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group flex items-center hover:bg-surface -mx-2 px-2 py-1.5 transition-colors cursor-pointer"
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-accent mr-2">-rw-r--r--</span>
                    <span className="text-text-main font-bold truncate">
                      {note.title || "untitled_note"}.md
                    </span>
                  </div>
                  <div className="w-32 text-right text-text-muted text-xs">
                    {new Date(note.lastEdited).toLocaleDateString()}
                  </div>
                  <div className="w-12 text-center">
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="text-text-muted hover:text-danger outline-none"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ACTIVE NOTE EDITOR */
          <div className="flex flex-col flex-1 h-full">
            <div className="flex items-center gap-2 mb-4 text-text-main text-lg font-bold">
              <span className="text-accent">#</span>
              <input
                type="text"
                value={activeNote?.title || ""}
                onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                placeholder="Note Title"
                className="flex-1 outline-none bg-transparent placeholder-text-muted focus-visible:border-b focus-visible:border-accent pb-1 transition-all"
              />
            </div>

            {isEditing ? (
              <textarea
                value={activeNote?.content || ""}
                onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                placeholder="Start typing your markdown notes here..."
                className="flex-1 w-full min-h-[250px] outline-none resize-none bg-transparent focus-visible:ring-1 focus-visible:ring-accent p-2 text-text-sub placeholder-text-muted font-mono leading-relaxed rounded"
              />
            ) : (
              <div className="flex-1 w-full min-h-[250px] prose prose-invert prose-sm max-w-none overflow-y-auto text-text-main font-sans">
                {activeNote?.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeNote.content}
                  </ReactMarkdown>
                ) : (
                  <div className="text-text-muted font-mono mt-4">Empty file...</div>
                )}
              </div>
            )}

            {/* STATUS BAR */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {new Date(activeNote?.lastEdited).toLocaleString([], { hour12: false })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Type size={12} />
                  {activeNote?.content.length || 0} bytes
                </span>
              </div>
              <span className="text-success flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                [ WROTE ]
              </span>
            </div>
          </div>
        )}
      </div>
    </NotesTerminalWindow>
  )
}
