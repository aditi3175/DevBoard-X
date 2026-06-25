"use client"

import { createContext, useContext, useEffect } from "react"
import { usePersistentState } from "@/utils/storage"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme, isLoaded] = usePersistentState("devboard-theme", "dark")

  // Ensure valid theme
  useEffect(() => {
    if (isLoaded && theme !== "dark" && theme !== "light") {
      setTheme("dark")
    }
  }, [theme, isLoaded, setTheme])

  // APPLY THEME
  useEffect(() => {
    if (!isLoaded) return
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme, isLoaded])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isLoaded
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}