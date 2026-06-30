"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Code2, Search, Trash2, Edit, Copy, Heart, Plus, Terminal } from "lucide-react"

import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"

export default function SnippetsPage() {
  const _snippets = useQuery(api.snippets.getSnippets)
  const snippets = useMemo(() => _snippets || [], [_snippets])
  const deleteSnippet = useMutation(api.snippets.deleteSnippet)
  const toggleFavorite = useMutation(api.snippets.toggleFavorite)
  const createSnippet = useMutation(api.snippets.createSnippet)

  const [search, setSearch] = useState("")
  const [filterLang, setFilterLang] = useState("all")
  const [sortBy, setSortBy] = useState("recent") // "recent", "used", "favorites"

  const languages = ["all", ...new Set(snippets.map(s => s.language))].filter(Boolean)

  const filteredSnippets = useMemo(() => {
    let result = snippets.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                            (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
      const matchesLang = filterLang === "all" || s.language === filterLang
      return matchesSearch && matchesLang
    })

    if (sortBy === "recent") {
      result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === "used") {
      result = result.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    } else if (sortBy === "favorites") {
      result = result.filter(s => s.favorite)
    }

    return result
  }, [snippets, search, filterLang, sortBy])

  const handleDuplicate = async (snippet) => {
    await createSnippet({
      title: `${snippet.title} (Copy)`,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags || [],
      favorite: false
    })
  }

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete the snippet "${title}"?`)) {
      await deleteSnippet({ id })
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("Code copied to clipboard!")
  }

  return (
    <div className="flex-1 p-8 bg-surface text-text-main overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3">
              <Code2 className="text-primary" size={36} /> Snippet Library
            </h1>
            <p className="text-zinc-400 mt-2">Manage your global code snippets usable across all tasks.</p>
          </div>
        </div>

        <Card className="mb-6 bg-zinc-950/40 p-4 border border-zinc-800/60 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search snippets by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-primary/50 text-white"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-primary/50 text-zinc-300"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang === "all" ? "All Languages" : lang}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-primary/50 text-zinc-300"
            >
              <option value="recent">Recently Added</option>
              <option value="used">Most Used</option>
              <option value="favorites">Favorites Only</option>
            </select>
          </div>
        </Card>

        {filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSnippets.map((snippet) => (
              <Card key={snippet._id} className="group relative overflow-hidden bg-zinc-950/50 hover:border-zinc-700 transition-all flex flex-col h-[320px]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {snippet.title}
                    </h3>
                    {snippet.description && (
                      <p className="text-sm text-zinc-400 mt-1">{snippet.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFavorite({ id: snippet._id, favorite: !snippet.favorite })}
                    className={`p-1.5 rounded-full transition-colors ${snippet.favorite ? "text-danger bg-danger/10 hover:bg-danger/20" : "text-zinc-500 hover:text-white hover:bg-zinc-800"}`}
                  >
                    <Heart size={18} fill={snippet.favorite ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-hidden relative rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-4 font-mono text-sm text-zinc-300">
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => copyToClipboard(snippet.code)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded" title="Copy Code">
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="h-full overflow-hidden whitespace-pre-wrap break-all opacity-80">
                    {snippet.code.length > 400 ? snippet.code.slice(0, 400) + "\n..." : snippet.code}
                  </pre>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded">
                      {snippet.language}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Terminal size={12} /> Used {snippet.usageCount || 0} times
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDuplicate(snippet)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition" title="Duplicate">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => handleDelete(snippet._id, snippet.title)} className="p-1.5 text-zinc-400 hover:text-danger hover:bg-danger/10 rounded transition" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Code2}
            title="No snippets found"
            description="You don't have any snippets matching your search criteria."
          />
        )}
      </div>
    </div>
  )
}
