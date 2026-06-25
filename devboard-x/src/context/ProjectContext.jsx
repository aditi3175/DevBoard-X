"use client"

import { createContext, useContext, useMemo } from "react"
import { usePersistentState } from "@/utils/storage"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"

const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  // Read local tasks, resources, and activity
  const [localProjects, setLocalProjects, isLoadedLocal] = usePersistentState("devboard-projects", [])
  
  // Read Convex projects
  const convexProjects = useQuery(api.projects.getProjects)
  
  const createProject = useMutation(api.projects.createProject)
  const updateProject = useMutation(api.projects.updateProject)
  const deleteProject = useMutation(api.projects.deleteProject)

  const isLoaded = isLoadedLocal && convexProjects !== undefined

  // Merge Convex metadata with LocalStorage nested data
  const projects = useMemo(() => {
    if (!convexProjects) return []
    return convexProjects.map((cp) => {
      // Find matching local project to attach tasks, resources, activity
      const local = localProjects.find((lp) => lp._id === cp._id) || { tasks: [], resources: [], activity: [] }
      return {
        ...cp,
        tasks: local.tasks || [],
        resources: local.resources || [],
        activity: local.activity || []
      }
    })
  }, [convexProjects, localProjects])

  // Shim `setProjects` to intercept legacy writes (e.g., adding a task)
  // and persist only the local storage part, so analytics and tasks don't break.
  const setProjects = (newProjectsOrUpdater) => {
    setLocalProjects((prevLocalProjects) => {
      // Resolve the new projects array
      const newProjects = typeof newProjectsOrUpdater === 'function' 
        ? newProjectsOrUpdater(projects) 
        : newProjectsOrUpdater;

      // We only store exactly what was passed. If the UI passes the full array 
      // containing Convex metadata + modified tasks, we save it directly to 
      // preserve backward compatibility for Analytics.
      return newProjects;
    });
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        setProjects,
        isLoaded,
        createProject,
        updateProject,
        deleteProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  return useContext(ProjectContext)
}