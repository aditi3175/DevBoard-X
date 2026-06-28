import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (if you add auth later)
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }),

  // Projects table
  projects: defineTable({
    userId: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "Planning", "In Progress", "Completed", "On Hold"
    techStack: v.array(v.string()),
    createdAt: v.string(),
    lastUpdatedAt: v.string(),
  }).index("by_user", ["userId"]),

  // Tasks table
  tasks: defineTable({
    userId: v.optional(v.string()),
    projectId: v.id("projects"),
    title: v.string(),
    priority: v.string(), // "Low", "Medium", "High"
    dueDate: v.optional(v.string()),
    completed: v.boolean(),
    progress: v.number(),
    template: v.string(), // "Blank", "HTML", "React", "Node.js"
    codeExecuted: v.boolean(),
    userMarkedFinished: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_project", ["projectId"]).index("by_user", ["userId"]),

  // Resources table
  resources: defineTable({
    userId: v.optional(v.string()),
    projectId: v.id("projects"),
    title: v.string(),
    url: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    pinned: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_project", ["projectId"]).index("by_user", ["userId"]),

  // Virtual File System table
  files: defineTable({
    userId: v.optional(v.string()),
    taskId: v.id("tasks"),
    parentId: v.optional(v.id("files")), // nullable for root
    name: v.string(),
    type: v.union(v.literal("file"), v.literal("folder")),
    language: v.optional(v.string()),
    extension: v.optional(v.string()),
    order: v.number(),
    code: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_task", ["taskId"]).index("by_parent", ["parentId"]).index("by_user", ["userId"]),

  // Snippets table
  snippets: defineTable({
    userId: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    code: v.string(),
    language: v.string(),
    tags: v.array(v.string()),
    favorite: v.boolean(),
    usageCount: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]),

  // Activity table
  activity: defineTable({
    userId: v.optional(v.string()),
    type: v.string(),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    resourceId: v.optional(v.id("resources")),
    snippetId: v.optional(v.id("snippets")),
    message: v.string(),
    metadata: v.optional(v.any()), // flexible payload for extra context
    createdAt: v.string(),
  }).index("by_project", ["projectId"]).index("by_user", ["userId"]),
  
  // Execution logs table
  execution_logs: defineTable({
    userId: v.optional(v.string()),
    taskId: v.id("tasks"),
    fileId: v.optional(v.id("files")),
    command: v.optional(v.string()),
    output: v.string(),
    status: v.string(), // "success", "error", "running"
    startedAt: v.string(),
    finishedAt: v.optional(v.string()),
    duration: v.optional(v.number()),
    exitCode: v.optional(v.number()),
  }).index("by_task", ["taskId"]).index("by_user", ["userId"]),

  // Command history table
  command_history: defineTable({
    userId: v.optional(v.string()),
    taskId: v.id("tasks"),
    command: v.string(),
    executedAt: v.string(),
  }).index("by_task", ["taskId"]).index("by_user", ["userId"]),
});
