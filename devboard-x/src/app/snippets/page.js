"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Trash2,
  Copy,
  Check,
  Pencil
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/context/ThemeContext"
import {
  Prism as SyntaxHighlighter
} from "react-syntax-highlighter"

import {
  oneDark,
  oneLight
} from "react-syntax-highlighter/dist/esm/styles/prism"

export default function SnippetsPage() {

  const router = useRouter()
  const { theme } = useTheme()

  // FORM STATE
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [language, setLanguage] = useState("")
  const [code, setCode] = useState("")
  const [search, setSearch] = useState("")
  const [copiedIndex, setCopiedIndex] = useState(null)

  // SNIPPETS STATE
  const [snippets, setSnippets] = useState([])

  // EDIT STATE
  const [editIndex, setEditIndex] = useState(null)

  // LOAD SNIPPETS
  useEffect(() => {

    const savedSnippets =
      localStorage.getItem("devboard-snippets")

    if (savedSnippets) {
      setSnippets(JSON.parse(savedSnippets))
    }

  }, [])

  // SAVE SNIPPETS
  useEffect(() => {

    localStorage.setItem(
      "devboard-snippets",
      JSON.stringify(snippets)
    )

  }, [snippets])

  // ADD / UPDATE SNIPPET
  const handleAddSnippet = () => {

    if (!title.trim() || !category || !language || !code.trim()) {
      alert("Please fill all the fields!")
      return
    }

    if (editIndex !== null) {

      const updatedSnippets = [...snippets]

      updatedSnippets[editIndex] = {
        title,
        category,
        code,
        language,
        createdAt:
          snippets[editIndex].createdAt
      }

      setSnippets(updatedSnippets)

      setEditIndex(null)

    }

    else {

      const newSnippet = {
        title,
        category,
        language,
        code,
        createdAt:
          new Date().toLocaleDateString()
      }

      setSnippets([
        newSnippet,
        ...snippets
      ])

    }

    setTitle("")
    setCategory("")
    setLanguage("")
    setCode("")

  }

  // DELETE SNIPPET
  const handleDeleteSnippet = (index) => {

    const updatedSnippets =
      snippets.filter((_, i) => i !== index)

    setSnippets(updatedSnippets)

  }

  // EDIT SNIPPET
  const handleEditSnippet = (index) => {

    const snippet = snippets[index]

    setTitle(snippet.title)
    setCategory(snippet.category)
    setCode(snippet.code)
    setLanguage(snippet.language)

    setEditIndex(index)

  }

  // SEARCH
  const filteredSnippets = snippets.filter((snippet) =>
    snippet.title
      .toLowerCase()
      .includes(search.toLowerCase())
    ||
    snippet.category
      .toLowerCase()
      .includes(search.toLowerCase())
    ||
    snippet.language
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const handleCopySnippet = (code, index) => {

    navigator.clipboard.writeText(code)

    setCopiedIndex(index)

    setTimeout(() => {

    setCopiedIndex(null)

  }, 2000)

}

  return (

    <div
      className={`min-h-screen p-6 transition ${
        theme === "dark"
          ? "bg-zinc-950 text-white"
          : "bg-white text-black"
      }`}
    >

      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/")}
        className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-xl transition ${
          theme === "dark"
            ? "bg-zinc-900 hover:bg-zinc-800 text-white"
            : "bg-zinc-100 hover:bg-zinc-200 text-black"
        }`}
      >

        <ArrowLeft size={18} />

        <span>
          Back
        </span>

      </button>

      {/* HEADER */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Code Snippets
        </h1>

        <p
          className={`mt-2 ${
            theme === "dark"
              ? "text-zinc-500"
              : "text-zinc-600"
          }`}
        >
          Store and organize reusable code.
        </p>

      </div>

      {/* FORM */}
      <div
        className={`border rounded-2xl p-5 mb-8 ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800"
            : "bg-zinc-100 border-zinc-300"
        }`}
      >

        <h2 className="text-2xl font-semibold mb-5">
          {
            editIndex !== null
              ? "Edit Snippet"
              : "Add New Snippet"
          }
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Snippet title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full border rounded-xl px-4 py-3 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                : "bg-white border-zinc-300 text-black placeholder-zinc-400"
            }`}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full border rounded-xl px-4 py-3 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white"
                : "bg-white border-zinc-300 text-black"
            }`}
          >
            <option value="" disabled>
              Select Category</option>

            <option>Configuration</option>
            <option>UI Component</option>
            <option>API</option>
            <option>Database</option>
            <option>Node.js</option>
            <option>Authentication</option>
            <option>Others</option>

          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`w-full border rounded-xl px-4 py-3 outline-none ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white"
                : "bg-white border-zinc-300 text-black"
            }`}
          >
            <option value="" disabled>
              Select Language
            </option>

            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="php">PHP</option>
            <option value="jsx">React JSX</option>
            <option value="tsx">React TSX</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="json">JSON</option>

          </select>

          <textarea
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`w-full min-h-[200px] border rounded-xl px-4 py-3 outline-none resize-none font-mono ${
              theme === "dark"
                ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
                : "bg-white border-zinc-300 text-black placeholder-zinc-400"
            }`}
          />

          <button
            onClick={handleAddSnippet}
            className={`px-5 py-3 rounded-xl font-medium transition ${
              theme === "dark"
                ? "bg-white text-black"
                : "bg-black text-white"
            }`}
          >
            {
              editIndex !== null
                ? "Update Snippet"
                : "Save Snippet"
            }
          </button>

        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-6">

        <input
          type="text"
          placeholder="Search snippets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full max-w-md border rounded-xl px-4 py-3 outline-none ${
            theme === "dark"
              ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
              : "bg-white border-zinc-300 text-black placeholder-zinc-400"
          }`}
        />

      </div>

      {/* SNIPPETS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {filteredSnippets.length === 0 && (

          <div
            className={`
              rounded-2xl
              border
              p-10
              text-center
              ${
                theme === "dark"
                  ? "border-zinc-800 bg-zinc-900"
                  : "border-zinc-300 bg-zinc-100"
              }
            `}
          >

            <h3 className="text-xl font-semibold">
              No Snippets Found
            </h3>

            <p className="mt-2 text-zinc-500">
              Save your first code snippet.
            </p>
          </div>

        )}

        {filteredSnippets.map((snippet, index) => (

          <div
            key={index}
            className={`border rounded-2xl p-5 ${
              theme === "dark"
                ? "bg-zinc-900 border-zinc-800"
                : "bg-zinc-100 border-zinc-300"
            }`}
          >

            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">

              <div>

                <h3 className="text-xl font-semibold">
                  {snippet.title}
                </h3>

                <span className="inline-block px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400
                    mt-1
                  "
                >
                  {snippet.category}
                </span>

                <span
                  className="
                    inline-block
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    bg-purple-500/20
                    text-purple-400
                    mt-2
                    ml-2"
                >
                  {snippet.language}
                </span>

              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    handleEditSnippet(index)
                  }
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() =>
                    handleCopySnippet(
                      snippet.code,
                      index
                    )
                  }
                  className="text-green-400 hover:text-green-300 transition"
                >
                  {
                    copiedIndex === index
                      ? <Check size={18} />
                      : <Copy size={18} />
                  }
                </button>

                <button
                  onClick={() =>
                    handleDeleteSnippet(index)
                  }
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>

            {/* CODE */}
            <SyntaxHighlighter
              language={
                snippet.language || "javascript"
              }
              style={
                theme === "dark"
                  ? oneDark
                  : oneLight
              }
              customStyle={{
                borderRadius: "12px",
                padding: "16px",
                margin: 0
              }}
            >

              {snippet.code}

            </SyntaxHighlighter>

            {/* FOOTER */}
            <p
              className={`text-xs mt-4 ${
                theme === "dark"
                  ? "text-zinc-500"
                  : "text-zinc-600"
              }`}
            >
              Created: {snippet.createdAt}
            </p>

          </div>

        ))}

      </div>

    </div>

  )

}