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
      name: "Terminal",
      icon: Terminal,
      path: "/terminal"
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
      name: "Snippets",
      icon: Code2,
      path: "/snippets"
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings"
    }

  ]

  return (

    <div
      className={`h-screen w-64 p-4 flex flex-col border-r transition ${
        theme === "dark"
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

      {/* NAVIGATION */}
      <div className="flex flex-col gap-3">

        {navItems.map((item) => {

          const Icon = item.icon

          // ACTIVE ROUTE
          const isActive = pathname === item.path

          return (

            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? theme === "dark"
                    ? "bg-zinc-800 text-white"
                    : "bg-white text-black border border-zinc-300"
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

      </div>

    </div>

  )

}