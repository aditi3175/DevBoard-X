import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper function to insert activity directly from other mutations
// Use this inside other mutations to automatically generate events.
export async function logActivityEvent(
  ctx: MutationCtx,
  args: {
    type: string;
    message: string;
    projectId?: Id<"projects">;
    taskId?: Id<"tasks">;
    resourceId?: Id<"resources">;
    snippetId?: Id<"snippets">;
    metadata?: any;
  }
) {
  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.subject;

  await ctx.db.insert("activity", {
    userId,
    type: args.type,
    message: args.message,
    projectId: args.projectId,
    taskId: args.taskId,
    resourceId: args.resourceId,
    snippetId: args.snippetId,
    metadata: args.metadata,
    createdAt: new Date().toISOString(),
  });
}

// Queries
export const getActivity = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const activities = await ctx.db.query("activity").withIndex("by_user", q => q.eq("userId", userId)).order("desc").take(100);

    return Promise.all(activities.map(async (act) => {
      let projectTitle = null;
      let taskTitle = null;
      if (act.projectId) {
        const proj = await ctx.db.get(act.projectId);
        if (proj) projectTitle = proj.title;
      }
      if (act.taskId) {
        const task = await ctx.db.get(act.taskId);
        if (task) taskTitle = task.title;
      }
      return { ...act, projectTitle, taskTitle };
    }));
  },
});

export const getProjectActivity = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const activities = await ctx.db
      .query("activity")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(100);

    const userActivities = activities.filter(a => a.userId === userId);

    return Promise.all(userActivities.map(async (act) => {
      let projectTitle = null;
      let taskTitle = null;
      if (act.projectId) {
        const proj = await ctx.db.get(act.projectId);
        if (proj) projectTitle = proj.title;
      }
      if (act.taskId) {
        const task = await ctx.db.get(act.taskId);
        if (task) taskTitle = task.title;
      }
      return { ...act, projectTitle, taskTitle };
    }));
  },
});

export const createActivity = mutation({
  args: {
    type: v.string(),
    message: v.string(),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    resourceId: v.optional(v.id("resources")),
    snippetId: v.optional(v.id("snippets")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await logActivityEvent(ctx, args);
  },
});

export const clearProjectActivity = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const activities = await ctx.db
      .query("activity")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    for (const activity of activities) {
      if (activity.userId === userId) {
        await ctx.db.delete(activity._id);
      }
    }
  },
});
