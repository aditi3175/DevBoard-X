"use client"

import { createContext, useContext } from "react"
import { usePersistentState } from "@/utils/storage"

const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [projects, setProjects, isLoaded] = usePersistentState("devboard-projects", [])

  return (
    <ProjectContext.Provider
      value={{
        projects,
        setProjects,
        isLoaded
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  return useContext(ProjectContext)
}