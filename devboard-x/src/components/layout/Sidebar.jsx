"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Layout,
  Terminal,
  FolderKanban,
  BarChart3,
  Settings,
  Code2
} from "lucide-react"

export default function Sidebar() {
  // CURRENT ROUTE
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      icon: Layout,
      path: "/dashboard"
    },
    {
      name: "Projects",
      icon: FolderKanban,
      path: "/projects"
    },
    {
      name: "Snippets",
      icon: Code2,
      path: "/snippets"
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics"
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings"
    }
  ]

  return (
    <aside className="hidden md:flex h-full w-64 p-4 flex-col border-r transition bg-surface text-text-main border-border-subtle">
      {/* LOGO */}
      <div className="mb-8 rounded-2xl border border-border-subtle bg-page px-4 py-4 panel-shadow">
        <h1 className="text-2xl font-black tracking-tight">
          DevBoard X
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          Build space
        </p>
      </div>

      {/* NAV LINKS */}
      <nav aria-label="Desktop Sidebar" className="flex flex-col gap-6 flex-1">
        
        {/* Workspace Section */}
        <div>
          <h2 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Workspace
          </h2>
          <div className="flex flex-col gap-0.5">
            {navItems.slice(0, 3).map((item) => {
              const Icon = item.icon
              const isActive = item.path === "/" 
                ? pathname === "/" 
                : pathname.startsWith(item.path)

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-r-xl px-4 py-2.5 transition-all outline-none border-l-4 ${
                    isActive
                      ? "border-primary bg-secondary text-primary"
                      : "border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-main hover:border-border-strong"
                  }`}
                >
                  <Icon size={18} className={`transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
                  <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Platform Section */}
        <div>
          <h2 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Platform
          </h2>
          <div className="flex flex-col gap-0.5">
            {navItems.slice(3).map((item) => {
              const Icon = item.icon
              const isActive = item.path === "/" 
                ? pathname === "/" 
                : pathname.startsWith(item.path)

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-r-xl px-4 py-2.5 transition-all outline-none border-l-4 ${
                    isActive
                      ? "border-primary bg-secondary text-primary"
                      : "border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-main hover:border-border-strong"
                  }`}
                >
                  <Icon size={18} className={`transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
                  <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </aside>
  )
}
