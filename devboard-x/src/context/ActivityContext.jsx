"use client"

import { createContext, useContext } from "react"
import { usePersistentState } from "@/utils/storage"

const ActivityContext = createContext()

const MAX_ACTIVITIES = 100

export function ActivityProvider({ children }) {
  const [globalActivities, setGlobalActivities, isLoaded] = usePersistentState("devboard-global-activity", [])

  // LOG ACTIVITY FUNCTION
  const logActivity = ({ type, message, projectId = null, projectTitle = null, taskId = null, metadata = {} }) => {
    const newActivity = {
      id: crypto.randomUUID(),
      type,
      message,
      projectId,
      projectTitle,
      taskId,
      metadata,
      timestamp: new Date().toISOString()
    }
    
    setGlobalActivities(prev => {
      const updated = [newActivity, ...prev]
      return updated.slice(0, MAX_ACTIVITIES)
    })
  }

  return (
    <ActivityContext.Provider value={{ globalActivities, logActivity, isLoaded }}>
      {children}
    </ActivityContext.Provider>
  )
}

export function useActivity() {
  return useContext(ActivityContext)
}
