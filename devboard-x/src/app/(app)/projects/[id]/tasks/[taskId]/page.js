"use client"

import Editor from "@monaco-editor/react"
import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useConvex } from "convex/react"
import { api } from "../../../../../../../convex/_generated/api"
import {
  FileCode,
  Plus,
  Trash2,
  Edit,
  Atom,
  Wind,
  Braces,
  FileText,
  File,
  Folder,
  FolderOpen,
  FolderPlus,
  Maximize2,
  Minimize2,
  ExternalLink,
  AlertTriangle,
  BarChart2,
  Code2
} from "lucide-react"

import Card from "@/components/ui/Card"
import SnippetPickerModal from "@/components/snippets/SnippetPickerModal"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"

import { useProjects } from "@/context/ProjectContext"
import ProjectSubNav from "@/components/project/ProjectSubNav"


// File type and icon mapping
const getFileIcon = (filename, isSelected) => {
  const name = filename.toLowerCase()

  // Tailwind config check first
  if (name === "tailwind.config.js" || name === "tailwind.config.ts") {
    return <Wind size={16} className={isSelected ? "text-cyan-100" : "text-cyan-400"} />
  }

  const ext = name.split(".").pop()

  switch (ext) {
    case "html":
      return (
        <span className={`w-4.5 h-4.5 rounded flex items-center justify-center text-xs font-black shrink-0 ${isSelected
          ? "bg-white text-orange-600"
          : "bg-orange-600 text-white"
          }`}>
          &lt;/&gt;
        </span>
      )
    case "js":
    case "mjs":
      return (
        <span className={`w-4.5 h-4.5 rounded flex items-center justify-center text-xs font-black shrink-0 ${isSelected
          ? "bg-white text-primary"
          : "bg-warning text-white"
          }`}>
          JS
        </span>
      )
    case "jsx":
    case "tsx":
      return <Atom size={16} className={isSelected ? "text-cyan-100" : "text-cyan-400"} />
    case "css":
      return (
        <span className={`w-4.5 h-4.5 rounded flex items-center justify-center text-xs font-black shrink-0 ${isSelected
          ? "bg-white text-primary"
          : "bg-accent text-accent-fg"
          }`}>
          CSS
        </span>
      )
    case "json":
      return <Braces size={16} className={isSelected ? "text-orange-200" : "text-orange-400"} />
    case "md":
      return <FileText size={16} className={isSelected ? "text-primary-hover" : "text-primary"} />
    default:
      return <File size={16} className={isSelected ? "text-white" : "text-zinc-400"} />
  }
}

// Tree utility helper functions
const findFileByPath = (nodes, pathStr) => {
  if (!nodes || !pathStr) return null
  const parts = pathStr.split("/").filter(Boolean)
  let currentNodes = nodes
  let foundNode = null

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const node = currentNodes.find(n => n.name === part)
    if (!node) return null

    if (i === parts.length - 1) {
      foundNode = node
    } else if (node.isFolder) {
      currentNodes = node.children || []
    } else {
      return null
    }
  }
  return foundNode
}

const updateFileInTree = (nodes, pathStr, updates) => {
  if (!nodes) return []
  const parts = pathStr.split("/").filter(Boolean)

  const recurse = (currentNodes, depth) => {
    return currentNodes.map(node => {
      if (node.name === parts[depth]) {
        if (depth === parts.length - 1) {
          return { ...node, ...updates }
        } else if (node.isFolder) {
          return {
            ...node,
            children: recurse(node.children || [], depth + 1)
          }
        }
      }
      return node
    })
  }

  return recurse(nodes, 0)
}

const addNodeToTree = (nodes, parentPathStr, newNode) => {
  if (!nodes) return [newNode]
  if (!parentPathStr || parentPathStr === "/") {
    return [...nodes, newNode]
  }
  const parts = parentPathStr.split("/").filter(Boolean)

  const recurse = (currentNodes, depth) => {
    return currentNodes.map(node => {
      if (node.name === parts[depth]) {
        if (depth === parts.length - 1 && node.isFolder) {
          return {
            ...node,
            children: [...(node.children || []), newNode]
          }
        } else if (node.isFolder) {
          return {
            ...node,
            children: recurse(node.children || [], depth + 1)
          }
        }
      }
      return node
    })
  }

  return recurse(nodes, 0)
}

const deleteNodeFromTree = (nodes, pathStr) => {
  if (!nodes) return []
  const parts = pathStr.split("/").filter(Boolean)

  const recurse = (currentNodes, depth) => {
    if (depth === parts.length - 1) {
      return currentNodes.filter(node => node.name !== parts[depth])
    }
    return currentNodes.map(node => {
      if (node.name === parts[depth] && node.isFolder) {
        return {
          ...node,
          children: recurse(node.children || [], depth + 1)
        }
      }
      return node
    })
  }

  return recurse(nodes, 0)
}

const renameNodeInTree = (nodes, pathStr, newName) => {
  if (!nodes) return []
  const parts = pathStr.split("/").filter(Boolean)

  const recurse = (currentNodes, depth) => {
    return currentNodes.map(node => {
      if (node.name === parts[depth]) {
        if (depth === parts.length - 1) {
          return { ...node, name: newName }
        } else if (node.isFolder) {
          return {
            ...node,
            children: recurse(node.children || [], depth + 1)
          }
        }
      }
      return node
    })
  }

  return recurse(nodes, 0)
}

const getFirstFile = (nodes, parentPath = "") => {
  if (!nodes || nodes.length === 0) return null
  for (const node of nodes) {
    const currentPath = `${parentPath}/${node.name}`
    if (!node.isFolder) {
      return currentPath
    }
    if (node.isFolder && node.children) {
      const childFile = getFirstFile(node.children, currentPath)
      if (childFile) return childFile
    }
  }
  return null
}

const getFilePaths = (nodes, parentPath = "") => {
  if (!nodes) return []
  let paths = []
  nodes.forEach(node => {
    const currentPath = `${parentPath}/${node.name}`
    if (!node.isFolder) {
      paths.push(currentPath)
    } else if (node.children) {
      paths = [...paths, ...getFilePaths(node.children, currentPath)]
    }
  })
  return paths
}

const findFileByFilename = (nodes, filename) => {
  if (!nodes) return null
  for (const node of nodes) {
    if (!node.isFolder && node.name === filename) {
      return node
    }
    if (node.isFolder && node.children) {
      const found = findFileByFilename(node.children, filename)
      if (found) return found
    }
  }
  return null
}

