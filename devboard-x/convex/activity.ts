import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getActivity = query({
  args: { projectId: v.optional(v.id("projects")) },
  handler: async (ctx, args) => {
    // Placeholder for fetching activity logs
    return [];
  },
});

export const logActivity = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Placeholder for logging activity
  },
});
