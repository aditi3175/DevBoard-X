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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Code2 size={20} className="text-primary" />
            Insert Global Snippet
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-800/60 flex gap-3 bg-zinc-950/20">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search snippets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-primary/50 text-white"
              autoFocus
            />
          </div>
          <select
            value={filterLang}
            onChange={e => setFilterLang(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-primary/50 text-zinc-300"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang === "all" ? "All Languages" : lang}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredSnippets.length > 0 ? (
            filteredSnippets.map(snippet => (
              <div key={snippet._id} className="group border border-zinc-800/60 rounded-lg p-3 hover:bg-zinc-800/30 transition-colors flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-200">{snippet.title}</h3>
                    {snippet.description && <p className="text-xs text-zinc-400 mt-1">{snippet.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{snippet.language}</span>
                    <button
                      onClick={() => onInsert(snippet)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-semibold transition"
                    >
                      <Plus size={14} /> Insert
                    </button>
                  </div>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 overflow-hidden">
                  <pre className="text-xs text-zinc-300 font-mono overflow-hidden opacity-80 max-h-24">
                    {snippet.code.slice(0, 300)}{snippet.code.length > 300 ? "..." : ""}
                  </pre>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-zinc-500">
              <Code2 size={48} className="mx-auto mb-3 opacity-20" />
              <p>No snippets found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