const detectLanguageFromFilename = (filename) => {
  if (!filename) return "javascript"
  const name = filename.toLowerCase()
  const ext = name.split(".").pop()
  switch (ext) {
    case "html":
      return "html"
    case "css":
      return "css"
    case "js":
    case "mjs":
      return "javascript"
    case "jsx":
      return "javascript"
    case "tsx":
    case "ts":
      return "typescript"
    case "json":
      return "json"
    case "md":
      return "markdown"
    default:
      return "javascript"
  }
}

const detectTaskTemplate = (task) => {
  if (!task) return "HTML"
  if (task.template) {
    if (task.template === "Next.js") return "Next.js"
    if (task.template === "Node.js") return "Node.js"
    return task.template
  }
  const paths = getFilePaths(task.files || [])
  const hasIndexHtml = paths.some(p => p.toLowerCase().endsWith("index.html"))
  const hasAppJsx = paths.some(p => p.toLowerCase().endsWith("app.jsx") || p.toLowerCase().endsWith("main.jsx"))
  const hasNextConfig = paths.some(p => p.toLowerCase().endsWith("next.config.js") || p.toLowerCase().includes("/app/layout.js"))
  const hasServerJs = paths.some(p => p.toLowerCase().endsWith("server.js"))
  const hasIndexJs = paths.some(p => p.toLowerCase().endsWith("index.js"))

  if (hasIndexHtml) return "HTML"
  if (hasAppJsx) return "React"
  if (hasNextConfig) return "Next.js"
  if (hasServerJs) return "Express"
  if (hasIndexJs) return "Node.js"
  return "HTML"
}

const combineHtmlCssJs = (html, css, js) => {
  let combined = html
  
  const consoleOverrideScript = `
    <script>
      (function() {
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = function(...args) {
          originalLog.apply(console, args);
          window.parent.postMessage({ 
            type: 'html-console-log', 
            text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') 
          }, '*');
        };
        
        console.error = function(...args) {
          originalError.apply(console, args);
          window.parent.postMessage({ 
            type: 'html-console-error', 
            text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') 
          }, '*');
        };
        
        window.addEventListener('error', function(e) {
          window.parent.postMessage({ 
            type: 'html-console-error', 
            text: e.message 
          }, '*');
        });
      })();
    </script>
  `

  const styleTag = `<style>${css}</style>`
  if (combined.includes("</head>")) {
    combined = combined.replace("</head>", styleTag + "</head>")
  } else {
    combined = styleTag + combined
  }
  
  const scriptTag = consoleOverrideScript + `<script>
try {
${js}
} catch(err) {
  console.error(err.message);
}
</script>`

  if (combined.includes("</body>")) {
    combined = combined.replace("</body>", scriptTag + "</body>")
  } else {
    combined = combined + scriptTag
  }
  
  return combined
}

