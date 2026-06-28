"use client"

import { createContext, useContext, useMemo } from "react"
import { usePersistentState } from "@/utils/storage"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"

const ProjectContext = createContext()

const findLocalCode = (nodes, id) => {
  if (!nodes) return null;
  for (const n of nodes) {
    if (n._id === id) return n;
    if (n.children) {
      const found = findLocalCode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function ProjectProvider({ children }) {
  // Read local tasks, resources, and activity
  const [localProjects, setLocalProjects, isLoadedLocal] = usePersistentState("devboard-projects", [])
  
  // Read Convex projects, tasks, and files
  const convexProjects = useQuery(api.projects.getProjects)
  const convexTasks = useQuery(api.tasks.getAllTasks)
  const convexFiles = useQuery(api.files.getAllFiles)
  
  const createProject = useMutation(api.projects.createProject)
  const updateProject = useMutation(api.projects.updateProject)
  const deleteProject = useMutation(api.projects.deleteProject)

  const createTask = useMutation(api.tasks.createTask)
  const updateTask = useMutation(api.tasks.updateTask)
  const deleteTask = useMutation(api.tasks.deleteTask)

  const isLoaded = isLoadedLocal && convexProjects !== undefined && convexTasks !== undefined && convexFiles !== undefined

  // Merge Convex metadata with LocalStorage nested data
  const projects = useMemo(() => {
    if (!convexProjects || !convexTasks || !convexFiles) return []
    return convexProjects.map((cp) => {
      // Find matching local project to attach resources, activity
      const local = localProjects.find((lp) => lp._id === cp._id) || { tasks: [], resources: [], activity: [] }
      
      const projectTasks = convexTasks.filter(t => t.projectId === cp._id)
      
      const mergedTasks = projectTasks.map(ct => {
        const localTaskWorkspace = local.tasks.find(lt => lt._id === ct._id) || {
          files: [],
          editorCode: "",
          consoleOutput: [],
          previewState: null,
          terminalHistory: []
        }

        // Build file tree for this task
        const taskFiles = convexFiles.filter(f => f.taskId === ct._id)
        const fileMap = {}
        const rootFiles = []

        // Pass 1: Initialize nodes and populate local code
        taskFiles.forEach(cf => {
          const localNode = findLocalCode(localTaskWorkspace.files, cf._id) || {}
          fileMap[cf._id] = {
            _id: cf._id,
            name: cf.name,
            isFolder: cf.type === "folder",
            output: localNode.output || "",
            children: cf.type === "folder" ? [] : undefined
          }
        })

        // Pass 2: Build tree structure
        taskFiles.forEach(cf => {
          const node = fileMap[cf._id]
          if (cf.parentId) {
            if (fileMap[cf.parentId]) {
              fileMap[cf.parentId].children.push(node)
            }
          } else {
            rootFiles.push(node)
          }
        })

        // Pass 3: Sort children recursively (folders first, then alphabetically)
        const sortNodes = (nodes) => {
          nodes.sort((a, b) => {
            if (a.isFolder === b.isFolder) {
              return a.name.localeCompare(b.name)
            }
            return a.isFolder ? -1 : 1
          })
          nodes.forEach(n => {
            if (n.isFolder && n.children) sortNodes(n.children)
          })
        }
        sortNodes(rootFiles)

        return {
          ...ct,
          ...localTaskWorkspace,
          files: rootFiles
        }
      })

      return {
        ...cp,
        tasks: mergedTasks,
        activity: local.activity || []
      }
    })
  }, [convexProjects, convexTasks, convexFiles, localProjects])

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

  const createFile = useMutation(api.files.createFile)
  const createFolder = useMutation(api.files.createFolder)
  const renameFile = useMutation(api.files.renameFile)
  const deleteFile = useMutation(api.files.deleteFile)
  const moveFile = useMutation(api.files.moveFile)

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
        deleteTask,
        createFile,
        createFolder,
        renameFile,
        deleteFile,
        moveFile
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  return useContext(ProjectContext)
}