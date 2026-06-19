"use client"

import { Search, Bell, User } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export default function Navbar() {

  const { theme } = useTheme()

  return (

    <div
      className={`h-16 w-full px-6 flex items-center justify-between border-b transition ${
        theme === "dark"
          ? "bg-zinc-900 text-white border-zinc-800"
          : "bg-white text-black border-zinc-300"
      }`}
    >

      {/* LEFT SIDE */}
      <div>

        <h2 className="text-lg font-semibold">
          Dashboard
        </h2>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">

        {/* SEARCH */}
        <div
          className={`flex items-center gap-2 w-80 border px-4 py-2 rounded-lg transition ${
            theme === "dark"
              ? "border-zinc-700 focus-within:border-zinc-500"
              : "border-zinc-300 focus-within:border-zinc-500"
          }`}
        >

          <Search
            size={18}
            className={
              theme === "dark"
                ? "text-zinc-400"
                : "text-zinc-500"
            }
          />

          <input
            type="text"
            placeholder="find it here!"
            className={`w-full outline-none bg-transparent text-sm ${
              theme === "dark"
                ? "text-white placeholder-zinc-500"
                : "text-black placeholder-zinc-400"
            }`}
          />

        </div>

        {/* NOTIFICATIONS */}
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            theme === "dark"
              ? "hover:bg-zinc-800"
              : "hover:bg-zinc-100"
          }`}
        >

          <Bell size={18} />

          <span>
            Notifications
          </span>

        </button>

        {/* PROFILE */}
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            theme === "dark"
              ? "hover:bg-zinc-800"
              : "hover:bg-zinc-100"
          }`}
        >

          <User size={18} />

          <span>
            Profile
          </span>

        </button>

      </div>

    </div>

  )

}