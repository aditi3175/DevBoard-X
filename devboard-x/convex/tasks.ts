import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const getTasks = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const getTask = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    priority: v.string(),
    dueDate: v.optional(v.string()),
    template: v.string(),
    completed: v.boolean(),
    progress: v.number(),
    codeExecuted: v.boolean(),
    userMarkedFinished: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.insert("tasks", {
      ...args,
    });

    const now = new Date().toISOString();

    const insertFile = async (name: string, type: "file" | "folder", parentId?: any) => {
      return await ctx.db.insert("files", {
        taskId: newTaskId,
        parentId,
        name,
        type,
        order: 0,
        createdAt: now,
        updatedAt: now,
      });
    };

    if (args.template === "HTML") {
      await insertFile("index.html", "file");
      await insertFile("style.css", "file");
      await insertFile("script.js", "file");
      await insertFile("assets", "folder");
    } else if (args.template === "React") {
      const srcId = await insertFile("src", "folder");
      await insertFile("public", "folder");
      await insertFile("package.json", "file");
      await insertFile("vite.config.js", "file");
      
      await insertFile("main.jsx", "file", srcId);
      await insertFile("App.jsx", "file", srcId);
      await insertFile("index.css", "file", srcId);
    } else if (args.template === "Next.js") {
      const appId = await insertFile("app", "folder");
      await insertFile("components", "folder");
      await insertFile("public", "folder");
      await insertFile("package.json", "file");
      
      await insertFile("layout.js", "file", appId);
      await insertFile("page.js", "file", appId);
      await insertFile("globals.css", "file", appId);
    } else if (args.template === "Node.js") {
      await insertFile("index.js", "file");
      await insertFile("package.json", "file");
      await insertFile(".env", "file");
    } else if (args.template === "Express") {
      await insertFile("server.js", "file");
      await insertFile("routes", "folder");
      await insertFile("controllers", "folder");
      await insertFile("middlewares", "folder");
      await insertFile("package.json", "file");
      await insertFile(".env", "file");
    } else if (args.template === "Blank") {
      await insertFile("README.md", "file");
    }

    return newTaskId;
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    template: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    progress: v.optional(v.number()),
    codeExecuted: v.optional(v.boolean()),
    userMarkedFinished: v.optional(v.boolean()),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
