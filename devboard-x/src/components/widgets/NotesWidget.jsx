"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Plus, Trash2, Edit2, ChevronLeft, Eye, Clock, Type } from "lucide-react"
import { usePersistentState } from "@/utils/storage"
import EmptyState from "@/components/ui/EmptyState"
import Button from "@/components/ui/Button"

export default function NotesWidget() {

  // STATE
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

  const activeNoteId = selectedNoteId || (notes.length > 0 ? notes[0].id : null)

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
      <div className="mt-6 w-full border rounded-xl transition overflow-hidden flex flex-col min-h-[400px] animate-pulse bg-surface border-border-subtle">
        <div className="px-5 py-4 border-b flex items-center justify-between border-border-subtle bg-bg-hover">
          <div className="h-6 w-32 rounded bg-bg-active"></div>
          <div className="h-8 w-24 rounded-lg bg-bg-active"></div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-bg-active"></div>
          ))}
        </div>
      </div>
    )
  }

  const cardClass = "mt-6 w-full border rounded-xl transition overflow-hidden flex flex-col bg-surface border-border-subtle"

  return (
    <div className={cardClass} style={{ minHeight: "400px" }}>
      {/* HEADER */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between border-border-subtle bg-bg-hover"
      >
        <div className="flex items-center gap-3">
          {activeNoteId && (
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setSelectedNoteId(null)}
            >
              <ChevronLeft size={20} />
            </Button>
          )}
          <div>
            <h2 className="text-xl font-bold text-text-main">
              {activeNoteId ? "Edit Note" : "Developer Notes"}
            </h2>
            <p className="text-xs mt-0.5 text-text-secondary">
              {activeNoteId
                ? "Notion-style workspace"
                : "Keep track of ideas, tasks and bugs."}
            </p>
          </div>
        </div>

        {!activeNoteId && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCreateNote}
            aria-label="Create new note"
            leftIcon={Plus}
          >
            <span className="hidden sm:inline">New Note</span>
          </Button>
        )}

        {activeNoteId && (
          <div className="flex items-center gap-2">
            <Button
              variant={isEditing ? "primary" : "secondary"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              leftIcon={isEditing ? Eye : Edit2}
              className={isEditing ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}
            >
              {isEditing ? "Preview" : "Edit"}
            </Button>
            <Button
              variant="destructive"
              size="iconSm"
              onClick={(e) => handleDeleteNote(activeNoteId, e)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="p-5 flex-1 flex flex-col relative">
        {!activeNoteId ? (
          /* NOTES GRID */
          notes.length === 0 ? (
            <div className="flex-1">
              <EmptyState
                icon={Type}
                title="No notes yet"
                description="Create your first developer note to keep track of ideas, tasks, and bugs."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative p-4 rounded-xl border transition flex flex-col h-[160px] bg-surface border-border-subtle hover:border-border-strong"
                >
                  <button
                    onClick={() => setSelectedNoteId(note.id)}
                    aria-label={`Open note ${note.title || "Untitled"}`}
                    className="absolute inset-0 z-0 w-full h-full rounded-xl focus-visible:ring-2 focus-visible:ring-primary outline-none"
                  />
                  <div className="relative z-10 pointer-events-none flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-2 truncate text-text-main">
                      {note.title || "Untitled Note"}
                    </h3>
                    <p
                      className="text-sm line-clamp-3 mb-auto text-text-secondary"
                    >
                      {note.content || "Empty note..."}
                    </p>
                  </div>
                  <div className="relative z-10 mt-3 pt-3 border-t flex items-center justify-between text-xs uppercase font-bold border-border-subtle text-text-muted tracking-wider">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(note.lastEdited).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      aria-label={`Delete note ${note.title || "Untitled"}`}
                      className="opacity-0 group-hover:opacity-100 hover:text-danger text-text-muted px-2 h-6 text-xs"
                    >
                      Delete
                    </Button>
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
              className="text-2xl font-black mb-4 outline-none bg-transparent rounded focus-visible:ring-2 focus-visible:ring-primary text-text-main placeholder-text-muted"
            />

            {isEditing ? (
              <>
                <label htmlFor="note-content-input" className="sr-only">Note Content</label>
                <textarea
                  id="note-content-input"
                  value={activeNote?.content || ""}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder="Start typing your markdown notes here..."
                  className="flex-1 w-full min-h-[300px] outline-none resize-none bg-transparent rounded p-2 focus-visible:ring-2 focus-visible:ring-primary text-text-main placeholder-text-muted"
                />
              </>
            ) : (
              <div
                className="flex-1 w-full min-h-[300px] prose prose-sm max-w-none overflow-y-auto dark:prose-invert text-text-main"
              >
                {activeNote?.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeNote.content}
                  </ReactMarkdown>
                ) : (
                  <div className="mt-8">
                    <EmptyState
                      variant="compact"
                      icon={Eye}
                      title="Nothing to preview"
                      description="Switch to edit mode to start writing your markdown note."
                    />
                  </div>
                )}
              </div>
            )}

            {/* STATUS BAR */}
            <div
              className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-medium border-border-subtle text-text-muted"
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
              <span className="text-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Auto-saved
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}