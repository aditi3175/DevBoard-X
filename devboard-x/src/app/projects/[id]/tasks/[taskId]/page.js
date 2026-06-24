"use client"

import Editor from "@monaco-editor/react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
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
  ExternalLink
} from "lucide-react"

import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"
import ProjectSubNav from "@/components/project/ProjectSubNav"
import {
  ACTIVITY_TYPES,
  appendProjectActivity,
  buildActivityEntry
} from "@/utils/projectActivity"
import { useActivity } from "@/context/ActivityContext"

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
        <span className={`w-4.5 h-4.5 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${isSelected
          ? "bg-white text-orange-600"
          : "bg-orange-600 text-white"
          }`}>
          &lt;/&gt;
        </span>
      )
    case "js":
    case "mjs":
      return (
        <span className={`w-4.5 h-4.5 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${isSelected
          ? "bg-white text-blue-600"
          : "bg-yellow-500 text-black"
          }`}>
          JS
        </span>
      )
    case "jsx":
    case "tsx":
      return <Atom size={16} className={isSelected ? "text-cyan-100" : "text-cyan-400"} />
    case "css":
      return (
        <span className={`w-4.5 h-4.5 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${isSelected
          ? "bg-white text-blue-600"
          : "bg-blue-500 text-white"
          }`}>
          CSS
        </span>
      )
    case "json":
      return <Braces size={16} className={isSelected ? "text-orange-200" : "text-orange-400"} />
    case "md":
      return <FileText size={16} className={isSelected ? "text-indigo-200" : "text-indigo-400"} />
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
  const appCode = appJsxNode ? appJsxNode.code : ""

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
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span>
        </div>
        <div className="bg-white px-3 py-1 rounded border border-zinc-200/80 w-64 text-center text-[10px] font-mono truncate">
          http://localhost:5173/
        </div>
        <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-bold">Vite + React</span>
      </div>

      {/* Simulator Content */}
      <div className="p-5 flex-1 overflow-y-auto flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-sky-600 flex items-center gap-2">
            <span className="animate-spin inline-block text-sky-500">⚛️</span>
            {reactTitle}
          </h1>
          <p className="text-xs text-zinc-400 mt-2">
            {reactSubtitle}
          </p>
        </div>

        <div className="p-3 border border-zinc-100 bg-zinc-50 rounded-lg flex items-center justify-between mt-3">
          <div>
            <h4 className="font-bold text-xs text-zinc-700">Interactive Clicker Widget</h4>
            <p className="text-[10px] text-zinc-400">Verifying live React state bindings</p>
          </div>
          <button 
            onClick={() => setClickCount(c => c + 1)}
            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded text-xs font-bold shadow-sm transition"
          >
            Clicks: {clickCount}
          </button>
        </div>

        <div className="text-[9px] text-zinc-400 border-t border-zinc-100 pt-2.5 mt-2 flex justify-between select-none">
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

  const { theme } = useTheme()
  const { projects, setProjects } = useProjects()
  const { logActivity } = useActivity()

  const projectIndex = Number(params.id)
  const taskIndex = Number(params.taskId)

  const project = projects[projectIndex]
  const task = project?.tasks?.[taskIndex]

  const [selectedFilePath, setSelectedFilePath] = useState("")
  const [expandedDirs, setExpandedDirs] = useState({ "/src": true, "/app": true })
  const [editorRef, setEditorRef] = useState(null)
  const [globalSnippets, setGlobalSnippets] = useState([])
  const [terminalTab, setTerminalTab] = useState("console")
  const [htmlSrcDoc, setHtmlSrcDoc] = useState("")
  const [previewFullscreen, setPreviewFullscreen] = useState(false)

  // Load global snippets
  useEffect(() => {
    const saved = localStorage.getItem("devboard-snippets")
    if (saved) {
      setGlobalSnippets(JSON.parse(saved))
    }
  }, [projects, selectedFilePath])

  const taskSnippets = globalSnippets.filter(s =>
    task?.snippets?.includes(s.id)
  )

  const getActiveFileOrSnippet = () => {
    if (selectedFilePath && selectedFilePath.startsWith("snippet:")) {
      const snippetId = selectedFilePath.replace("snippet:", "")
      const snip = globalSnippets.find(s => s.id === snippetId)
      if (snip) {
        return {
          name: snip.title,
          code: snip.code,
          isSnippet: true,
          id: snip.id,
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
      if (task.projectRan) {
        calculatedProgress += 35;
      }
      const snippetsCount = task.snippets ? task.snippets.length : 0;
      if (snippetsCount > 0) {
        calculatedProgress += 15;
      }
      if (task.userMarkedFinished) {
        calculatedProgress = 100;
      }

      const calculatedCompleted = !!task.userMarkedFinished

      if (task.completed !== calculatedCompleted || task.progress !== calculatedProgress) {
        const updatedProjects = [...projects]
        updatedProjects[projectIndex].tasks[taskIndex].completed = calculatedCompleted
        updatedProjects[projectIndex].tasks[taskIndex].progress = calculatedProgress
        setProjects(updatedProjects)
      }
    }
  }, [
    project,
    task,
    projectIndex,
    taskIndex,
    projects,
    setProjects,
    task?.fileEdited,
    task?.projectRan,
    task?.userMarkedFinished,
    task?.snippets
  ])

  // Auto-switch tabs based on template type
  useEffect(() => {
    if (task) {
      const template = detectTaskTemplate(task)
      if (template === "HTML" || template === "React") {
        setTerminalTab("preview")
      } else {
        setTerminalTab("console")
      }
    }
  }, [projectIndex, taskIndex, task?.title])

  // Initialize task files if they don't exist
  useEffect(() => {
    if (project && task && (!task.files || task.files.length === 0)) {
      const updatedProjects = [...projects]
      updatedProjects[projectIndex].tasks[taskIndex].files = [
        {
          name: "index.js",
          code: "// Write your JavaScript code here\nconsole.log('Hello, World!');\n",
          output: ""
        }
      ]
      setProjects(updatedProjects)
    }
  }, [project, task, projectIndex, taskIndex, projects, setProjects])

  // Reset selectedFilePath on task switches
  useEffect(() => {
    setSelectedFilePath("")
  }, [projectIndex, taskIndex])

  // Resolve selection if empty or invalid
  useEffect(() => {
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
  }, [task?.files, selectedFilePath, globalSnippets])

  // Sync editor values
  useEffect(() => {
    if (selectedFile) {
      setCode(selectedFile.code || "")
      setOutput(selectedFile.output || "")
    } else {
      setCode("")
      setOutput("")
    }
  }, [selectedFile])

  // Listening to iframe console messages
  useEffect(() => {
    const handleConsoleMessage = (e) => {
      if (e.data && (e.data.type === 'html-console-log' || e.data.type === 'html-console-error')) {
        const now = new Date()
        const timeStr = now.toTimeString().split(" ")[0]
        const logEntry = {
          timestamp: timeStr,
          type: e.data.type === 'html-console-error' ? "error" : "success",
          text: e.data.text
        }
        
        setProjects(prevProjects => {
          const updated = [...prevProjects]
          const currentTask = updated[projectIndex]?.tasks?.[taskIndex]
          if (currentTask) {
            if (!currentTask.terminalHistory) currentTask.terminalHistory = []
            const history = currentTask.terminalHistory
            if (history.length === 0 || history[history.length - 1].text !== logEntry.text || history[history.length - 1].timestamp !== logEntry.timestamp) {
              currentTask.terminalHistory = [...history, logEntry]
            }
          }
          return updated
        })
      }
    }
    window.addEventListener('message', handleConsoleMessage)
    return () => window.removeEventListener('message', handleConsoleMessage)
  }, [projectIndex, taskIndex])

  if (!project || !task) {
    return (
      <div
        className={`min-h-screen p-6 ${theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
          }`}
      >
        <h1 className="text-3xl font-bold">
          Task Not Found
        </h1>
      </div>
    )
  }

  const handleRunTask = () => {
    const template = detectTaskTemplate(task)
    const now = new Date()
    const timeStr = now.toTimeString().split(" ")[0]
    
    const updatedProjects = [...projects]
    const currentTask = updatedProjects[projectIndex].tasks[taskIndex]
    
    if (!currentTask.terminalHistory) currentTask.terminalHistory = []
    if (!currentTask.commandHistory) currentTask.commandHistory = []

    if (template === "HTML") {
      const indexHtmlNode = findFileByPath(task.files, "/index.html") || findFileByFilename(task.files, "index.html")
      const styleCssNode = findFileByPath(task.files, "/style.css") || findFileByFilename(task.files, "style.css")
      const appJsNode = findFileByPath(task.files, "/app.js") || findFileByFilename(task.files, "app.js")

      const html = indexHtmlNode ? indexHtmlNode.code : "<h1>No index.html found</h1>"
      const css = styleCssNode ? styleCssNode.code : ""
      const js = appJsNode ? appJsNode.code : ""

      // Combine HTML, CSS, JS
      const combined = combineHtmlCssJs(html, css, js)
      setHtmlSrcDoc(combined)

      logActivity({
        type: "code_executed",
        message: `Executed code in task "${task.title}"`,
        projectId: projectIndex,
        projectTitle: updatedProjects[projectIndex].title
      })

      const logEntry = {
        timestamp: timeStr,
        type: "success",
        text: "Project built. HTML preview refreshed successfully."
      }
      currentTask.terminalHistory.push(logEntry)
      currentTask.projectRan = true
      currentTask.codeExecuted = true
      setTerminalTab("preview")
      setProjects(updatedProjects)
    } 
    else if (template === "React") {
      logActivity({
        type: "code_executed",
        message: `Executed React code in task "${task.title}"`,
        projectId: projectIndex,
        projectTitle: updatedProjects[projectIndex].title
      })

      const logEntry = {
        timestamp: timeStr,
        type: "success",
        text: "Vite dev server started. Live React Simulator rendered."
      }
      currentTask.terminalHistory.push(logEntry)
      currentTask.projectRan = true
      currentTask.codeExecuted = true
      setTerminalTab("preview")
      setProjects(updatedProjects)
    } 
    else if (template === "Next.js") {
      const logEntry = {
        timestamp: timeStr,
        type: "error",
        text: "This starter represents a Next.js project structure. Runtime execution is not supported inside DevBoard X yet."
      }
      currentTask.terminalHistory.push(logEntry)
      currentTask.projectRan = true
      currentTask.codeExecuted = true
      setTerminalTab("console")
      setProjects(updatedProjects)
    } 
    else if (template === "Node.js") {
      const logEntry = {
        timestamp: timeStr,
        type: "error",
        text: "Node runtime required. Backend execution environment not available."
      }
      currentTask.terminalHistory.push(logEntry)
      currentTask.projectRan = true
      currentTask.codeExecuted = true
      setTerminalTab("console")
      setProjects(updatedProjects)
    } 
    else if (template === "Express") {
      const logEntry = {
        timestamp: timeStr,
        type: "error",
        text: "Server execution is not available inside browser environment."
      }
      currentTask.terminalHistory.push(logEntry)
      currentTask.projectRan = true
      currentTask.codeExecuted = true
      setTerminalTab("console")
      setProjects(updatedProjects)
    } 
    else {
      // Stand-alone JavaScript File execution (fallback)
      if (!selectedFilePath) return

      try {
        let result = ""
        const originalLog = console.log

        console.log = (...args) => {
          result += args.join(" ") + "\n"
        }

        eval(code)

        console.log = originalLog

        const finalOutput = result || "Code executed successfully."
        setOutput(finalOutput)

        logActivity({
          type: "code_executed",
          message: `Executed JavaScript code in task "${task.title}"`,
          projectId: projectIndex,
          projectTitle: updatedProjects[projectIndex].title
        })

        const logEntry = {
          timestamp: timeStr,
          type: "success",
          text: finalOutput,
          command: code
        }

        currentTask.terminalHistory.push(logEntry)
        currentTask.commandHistory.push({
          timestamp: timeStr,
          command: code
        })

        if (!selectedFilePath.startsWith("snippet:")) {
          currentTask.files = updateFileInTree(
            currentTask.files,
            selectedFilePath,
            { code, output: finalOutput }
          )
        }

        currentTask.projectRan = true
        currentTask.codeExecuted = true
        setTerminalTab("console")
        setProjects(updatedProjects)
      }
      catch (error) {
        const logEntry = {
          timestamp: timeStr,
          type: "error",
          text: error.message,
          command: code
        }

        currentTask.terminalHistory.push(logEntry)
        currentTask.commandHistory.push({
          timestamp: timeStr,
          command: code
        })

        if (!selectedFilePath.startsWith("snippet:")) {
          currentTask.files = updateFileInTree(
            currentTask.files,
            selectedFilePath,
            { output: error.message }
          )
        }

        currentTask.projectRan = true
        currentTask.codeExecuted = true
        setTerminalTab("console")
        setProjects(updatedProjects)
        setOutput(error.message)
      }
    }
  }

  const handleClearTerminal = () => {
    const updatedProjects = [...projects]
    updatedProjects[projectIndex].tasks[taskIndex].terminalHistory = []
    setProjects(updatedProjects)
  }

  const handleLoadCommand = (cmdText) => {
    if (!selectedFilePath || selectedFile?.isSnippet) {
      alert("Cannot restore history command into a snippet or when no file is active!")
      return
    }
    setCode(cmdText)
    const updatedProjects = [...projects]
    updatedProjects[projectIndex].tasks[taskIndex].files = updateFileInTree(
      updatedProjects[projectIndex].tasks[taskIndex].files,
      selectedFilePath,
      { code: cmdText }
    )
    setProjects(updatedProjects)
    alert("Command restored to Monaco Editor!")
  }

  // CRUD Event Handlers
  const handleCreateFile = (parentPath = "") => {
    const fileName = prompt("Enter file name")
    if (!fileName) return

    const currentFiles = task?.files || []
    const parentNode = parentPath ? findFileByPath(currentFiles, parentPath) : null
    const siblings = parentNode ? (parentNode.children || []) : currentFiles
    if (siblings.some(n => n.name.toLowerCase() === fileName.toLowerCase())) {
      alert("A file or folder with this name already exists at this level.")
      return
    }

    const updatedProjects = [...projects]
    const newNode = {
      name: fileName,
      code: "",
      output: ""
    }

    updatedProjects[projectIndex].tasks[taskIndex].files = addNodeToTree(
      updatedProjects[projectIndex].tasks[taskIndex].files || [],
      parentPath,
      newNode
    )
    updatedProjects[projectIndex].tasks[taskIndex].fileEdited = true

    const withActivity = appendProjectActivity(
      updatedProjects,
      projectIndex,
      buildActivityEntry(
        ACTIVITY_TYPES.FILE_CREATED,
        `Created file: ${fileName}`,
        { taskIndex }
      )
    )

    logActivity({
      type: "file_created",
      message: `Created file "${fileName}" in task "${task.title}"`,
      projectId: projectIndex,
      projectTitle: updatedProjects[projectIndex].title
    })

    setProjects(withActivity)

    const newFilePath = parentPath ? `${parentPath}/${fileName}` : `/${fileName}`
    setSelectedFilePath(newFilePath)

    if (parentPath) {
      setExpandedDirs(prev => ({ ...prev, [parentPath]: true }))
    }
  }

  const handleCreateFolder = (parentPath = "") => {
    const folderName = prompt("Enter folder name")
    if (!folderName) return

    const currentFiles = task?.files || []
    const parentNode = parentPath ? findFileByPath(currentFiles, parentPath) : null
    const siblings = parentNode ? (parentNode.children || []) : currentFiles
    if (siblings.some(n => n.name.toLowerCase() === folderName.toLowerCase())) {
      alert("A file or folder with this name already exists at this level.")
      return
    }

    const updatedProjects = [...projects]
    const newNode = {
      name: folderName,
      isFolder: true,
      children: []
    }

    updatedProjects[projectIndex].tasks[taskIndex].files = addNodeToTree(
      updatedProjects[projectIndex].tasks[taskIndex].files || [],
      parentPath,
      newNode
    )
    updatedProjects[projectIndex].tasks[taskIndex].fileEdited = true

    setProjects(updatedProjects)

    const newFolderPath = parentPath ? `${parentPath}/${folderName}` : `/${folderName}`
    setExpandedDirs(prev => ({
      ...prev,
      [parentPath]: true,
      [newFolderPath]: true
    }))
  }

  const handleRenameFile = (pathStr, currentName) => {
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

    const updatedProjects = [...projects]

    updatedProjects[projectIndex].tasks[taskIndex].files = renameNodeInTree(
      updatedProjects[projectIndex].tasks[taskIndex].files,
      pathStr,
      newName
    )
    updatedProjects[projectIndex].tasks[taskIndex].fileEdited = true

    const withActivity = appendProjectActivity(
      updatedProjects,
      projectIndex,
      buildActivityEntry(
        ACTIVITY_TYPES.FILE_RENAMED,
        `Renamed file: ${currentName} → ${newName}`,
        { taskIndex }
      )
    )

    setProjects(withActivity)

    if (selectedFilePath === pathStr) {
      const fileParts = pathStr.split("/")
      fileParts[fileParts.length - 1] = newName
      const newPath = fileParts.join("/")
      setSelectedFilePath(newPath)
    }
  }

  const handleRenameFolder = (pathStr, currentName) => {
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

    const updatedProjects = [...projects]

    updatedProjects[projectIndex].tasks[taskIndex].files = renameNodeInTree(
      updatedProjects[projectIndex].tasks[taskIndex].files,
      pathStr,
      newName
    )
    updatedProjects[projectIndex].tasks[taskIndex].fileEdited = true

    const withActivity = appendProjectActivity(
      updatedProjects,
      projectIndex,
      buildActivityEntry(
        ACTIVITY_TYPES.FILE_RENAMED,
        `Renamed folder: ${currentName} → ${newName}`,
        { taskIndex }
      )
    )

    setProjects(withActivity)

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

  const handleDeleteFile = (pathStr) => {
    const updatedProjects = [...projects]
    const currentFiles = updatedProjects[projectIndex].tasks[taskIndex].files || []

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

    const newTree = deleteNodeFromTree(currentFiles, pathStr)
    updatedProjects[projectIndex].tasks[taskIndex].files = newTree
    updatedProjects[projectIndex].tasks[taskIndex].fileEdited = true

    const withActivity = appendProjectActivity(
      updatedProjects,
      projectIndex,
      buildActivityEntry(
        ACTIVITY_TYPES.FILE_DELETED,
        `Deleted file: ${pathStr}`,
        { taskIndex }
      )
    )

    logActivity({
      type: "file_deleted",
      message: `Deleted file "${pathStr}" in task "${task.title}"`,
      projectId: projectIndex,
      projectTitle: updatedProjects[projectIndex].title
    })

    setProjects(withActivity)

    if (selectedFilePath === pathStr) {
      const firstFile = getFirstFile(newTree)
      setSelectedFilePath(firstFile || "")
    }
  }

  const handleDeleteFolder = (pathStr) => {
    if (!confirm("Are you sure you want to delete this folder and all its contents?")) return

    const updatedProjects = [...projects]
    const currentFiles = updatedProjects[projectIndex].tasks[taskIndex].files || []

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

    const newTree = deleteNodeFromTree(currentFiles, pathStr)
    updatedProjects[projectIndex].tasks[taskIndex].files = newTree
    updatedProjects[projectIndex].tasks[taskIndex].fileEdited = true

    setProjects(updatedProjects)

    if (selectedFilePath.startsWith(pathStr + "/") || selectedFilePath === pathStr) {
      const firstFile = getFirstFile(newTree)
      setSelectedFilePath(firstFile || "")
    }

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
  const handleSaveAsSnippet = () => {
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

    const newSnippetId = Date.now().toString()
    const newSnippet = {
      id: newSnippetId,
      title: snippetTitle,
      category: "Task Snippet",
      language: lang,
      code: selectedCode,
      createdAt: new Date().toLocaleDateString(),
      taskId: taskIndex,
      projectId: projectIndex
    }

    const saved = localStorage.getItem("devboard-snippets")
    const globalList = saved ? JSON.parse(saved) : []
    localStorage.setItem("devboard-snippets", JSON.stringify([newSnippet, ...globalList]))

    const updatedProjects = [...projects]
    if (!updatedProjects[projectIndex].tasks[taskIndex].snippets) {
      updatedProjects[projectIndex].tasks[taskIndex].snippets = []
    }
    updatedProjects[projectIndex].tasks[taskIndex].snippets.push(newSnippetId)

    const withActivity = appendProjectActivity(
      updatedProjects,
      projectIndex,
      buildActivityEntry(
        ACTIVITY_TYPES.SNIPPET_SAVED,
        `Saved snippet: ${snippetTitle}`,
        { taskIndex }
      )
    )

    logActivity({
      type: "snippet_saved",
      message: `Saved snippet "${snippetTitle}"`,
      projectId: projectIndex,
      projectTitle: updatedProjects[projectIndex].title
    })

    setProjects(withActivity)

    setGlobalSnippets([newSnippet, ...globalList])

    alert(`Snippet "${snippetTitle}" saved successfully!`)
  }

  const handleUnlinkSnippet = (snippetId) => {
    const updatedProjects = [...projects]
    if (updatedProjects[projectIndex].tasks[taskIndex].snippets) {
      updatedProjects[projectIndex].tasks[taskIndex].snippets =
        updatedProjects[projectIndex].tasks[taskIndex].snippets.filter(id => id !== snippetId)
      setProjects(updatedProjects)
    }

    if (selectedFilePath === `snippet:${snippetId}`) {
      setSelectedFilePath("")
    }
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
            <button
              onClick={() => toggleDir(currentPath)}
              aria-expanded={isExpanded}
              aria-label={`Toggle folder ${node.name}`}
              className={`group flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none w-full text-left ${theme === "dark"
                ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                : "hover:bg-zinc-200 text-zinc-700 hover:text-black"
                }`}
            >
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <span className="text-sm shrink-0 select-none">
                  {isExpanded ? "📂" : "📁"}
                </span>
                <span className="truncate text-sm font-medium select-none">
                  {node.name}
                </span>
              </div>

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
                  className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </button>

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
          <button
            key={currentPath}
            onClick={() => setSelectedFilePath(currentPath)}
            aria-selected={isSelected}
            aria-label={`Select file ${node.name}`}
            className={`group flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none w-full text-left ${isSelected
              ? "bg-blue-600 text-white font-medium shadow-sm"
              : theme === "dark"
                ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                : "hover:bg-zinc-200 text-zinc-700 hover:text-black"
              }`}
          >
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              {getFileIcon(node.name, isSelected)}
              <span className="truncate text-sm select-none">
                {node.name}
              </span>
            </div>

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
                  ? "text-white hover:bg-red-500/30"
                  : "text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                  }`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </button>
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
  const snippetsCount = task?.snippets ? task.snippets.length : 0
  const codeExecuted = !!task?.projectRan
  const runCount = task?.terminalHistory ? task.terminalHistory.length : 0
  const progressPercent = task?.progress || 0
  const taskTemplate = detectTaskTemplate(task)

  return (
    <div
      className={`min-h-screen p-6 ${theme === "dark"
        ? "bg-zinc-950 text-white"
        : "bg-white text-black"
        }`}
    >
      {/* BACK BUTTON */}
      <button
        onClick={() => router.push(`/projects/${projectIndex}`)}
        className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${theme === "dark"
          ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
          }`}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {task.title}
          </h1>
          <p
            className={`mt-2 text-sm ${theme === "dark"
              ? "text-zinc-400"
              : "text-zinc-600"
              }`}
          >
            Workspace Environment • <span className="font-semibold text-blue-500">{taskTemplate} Mode</span>
          </p>
        </div>
      </div>

      <ProjectSubNav projectIndex={projectIndex} />

      {/* IDE split layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-8">

        {/* EXPLORER SIDEBAR */}
        <div
          className={`w-full lg:w-[260px] shrink-0 border rounded-2xl p-5 flex flex-col justify-between min-h-[580px] ${theme === "dark"
            ? "bg-zinc-900 border-zinc-800 text-zinc-300"
            : "bg-zinc-100 border-zinc-300 text-black"
            }`}
        >
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/20">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                📂 Explorer
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
                <span className="text-sm text-zinc-400 italic p-4 text-center">
                  No files in task
                </span>
              )}
            </div>

            {/* Snippets Section */}
            <div className="flex flex-col mt-4 pt-3 border-t border-zinc-800/25">
              <h3 className="font-semibold text-sm flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-800/20 text-zinc-400">
                <span>📝 Task Snippets</span>
              </h3>

              <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] pr-1">
                {taskSnippets.length > 0 ? (
                  taskSnippets.map((snippet) => {
                    const isSelected = selectedFilePath === `snippet:${snippet.id}`
                    return (
                      <button
                        key={snippet.id}
                        onClick={() => setSelectedFilePath(`snippet:${snippet.id}`)}
                        aria-selected={isSelected}
                        aria-label={`Select snippet ${snippet.title}`}
                        className={`group flex items-center justify-between px-3 py-1 rounded-lg cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none w-full text-left ${isSelected
                          ? "bg-blue-600 text-white font-medium shadow-sm"
                          : theme === "dark"
                            ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                            : "hover:bg-zinc-200 text-zinc-700 hover:text-black"
                          }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <FileText size={14} className={isSelected ? "text-white" : "text-zinc-400"} />
                          <span className="truncate text-sm">
                            {snippet.title}
                          </span>
                        </div>

                        {/* Unlink Action */}
                        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            title="Unlink"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnlinkSnippet(snippet.id)
                            }}
                            className={`p-0.5 rounded transition-colors ${isSelected
                              ? "text-white hover:bg-white/20"
                              : "text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                              }`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <span className="text-xs text-zinc-400 italic p-2 text-center">
                    No linked snippets
                  </span>
                )}
              </div>
            </div>

            {/* Task Progress & Statistics Section */}
            <div className="flex flex-col mt-4 pt-3 border-t border-zinc-800/25">
              <h3 className="font-semibold text-sm mb-2 pb-1.5 border-b border-zinc-800/20 text-zinc-400">
                📊 Workspace Statistics
              </h3>

              <div className="flex flex-col gap-2.5">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-medium text-zinc-400">
                    <span>Task Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Statistics checklist */}
                <div className="text-[11px] space-y-1 text-zinc-400 font-medium bg-zinc-950/45 p-2.5 rounded-lg border border-zinc-800/40">
                  <div className="flex justify-between items-center">
                    <span>Files Created:</span>
                    <span className="text-zinc-200">{totalFilesCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Snippets Saved:</span>
                    <span className="text-zinc-200">{snippetsCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Code Executed:</span>
                    <span className={codeExecuted ? "text-green-400 font-bold" : "text-zinc-400"}>
                      {codeExecuted ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Project Runs:</span>
                    <span className="text-zinc-200">{runCount}</span>
                  </div>
                </div>

                {/* Mark as finished toggle */}
                <label htmlFor="mark-finished" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-400 cursor-pointer hover:bg-blue-500/20 transition-all select-none focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    id="mark-finished"
                    type="checkbox"
                    checked={userMarkedFinished}
                    onChange={(e) => {
                      let updatedProjects = [...projects]
                      updatedProjects[projectIndex].tasks[taskIndex].userMarkedFinished = e.target.checked

                      if (e.target.checked) {
                        updatedProjects = appendProjectActivity(
                          updatedProjects,
                          projectIndex,
                          buildActivityEntry(
                            ACTIVITY_TYPES.TASK_COMPLETED,
                            `Completed task: ${task.title}`,
                            { taskIndex }
                          )
                        )

                        logActivity({
                          type: "task_completed",
                          message: `Completed task "${task.title}"`,
                          projectId: projectIndex,
                          projectTitle: updatedProjects[projectIndex].title,
                          taskId: taskIndex
                        })
                      }

                      setProjects(updatedProjects)
                    }}
                    className="accent-blue-500 rounded cursor-pointer scale-90"
                  />
                  Mark workspace as finished
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANE: EDITOR & OUTPUT */}
        <div className="flex-1 flex flex-col gap-6">

          {/* CODE EDITOR */}
          <div
            className={`border rounded-2xl p-5 ${theme === "dark"
              ? "bg-zinc-900 border-zinc-800"
              : "bg-zinc-100 border-zinc-300"
              }`}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span>Code Editor</span>
              {selectedFilePath && (
                <span className={`text-xs px-2 py-1 rounded font-mono ${theme === "dark" ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600"}`}>
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

                  if (selectedFilePath.startsWith("snippet:")) {
                    const snippetId = selectedFilePath.replace("snippet:", "")
                    const saved = localStorage.getItem("devboard-snippets")
                    const globalList = saved ? JSON.parse(saved) : []
                    const updatedList = globalList.map(s => {
                      if (s.id === snippetId) {
                        return { ...s, code: newCode }
                      }
                      return s
                    })
                    localStorage.setItem("devboard-snippets", JSON.stringify(updatedList))
                  } else {
                    const updatedProjects = [...projects]
                    if (!updatedProjects[projectIndex].tasks[taskIndex].files) {
                      updatedProjects[projectIndex].tasks[taskIndex].files = []
                    }

                    updatedProjects[projectIndex].tasks[taskIndex].files = updateFileInTree(
                      updatedProjects[projectIndex].tasks[taskIndex].files,
                      selectedFilePath,
                      { code: newCode }
                    )
                    updatedProjects[projectIndex].tasks[taskIndex].fileEdited = true

                    setProjects(updatedProjects)
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
              <button
                onClick={handleRunTask}
                disabled={!selectedFilePath}
                className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-sm transition-colors text-sm ${
                  selectedFilePath
                    ? "bg-green-600 hover:bg-green-500 cursor-pointer"
                    : "bg-zinc-600 cursor-not-allowed opacity-50"
                }`}
              >
                ▶ Run Task
              </button>

              <button
                onClick={handleSaveAsSnippet}
                disabled={!selectedFilePath || selectedFile?.isSnippet}
                className={`px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors text-sm ${
                  selectedFilePath && !selectedFile?.isSnippet
                    ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 cursor-not-allowed opacity-50"
                }`}
              >
                📝 Save as Snippet
              </button>
            </div>
          </div>

          {/* TERMINAL & PREVIEW SPLIT VIEW */}
          <div
            className={`border rounded-2xl overflow-hidden ${previewFullscreen ? "fixed inset-0 z-50 rounded-none" : ""} ${theme === "dark"
              ? "bg-zinc-900 border-zinc-800 text-zinc-300"
              : "bg-zinc-100 border-zinc-300 text-black"
              }`}
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
                    className={`pb-1.5 pt-1 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                      terminalTab === "preview"
                        ? "border-blue-500 text-white"
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
                  className={`pb-1.5 pt-1 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                    terminalTab === "console"
                      ? "border-blue-500 text-white"
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
                    className={`pb-1.5 pt-1 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                      terminalTab === "terminal"
                        ? "border-blue-500 text-white"
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
                    className={`pb-1.5 pt-1 transition-all border-b-2 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                      terminalTab === "history"
                        ? "border-blue-500 text-white"
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
                    onClick={handleClearTerminal}
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
                    className="p-1 rounded hover:bg-black/10 text-zinc-400 hover:text-white transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
                {terminalTab === "preview" && (
                  <button
                    title={previewFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                    aria-label={previewFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                    onClick={() => setPreviewFullscreen(f => !f)}
                    className="p-1 rounded hover:bg-black/10 text-zinc-400 hover:text-white transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
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
                      <div className="text-zinc-400 italic p-6 text-center select-none">
                        No HTML build generated yet. Click "Run Task" to render the live webpage preview.
                      </div>
                    )
                  ) : taskTemplate === "React" ? (
                    <ReactMockupPreview task={task} />
                  ) : taskTemplate === "Next.js" ? (
                    <div className="p-4 bg-zinc-950 text-zinc-400 rounded-lg flex flex-col gap-2 select-none border border-zinc-800">
                      <p className="text-sky-400 font-bold flex items-center gap-1.5">
                        <span className="text-xs">▲</span> Next.js Starter Simulator
                      </p>
                      <p className="text-xs">This starter represents a Next.js App Router project structure.</p>
                      <p className="text-yellow-400 text-[11px]">⚠️ Runtime execution is not supported inside DevBoard X yet.</p>
                      <p className="text-zinc-400 text-[10px] border-t border-zinc-800/60 pt-2 mt-1">
                        Files like page.js and layout.js are safely persisted in task workspace context.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-950 text-zinc-400 rounded-lg flex flex-col gap-2 select-none border border-zinc-800">
                      <p className="text-green-400 font-bold flex items-center gap-1.5">
                        <span className="text-xs">🟢</span> {taskTemplate} Execution Environment
                      </p>
                      <p className="text-xs">Entry file: {taskTemplate === "Express" ? "server.js" : "index.js"}</p>
                      <p className="text-red-400 text-[11px]">
                        ⚠️ {taskTemplate === "Express" 
                          ? "Server execution is not available inside browser environment." 
                          : "Node runtime required. Backend execution environment not available."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {terminalTab === "console" && (
                <div className="flex flex-col gap-1.5">
                  {task?.terminalHistory && task.terminalHistory.length > 0 ? (
                    task.terminalHistory.map((log, index) => (
                      <div key={index} className="flex items-start gap-2 whitespace-pre-wrap">
                        <span className="text-zinc-400 shrink-0 select-none">
                          [{log.timestamp}]
                        </span>
                        <span className={log.type === "error" ? "text-red-400" : "text-emerald-400"}>
                          {log.text}
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <p className="text-zinc-400 mb-1">
                        $ devboard run
                      </p>
                      <pre className="whitespace-pre-wrap text-zinc-400 italic select-none">
                        Console output empty. Run task to execute code scripts...
                      </pre>
                    </>
                  )}
                </div>
              )}

              {terminalTab === "terminal" && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-zinc-400 flex items-center gap-2 mb-2 select-none">
                    <span className="text-emerald-500 font-bold">devboard</span>
                    <span className="text-zinc-600">~/{task?.title || "workspace"}</span>
                    <span className="text-zinc-700">$</span>
                  </div>
                  {task?.terminalHistory && task.terminalHistory.length > 0 ? (
                    task.terminalHistory.map((log, index) => (
                      <div key={index} className="flex items-start gap-2 whitespace-pre-wrap">
                        <span className="text-zinc-400 shrink-0 select-none">
                          [{log.timestamp}]
                        </span>
                        <span className={log.type === "error" ? "text-red-400" : "text-emerald-400"}>
                          {log.text}
                        </span>
                      </div>
                    ))
                  ) : (
                    <pre className="whitespace-pre-wrap text-zinc-400 italic select-none">
                      Terminal ready. Run task to see output...
                    </pre>
                  )}
                </div>
              )}

              {terminalTab === "history" && (
                <div className="flex flex-col gap-2">
                  {task?.commandHistory && task.commandHistory.length > 0 ? (
                    task.commandHistory.slice().reverse().map((cmd, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800/40 gap-3 hover:border-zinc-700 transition"
                      >
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="text-[10px] text-zinc-400 select-none">
                            Run at {cmd.timestamp}
                          </span>
                          <span className="truncate text-zinc-300 font-mono">
                            {cmd.command.length > 60 ? `${cmd.command.substring(0, 60)}...` : cmd.command}
                          </span>
                        </div>
                        <button
                          title="Restore in editor"
                          onClick={() => handleLoadCommand(cmd.command)}
                          className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-[10px] font-semibold text-white shrink-0 transition"
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
          </div>

        </div>

      </div>
    </div>
  )
}