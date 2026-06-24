"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/context/ThemeContext"

export default function ProjectSubNav({ projectIndex }) {
  const { theme } = useTheme()
  const pathname = usePathname()

  const tabs = [
    {
      name: "Overview",
      href: `/projects/${projectIndex}`
    },
    {
      name: "Tasks",
      href: `/projects/${projectIndex}/tasks`
    },
    {
      name: "Workspace",
      href: `/projects/${projectIndex}/workspace`
    },
    {
      name: "Resources",
      href: `/projects/${projectIndex}/resources`
    }
  ]

  const isActive = (href, name) => {
    if (name === "Overview") {
      return pathname === href
    }
    if (name === "Tasks") {
      return pathname === href
    }
    if (name === "Workspace") {
      return (
        pathname.startsWith(href) ||
        pathname.startsWith(`/projects/${projectIndex}/tasks/`)
      )
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-wrap gap-3 mt-8 mb-8">
      {tabs.map((tab) => {
        const active = isActive(tab.href, tab.name)

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`px-5 py-2.5 rounded-xl font-medium transition ${
              active
                ? "bg-blue-500 text-white"
                : theme === "dark"
                  ? "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {tab.name}
          </Link>
        )
      })}
    </div>
  )
}
