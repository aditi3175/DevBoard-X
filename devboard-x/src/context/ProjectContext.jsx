"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react"

const ProjectContext = createContext()

export function ProjectProvider({ children }) {

  const [projects, setProjects] = useState([])

  // LOAD PROJECTS
  useEffect(() => {

    const savedProjects = localStorage.getItem(
      "devboard-projects"
    )

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }

  }, [])

  // SAVE PROJECTS
  useEffect(() => {

    localStorage.setItem(
      "devboard-projects",
      JSON.stringify(projects)
    )

  }, [projects])

  return (

    <ProjectContext.Provider
      value={{
        projects,
        setProjects
      }}
    >

      {children}

    </ProjectContext.Provider>

  )

}

export function useProjects() {
  return useContext(ProjectContext)
}