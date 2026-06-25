"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Search,
  FolderKanban,
  ListTodo,
  Code2,
  Link2,
  Zap,
  Plus,
  FolderCode,
  ArrowRight,
  CornerDownLeft
} from "lucide-react"


import { useProjects } from "@/context/ProjectContext"

// Category definitions for icons and styling
const CATEGORIES = {
  action: {
    label: "Quick Actions",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/15"
  },
  project: {
    label: "Projects",
    icon: FolderKanban,
    color: "text-blue-400",
    bg: "bg-blue-500/15"
  },
  task: {
    label: "Tasks",
    icon: ListTodo,
    color: "text-green-400",
    bg: "bg-green-500/15"
  },
  snippet: {
    label: "Snippets",
    icon: Code2,
    color: "text-purple-400",
    bg: "bg-purple-500/15"
  },
  resource: {
    label: "Resources",
    icon: Link2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15"
  }
}

// Order in which grouped categories appear
const CATEGORY_ORDER = ["action", "project", "task", "snippet", "resource"]

export default function CommandPalette() {
  const router = useRouter()
  const { projects } = useProjects()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const inputRef = useRef(null)
  const listRef = useRef(null)
  const itemRefs = useRef([])

  // ─── BUILD SEARCHABLE ITEMS ────────────────────────────────────
  const allItems = useMemo(() => {
    const items = []

    // Quick Actions — always available
    const quickActions = [
      {
        id: "action-create-task",
        category: "action",
        title: "Create Task",
        subtitle: "Add a new task to a project",
        icon: Plus,
        route: projects.length > 0 ? `/projects/0/tasks` : "/projects"
      },
      {
        id: "action-create-resource",
        category: "action",
        title: "Create Resource",
        subtitle: "Add a new resource link",
        icon: Link2,
        route: projects.length > 0 ? `/projects/0/resources` : "/projects"
      },
      {
        id: "action-open-workspace",
        category: "action",
        title: "Open Workspace",
        subtitle: "Open project workspace",
        icon: FolderCode,
        route: projects.length > 0 ? `/projects/0/workspace` : "/projects"
      }
    ]
    items.push(...quickActions)

    // Projects
    projects.forEach((project, pIdx) => {
      items.push({
        id: `project-${pIdx}`,
        category: "project",
        title: project.title,
        subtitle: project.description || project.status || "",
        meta: project.status,
        route: `/projects/${pIdx}`
      })

      // Tasks inside each project
      ;(project.tasks || []).forEach((task, tIdx) => {
        items.push({
          id: `task-${pIdx}-${tIdx}`,
          category: "task",
          title: task.title,
          subtitle: project.title,
          meta: task.priority || "",
          route: `/projects/${pIdx}/tasks/${tIdx}`
        })
      })

      // Resources inside each project
      ;(project.resources || []).forEach((resource, rIdx) => {
        items.push({
          id: `resource-${pIdx}-${rIdx}`,
          category: "resource",
          title: resource.title,
          subtitle: `${resource.category || ""} · ${project.title}`,
          meta: resource.category || "",
          route: `/projects/${pIdx}/resources`
        })
      })
    })

    return items
  }, [projects])

  // ─── FILTERED RESULTS ──────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim()

    if (!q) {
      // When empty, show quick actions + up to 3 from each other category
      const actions = allItems.filter((i) => i.category === "action")
      const others = []
      for (const cat of ["project", "task", "snippet", "resource"]) {
        const catItems = allItems.filter((i) => i.category === cat).slice(0, 3)
        others.push(...catItems)
      }
      return [...actions, ...others]
    }

    return allItems.filter((item) => {
      const haystack = `${item.title} ${item.subtitle} ${item.meta || ""}`.toLowerCase()
      // Match all query words (simple multi-word matching)
      const words = q.split(/\s+/)
      return words.every((word) => haystack.includes(word))
    })
  }, [query, allItems])

  // Group filtered results by category for display
  const groupedResults = useMemo(() => {
    const groups = []
    const flatList = []

    for (const cat of CATEGORY_ORDER) {
      const items = filteredItems.filter((i) => i.category === cat)
      if (items.length > 0) {
        groups.push({ category: cat, items })
        flatList.push(...items)
      }
    }

    return { groups, flatList }
  }, [filteredItems])

  // ─── KEYBOARD HANDLING ─────────────────────────────────────────
  const handleSelect = useCallback(
    (item) => {
      setOpen(false)
      setQuery("")
      setActiveIndex(0)
      router.push(item.route)
    },
    [router]
  )

  // Global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery("")
        setActiveIndex(0)
      }
    }

    window.addEventListener("keydown", handleGlobalKey)
    return () => window.removeEventListener("keydown", handleGlobalKey)
  }, [])

  // Palette-internal keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKey = (e) => {
      const { flatList } = groupedResults
      const total = flatList.length

      if (e.key === "Escape") {
        e.preventDefault()
        setOpen(false)
        setQuery("")
        setActiveIndex(0)
        return
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % Math.max(total, 1))
        return
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + Math.max(total, 1)) % Math.max(total, 1))
        return
      }

      if (e.key === "Enter") {
        e.preventDefault()
        const selected = flatList[activeIndex]
        if (selected) handleSelect(selected)
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, groupedResults, activeIndex, handleSelect])

  // Removed effect that resets activeIndex
  // Autofocus input when palette opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    const el = itemRefs.current[activeIndex]
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [activeIndex])

  // ─── THEME TOKENS ──────────────────────────────────────────────
  const tokens = {
    backdrop: "bg-black/60 backdrop-blur-sm dark:bg-black/80",
    panel: "bg-surface border-border-subtle shadow-2xl shadow-black/20",
    input: "text-text-main placeholder-text-muted",
    inputBorder: "border-border-subtle",
    sectionLabel: "text-text-muted",
    itemBg: "hover:bg-bg-hover",
    itemActiveBg: "bg-bg-active",
    itemTitle: "text-text-main",
    itemSubtitle: "text-text-secondary",
    emptyText: "text-text-muted",
    footerBg: "bg-bg-hover border-border-subtle",
    footerText: "text-text-muted",
    kbd: "bg-surface text-text-muted border-border-strong"
  }

  // ─── RENDER ────────────────────────────────────────────────────
  let flatIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] ${tokens.backdrop}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => {
            setOpen(false)
            setQuery("")
            setActiveIndex(0)
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-palette-title"
            className={`w-full max-w-[640px] mx-4 rounded-2xl border overflow-hidden ${tokens.panel}`}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visually hidden title for screen readers */}
            <h2 id="command-palette-title" className="sr-only">Command Palette</h2>
            
            {/* Search Input */}
            <label htmlFor="command-palette-search" className="sr-only">Search Command Palette</label>
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${tokens.inputBorder}`}>
              <Search size={20} className="text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                placeholder="Search projects, tasks, snippets, resources..."
                className={`flex-1 bg-transparent outline-none text-base ${tokens.input}`}
                id="command-palette-search"
              />
              <kbd
                className={`hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border ${tokens.kbd}`}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-[400px] overflow-y-auto scrollbar-hide"
              id="command-palette-results"
            >
              {groupedResults.flatList.length === 0 ? (
                <div className="py-14 text-center">
                  <p className={`text-sm ${tokens.emptyText}`}>
                    No results for &ldquo;{query}&rdquo;
                  </p>
                </div>
              ) : (
                groupedResults.groups.map((group) => {
                  const catDef = CATEGORIES[group.category]
                  const CatIcon = catDef.icon

                  return (
                    <div key={group.category} className="py-1">
                      {/* Section Header */}
                      <div className="flex items-center gap-2 px-5 py-2">
                        <CatIcon size={13} className={catDef.color} />
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider truncate ${tokens.sectionLabel}`}
                        >
                          {catDef.label}
                        </span>
                      </div>

                      {/* Items */}
                      {group.items.map((item) => {
                        flatIndex++
                        const currentIdx = flatIndex
                        const isActive = currentIdx === activeIndex
                        const ItemIcon = item.icon || catDef.icon

                        return (
                          <button
                            key={item.id}
                            ref={(el) => {
                              itemRefs.current[currentIdx] = el
                            }}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(currentIdx)}
                            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors duration-75 cursor-pointer ${
                              isActive ? tokens.itemActiveBg : tokens.itemBg
                            }`}
                            id={`command-palette-item-${item.id}`}
                          >
                            {/* Icon */}
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${catDef.bg}`}
                            >
                              <ItemIcon size={16} className={catDef.color} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${tokens.itemTitle}`}>
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className={`text-xs truncate ${tokens.itemSubtitle}`}>
                                  {item.subtitle}
                                </p>
                              )}
                            </div>

                            {/* Trailing hint */}
                            {isActive && (
                              <div className="flex items-center gap-1 shrink-0">
                                <CornerDownLeft size={13} className={tokens.footerText} />
                              </div>
                            )}

                            {/* Meta badge */}
                            {!isActive && item.meta && (
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${catDef.bg} ${catDef.color}`}
                              >
                                {item.meta}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            <div
              className={`flex items-center justify-between px-5 py-2.5 border-t text-xs ${tokens.footerBg} ${tokens.footerText}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className={`px-1.5 py-0.5 rounded border text-xs font-mono ${tokens.kbd}`}>
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className={`px-1.5 py-0.5 rounded border text-xs font-mono ${tokens.kbd}`}>
                    ↵
                  </kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className={`px-1.5 py-0.5 rounded border text-xs font-mono ${tokens.kbd}`}>
                    esc
                  </kbd>
                  close
                </span>
              </div>
              <span className="flex items-center gap-1.5">
                <Zap size={11} className="text-amber-500" />
                DevBoard X
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
