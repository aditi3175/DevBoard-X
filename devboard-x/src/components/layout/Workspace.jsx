"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  Code2,
  FileCode,
  FileJson,
  FileText,
  Play,
  Wind
} from "lucide-react"

import NotesWidget from "@/components/widgets/NotesWidget"
import { formatProjectDate } from "@/utils/projectOverview"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

// --- PARTICLES BACKGROUND ---
const Particles = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let particles = []

    // Attempt to get CSS variable --accent (fallback to lime #c8f135)
    let accent = "#c8f135"
    if (typeof window !== "undefined") {
      const style = getComputedStyle(document.documentElement)
      const val = style.getPropertyValue("--accent").trim()
      if (val) accent = val
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", resize)
    resize()

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() * 0.3) - 0.15
        this.speedY = (Math.random() * 0.3) - 0.15
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > canvas.width) this.x = 0
        else if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0) this.y = canvas.height
      }
      draw() {
        ctx.globalAlpha = 0.2
        ctx.fillStyle = accent
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    for (let i = 0; i < 40; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />
}

// --- TERMINAL WINDOW WRAPPER ---
const TerminalWindow = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-page border border-border rounded-[8px] overflow-hidden z-10 flex flex-col ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-page-raised shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-danger" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning" />
        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
        <span className="ml-4 text-xs text-text-muted font-mono">{title}</span>
      </div>
      <div className="p-5 font-mono flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}

const getFileIconColor = (filename) => {
  const ext = filename.split(".").pop().toLowerCase()
  switch (ext) {
    case "js": case "jsx": case "ts": case "tsx": return "text-warning"
    case "css": return "text-info"
    case "json": return "text-danger"
    case "md": return "text-accent"
    default: return "text-text-muted"
  }
}

export default function Workspace() {
  const router = useRouter()

  const dashboardData = useQuery(api.dashboard.getDashboardMetrics)
  const analyticsData = useQuery(api.analytics.getWorkspaceMetrics)
  const globalSnippets = useQuery(api.snippets.getSnippets) || []

  const globalActivities = dashboardData?.recentActivity || []
  const upcomingTasks = dashboardData?.upcomingTasks || []
  const recentFiles = dashboardData?.recentFiles || []
  const recentProjects = dashboardData?.recentProjects || []

  const metrics = analyticsData?.workspace || {
    activeTasks: 0,
    activeFiles: 0,
    totalSnippets: 0,
    totalExecutions: 0
  }

  return (
    <div className="relative flex h-screen flex-1 flex-col overflow-y-auto bg-page text-text-sub font-mono selection:bg-accent selection:text-text-on-lime">
      <Particles />

      <div className="relative z-10 flex-1 p-6 md:p-8 xl:p-12 max-w-[1600px] mx-auto w-full">
        
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex gap-2 text-sm">
            <span className="text-accent">~</span>
            <span className="text-text-main">$</span>
            <span className="text-text-sub">devboard status --overview</span>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border-l-2 border-border pl-4">
              <div className="text-xs text-text-muted mb-1">active_tasks</div>
              <div className="text-2xl text-text-main font-bold">{metrics.activeTasks}</div>
            </div>
            <div className="border-l-2 border-border pl-4">
              <div className="text-xs text-text-muted mb-1">tracked_files</div>
              <div className="text-2xl text-text-main font-bold">{metrics.activeFiles}</div>
            </div>
            <div className="border-l-2 border-border pl-4">
              <div className="text-xs text-text-muted mb-1">snippets</div>
              <div className="text-2xl text-text-main font-bold">{metrics.totalSnippets}</div>
            </div>
            <div className="border-l-2 border-border pl-4">
              <div className="text-xs text-text-muted mb-1">executions</div>
              <div className="text-2xl text-text-main font-bold">{metrics.totalExecutions}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(350px,0.8fr)] gap-8">
          
          <div className="flex flex-col gap-8">
            {/* ACTIVE PROJECTS */}
            <TerminalWindow title="~/workspace/active-projects.sh">
              <div className="flex gap-2 mb-6 text-sm">
                <span className="text-accent">{">"}</span>
                <span className="text-text-muted">Loading project health streams...</span>
              </div>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.slice(0, 4).map((project, i) => {
                    const total = project.taskStats?.total || 0
                    const completed = project.taskStats?.completed || 0
                    const overdue = project.taskStats?.overdue || 0
                    const rate = total === 0 ? 0 : Math.round((completed / total) * 100)

                    return (
                      <Link key={project._id || i} href={`/projects/${project._id}`} className="block group">
                        <div className="flex flex-col md:flex-row md:items-end justify-between border border-transparent group-hover:border-border p-3 -mx-3 transition-colors">
                          <div>
                            <div className="text-text-main font-bold mb-1 flex items-center gap-2">
                              {project.title}
                              {overdue > 0 && <span className="text-danger text-xs">[ERR: {overdue} OVERDUE]</span>}
                            </div>
                            <div className="text-xs text-text-muted">
                              Tasks: {completed}/{total} | Updated: {formatProjectDate(project.updatedAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 md:mt-0">
                            <div className="text-accent text-xs">[{rate}%]</div>
                            <div className="w-32 h-1 bg-surface">
                              <div className="h-full bg-accent" style={{ width: `${rate}%` }} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="text-text-muted">No active projects found. Initialize with `devboard init`</div>
                )}
              </div>
            </TerminalWindow>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* RECENT FILES */}
              <TerminalWindow title="~/workspace/tracked-files.json">
                <div className="text-accent mb-4">{"{"}</div>
                <div className="pl-4 space-y-2 text-sm">
                  {recentFiles.length > 0 ? (
                    recentFiles.slice(0, 5).map((file, i) => (
                      <Link key={file._id || i} href={`/projects/${file.projectId}/tasks/${file.taskId}`} className="flex gap-3 hover:bg-surface -mx-2 px-2 py-1">
                        <span className="text-text-muted">"{file.name}":</span>
                        <span className={getFileIconColor(file.name)}>"{file.taskTitle}"</span>
                        {i < 4 && <span className="text-text-muted">,</span>}
                      </Link>
                    ))
                  ) : (
                    <div className="text-text-muted">"status": "empty"</div>
                  )}
                </div>
                <div className="text-accent mt-4">{"}"}</div>
              </TerminalWindow>

              {/* SNIPPETS */}
              <TerminalWindow title="~/workspace/snippets.yaml">
                <div className="space-y-4 text-sm">
                  {globalSnippets.length > 0 ? (
                    globalSnippets.slice(0, 5).map((snippet, i) => (
                      <div key={snippet._id || i} className="hover:bg-surface -mx-2 px-2 py-1 cursor-pointer">
                        <div className="text-text-main">- name: <span className="text-info">{snippet.title}</span></div>
                        <div className="text-text-muted pl-4">lang: <span className="text-warning">{snippet.language}</span></div>
                      </div>
                    ))
                  ) : (
                    <div className="text-text-muted">items: []</div>
                  )}
                </div>
              </TerminalWindow>
            </div>
            
            <NotesWidget />
          </div>

          <div className="flex flex-col h-full">
            {/* LIVE LOG STREAM */}
            <TerminalWindow title="~/system/live-log-stream" className="h-full">
              <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-text-muted">Tail output /var/log/workspace</span>
              </div>
              
              <div className="flex-1 flex flex-col gap-3 text-sm overflow-hidden">
                <div className="space-y-3">
                {globalActivities && globalActivities.length > 0 ? (
                  globalActivities.slice(0, 30).map((log, i) => {
                    const isClickable = log.projectId !== null && log.projectId !== undefined
                    const LogElement = isClickable ? "button" : "div"
                    
                    // Determine log type styling
                    let tag = "inf"
                    let color = "text-info"
                    
                    if (log.type.includes("CREATED") || log.type.includes("COMPLETED")) { tag = "ok"; color = "text-success" }
                    if (log.type.includes("DELETED") || log.type.includes("ERROR")) { tag = "err"; color = "text-danger" }
                    if (log.type.includes("UPDATED")) { tag = "upd"; color = "text-warning" }
                    
                    return (
                      <LogElement
                        key={log._id || log.id || i}
                        onClick={() => {
                          if (!isClickable) return
                          if (log.taskId !== null && log.taskId !== undefined) {
                            router.push(`/projects/${log.projectId}/tasks/${log.taskId}`)
                          } else {
                            router.push(`/projects/${log.projectId}`)
                          }
                        }}
                        className={`flex items-start gap-3 w-full text-left outline-none ${isClickable ? "hover:bg-surface -mx-2 px-2 py-1" : ""}`}
                      >
                        <span className="text-text-muted shrink-0 text-xs mt-0.5">
                          {new Date(log._creationTime || log.timestamp || log.createdAt || Date.now()).toLocaleTimeString([], { hour12: false })}
                        </span>
                        <span className={`shrink-0 ${color}`}>[ {tag} ]</span>
                        <span className="text-text-sub truncate">{log.message}</span>
                      </LogElement>
                    )
                  })
                ) : (
                  <div className="text-text-muted flex gap-2"><span className="text-accent">~</span> <span className="text-text-main">$</span> waiting for logs...</div>
                )}
                </div>
                <div className="flex-1"></div>
                <div className="text-text-main animate-pulse pt-2 shrink-0">_</div>
              </div>
            </TerminalWindow>
          </div>
        </div>
      </div>
    </div>
  )
}
