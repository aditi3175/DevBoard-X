import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllFiles = query({
  handler: async (ctx) => {
    return await ctx.db.query("files").collect();
  },
});

export const getFiles = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const getFileTree = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    // The backend can return the flat array, but since the prompt says "getFileTree",
    // we could assemble the tree here. However, to keep it simple and let the frontend 
    // inject code easily, returning the flat normalized records is standard for REST/GraphQL.
    // The frontend ProjectContext will build the actual tree.
    return files;
  },
});

export const createFile = mutation({
  args: {
    taskId: v.id("tasks"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
    language: v.optional(v.string()),
    extension: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("files", {
      ...args,
      type: "file",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createFolder = mutation({
  args: {
    taskId: v.id("tasks"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("files", {
      ...args,
      type: "folder",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const renameFile = mutation({
  args: {
    id: v.id("files"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const moveFile = mutation({
  args: {
    id: v.id("files"),
    parentId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      parentId: args.parentId,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    // We should delete the file and all its children recursively
    const deleteRecursively = async (fileId: any) => {
      const children = await ctx.db
        .query("files")
        .withIndex("by_parent", (q) => q.eq("parentId", fileId))
        .collect();
      
      for (const child of children) {
        await deleteRecursively(child._id);
      }
      await ctx.db.delete(fileId);
    };

    await deleteRecursively(args.id);
  },
});
