"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ProjectSubNav({ projectIndex }) {
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
    return pathname.startsWith(href)
  }

  return (
    <nav aria-label="Project Sections" className="flex overflow-x-auto whitespace-nowrap gap-6 mt-8 mb-8 border-b border-border-subtle scrollbar-hide w-full">
      {tabs.map((tab) => {
        const active = isActive(tab.href, tab.name)

        return (
          <Link
            key={tab.name}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`px-4 py-2.5 font-medium transition whitespace-nowrap border-b-2 ${
              active
                ? "border-blue-500 text-text-main font-semibold"
                : "border-transparent text-text-secondary hover:text-text-main hover:border-border-strong"
            }`}
          >
            {tab.name}
          </Link>
        )
      })}
    </nav>
  )
}
