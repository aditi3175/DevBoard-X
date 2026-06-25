import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getProjects = query({
  handler: async (ctx) => {
    return await ctx.db.query("projects").order("desc").collect();
  },
});

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    techStack: v.array(v.string()),
    createdAt: v.string(),
    lastUpdatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
    });
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    techStack: v.array(v.string()),
    lastUpdatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
