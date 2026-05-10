"use client"
import { motion } from "framer-motion"
export default function WidgetCard({ Icon, title, value, color }) {
  return (
    
    <motion.div 
      whileHover={{
        y: -10,
        scale: 1.04
      }}
      transition={{
        type: "spring",
        stiffness: 300
      }}
      className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:shadow-xl transition">
      
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
      
    </motion.div>
  )
}