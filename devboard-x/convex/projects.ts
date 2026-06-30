import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { logActivityEvent } from "./activity";

export const getProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    return await ctx.db.query("projects").withIndex("by_user", q => q.eq("userId", userId)).order("desc").collect();
  },
});

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) return null;
    return project;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const projectId = await ctx.db.insert("projects", {
      ...args,
      userId,
    });
    await logActivityEvent(ctx, {
      type: "project_created",
      message: `Created project: ${args.title}`,
      projectId,
    });
    return projectId;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) throw new Error("Unauthorized");
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    await logActivityEvent(ctx, {
      type: "project_updated",
      message: `Updated project settings for: ${args.title}`,
      projectId: id,
    });
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const project = await ctx.db.get(args.id);
    if (project && project.userId === userId) {
      await logActivityEvent(ctx, {
        type: "project_deleted",
        message: `Deleted project: ${project.title}`,
      });
      await ctx.db.delete(args.id);

      // Cascade delete tasks, their files, and execution logs
      const tasks = await ctx.db.query("tasks").withIndex("by_project", q => q.eq("projectId", args.id)).collect();
      for (const t of tasks) {
        const files = await ctx.db.query("files").withIndex("by_task", q => q.eq("taskId", t._id)).collect();
        for (const f of files) await ctx.db.delete(f._id);
        
        const logs = await ctx.db.query("execution_logs").withIndex("by_task", q => q.eq("taskId", t._id)).collect();
        for (const log of logs) await ctx.db.delete(log._id);
        
        await ctx.db.delete(t._id);
      }

      // Cascade delete resources
      const resources = await ctx.db.query("resources").withIndex("by_project", q => q.eq("projectId", args.id)).collect();
      for (const r of resources) await ctx.db.delete(r._id);
    }
  },
});
