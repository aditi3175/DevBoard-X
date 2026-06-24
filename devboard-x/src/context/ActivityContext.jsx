"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ActivityContext = createContext()

const MAX_ACTIVITIES = 100

export function ActivityProvider({ children }) {
  const [globalActivities, setGlobalActivities] = useState([])
  const [mounted, setMounted] = useState(false)

  // LOAD FROM LOCAL STORAGE
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("devboard-global-activity")
    if (saved) {
      setGlobalActivities(JSON.parse(saved))
    }
  }, [])

  // SAVE TO LOCAL STORAGE
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("devboard-global-activity", JSON.stringify(globalActivities))
    }
  }, [globalActivities, mounted])

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
    <ActivityContext.Provider value={{ globalActivities, logActivity }}>
      {children}
    </ActivityContext.Provider>
  )
}

export function useActivity() {
  return useContext(ActivityContext)
}
