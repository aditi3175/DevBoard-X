export const RESOURCE_CATEGORIES = [
  "GitHub",
  "Figma",
  "API Docs",
  "Deployment",
  "Database",
  "Tutorial",
  "Article",
  "Design",
  "Other"
]

export const CATEGORY_BADGE_STYLES = {
  GitHub: "bg-zinc-800 text-zinc-200 border-zinc-700",
  Figma: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "API Docs": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Deployment: "bg-green-500/20 text-green-400 border-green-500/30",
  Database: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Tutorial: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Article: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Design: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
}

export function getCategoryBadgeStyle(category) {
  return CATEGORY_BADGE_STYLES[category] || CATEGORY_BADGE_STYLES.Other
}
