export default function WidgetCard({Icon, title, value, color}) {
  return (
    
    <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
      {/* Left side: Icon + Text */}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-zinc-400 font-medium">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>

      {/* Right side: Trend */}
      <div className="text-right">
        <span className="text-green-400 font-semibold">+5.2%</span>
        <p className="text-zinc-500 text-sm">vs last month</p>
      </div>
      
    </div>
  )
}