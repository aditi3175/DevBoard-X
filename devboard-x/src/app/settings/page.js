"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()

  // SETTINGS STATE
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [animations, setAnimations] = useState(true)

  // MOUNTED STATE
  const [mounted, setMounted] = useState(false)

  // FIX HYDRATION
  useEffect(() => {
    setMounted(true)
  }, [])

  // LOAD SETTINGS
  useEffect(() => {

    const savedSettings = localStorage.getItem("devboard-settings")

    if (savedSettings) {

      const parsedSettings = JSON.parse(savedSettings)

      setUsername(parsedSettings.username || "")
      setEmail(parsedSettings.email || "")
      setTheme(parsedSettings.theme || "dark")
      setNotifications(parsedSettings.notifications)
      setAnimations(parsedSettings.animations)

    }

  }, [])

  // SAVE SETTINGS
  const handleSaveSettings = () => {

    const settingsData = {
      username,
      email,
      theme,
      notifications,
      animations
    }

    localStorage.setItem(
      "devboard-settings",
      JSON.stringify(settingsData)
    )

    alert("Settings saved successfully!")

  }

  if (!mounted) return null

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

      {/* PAGE HEADER */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Settings
        </h1>

        <p
          className={`mt-2 ${
            theme === "dark"
              ? "text-zinc-500"
              : "text-zinc-600"
          }`}
        >
          Manage your dashboard preferences.
        </p>

      </div>

      {/* SETTINGS CONTAINER */}
      <div className="space-y-6 max-w-3xl">

        {/* PROFILE SECTION */}
        <div
          className={`border rounded-2xl p-6 ${
            theme === "dark"
              ? "bg-zinc-900 border-zinc-800"
              : "bg-zinc-100 border-zinc-300"
          }`}
        >

          <h2 className="text-2xl font-semibold mb-5">
            Profile Settings
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 outline-none border ${
                theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                  : "bg-white border-zinc-300 text-black placeholder-zinc-400"
              }`}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl px-4 py-3 outline-none border ${
                theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                  : "bg-white border-zinc-300 text-black placeholder-zinc-400"
              }`}
            />

          </div>

        </div>

        {/* THEME SECTION */}
        <div
          className={`border rounded-2xl p-6 ${
            theme === "dark"
              ? "bg-zinc-900 border-zinc-800"
              : "bg-zinc-100 border-zinc-300"
          }`}
        >

          <h2 className="text-2xl font-semibold mb-5">
            Appearance
          </h2>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 outline-none border ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white"
                : "bg-white border-zinc-300 text-black"
            }`}
          >

            <option value="dark">Dark</option>
            <option value="light">Light</option>

          </select>

        </div>

        {/* PREFERENCES */}
        <div
          className={`border rounded-2xl p-6 ${
            theme === "dark"
              ? "bg-zinc-900 border-zinc-800"
              : "bg-zinc-100 border-zinc-300"
          }`}
        >

          <h2 className="text-2xl font-semibold mb-5">
            Preferences
          </h2>

          <div className="space-y-5">

            {/* NOTIFICATIONS */}
            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-medium">
                  Notifications
                </h3>

                <p
                  className={`text-sm ${
                    theme === "dark"
                      ? "text-zinc-500"
                      : "text-zinc-600"
                  }`}
                >
                  Receive dashboard notifications.
                </p>

              </div>

              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full transition flex items-center px-1 ${
                  notifications
                    ? "bg-green-500 justify-end"
                    : "bg-zinc-700 justify-start"
                }`}
              >

                <div className="w-6 h-6 bg-white rounded-full"></div>

              </button>

            </div>

            {/* ANIMATIONS */}
            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-medium">
                  Animations
                </h3>

                <p
                  className={`text-sm ${
                    theme === "dark"
                      ? "text-zinc-500"
                      : "text-zinc-600"
                  }`}
                >
                  Enable UI animations.
                </p>

              </div>

              <button
                onClick={() => setAnimations(!animations)}
                className={`w-14 h-8 rounded-full transition flex items-center px-1 ${
                  animations
                    ? "bg-green-500 justify-end"
                    : "bg-zinc-700 justify-start"
                }`}
              >

                <div className="w-6 h-6 bg-white rounded-full"></div>

              </button>

            </div>

          </div>

        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSaveSettings}
          className={`px-6 py-3 rounded-xl font-medium transition ${
            theme === "dark"
              ? "bg-white text-black"
              : "bg-black text-white"
          }`}
        >
          Save Settings
        </button>

      </div>

    </div>

  )

}