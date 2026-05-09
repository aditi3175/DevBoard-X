import { Search, Bell, User } from "lucide-react"
export default function Navbar() {
  return (
    <div className="h-16 w-full bg-zinc-900 text-white px-6 flex items-center justify-between">

      {/* Left Side */}
      <div>
        <h2 className="text-lg font-semibold">
          Dashboard
        </h2>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2 w-80 border border-zinc-700 focus-within:border-zinc-500 px-4 py-2 rounded-lg transition">
          <Search size={18} className="text-zinc-400" />
          <input
            type="text"
            placeholder="find it here!"
            className="w-full outline-none bg-transparent text-white text-sm placeholder-zinc-500"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-zinc-800 transition">
          <Bell size={18} />
          <span>notifications</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-zinc-800 transition">
          <User size={18} />
          <span>Profile</span>
        </button>

      </div>

    </div>
  )
}