"use client"

import { useSyncExternalStore, useEffect } from "react"

const stores = {}

function createStore(key, initialValue) {
  let value = initialValue
  let loaded = false
  let snapshot = [value, loaded]
  const serverSnapshot = [initialValue, false]
  
  const listeners = new Set()

  function getSnapshot() {
    return snapshot
  }

  function getServerSnapshot() {
    return serverSnapshot
  }

  function updateSnapshot(newValue, newLoaded) {
    if (value !== newValue || loaded !== newLoaded) {
      value = newValue
      loaded = newLoaded
      snapshot = [value, loaded]
      return true
    }
    return false
  }

  function subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function setValue(updater) {
    const nextValue = typeof updater === "function" ? updater(value) : updater
    
    if (updateSnapshot(nextValue, loaded)) {
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue))
        } catch (e) {
          console.error(`Storage write error for key ${key}`, e)
        }
      }
      listeners.forEach((l) => l())
    }
  }

  function init() {
    if (loaded) return
    if (typeof window === "undefined") return

    let parsedValue = initialValue
    let requiresMigration = false

    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        try {
          const parsed = JSON.parse(item)
          if (Array.isArray(initialValue)) {
            if (!Array.isArray(parsed)) {
              console.warn(`Storage type mismatch for ${key}. Expected Array. Falling back to default.`)
            } else {
              parsedValue = parsed
            }
          } else if (initialValue !== null && typeof initialValue === "object") {
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
              console.warn(`Storage type mismatch for ${key}. Expected Object. Falling back to default.`)
            } else {
              parsedValue = parsed
            }
          } else {
            parsedValue = parsed
          }
        } catch (e) {
          if (typeof initialValue === "string") {
            parsedValue = item
            requiresMigration = true
          } else {
            console.warn(`Storage read error for key ${key} (malformed JSON)`, e)
          }
        }
      }
    } catch (e) {
      console.error(`Storage access error for key ${key}`, e)
    }

    if (key === "devboard-theme") {
      if (parsedValue !== "dark" && parsedValue !== "light") {
        parsedValue = "light"
        requiresMigration = true
      }
    }

    if (updateSnapshot(parsedValue, true)) {
      if (requiresMigration && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(key, JSON.stringify(parsedValue))
        } catch (e) {
          // ignore migration write errors
        }
      }
      listeners.forEach((l) => l())
    }
  }

  return {
    subscribe,
    getSnapshot,
    getServerSnapshot,
    setValue,
    init
  }
}

function getStore(key, initialValue) {
  if (!stores[key]) {
    stores[key] = createStore(key, initialValue)
  }
  return stores[key]
}

export function usePersistentState(key, initialValue) {
  const store = getStore(key, initialValue)
  
  useEffect(() => {
    store.init()
  }, [store])

  const [value, loaded] = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  )

  return [value, store.setValue, loaded]
}
