"use client"
import Editor from "@monaco-editor/react"
import { useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { useTheme } from "@/context/ThemeContext"
import { useProjects } from "@/context/ProjectContext"

export default function TaskWorkspacePage() {

  const router = useRouter()
  const params = useParams()

  const { theme } = useTheme()
  const { projects, setProjects } = useProjects()

  const projectIndex = Number(params.id)
  const taskIndex = Number(params.taskId)

  const project = projects[projectIndex]
  const task = project?.tasks?.[taskIndex]

  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const selectedFile = task?.files?.[selectedFileIndex]


  const [code, setCode] = useState(
    selectedFile?.code || ""
  )

  const [output, setOutput] = useState(
    selectedFile?.output || ""
  )

  if (!project || !task) {

    return (

      <div
        className={`min-h-screen p-6 ${
          theme === "dark"
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

  const handleRunCode = () => {

    try {

      let result = ""

      const originalLog = console.log

      console.log = (...args) => {
        result += args.join(" ") + "\n"
      }

      eval(code)

      console.log = originalLog

      setOutput(result || "Code executed successfully.")

      const updatedProjects = [...projects]

      updatedProjects[projectIndex]
        .tasks[taskIndex]
        .files[selectedFileIndex]
        .code = code

      updatedProjects[projectIndex]
        .tasks[taskIndex]
        .files[selectedFileIndex]
        .output = result

      setProjects(updatedProjects)

    }

    catch (error) {

      setOutput(error.message)

      const updatedProjects = [...projects]

      updatedProjects[projectIndex]
        .tasks[taskIndex]
        .files[selectedFileIndex]
        .output = error.message

      setProjects(updatedProjects)

    }

  }

  return (

    <div
      className={`min-h-screen p-6 ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
      }`}
    >

      {/* BACK BUTTON */}

      <button
        onClick={() =>
          router.push(`/projects/${projectIndex}`)
        }
        className={`mb-8 flex items-center gap-2 px-4 py-2 rounded-xl ${
          theme === "dark"
            ? "bg-zinc-900 hover:bg-zinc-800"
            : "bg-zinc-100 hover:bg-zinc-200"
        }`}
      >

        <ArrowLeft size={18} />

        Back

      </button>

      {/* HEADER */}

      <h1 className="text-4xl font-bold">
        {task.title}
      </h1>

      <p
        className={`mt-2 ${
          theme === "dark"
            ? "text-zinc-400"
            : "text-zinc-600"
        }`}
      >
        Task Workspace
      </p>

      <div className="mb-4">

        <h3 className="mb-3 font-semibold">
          Files
        </h3>

        <div className="flex flex-wrap gap-2">

          {task.files?.map((file, index) => (

            <button
              key={index}
              onClick={() => {

                setSelectedFileIndex(index)

                setCode(
                  file.code || ""
                )

                setOutput(
                  file.output || ""
                )

              }}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedFileIndex === index
                  ? "bg-blue-500 text-white"
                  : theme === "dark"
                  ? "bg-zinc-800 text-zinc-300"
                  : "bg-zinc-200 text-black"
              }`}
            >

              📄 {file.name}

            </button>

          ))}

        </div>

      </div>

      <button
        onClick={() => {

          const fileName =
            prompt("Enter file name")

          if (!fileName) return

          const updatedProjects =
            [...projects]

          updatedProjects[
            projectIndex
          ].tasks[
            taskIndex
          ].files.push({
            name: fileName,
            code: "",
            output: ""
          })

          setProjects(updatedProjects)

        }}
        className="
          mb-4
          px-4
          py-2
          rounded-lg
          bg-green-500
          text-white
        "
      >

        + New File

      </button>

      {/* CODE EDITOR */}

      <div
        className={`mt-8 border rounded-2xl p-5 ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
        }`}
      >

        <h2 className="text-xl font-semibold mb-4">
          Code Editor
        </h2>

        <div className="overflow-hidden rounded-xl border border-zinc-800">

          <Editor
            height="400px"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) =>
              setCode(value || "")
            }
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

        <button
          onClick={handleRunCode}
          className="mt-4 px-5 py-3 rounded-xl bg-green-500 text-white"
        >
          ▶ Run
        </button>

      </div>

      {/* OUTPUT */}

      <div
        className={`mt-6 border rounded-2xl p-5 ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
        }`}
      >

        <h2 className="text-xl font-semibold mb-4">
          Terminal Output
        </h2>

        <div
          className="
            bg-black
            rounded-xl
            p-4
            min-h-[150px]
            font-mono
            text-green-400
            border
            border-zinc-800
          "
        >

          <p className="text-zinc-500 mb-3">
            $ Running JavaScript...
          </p>

          <pre className="whitespace-pre-wrap">
            {output || "Waiting for execution..."}
          </pre>

        </div>

      </div>

    </div>

  )

}