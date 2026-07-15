import { useState, useMemo } from "react"
import { Search, Code2, Plus, X } from "lucide-react"

export default function SnippetPickerModal({ isOpen, onClose, snippets, onInsert }) {
  const [search, setSearch] = useState("")
  const [filterLang, setFilterLang] = useState("all")

  const filteredSnippets = useMemo(() => {
    return snippets.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                            (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
      const matchesLang = filterLang === "all" || s.language === filterLang
      return matchesSearch && matchesLang
    })
  }, [snippets, search, filterLang])

  const languages = ["all", ...new Set(snippets.map(s => s.language))].filter(Boolean)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/90 p-4">
      <div className="bg-surface border border-border-subtle rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Code2 size={20} className="text-primary" />
            Insert Global Snippet
          </h2>
          <button onClick={onClose} className="p-1 rounded text-text-muted hover:bg-bg-hover hover:text-text-main transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-border-subtle flex gap-3 bg-bg-hover">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search snippets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-primary text-text-main placeholder:text-text-muted"
              autoFocus
            />
          </div>
          <select
            value={filterLang}
            onChange={e => setFilterLang(e.target.value)}
            className="px-3 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-primary text-text-main"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang === "all" ? "All Languages" : lang}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredSnippets.length > 0 ? (
            filteredSnippets.map(snippet => (
              <div key={snippet._id} className="group border border-border-subtle rounded-lg p-3 hover:bg-bg-hover transition-colors flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text-main">{snippet.title}</h3>
                    {snippet.description && <p className="text-xs text-text-muted mt-1">{snippet.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded bg-info-bg text-info-text">{snippet.language}</span>
                    <button
                      onClick={() => onInsert(snippet)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-lg text-xs font-semibold transition"
                    >
                      <Plus size={14} /> Insert
                    </button>
                  </div>
                </div>
                <div className="bg-bg-active p-3 rounded-lg border border-border-subtle overflow-hidden">
                  <pre className="text-xs text-text-secondary font-mono overflow-hidden max-h-24">
                    {snippet.code.slice(0, 300)}{snippet.code.length > 300 ? "..." : ""}
                  </pre>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-text-muted">
              <Code2 size={48} className="mx-auto mb-3 opacity-20" />
              <p>No snippets found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