function ReactMockupPreview({ task }) {
  const [clickCount, setClickCount] = useState(0)

  // Extract content from App.jsx
  const appJsxNode = findFileByPath(task?.files, "/src/App.jsx") || findFileByFilename(task?.files, "App.jsx")
  const appCode = useQuery(api.files.getFileContent, appJsxNode ? { id: appJsxNode._id } : "skip") || ""

  const getCleanMatch = (regex, defaultVal) => {
    const match = appCode.match(regex)
    return match ? match[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : defaultVal
  }
  const reactTitle = getCleanMatch(/<h1[^>]*>(.*?)<\/h1>/, "Hello, React!")
  const reactSubtitle = getCleanMatch(/<p[^>]*>(.*?)<\/p>/, "Welcome to your React starter project.")

  return (
    <div className="bg-white text-zinc-800 rounded-xl overflow-hidden shadow-md font-sans text-sm flex flex-col h-[280px]">
      {/* Browser Bar */}
      <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex items-center justify-between text-xs text-zinc-400 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-success inline-block"></span>
        </div>
        <div className="bg-white px-3 py-1 rounded border border-zinc-200/80 w-64 text-center text-xs font-mono truncate">
          http://localhost:5173/
        </div>
        <span className="text-xs bg-info-bg text-info-text px-1.5 py-0.5 rounded font-bold">Vite + React</span>
      </div>

      {/* Simulator Content */}
      <div className="p-5 flex-1 overflow-y-auto flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-info flex items-center gap-2">
            <Atom size={16} className="animate-spin text-info" aria-hidden="true" />
            {reactTitle}
          </h1>
          <p className="text-xs text-zinc-400 mt-2">
            {reactSubtitle}
          </p>
        </div>

        <div className="p-3 border border-zinc-100 bg-zinc-50 rounded-lg flex items-center justify-between mt-3">
          <div>
            <h4 className="font-bold text-xs text-zinc-700">Interactive Clicker Widget</h4>
            <p className="text-xs text-zinc-400">Verifying live React state bindings</p>
          </div>
          <button 
            onClick={() => setClickCount(c => c + 1)}
            className="px-3 py-1.5 bg-info hover:brightness-110 text-white rounded text-xs font-bold shadow-sm transition"
          >
            Clicks: {clickCount}
          </button>
        </div>

        <div className="text-xs text-zinc-400 border-t border-zinc-100 pt-2.5 mt-2 flex justify-between select-none">
          <span>HMR: Active</span>
          <span>DevBoard X React Simulator</span>
        </div>
      </div>
    </div>
  )
}

export default function TaskWorkspacePage() {

  const router = useRouter()
  const params = useParams()


  const { projects, setProjects, isLoaded, updateTask, createFile, createFolder, renameFile, deleteFile } = useProjects()

  const urlTaskId = params.taskId === "undefined" ? null : params.taskId
  const projectId = params.id === "undefined" ? null : params.id
  
  const fetchedTask = useQuery(api.tasks.getTask, urlTaskId ? { id: urlTaskId } : "skip")
  const fetchedFiles = useQuery(api.files.getFileTree, urlTaskId ? { taskId: urlTaskId } : "skip")
  const task = useMemo(() => fetchedTask ? { ...fetchedTask, files: fetchedFiles || [] } : null, [fetchedTask, fetchedFiles])
  
  const isOldProject = !isNaN(Number(projectId))
  const projectIndex = isOldProject ? Number(projectId) : projects.findIndex(p => p._id === projectId)
  const project = projects[projectIndex]

  const [selectedFilePath, setSelectedFilePath] = useState("")
  const [expandedDirs, setExpandedDirs] = useState({ "/src": true, "/app": true })
  const [editorRef, setEditorRef] = useState(null)
  const [terminalTab, setTerminalTab] = useState("console")
  const [htmlSrcDoc, setHtmlSrcDoc] = useState("")
  const [previewFullscreen, setPreviewFullscreen] = useState(false)
  const [saveState, setSaveState] = useState("saved") // "saved", "saving", "error", "unsaved"
  const [isSnippetPickerOpen, setIsSnippetPickerOpen] = useState(false)

  const updateFileContent = useMutation(api.files.updateFileContent)
  const runTaskMutation = useMutation(api.execution.runTask)
  const appendConsoleOutput = useMutation(api.execution.appendConsoleOutput)
  const clearExecutionHistory = useMutation(api.execution.clearExecutionHistory)
  
  const executionLogs = useQuery(api.execution.getExecutionHistory, task?._id ? { taskId: task._id } : "skip")
  const commandHistory = useQuery(api.execution.getCommandHistory, task?._id ? { taskId: task._id } : "skip")
  
  const fetchedSnippets = useQuery(api.snippets.getSnippets)
  const globalSnippets = useMemo(() => fetchedSnippets || [], [fetchedSnippets])
  const createSnippet = useMutation(api.snippets.createSnippet)
  const updateSnippet = useMutation(api.snippets.updateSnippet)
  const deleteSnippet = useMutation(api.snippets.deleteSnippet)
  const toggleFavorite = useMutation(api.snippets.toggleFavorite)
  const incrementUsage = useMutation(api.snippets.incrementUsage)

  const convex = useConvex()
  const autosaveTimerRef = useRef(null)
  const loadedFileIdRef = useRef(null)

  const handleAutoSave = async (fileId, codeToSave) => {
    setSaveState("saving")
    try {
      await updateFileContent({ id: fileId, code: codeToSave })
      setSaveState("saved")
    } catch (err) {
      console.error("Autosave failed", err)
      setSaveState("error")
      
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = setTimeout(() => {
        handleAutoSave(fileId, codeToSave)
      }, 3000)
    }
  }


  const getActiveFileOrSnippet = () => {
    if (selectedFilePath && selectedFilePath.startsWith("snippet:")) {
      const snippetId = selectedFilePath.replace("snippet:", "")
      const snip = globalSnippets.find(s => (s._id || s.id) === snippetId)
      if (snip) {
        return {
          name: snip.title,
          code: snip.code,
          isSnippet: true,
          _id: snip._id,
          id: snip._id || snip.id,
          language: snip.language
        }
      }
    }
    return findFileByPath(task?.files, selectedFilePath)
  }

  const selectedFile = getActiveFileOrSnippet()

  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")

  const userMarkedFinished = !!task?.userMarkedFinished

  // Sync completion and progress to context
  useEffect(() => {
    if (project && task) {
      let calculatedProgress = 0;
      if (task.fileEdited) {
        calculatedProgress += 35;
      }
      if (task.codeExecuted) {
        calculatedProgress += 35;
      }
      if (task.userMarkedFinished) {
        calculatedProgress = 100;
      }

      const calculatedCompleted = !!task.userMarkedFinished

      if (task.completed !== calculatedCompleted || task.progress !== calculatedProgress) {
        
        // Update Convex Metadata
        if (task._id) {
          updateTask({
            id: task._id,
            completed: calculatedCompleted,
            progress: calculatedProgress,
            updatedAt: new Date().toISOString()
          })
        }
      }
    }
  }, [
    project,
    task,
    projects,
    setProjects,
    updateTask,
    task?.fileEdited,
    task?.projectRan,
    task?.userMarkedFinished
  ])

  // Auto-switch tabs based on template type
  useEffect(() => {
    const timer = setTimeout(() => {
      if (task) {
        const template = detectTaskTemplate(task)
        if (template === "HTML" || template === "React") {
          setTerminalTab("preview")
        } else {
          setTerminalTab("console")
        }
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [projectId, urlTaskId, task?.title, task])


  // Reset selectedFilePath on task switches
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedFilePath("")
    }, 0)
    return () => clearTimeout(timer)
  }, [projectId, urlTaskId])

  // Resolve selection if empty or invalid
  useEffect(() => {
    const timer = setTimeout(() => {
      if (task?.files) {
        const currentSelectedExists = selectedFilePath.startsWith("snippet:")
          ? globalSnippets.some(s => `snippet:${s.id}` === selectedFilePath)
          : findFileByPath(task.files, selectedFilePath)

        if (!selectedFilePath || !currentSelectedExists) {
          const firstFile = getFirstFile(task.files)
          setSelectedFilePath(firstFile || "")
        }
      } else {
        setSelectedFilePath("")
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [task?.files, selectedFilePath, globalSnippets])

  const activeFileCode = useQuery(api.files.getFileContent, selectedFile && !selectedFile.isSnippet ? { id: selectedFile._id } : "skip")

  // Sync editor values
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedFile) {
        if (selectedFile.isSnippet) {
          setCode(selectedFile.code || "")
          setOutput(selectedFile.output || "")
          loadedFileIdRef.current = null
          setSaveState("saved")
        } else {
          if (activeFileCode !== undefined && loadedFileIdRef.current !== selectedFile._id) {
            setCode(activeFileCode)
            setOutput(selectedFile.output || "")
            loadedFileIdRef.current = selectedFile._id
            setSaveState("saved")
          }
        }
      } else {
        setCode("")
        setOutput("")
        loadedFileIdRef.current = null
        setSaveState("saved")
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [selectedFile, activeFileCode])

  // Listening to iframe console messages
  useEffect(() => {
    const handleConsoleMessage = (e) => {
      if (e.data && (e.data.type === 'html-console-log' || e.data.type === 'html-console-error')) {
        appendConsoleOutput({
          taskId: task._id,
          output: e.data.text,
          status: e.data.type === 'html-console-error' ? "error" : "success"
        }).catch(err => console.error("Failed to append console output", err))
      }
    }
    window.addEventListener('message', handleConsoleMessage)
    return () => window.removeEventListener("message", handleConsoleMessage)
  }, [task?._id, appendConsoleOutput])

  if (!isLoaded) {
    return (
      <div className="h-full flex-1 p-4 flex flex-col transition bg-surface text-text-main">
        <div className="mb-4 animate-pulse">
          <div className="h-8 w-64 rounded mb-2 bg-bg-active"></div>
          <div className="h-4 w-96 rounded bg-bg-active"></div>
        </div>
        <div className="flex-1 grid grid-cols-12 gap-4">
          <div className="col-span-3 rounded-2xl animate-pulse bg-bg-active"></div>
          <div className="col-span-9 rounded-2xl animate-pulse bg-bg-active"></div>
        </div>
      </div>
    )
  }

  if (!project || !task) {
    return (
      <div className="h-full flex-1 p-6 bg-surface text-text-main flex flex-col items-center justify-center">
        <EmptyState 
          icon={AlertTriangle} 
          title="Task Not Found" 
          description="This task might have been deleted or you don't have access." 
        />
      </div>
    )
  }

  const handleRunTask = async () => {
    const template = detectTaskTemplate(task)

    if (template === "HTML") {
      const indexHtmlNode = findFileByPath(task.files, "/index.html") || findFileByFilename(task.files, "index.html")
      const styleCssNode = findFileByPath(task.files, "/style.css") || findFileByFilename(task.files, "style.css")
      const appJsNode = findFileByPath(task.files, "/app.js") || findFileByFilename(task.files, "app.js")

      const html = indexHtmlNode ? await convex.query(api.files.getFileContent, { id: indexHtmlNode._id }) : "<h1>No index.html found</h1>"
      const css = styleCssNode ? await convex.query(api.files.getFileContent, { id: styleCssNode._id }) : ""
      const js = appJsNode ? await convex.query(api.files.getFileContent, { id: appJsNode._id }) : ""

      // Combine HTML, CSS, JS
      const combined = combineHtmlCssJs(html, css, js)
      setHtmlSrcDoc(combined)



      await runTaskMutation({
        taskId: task._id,
        output: "Project built. HTML preview refreshed successfully.",
        status: "success"
      })
      
      updateTask({ id: task._id, codeExecuted: true, updatedAt: new Date().toISOString() })
      setTerminalTab("preview")
    } 
    else if (template === "React") {


      await runTaskMutation({
        taskId: task._id,
        output: "Vite dev server started. Live React Simulator rendered.",
        status: "success"
      })
      
      updateTask({ id: task._id, codeExecuted: true, updatedAt: new Date().toISOString() })
      setTerminalTab("preview")
    } 
    else if (template === "Next.js") {
      await runTaskMutation({
        taskId: task._id,
        output: "This starter represents a Next.js project structure. Runtime execution is not supported inside DevBoard X yet.",
        status: "error"
      })
      
      updateTask({ id: task._id, codeExecuted: true, updatedAt: new Date().toISOString() })
      setTerminalTab("console")
    } 
    else if (template === "Node.js") {
      await runTaskMutation({
        taskId: task._id,
        output: "Node runtime required. Backend execution environment not available.",
        status: "error"
      })
      
      updateTask({ id: task._id, codeExecuted: true, updatedAt: new Date().toISOString() })
      setTerminalTab("console")
    } 
    else if (template === "Express") {
      await runTaskMutation({
        taskId: task._id,
        output: "Server execution is not available inside browser environment.",
        status: "error"
      })
      
      updateTask({ id: task._id, codeExecuted: true, updatedAt: new Date().toISOString() })
      setTerminalTab("console")
    } 
    else {
      // Stand-alone JavaScript File execution (fallback)
      if (!selectedFilePath) return

      try {
        let result = ""
        const originalLog = console.log

        // eslint-disable-next-line react-hooks/immutability
        console.log = (...args) => {
          result += args.join(" ") + "\n"
        }

        new Function(code)()

        // eslint-disable-next-line react-hooks/immutability
        console.log = originalLog

        const finalOutput = result || "Code executed successfully."
        setOutput(finalOutput)



        await runTaskMutation({
          taskId: task._id,
          fileId: selectedFile && !selectedFile.isSnippet ? selectedFile._id : undefined,
          command: code,
          output: finalOutput,
          status: "success"
        })

        updateTask({ id: task._id, codeExecuted: true, updatedAt: new Date().toISOString() })

        setTerminalTab("console")
      }
      catch (error) {
        await runTaskMutation({
          taskId: task._id,
          fileId: selectedFile && !selectedFile.isSnippet ? selectedFile._id : undefined,
          command: code,
          output: error.message,
          status: "error"
        })



        setTerminalTab("console")
      }
    }
  }

  const handleClearTerminal = () => {
    // History is managed via execution logs now
  }

  const handleLoadCommand = (cmdText) => {
    if (!selectedFilePath || selectedFile?.isSnippet) {
      alert("Cannot restore history command into a snippet or when no file is active!")
      return
    }
    setCode(cmdText)
    // File contents are managed by the Convex editor bindings now
    alert("Command restored to Monaco Editor!")
  }

  // CRUD Event Handlers
  const handleCreateFile = async (parentPath = "") => {
    const fileName = prompt("Enter file name")
    if (!fileName) return

    const currentFiles = task?.files || []
    const parentNode = parentPath ? findFileByPath(currentFiles, parentPath) : null
    const siblings = parentNode ? (parentNode.children || []) : currentFiles
    if (siblings.some(n => n.name.toLowerCase() === fileName.toLowerCase())) {
      alert("A file or folder with this name already exists at this level.")
      return
    }

    await createFile({
      taskId: task._id,
      parentId: parentNode ? parentNode._id : undefined,
      name: fileName,
      order: siblings.length
    })

    updateTask({ id: task._id, fileEdited: true, updatedAt: new Date().toISOString() })

    const newFilePath = parentPath ? `${parentPath}/${fileName}` : `/${fileName}`
    setSelectedFilePath(newFilePath)

    if (parentPath) {
      setExpandedDirs(prev => ({ ...prev, [parentPath]: true }))
    }
  }

  const handleCreateFolder = async (parentPath = "") => {
    const folderName = prompt("Enter folder name")
    if (!folderName) return

    const currentFiles = task?.files || []
    const parentNode = parentPath ? findFileByPath(currentFiles, parentPath) : null
    const siblings = parentNode ? (parentNode.children || []) : currentFiles
    if (siblings.some(n => n.name.toLowerCase() === folderName.toLowerCase())) {
      alert("A file or folder with this name already exists at this level.")
      return
    }

    await createFolder({
      taskId: task._id,
      parentId: parentNode ? parentNode._id : undefined,
      name: folderName,
      order: siblings.length
    })

    updateTask({ id: task._id, fileEdited: true, updatedAt: new Date().toISOString() })

    const newFolderPath = parentPath ? `${parentPath}/${folderName}` : `/${folderName}`
    setExpandedDirs(prev => ({
      ...prev,
      [parentPath]: true,
      [newFolderPath]: true
    }))
  }

  const handleRenameFile = async (pathStr, currentName) => {
    const newName = prompt("Rename file", currentName)
    if (!newName) return

    const currentFiles = task?.files || []
    const parts = pathStr.split("/").filter(Boolean)
    const parentParts = parts.slice(0, -1)
    const parentPath = parentParts.length > 0 ? "/" + parentParts.join("/") : ""
    const parentNode = parentPath ? findFileByPath(currentFiles, parentPath) : null
    const siblings = parentNode ? (parentNode.children || []) : currentFiles
    if (siblings.some(n => n.name.toLowerCase() === newName.toLowerCase() && n.name !== currentName)) {
      alert("A file or folder with this name already exists at this level.")
      return
    }

    const node = findFileByPath(currentFiles, pathStr)
    if (!node) return

    await renameFile({
      id: node._id,
      name: newName
    })

    updateTask({ id: task._id, fileEdited: true, updatedAt: new Date().toISOString() })


    if (selectedFilePath === pathStr) {
      const fileParts = pathStr.split("/")
      fileParts[fileParts.length - 1] = newName
      const newPath = fileParts.join("/")
      setSelectedFilePath(newPath)
    }
  }

  const handleRenameFolder = async (pathStr, currentName) => {
    const newName = prompt("Rename folder", currentName)
    if (!newName) return

    const currentFiles = task?.files || []
    const parts = pathStr.split("/").filter(Boolean)
    const parentParts = parts.slice(0, -1)
    const parentPath = parentParts.length > 0 ? "/" + parentParts.join("/") : ""
    const parentNode = parentPath ? findFileByPath(currentFiles, parentPath) : null
    const siblings = parentNode ? (parentNode.children || []) : currentFiles
    if (siblings.some(n => n.name.toLowerCase() === newName.toLowerCase() && n.name !== currentName)) {
      alert("A file or folder with this name already exists at this level.")
      return
    }

    const node = findFileByPath(currentFiles, pathStr)
    if (!node) return

    await renameFile({
      id: node._id,
      name: newName
    })

    updateTask({ id: task._id, fileEdited: true, updatedAt: new Date().toISOString() })

    const folderParts = pathStr.split("/")
    folderParts[folderParts.length - 1] = newName
    const newPathStr = folderParts.join("/")

    if (selectedFilePath.startsWith(pathStr + "/") || selectedFilePath === pathStr) {
      const relativePart = selectedFilePath.slice(pathStr.length)
      setSelectedFilePath(newPathStr + relativePart)
    }

    setExpandedDirs(prev => {
      const newExpanded = {}
      Object.keys(prev).forEach(key => {
        if (key.startsWith(pathStr + "/") || key === pathStr) {
          const relativePart = key.slice(pathStr.length)
          newExpanded[newPathStr + relativePart] = prev[key]
        } else {
          newExpanded[key] = prev[key]
        }
      })
      return newExpanded
    })
  }

  const handleDeleteFile = async (pathStr) => {
    const currentFiles = task?.files || []

    const countFiles = (nodes) => {
      let count = 0
      nodes.forEach(n => {
        if (!n.isFolder) count++
        else count += countFiles(n.children || [])
      })
      return count
    }

    if (countFiles(currentFiles) <= 1) {
      alert("Cannot delete the last remaining file in this task workspace.")
      return
    }

    const node = findFileByPath(currentFiles, pathStr)
    if (!node) return

    await deleteFile({ id: node._id })

    updateTask({ id: task._id, fileEdited: true, updatedAt: new Date().toISOString() })
  }

  const handleDeleteFolder = async (pathStr) => {
    if (!confirm("Are you sure you want to delete this folder and all its contents?")) return

    const currentFiles = task?.files || []

    const countFiles = (nodes) => {
      let count = 0
      nodes.forEach(n => {
        if (!n.isFolder) count++
        else count += countFiles(n.children || [])
      })
      return count
    }

    const folderNode = findFileByPath(currentFiles, pathStr)
    const filesInFolder = folderNode ? countFiles([folderNode]) : 0
    if (countFiles(currentFiles) - filesInFolder <= 0) {
      alert("Cannot delete this folder as it would leave the workspace empty. Workspace must contain at least one file.")
      return
    }

    if (!folderNode) return
    await deleteFile({ id: folderNode._id })

    updateTask({ id: task._id, fileEdited: true, updatedAt: new Date().toISOString() })

    setExpandedDirs(prev => {
      const newExpanded = {}
      Object.keys(prev).forEach(key => {
        if (!key.startsWith(pathStr + "/") && key !== pathStr) {
          newExpanded[key] = prev[key]
        }
      })
      return newExpanded
    })
  }

  const toggleDir = (dirPath) => {
    setExpandedDirs(prev => ({
      ...prev,
      [dirPath]: !prev[dirPath]
    }))
  }

  // Snippet Actions
  const handleSaveAsSnippet = async () => {
    if (!selectedFilePath || !selectedFile) return

    let selectedCode = ""
    if (editorRef) {
      selectedCode = editorRef.getModel().getValueInRange(editorRef.getSelection())
    }

    if (!selectedCode) {
      selectedCode = code
    }

    if (!selectedCode.trim()) {
      alert("No code found in the editor to save as snippet!")
      return
    }

    const snippetTitle = prompt("Enter snippet title:", `Snippet from ${selectedFile.name}`)
    if (!snippetTitle) return

    const ext = selectedFile.name.split(".").pop().toLowerCase()
    let lang = "javascript"
    if (ext === "jsx" || ext === "tsx") lang = "jsx"
    else if (ext === "css") lang = "css"
    else if (ext === "html") lang = "html"
    else if (ext === "json") lang = "json"
    else if (ext === "py") lang = "python"

    const newSnippetId = await createSnippet({
      title: snippetTitle,
      description: `Saved from ${selectedFile.name}`,
      code: selectedCode,
      language: lang,
      tags: [],
      favorite: false
    })

    alert(`Snippet "${snippetTitle}" saved globally successfully!`)
  }

  // Recursive Tree Renderer
  const renderTree = (nodes, parentPath = "") => {
    const sortedNodes = [...nodes].sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1
      return a.name.localeCompare(b.name)
    })

    return sortedNodes.map((node) => {
      const currentPath = `${parentPath}/${node.name}`

      if (node.isFolder) {
        const isExpanded = expandedDirs[currentPath]

        return (
          <div key={currentPath} className="flex flex-col">
            {/* Folder Row */}
            <div
              className="group flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors w-full text-left hover:bg-bg-hover text-text-secondary hover:text-text-main"
            >
              <button
                onClick={() => toggleDir(currentPath)}
                aria-expanded={isExpanded}
                aria-label={`Toggle folder ${node.name}`}
                className="flex items-center gap-2 overflow-hidden mr-2 bg-transparent border-none p-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary outline-none text-inherit"
              >
                <span className="shrink-0 select-none flex items-center justify-center">
                  {isExpanded ? <FolderOpen size={16} className="text-zinc-400" aria-hidden="true" /> : <Folder size={16} className="text-zinc-400" aria-hidden="true" />}
                </span>
                <span className="truncate text-sm font-medium select-none">
                  {node.name}
                </span>
              </button>

              {/* Actions for Folder */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  title="New File"
                  aria-label={`New File in ${node.name}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCreateFile(currentPath)
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"
                >
                  <Plus size={12} />
                </button>
                <button
                  title="New Folder"
                  aria-label={`New Folder in ${node.name}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCreateFolder(currentPath)
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"
                >
                  <FolderPlus size={12} />
                </button>
                <button
                  title="Rename"
                  aria-label={`Rename folder ${node.name}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRenameFolder(currentPath, node.name)
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700"
                >
                  <Edit size={12} />
                </button>
                <button
                  title="Delete"
                  aria-label={`Delete folder ${node.name}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFolder(currentPath)
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-danger hover:bg-danger/10"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Folder Children (Indented) */}
            {isExpanded && (
              <div className="pl-4 border-l border-zinc-800/50 ml-3 mt-1 flex flex-col gap-1">
                {node.children && node.children.length > 0 ? (
                  renderTree(node.children, currentPath)
                ) : (
                  <span className="text-xs text-zinc-400 italic py-1 pl-2 select-none">Empty Folder</span>
                )}
              </div>
            )}
          </div>
        )
      } else {
        // File Row
        const isSelected = selectedFilePath === currentPath

        return (
          <div
            key={currentPath}
            className={`group flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 w-full text-left ${isSelected
              ? "bg-accent text-accent-fg shadow-sm"
              : "hover:bg-bg-hover text-text-secondary hover:text-text-main"
              }`}
          >
            <button
              onClick={() => setSelectedFilePath(currentPath)}
              aria-pressed={isSelected}
              aria-label={`Select file ${node.name}`}
              className="flex items-center gap-2 overflow-hidden mr-2 bg-transparent border-none p-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary outline-none text-inherit flex-1 text-left"
            >
              {getFileIcon(node.name, isSelected)}
              <span className={`truncate text-sm select-none ${isSelected ? "font-medium text-white" : ""}`}>
                {node.name}
              </span>
            </button>

            {/* Actions for File */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                title="Rename"
                aria-label={`Rename file ${node.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleRenameFile(currentPath, node.name)
                }}
                className={`p-1 rounded transition-colors ${isSelected
                  ? "text-white hover:bg-white/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
              >
                <Edit size={12} />
              </button>
              <button
                title="Delete"
                aria-label={`Delete file ${node.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFile(currentPath)
                }}
                className={`p-1 rounded transition-colors ${isSelected
                  ? "text-white hover:bg-danger/30"
                  : "text-zinc-400 hover:text-danger hover:bg-danger/10"
                  }`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )
      }
    })
  }

  // Workspace statistics calculations
  const countFiles = (nodes) => {
    if (!nodes) return 0
    let count = 0
    nodes.forEach(n => {
      if (!n.isFolder) count++
      else count += countFiles(n.children || [])
    })
    return count
  }
  const totalFilesCount = countFiles(task?.files)
  const codeExecuted = !!task?.projectRan
  const runCount = task?.terminalHistory ? task.terminalHistory.length : 0
  const progressPercent = task?.progress || 0
  const taskTemplate = detectTaskTemplate(task)

  return (
    <div
      className="h-full flex-1 p-6 bg-surface text-text-main"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {task.title}
          </h1>
          <p
            className="mt-2 text-sm text-text-secondary"
          >
            Workspace Environment • <span className="font-semibold text-primary">{taskTemplate} Mode</span>
          </p>
        </div>
      </div>

      <ProjectSubNav projectIndex={projectIndex} />

      {/* IDE split layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-8">

        {/* EXPLORER SIDEBAR */}
        <Card
          className="w-full lg:w-[260px] shrink-0 flex flex-col justify-between min-h-[580px]"
        >
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/20">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FolderOpen size={20} className="text-zinc-400" aria-hidden="true" /> Explorer
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  title="New File at Root"
                  onClick={() => handleCreateFile("")}
                  className="p-1 rounded hover:bg-black/10 text-zinc-400 hover:text-white"
                >
                  <Plus size={14} />
                </button>
                <button
                  title="New Folder at Root"
                  onClick={() => handleCreateFolder("")}
                  className="p-1 rounded hover:bg-black/10 text-zinc-400 hover:text-white"
                >
                  <FolderPlus size={14} />
                </button>
              </div>
            </div>

            {/* File Tree List */}
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[160px] pr-1">
              {task.files && task.files.length > 0 ? (
                renderTree(task.files)
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-zinc-400">
                  <span className="text-sm">No files created yet</span>
                  <span className="text-xs opacity-70 mt-1">Use the + buttons to add files</span>
                </div>
              )}
            </div>


            <div className="flex flex-col mt-4 pt-3 border-t border-border-subtle">
              <h3 className="font-semibold text-sm mb-2 pb-1.5 border-b border-border-subtle text-text-secondary flex items-center gap-2">
                <BarChart2 size={16} className="text-text-secondary" aria-hidden="true" /> Workspace Statistics
              </h3>

              <div className="flex flex-col gap-2.5">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-text-secondary">
                    <span>Task Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-active rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Statistics checklist */}
                <div className="text-xs space-y-1 text-text-secondary font-medium bg-bg-active/70 p-2.5 rounded-lg border border-border-subtle dark:bg-bg-input">
                  <div className="flex justify-between items-center">
                    <span>Files Created:</span>
                    <span className="font-bold text-text-main">{totalFilesCount}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Code Executed:</span>
                    <span className={codeExecuted ? "text-success font-bold" : "text-text-secondary"}>
                      {codeExecuted ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Project Runs:</span>
                    <span className="font-bold text-text-main">{runCount}</span>
                  </div>
                </div>

                {/* Mark as finished toggle */}
                <label htmlFor="mark-finished" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-xs font-semibold text-accent cursor-pointer hover:bg-accent/20 transition-all select-none focus-within:ring-2 focus-within:ring-accent">
                  <input
                    id="mark-finished"
                    type="checkbox"
                    checked={userMarkedFinished}
                    onChange={(e) => updateTask({ id: task._id, userMarkedFinished: e.target.checked, updatedAt: new Date().toISOString() })}
                    className="accent-primary rounded cursor-pointer scale-90"
                  />
                  Mark workspace as finished
                </label>
              </div>
            </div>
            </div>

          </Card>

        {/* RIGHT PANE: EDITOR & OUTPUT */}
        <div className="flex-1 flex flex-col gap-6">

          {/* CODE EDITOR */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>Code Editor</span>
                {saveState === "saving" && <span className="text-xs font-semibold text-info animate-pulse">Saving...</span>}
                {saveState === "saved" && <span className="text-xs font-semibold text-success">Saved</span>}
                {saveState === "error" && <span className="text-xs font-semibold text-danger">Save Failed (Retrying...)</span>}
                {saveState === "unsaved" && <span className="text-xs font-semibold text-zinc-400">Unsaved changes</span>}
              </div>
              {selectedFilePath && (
                <span className="text-xs px-2 py-1 rounded font-mono bg-bg-active text-text-muted">
                  {selectedFilePath}
                </span>
              )}
            </h2>

            <div className="overflow-hidden rounded-xl border border-zinc-800">
              <Editor
                height="400px"
                language={selectedFile ? (selectedFile.isSnippet ? (selectedFile.language || "javascript") : detectLanguageFromFilename(selectedFile.name)) : "javascript"}
                theme="vs-dark"
                value={code}
                onMount={(editor) => {
                  setEditorRef(editor)
                }}
                onChange={(value) => {
                  const newCode = value || ""
                  setCode(newCode)
                  setSaveState("unsaved")

                  if (selectedFilePath.startsWith("snippet:")) {
                    const snippetId = selectedFilePath.replace("snippet:", "")
                    const snip = globalSnippets.find(s => (s._id || s.id) === snippetId)
                    if (snip && snip._id) {
                      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
                      autosaveTimerRef.current = setTimeout(() => {
                        setSaveState("saving")
                        updateSnippet({
                          id: snip._id,
                          title: snip.title,
                          description: snip.description,
                          code: newCode,
                          language: snip.language,
                          tags: snip.tags || []
                        }).then(() => setSaveState("saved")).catch(() => setSaveState("error"))
                      }, 800)
                    }
                  } else if (selectedFile && !selectedFile.isSnippet) {
                    const fileId = selectedFile._id
                    
                    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
                    
                    autosaveTimerRef.current = setTimeout(() => {
                      handleAutoSave(fileId, newCode)
                    }, 800)

                    updateTask({ id: task._id, fileEdited: true, updatedAt: new Date().toISOString() })
                  }
                }}
                options={{
                  minimap: {
                    enabled: false
                  },
                  fontSize: 16,
                  automaticLayout: true,
                  scrollBeyondLastLine: false
                }}
              />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="success"
                onClick={handleRunTask}
                disabled={!selectedFilePath}
              >
                ▶ Run Task
              </Button>

              <Button
                variant="secondary"
                onClick={() => setIsSnippetPickerOpen(true)}
                disabled={!selectedFilePath || selectedFile?.isSnippet}
              >
                <Code2 size={16} aria-hidden="true" /> Insert Snippet
              </Button>

              <Button
                variant="primary"
                onClick={handleSaveAsSnippet}
                disabled={!selectedFilePath || selectedFile?.isSnippet}
              >
                <FileText size={16} aria-hidden="true" /> Save as Snippet
              </Button>
            </div>
            
            <SnippetPickerModal
              isOpen={isSnippetPickerOpen}
              onClose={() => setIsSnippetPickerOpen(false)}
              snippets={globalSnippets}
              onInsert={(snippet) => {
                if (editorRef) {
                  const position = editorRef.getPosition()
                  editorRef.executeEdits("snippet-insert", [{
                    range: { startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber, endColumn: position.column },
                    text: snippet.code,
                    forceMoveMarkers: true
                  }])
                  incrementUsage({ id: snippet._id })
                  setIsSnippetPickerOpen(false)
                }
              }}
            />
          </Card>

          {/* TERMINAL & PREVIEW SPLIT VIEW */}
          <Card
            className={`!p-0 overflow-hidden flex flex-col ${previewFullscreen ? "fixed inset-0 z-50 !rounded-none" : ""}`}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/40 bg-zinc-950/20 select-none">
              <div role="tablist" aria-label="Terminal views" className="flex items-center gap-4 text-xs font-bold tracking-wider">
                {/* PREVIEW tab — shown for HTML, React, Next.js only */}
                {(taskTemplate === "HTML" || taskTemplate === "React" || taskTemplate === "Next.js") && (
                  <button
                    role="tab"
                    aria-selected={terminalTab === "preview"}
                    onClick={() => setTerminalTab("preview")}
                    className={`pb-1.5 pt-1 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary outline-none ${
                      terminalTab === "preview"
                        ? "border-primary text-white"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    PREVIEW
                  </button>
                )}

                {/* CONSOLE tab — always shown */}
                <button
                  role="tab"
                  aria-selected={terminalTab === "console"}
                  onClick={() => setTerminalTab("console")}
                  className={`pb-1.5 pt-1 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary outline-none ${
                    terminalTab === "console"
                      ? "border-primary text-white"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  CONSOLE
                </button>

                {/* TERMINAL tab — shown for Node.js, Express only */}
                {(taskTemplate === "Node.js" || taskTemplate === "Express") && (
                  <button
                    role="tab"
                    aria-selected={terminalTab === "terminal"}
                    onClick={() => setTerminalTab("terminal")}
                    className={`pb-1.5 pt-1 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary outline-none ${
                      terminalTab === "terminal"
                        ? "border-primary text-white"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    TERMINAL
                  </button>
                )}

                {/* COMMAND HISTORY tab — shown for Node.js, Express only */}
                {(taskTemplate === "Node.js" || taskTemplate === "Express") && (
                  <button
                    role="tab"
                    aria-selected={terminalTab === "history"}
                    onClick={() => setTerminalTab("history")}
                    className={`pb-1.5 pt-1 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-primary outline-none ${
                      terminalTab === "history"
                        ? "border-primary text-white"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    COMMAND HISTORY
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Clear console button */}
                {terminalTab === "console" && (
                  <button
                    title="Clear Console"
                    onClick={() => {
                      if (task) {
                        clearExecutionHistory({ taskId: task._id }).catch(err => console.error("Failed to clear history", err))
                      }
                    }}
                    className="p-1 rounded hover:bg-black/10 text-zinc-400 hover:text-white transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                {/* Preview action buttons */}
                {terminalTab === "preview" && taskTemplate === "HTML" && htmlSrcDoc && (
                  <button
                    title="Open Preview in New Tab"
                    aria-label="Open Preview in New Tab"
                    onClick={() => {
                      const win = window.open("", "_blank")
                      if (win) {
                        win.document.open()
                        win.document.write(htmlSrcDoc)
                        win.document.close()
                      }
                    }}
                    className="p-1 rounded hover:bg-black/10 text-zinc-400 hover:text-white transition focus-visible:ring-2 focus-visible:ring-primary outline-none"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
                {terminalTab === "preview" && (
                  <button
                    title={previewFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                    aria-label={previewFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                    onClick={() => setPreviewFullscreen(f => !f)}
                    className="p-1 rounded hover:bg-black/10 text-zinc-400 hover:text-white transition focus-visible:ring-2 focus-visible:ring-primary outline-none"
                  >
                    {previewFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                )}
              </div>
            </div>

            {/* Panel Body */}
            <div className={`bg-black p-4 overflow-y-auto font-mono text-xs text-zinc-300 ${previewFullscreen ? "h-[calc(100vh-44px)]" : "min-h-[280px] max-h-[400px]"}`}>
              {terminalTab === "preview" && (
                <div className={`w-full h-full ${previewFullscreen ? "" : "min-h-[250px]"}`}>
                  {taskTemplate === "HTML" ? (
                    htmlSrcDoc ? (
                      <iframe
                        srcDoc={htmlSrcDoc}
                        className={`w-full bg-white rounded-lg border-0 shadow-inner ${previewFullscreen ? "h-full" : "h-[280px]"}`}
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-6 text-center select-none">
                        <span className="font-semibold text-zinc-300">Nothing generated yet</span>
                        <span className="text-xs mt-1">Click &quot;Run Task&quot; to render the live webpage preview.</span>
                      </div>
                    )
                  ) : taskTemplate === "React" ? (
                    <ReactMockupPreview task={task} />
                  ) : taskTemplate === "Next.js" ? (
                    <div className="p-4 bg-zinc-950 text-zinc-400 rounded-lg flex flex-col gap-2 select-none border border-zinc-800">
                      <p className="text-info font-bold flex items-center gap-1.5">
                        <span className="text-xs">▲</span> Next.js Starter Simulator
                      </p>
                      <p className="text-xs">This starter represents a Next.js App Router project structure.</p>
                      <p className="text-warning text-xs flex items-center gap-1.5"><AlertTriangle size={14} className="shrink-0" /> Runtime execution is not supported inside DevBoard X yet.</p>
                      <p className="text-zinc-400 text-xs border-t border-zinc-800/60 pt-2 mt-1">
                        Files like page.js and layout.js are safely persisted in task workspace context.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-950 text-zinc-400 rounded-lg flex flex-col gap-2 select-none border border-zinc-800">
                      <p className="text-success font-bold flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-success shrink-0" /> {taskTemplate} Execution Environment
                      </p>
                      <p className="text-xs">Entry file: {taskTemplate === "Express" ? "server.js" : "index.js"}</p>
                      <p className="text-danger text-xs flex items-start gap-1.5">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" /> 
                        <span>
                        {taskTemplate === "Express" 
                          ? "Server execution is not available inside browser environment." 
                          : "Node runtime required. Backend execution environment not available."}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {terminalTab === "console" && (
                <div className="flex flex-col gap-1.5">
                  {executionLogs && executionLogs.length > 0 ? (
                    executionLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-2 whitespace-pre-wrap">
                        <span className="text-zinc-400 shrink-0 select-none">
                          [{new Date(log.startedAt).toTimeString().split(" ")[0]}]
                        </span>
                        <span className={log.status === "error" ? "text-danger" : "text-success"}>
                          {log.output}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-zinc-500 select-none">
                      <span className="text-sm">Console output empty</span>
                      <span className="text-xs mt-1">Run task to execute code scripts</span>
                    </div>
                  )}
                </div>
              )}

              {terminalTab === "terminal" && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-zinc-400 flex items-center gap-2 mb-2 select-none">
                    <span className="text-success font-bold">devboard</span>
                    <span className="text-zinc-600">~/{task?.title || "workspace"}</span>
                    <span className="text-zinc-700">$</span>
                  </div>
                  {executionLogs && executionLogs.length > 0 ? (
                    executionLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-2 whitespace-pre-wrap">
                        <span className="text-zinc-400 shrink-0 select-none">
                          [{new Date(log.startedAt).toTimeString().split(" ")[0]}]
                        </span>
                        <span className={log.status === "error" ? "text-danger" : "text-success"}>
                          {log.output}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-zinc-500 select-none">
                      <span className="text-sm">Terminal ready</span>
                      <span className="text-xs mt-1">Run task to see output</span>
                    </div>
                  )}
                </div>
              )}

              {terminalTab === "history" && (
                <div className="flex flex-col gap-2">
                  {commandHistory && commandHistory.length > 0 ? (
                    commandHistory.map((cmd, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800/40 gap-3 hover:border-zinc-700 transition"
                      >
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="text-xs text-zinc-400 select-none">
                            Run at {new Date(cmd.executedAt).toTimeString().split(" ")[0]}
                          </span>
                          <span className="truncate text-zinc-300 font-mono">
                            {cmd.command.length > 60 ? `${cmd.command.substring(0, 60)}...` : cmd.command}
                          </span>
                        </div>
                        <button
                          title="Restore in editor"
                          onClick={() => handleLoadCommand(cmd.command)}
                          className="px-2 py-1 rounded bg-accent hover:bg-accent-hover text-xs font-semibold text-accent-fg shrink-0 transition"
                        >
                          Restore
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-zinc-400 italic select-none">
                      No commands executed yet.
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>

        </div>

      </div>
    </div>
  )
}
