"use client"

import Terminal from "@/components/layout/Terminal"
import { useTheme } from "@/context/ThemeContext"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function TerminalPage() {

  const router = useRouter()

  const { theme } = useTheme()

  return (

    <div
      className={`min-h-screen p-6 transition ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
      }`}
    >

      <button
        onClick={() => router.push("/")}
        className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-xl transition ${
          theme === "dark"
            ? "bg-zinc-900 hover:bg-zinc-800 text-white"
            : "bg-zinc-100 hover:bg-zinc-200 text-black"
        }`}
      >

        <ArrowLeft size={18} />

        <span>
          Back
        </span>
      </button>

      <h1 className="text-4xl font-bold">
        Terminal
      </h1>

      <p
        className={`${
          theme === "dark"
            ? "text-zinc-500"
            : "text-zinc-600"
        }`}
      >
        Execute commands and monitor your system
      </p>

      <div className="mt-6 flex-1">

        <Terminal />

      </div>

    </div>

  )

}