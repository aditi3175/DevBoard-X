import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logActivityEvent } from "./activity";

export const getResources = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const resources = await ctx.db
      .query("resources")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return resources.filter(r => r.userId === userId).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending
    });
  },
});

export const getResource = query({
  args: { id: v.id("resources") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const resource = await ctx.db.get(args.id);
    if (!resource || resource.userId !== userId) return null;
    return resource;
  },
});

export const createResource = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    url: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const now = new Date().toISOString();
    const resourceId = await ctx.db.insert("resources", {
      projectId: args.projectId,
      userId,
      title: args.title,
      url: args.url,
      category: args.category,
      description: args.description,
      pinned: args.pinned,
      createdAt: now,
      updatedAt: now,
    });

    await logActivityEvent(ctx, {
      type: "resource_added",
      message: `Added resource: ${args.title}`,
      projectId: args.projectId,
      resourceId,
    });

    return resourceId;
  },
});

export const updateResource = mutation({
  args: {
    id: v.id("resources"),
    title: v.string(),
    url: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const resource = await ctx.db.get(args.id);
    if (!resource || resource.userId !== userId) throw new Error("Unauthorized");

    const now = new Date().toISOString();
    await ctx.db.patch(args.id, {
      title: args.title,
      url: args.url,
      category: args.category,
      description: args.description,
      updatedAt: now,
    });
  },
});

export const deleteResource = mutation({
  args: { id: v.id("resources") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const resource = await ctx.db.get(args.id);
    if (resource && resource.userId === userId) {
      await logActivityEvent(ctx, {
        type: "resource_deleted",
        message: `Deleted resource: ${resource.title}`,
        projectId: resource.projectId,
      });
      await ctx.db.delete(args.id);
    }
  },
});

export const togglePinned = mutation({
  args: {
    id: v.id("resources"),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const resource = await ctx.db.get(args.id);
    if (!resource || resource.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      pinned: args.pinned,
      updatedAt: new Date().toISOString(),
    });
  },
});
