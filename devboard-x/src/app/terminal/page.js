import Terminal from "@/components/layout/Terminal"

export default function TerminalPage() {
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-4xl font-bold">Terminal</h1>
      <p className="text-zinc-500">Execute commands and monitor your system</p>
      <div className="mt-6">
        <Terminal />
      </div>
    </div>
  )
}