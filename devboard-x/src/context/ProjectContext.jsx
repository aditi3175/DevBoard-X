"use client"

import { createContext, useContext, useMemo } from "react"
import { usePersistentState } from "@/utils/storage"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"

const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  // Read local tasks, resources, and activity
  const [localProjects, setLocalProjects, isLoadedLocal] = usePersistentState("devboard-projects", [])
  
  // Read Convex projects and tasks
  const convexProjects = useQuery(api.projects.getProjects)
  const convexTasks = useQuery(api.tasks.getAllTasks)
  
  const createProject = useMutation(api.projects.createProject)
  const updateProject = useMutation(api.projects.updateProject)
  const deleteProject = useMutation(api.projects.deleteProject)

  const createTask = useMutation(api.tasks.createTask)
  const updateTask = useMutation(api.tasks.updateTask)
  const deleteTask = useMutation(api.tasks.deleteTask)

  const isLoaded = isLoadedLocal && convexProjects !== undefined && convexTasks !== undefined

  // Merge Convex metadata with LocalStorage nested data
  const projects = useMemo(() => {
    if (!convexProjects || !convexTasks) return []
    return convexProjects.map((cp) => {
      // Find matching local project to attach resources, activity
      const local = localProjects.find((lp) => lp._id === cp._id) || { tasks: [], resources: [], activity: [] }
      
      const projectTasks = convexTasks.filter(t => t.projectId === cp._id)
      
      const mergedTasks = projectTasks.map(ct => {
        const localTaskWorkspace = local.tasks.find(lt => lt._id === ct._id) || {
          files: [],
          folders: [],
          editorCode: "",
          consoleOutput: [],
          previewState: null,
          terminalHistory: []
        }
        return {
          ...ct,
          ...localTaskWorkspace
        }
      })

      return {
        ...cp,
        tasks: mergedTasks,
        resources: local.resources || [],
        activity: local.activity || []
      }
    })
  }, [convexProjects, convexTasks, localProjects])

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
        deleteProject,
        createTask,
        updateTask,
        deleteTask
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  return useContext(ProjectContext)
}