"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/context/ThemeContext"

import {
  Layout,
  Terminal,
  FolderKanban,
  BarChart3,
  Settings,
  Code2
} from "lucide-react"

export default function Sidebar() {

  const { theme } = useTheme()

  // CURRENT ROUTE
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      icon: Layout,
      path: "/"
    },
    {
      name: "Projects",
      icon: FolderKanban,
      path: "/projects"
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

    <aside
      className={`hidden md:flex h-full w-64 p-4 flex-col border-r transition ${theme === "dark"
          ? "bg-zinc-900 text-white border-zinc-800"
          : "bg-zinc-100 text-black border-zinc-300"
        }`}
    >

      {/* LOGO */}
      <div className="mb-8 px-3">

        <h1 className="text-2xl font-bold tracking-tight">
          DevBoard X
        </h1>

      </div>

      {/* NAV LINKS */}
      <nav aria-label="Desktop Sidebar" className="flex flex-col gap-2 flex-1">

        {navItems.map((item) => {

          const Icon = item.icon

          // ACTIVE ROUTE
          const isActive = item.path === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.path)

          return (

            <Link
              key={item.name}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${isActive
                  ? theme === "dark"
                    ? "bg-zinc-800 text-white"
                    : "bg-white text-black border border-zinc-300 shadow-sm"
                  : theme === "dark"
                    ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    : "text-zinc-600 hover:bg-zinc-200 hover:text-black"
                }`}
            >

              <Icon size={20} />

              <span className="font-medium">
                {item.name}
              </span>

            </Link>

          )

        })}

      </nav>

    </aside>

  )

}