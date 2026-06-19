"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {

  const [theme, setTheme] = useState("dark")

  // LOAD THEME
  useEffect(() => {

    const savedTheme = localStorage.getItem("devboard-theme")

    if (savedTheme) {
      setTheme(savedTheme)
    }

  }, [])

  // APPLY THEME
  useEffect(() => {

    localStorage.setItem("devboard-theme", theme)

    if (theme === "dark") {

      document.documentElement.classList.add("dark")

    }

    else {

      document.documentElement.classList.remove("dark")

    }

  }, [theme])

  return (

    <ThemeContext.Provider
      value={{
        theme,
        setTheme
      }}
    >

      {children}

    </ThemeContext.Provider>

  )

}

export function useTheme() {
  return useContext(ThemeContext)
}