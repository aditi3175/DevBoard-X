"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Layout,
  Terminal,
  FolderKanban,
  BarChart3,
  Settings
} from "lucide-react"

export default function Sidebar() {

  // GET CURRENT ROUTE
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
      name: "Settings",
      icon: Settings,
      path: "/settings"
    }
  ]

  return (

    <div className="h-screen w-64 bg-zinc-900 text-white p-4 flex flex-col border-r border-zinc-800">

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

          // CHECK ACTIVE ROUTE
          const isActive = pathname === item.path

          return (

            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
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