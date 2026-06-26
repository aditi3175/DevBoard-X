import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (if you add auth later)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    // Add clerkId or similar when auth is integrated
  }),

  // Projects table
  projects: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "Planning", "In Progress", "Completed", "On Hold"
    techStack: v.array(v.string()),
    createdAt: v.string(),
    lastUpdatedAt: v.string(),
    // userId: v.id("users"), // Uncomment when auth is added
  }),

  // Tasks table
  tasks: defineTable({
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
  }).index("by_project", ["projectId"]),

  // Resources table
  resources: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    url: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    pinned: v.boolean(),
    createdAt: v.string(),
  }).index("by_project", ["projectId"]),

  // Virtual File System table
  files: defineTable({
    taskId: v.id("tasks"),
    parentId: v.optional(v.id("files")), // nullable for root
    name: v.string(),
    type: v.union(v.literal("file"), v.literal("folder")),
    language: v.optional(v.string()),
    extension: v.optional(v.string()),
    order: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_task", ["taskId"]).index("by_parent", ["parentId"]),

  // Snippets table
  snippets: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    code: v.string(),
    language: v.string(),
    createdAt: v.string(),
    // userId: v.id("users"), // Uncomment when auth is added
  }),

  // Activity table
  activity: defineTable({
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()), // flexible payload for extra context
    timestamp: v.string(),
  }).index("by_project", ["projectId"]),
});
