"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Layout,
  FolderKanban,
  BarChart3,
  Settings,
  Code2
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", icon: Layout, path: "/dashboard" },
    { name: "Projects", icon: FolderKanban, path: "/projects" },
    { name: "Snippets", icon: Code2, path: "/snippets" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Settings", icon: Settings, path: "/settings" }
  ]

  return (
    <aside className="hidden md:flex h-full w-[52px] flex-col items-center py-4 gap-4 bg-page border-r border-border shrink-0">
      {/* Logo mark */}
      <div className="flex h-10 w-full items-center justify-center text-accent font-mono font-bold text-sm tracking-tighter">
        dX_
      </div>

      {/* Nav icons */}
      <nav aria-label="Desktop Sidebar" className="flex flex-col w-full flex-1 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.path === "/"
            ? pathname === "/"
            : pathname.startsWith(item.path)

          return (
            <Link
              key={item.name}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.name}
              title={item.name}
              className={`relative flex h-12 w-full items-center justify-center transition-colors duration-100 outline-none ${
                isActive
                  ? "bg-surface text-accent border-l-2 border-accent"
                  : "text-text-muted hover:text-text-main hover:bg-surface border-l-2 border-transparent"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
