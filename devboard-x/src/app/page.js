import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Workspace from "@/components/layout/Workspace";

export default function Home() {
  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />

      {/* Main Content Area */} 
      <div className="flex-1 flex flex-col">
        <Navbar />
        <Workspace />
      </div>
    </div>
  )
}