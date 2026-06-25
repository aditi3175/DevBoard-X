import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getResources = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Placeholder for fetching resources for a specific project
    return [];
  },
});

export const addResource = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    url: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Placeholder for adding a resource
  },
});
