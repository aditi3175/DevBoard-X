import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { logActivityEvent } from "./activity";

export const getAllFiles = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const files = await ctx.db.query("files").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    return files.map(f => ({ ...f, code: undefined }));
  },
});

export const getFiles = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const files = await ctx.db
      .query("files")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    return files.filter(f => f.userId === userId).map(f => ({ ...f, code: undefined }));
  },
});

export const getFileTree = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const files = await ctx.db
      .query("files")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    return files.filter(f => f.userId === userId).map(f => ({ ...f, code: undefined }));
  },
});

export const getFileContent = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const file = await ctx.db.get(args.id);
    if (!file || file.userId !== userId) return "";
    return file?.code ?? "";
  },
});

export const updateFileContent = mutation({
  args: {
    id: v.id("files"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const file = await ctx.db.get(args.id);
    if (!file || file.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, {
      code: args.code,
      updatedAt: new Date().toISOString(),
    });
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const now = new Date().toISOString();
    const fileId = await ctx.db.insert("files", {
      ...args,
      userId,
      type: "file",
      createdAt: now,
      updatedAt: now,
    });

    const task = await ctx.db.get(args.taskId);
    if (task && task.userId === userId) {
      await logActivityEvent(ctx, {
        type: "file_created",
        message: `Created file: ${args.name}`,
        projectId: task.projectId,
        taskId: args.taskId,
      });
    }

    return fileId;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const now = new Date().toISOString();
    const folderId = await ctx.db.insert("files", {
      ...args,
      userId,
      type: "folder",
      createdAt: now,
      updatedAt: now,
    });

    const task = await ctx.db.get(args.taskId);
    if (task && task.userId === userId) {
      await logActivityEvent(ctx, {
        type: "folder_created",
        message: `Created folder: ${args.name}`,
        projectId: task.projectId,
        taskId: args.taskId,
      });
    }

    return folderId;
  },
});

export const renameFile = mutation({
  args: {
    id: v.id("files"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const file = await ctx.db.get(args.id);
    if (!file || file.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: new Date().toISOString(),
    });

    const task = await ctx.db.get(file.taskId);
    if (task) {
      await logActivityEvent(ctx, {
        type: "file_renamed",
        message: `Renamed ${file.type}: ${file.name} to ${args.name}`,
        projectId: task.projectId,
        taskId: file.taskId,
      });
    }
  },
});

export const moveFile = mutation({
  args: {
    id: v.id("files"),
    parentId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const file = await ctx.db.get(args.id);
    if (!file || file.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, {
      parentId: args.parentId,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const file = await ctx.db.get(args.id);
    if (!file || file.userId !== userId) return;

    const task = await ctx.db.get(file.taskId);
    if (task) {
      await logActivityEvent(ctx, {
        type: file.type === "folder" ? "folder_deleted" : "file_deleted",
        message: `Deleted ${file.type}: ${file.name}`,
        projectId: task.projectId,
        taskId: file.taskId,
      });
    }

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
