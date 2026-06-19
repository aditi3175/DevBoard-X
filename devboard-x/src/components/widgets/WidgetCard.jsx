"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/context/ThemeContext"

export default function WidgetCard({
  Icon,
  title,
  value,
  color
}) {

  const { theme } = useTheme()

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
      className={`flex items-center justify-between p-4 rounded-xl border transition hover:shadow-xl ${
        theme === "dark"
          ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
          : "bg-zinc-100 border-zinc-300 hover:border-zinc-400"
      }`}
    >

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">

        <div
          className={`p-3 rounded-lg ${color}`}
        >

          <Icon size={24} />

        </div>

        <div>

          <p
            className={`font-medium ${
              theme === "dark"
                ? "text-zinc-400"
                : "text-zinc-600"
            }`}
          >
            {title}
          </p>

          <h3
            className={`text-2xl font-bold ${
              theme === "dark"
                ? "text-white"
                : "text-black"
            }`}
          >
            {value}
          </h3>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="text-right">

        <span className="text-green-400 font-semibold">
          +5.2%
        </span>

        <p
          className={`text-sm ${
            theme === "dark"
              ? "text-zinc-500"
              : "text-zinc-600"
          }`}
        >
          vs last month
        </p>

      </div>

    </motion.div>

  )

}