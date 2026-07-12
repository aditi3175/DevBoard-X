"use client"

import { User, Menu, X, Layout, FolderKanban, BarChart3, Settings, ChevronRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { useProjects } from "@/context/ProjectContext"
import Button from "@/components/ui/Button"


export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const drawerRef = useRef(null)

  const { projects, isLoaded } = useProjects()

  const navItems = [
    { name: "Dashboard", icon: Layout, path: "/" },
    { name: "Projects", icon: FolderKanban, path: "/projects" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Settings", icon: Settings, path: "/settings" }
  ]

  const buildBreadcrumbs = () => {
    if (pathname === "/") return [{ name: "Dashboard" }]
    if (pathname === "/projects") return [{ name: "Projects" }]
    if (pathname === "/analytics") return [{ name: "Analytics" }]
    if (pathname === "/settings") return [{ name: "Settings" }]

    if (pathname.startsWith("/projects/")) {
      const parts = pathname.split("/").filter(Boolean)
      const projectId = parts[1]

      const breadcrumbs = [{ name: "Projects", path: "/projects" }]

      if (!isLoaded) {
        breadcrumbs.push({ name: "Loading..." })
        return breadcrumbs
      }

      const project = projects[parseInt(projectId, 10)]
      if (!project) {
        breadcrumbs.push({ name: "Project Not Found" })
        return breadcrumbs
      }

      breadcrumbs.push({ name: project.title, path: `/projects/${projectId}` })

      if (parts[2] === "tasks" && parts[3]) {
        const taskId = parts[3]
        const task = project.tasks[parseInt(taskId, 10)]
        if (!task) {
          breadcrumbs.push({ name: "Task Not Found" })
        } else {
          breadcrumbs.push({ name: task.title })
        }
      } else if (parts[2] === "tasks") {
        breadcrumbs.push({ name: "Tasks" })
      } else if (parts[2] === "workspace") {
        breadcrumbs.push({ name: "Workspace" })
      } else if (parts[2] === "resources") {
        breadcrumbs.push({ name: "Resources" })
      }

      return breadcrumbs
    }

    return [{ name: "Workspace" }]
  }

  const breadcrumbs = buildBreadcrumbs()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mobileMenuOpen])

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  return (
    <header className="h-12 shrink-0 w-full px-4 sm:px-6 flex items-center justify-between border-b transition bg-surface text-text-main border-border-subtle">
      {/* LEFT SIDE: Brand / Menu Toggle */}
      <div className="flex items-center gap-3 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open mobile menu"
          aria-expanded={mobileMenuOpen}
          className="md:hidden"
        >
          <Menu size={20} />
        </Button>
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <div key={index} className="flex items-center gap-1.5 overflow-hidden">
                {crumb.path && !isLast ? (
                  <Link href={crumb.path} className="text-sm font-medium text-text-secondary hover:text-text-main truncate max-w-[120px] md:max-w-[200px]">
                    {crumb.name}
                  </Link>
                ) : (
                  <span className={`text-sm font-semibold truncate max-w-[120px] md:max-w-[200px] ${isLast ? "text-text-main" : "text-text-secondary"}`}>
                    {crumb.name}
                  </span>
                )}
                {!isLast && <ChevronRight size={14} className="text-text-muted shrink-0" />}
              </div>
            )
          })}
        </nav>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">



        {/* PROFILE */}
        <div className="hidden sm:flex ml-2">
          <UserButton afterSignOutUrl="/" />
        </div>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-page/90" 
            onClick={() => setMobileMenuOpen(false)} 
            aria-hidden="true"
          />
          <nav 
            ref={drawerRef}
            aria-label="Mobile Sidebar"
            className="relative w-64 h-full shadow-xl flex flex-col p-4 transition-transform bg-page text-text-main"
          >
            <div className="flex items-center justify-between mb-8 px-3">
              <h1 className="text-2xl font-bold tracking-tight">DevBoard X</h1>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)} 
                aria-label="Close mobile menu"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none ${
                      isActive
                        ? "bg-bg-active text-text-main shadow-sm"
                        : "text-text-secondary hover:bg-bg-hover hover:text-text-main"
                    }`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
