"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Code2, Search, Trash2, Edit, Copy, Heart, Plus, Terminal } from "lucide-react"

import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"

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
    <div className="h-full flex-1 overflow-y-auto p-8 text-text-main bg-page font-mono">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-3xl font-mono font-bold flex items-center gap-3 text-terminal-main">
            <span className="text-terminal-accent">~/</span>Snippet_Library
          </h1>
          <p className="mt-2 text-terminal-muted text-sm">// Manage your global code snippets usable across all tasks.</p>
        </div>

        <Card title="~/scripts/search_filter.sh" className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Input
              type="text"
              placeholder="Search snippets by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={Search}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="w-40 md:w-48"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang === "all" ? "All Languages" : lang}</option>
              ))}
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40 md:w-48"
            >
              <option value="recent">Recently Added</option>
              <option value="used">Most Used</option>
              <option value="favorites">Favorites</option>
            </Select>
          </div>
        </Card>

        {filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSnippets.map((snippet) => (
              <Card key={snippet._id} className="group relative flex h-[320px] flex-col overflow-hidden bg-surface/95 transition-all hover:-translate-y-0.5 hover:border-border-strong panel-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-black text-text-main">
                      {snippet.title}
                    </h3>
                    {snippet.description && (
                      <p className="mt-1 text-sm text-text-muted">{snippet.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFavorite({ id: snippet._id, favorite: !snippet.favorite })}
                    className={`p-1.5 rounded-full transition-colors ${snippet.favorite ? "text-danger bg-danger-bg hover:bg-danger/20" : "text-text-muted hover:bg-bg-hover hover:text-text-main"}`}
                  >
                    <Heart size={18} fill={snippet.favorite ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <div className="relative flex-1 min-h-0 rounded-lg border border-border-subtle bg-bg-active/70 p-4 font-mono text-sm text-text-secondary dark:bg-bg-input">
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => copyToClipboard(snippet.code)} className="rounded bg-surface p-1.5 text-text-main shadow-sm transition hover:bg-bg-hover" title="Copy Code">
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="h-full overflow-y-auto whitespace-pre-wrap break-all custom-scrollbar">
                    {snippet.code.length > 400 ? snippet.code.slice(0, 400) + "\n..." : snippet.code}
                  </pre>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded border border-accent/20 bg-accent/10 px-2 py-1 text-xs font-black text-accent">
                      {snippet.language}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Terminal size={12} /> Used {snippet.usageCount || 0} times
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDuplicate(snippet)} className="rounded p-1.5 text-text-muted transition hover:bg-bg-hover hover:text-text-main" title="Duplicate">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => handleDelete(snippet._id, snippet.title)} className="rounded p-1.5 text-text-muted transition hover:bg-danger-bg hover:text-danger" title="Delete">
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
