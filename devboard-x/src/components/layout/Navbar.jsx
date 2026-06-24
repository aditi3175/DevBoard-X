"use client"

import { Search, Bell, User, Menu, X, Layout, FolderKanban, BarChart3, Settings } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { theme } = useTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const drawerRef = useRef(null)

  const navItems = [
    { name: "Dashboard", icon: Layout, path: "/" },
    { name: "Projects", icon: FolderKanban, path: "/projects" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Settings", icon: Settings, path: "/settings" }
  ]

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

    <header
      className={`h-16 w-full px-4 sm:px-6 flex items-center justify-between border-b transition ${theme === "dark"
          ? "bg-zinc-900 text-white border-zinc-800"
          : "bg-white text-black border-zinc-300"
        }`}
    >

      {/* LEFT SIDE: Brand / Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open mobile menu"
          aria-expanded={mobileMenuOpen}
          className={`md:hidden flex items-center justify-center p-2 rounded-lg transition ${
            theme === "dark" ? "hover:bg-zinc-800 text-white" : "hover:bg-zinc-100 text-black"
          }`}
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold hidden sm:block">
          Workspace
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">

        {/* SEARCH */}
        <label htmlFor="global-search" className="sr-only">Search Workspace</label>
        <div
          className={`flex items-center gap-2 w-full max-w-xs border px-3 sm:px-4 py-2 rounded-lg transition focus-within:ring-2 focus-within:ring-blue-500 ${theme === "dark"
              ? "border-zinc-700 focus-within:border-zinc-500"
              : "border-zinc-300 focus-within:border-zinc-500"
            }`}
        >
          <Search size={18} className={theme === "dark" ? "text-zinc-400" : "text-zinc-400"} aria-hidden="true" />
          <input
            id="global-search"
            type="text"
            placeholder="Search..."
            className={`w-full outline-none bg-transparent text-sm ${theme === "dark"
                ? "text-white placeholder-zinc-500"
                : "text-black placeholder-zinc-400"
              }`}
          />
        </div>

        {/* NOTIFICATIONS */}
        <button
          aria-label="Notifications"
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition ${theme === "dark"
              ? "hover:bg-zinc-800"
              : "hover:bg-zinc-100"
            }`}
        >
          <Bell size={18} />
          <span className="hidden lg:inline">Notifications</span>
        </button>

        {/* PROFILE */}
        <button
          aria-label="Profile"
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition ${theme === "dark"
              ? "hover:bg-zinc-800"
              : "hover:bg-zinc-100"
            }`}
        >
          <User size={18} />
          <span className="hidden lg:inline">Profile</span>
        </button>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
            aria-hidden="true"
          />
          <nav 
            ref={drawerRef}
            aria-label="Mobile Sidebar"
            className={`relative w-64 h-full shadow-xl flex flex-col p-4 transition-transform ${
              theme === "dark" ? "bg-[#09090b] text-white" : "bg-zinc-50 text-black"
            }`}
          >
            <div className="flex items-center justify-between mb-8 px-3">
              <h1 className="text-2xl font-bold tracking-tight">DevBoard X</h1>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                aria-label="Close mobile menu"
                className="p-1 rounded-lg hover:bg-zinc-800/50 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              >
                <X size={20} />
              </button>
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                      isActive
                        ? theme === "dark" ? "bg-zinc-800 text-white" : "bg-white text-black shadow-sm border border-zinc-200"
                        : theme === "dark" ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-white" : "text-zinc-600 hover:bg-zinc-200/50 hover:text-black"
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