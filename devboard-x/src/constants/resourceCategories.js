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
  GitHub: "bg-bg-active text-text-main border-border-strong",
  Figma: "bg-primary/20 text-primary border-primary/30",
  "API Docs": "bg-info-bg text-info border-info/30",
  Deployment: "bg-success-bg text-success border-success/30",
  Database: "bg-warning-bg text-warning border-warning/30",
  Tutorial: "bg-info-bg text-info border-info/30",
  Article: "bg-bg-active text-text-muted border-border-subtle",
  Video: "bg-danger-bg text-danger border-danger/30",
  Other: "bg-bg-active text-text-muted border-border-strong"
}

export function getCategoryBadgeStyle(category) {
  return CATEGORY_BADGE_STYLES[category] || CATEGORY_BADGE_STYLES.Other
}
