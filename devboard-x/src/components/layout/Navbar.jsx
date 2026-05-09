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

        <button className="px-4 py-2 rounded-lg hover:bg-zinc-800 transition">
          Search
        </button>

        <button className="px-4 py-2 rounded-lg hover:bg-zinc-800 transition">
          Profile
        </button>

      </div>

    </div>
  )
}