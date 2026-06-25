import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSnippets = query({
  handler: async (ctx) => {
    // Placeholder for fetching global snippets
    return [];
  },
});

export const addSnippet = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    code: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    // Placeholder for adding a snippet
  },
});
