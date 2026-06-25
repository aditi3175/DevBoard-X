import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTasks = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Placeholder for fetching tasks for a specific project
    return [];
  },
});

export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    priority: v.string(),
    dueDate: v.optional(v.string()),
    template: v.string(),
  },
  handler: async (ctx, args) => {
    // Placeholder for creating a task
  },
});
