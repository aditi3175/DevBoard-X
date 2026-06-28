import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logActivityEvent } from "./activity";

export const runTask = mutation({
  args: {
    taskId: v.id("tasks"),
    fileId: v.optional(v.id("files")),
    command: v.optional(v.string()),
    output: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) throw new Error("Unauthorized");

    const now = new Date().toISOString();
    await ctx.db.insert("execution_logs", {
      userId,
      taskId: args.taskId,
      fileId: args.fileId,
      command: args.command,
      output: args.output,
      status: args.status,
      startedAt: now,
      finishedAt: now, // for synchronous execution
      duration: 0,
      exitCode: args.status === "error" ? 1 : 0,
    });
    
    // Also save command history if a command was run
    if (args.command) {
      await ctx.db.insert("command_history", {
        userId,
        taskId: args.taskId,
        command: args.command,
        executedAt: now,
      });
    }

    // Update task status
    await ctx.db.patch(args.taskId, {
      codeExecuted: true,
    });

    await logActivityEvent(ctx, {
      type: "task_executed",
      message: `Executed code for task: ${task.title}`,
      projectId: task.projectId,
      taskId: args.taskId,
    });
  },
});

export const appendConsoleOutput = mutation({
  args: {
    taskId: v.id("tasks"),
    output: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) throw new Error("Unauthorized");

    const now = new Date().toISOString();
    await ctx.db.insert("execution_logs", {
      userId,
      taskId: args.taskId,
      output: args.output,
      status: args.status,
      startedAt: now,
    });
  },
});

export const getExecutionHistory = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const logs = await ctx.db
      .query("execution_logs")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();

    return logs.filter(l => l.userId === userId);
  },
});

export const getCommandHistory = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const cmds = await ctx.db
      .query("command_history")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .collect();

    return cmds.filter(c => c.userId === userId);
  },
});

export const clearExecutionHistory = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const logs = await ctx.db
      .query("execution_logs")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    for (const log of logs) {
      if (log.userId === userId) {
        await ctx.db.delete(log._id);
      }
    }
  },
});

export const getLatestExecution = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const logs = await ctx.db
      .query("execution_logs")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .collect();
    
    return logs.find(l => l.userId === userId) || null;
  },
});
