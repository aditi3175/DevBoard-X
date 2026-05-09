"use client" // Required in Next.js for interactivity/hooks
import { useState } from "react";
import { Layout, Terminal, FolderKanban, BarChart3, Settings } from "lucide-react";

export default function Sidebar() {
  // 1. Create the state (Default it to 'Dashboard')
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navItems = [
    { name: "Dashboard", icon: Layout },
    { name: "Terminal", icon: Terminal },
    { name: "Projects", icon: FolderKanban },
    { name: "Analytics", icon: BarChart3 },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-zinc-900 text-white p-4 flex flex-col border-r border-zinc-800">
      {/* Logo / Title */}
      <div className="mb-8 px-3">
        <h1 className="text-2xl font-bold tracking-tight">DevBoard X</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // 2. Check if this item is the active one
          const isActive = activeTab === item.name;

          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)} // 3. Update state on click
              className={`flex items-center gap-3 text-left px-3 py-2 rounded-lg transition ${
                isActive 
                  ? "bg-zinc-800 text-white" // Active styles
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white" // Inactive styles
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}