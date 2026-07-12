import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { encryptToken, decryptToken } from "./crypto";

// Store a GitHub OAuth connection for the current user
export const storeConnection = mutation({
  args: {
    userId: v.string(),
    githubAccessToken: v.string(),
    githubUsername: v.string(),
    githubAvatarUrl: v.optional(v.string()),
    githubProfileUrl: v.string(),
    githubId: v.number(),
  },
  handler: async (ctx, args) => {
    // Encrypt the GitHub access token using AES-256-GCM before storage
    const encryptedToken = await encryptToken(args.githubAccessToken);

    // Check if a connection already exists for this user
    const existing = await ctx.db
      .query("github_connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        githubAccessToken: encryptedToken,
        githubUsername: args.githubUsername,
        githubAvatarUrl: args.githubAvatarUrl,
        githubProfileUrl: args.githubProfileUrl,
        githubId: args.githubId,
        connectedAt: new Date().toISOString(),
      });
      return existing._id;
    }

    // Create new connection
    const id = await ctx.db.insert("github_connections", {
      userId: args.userId,
      githubAccessToken: encryptedToken,
      githubUsername: args.githubUsername,
      githubAvatarUrl: args.githubAvatarUrl,
      githubProfileUrl: args.githubProfileUrl,
      githubId: args.githubId,
      connectedAt: new Date().toISOString(),
    });

    return id;
  },
});

// Get the GitHub connection for a specific user
export const getConnection = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return null;

    const connection = await ctx.db
      .query("github_connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!connection) return null;

    // Return connection data WITHOUT the access token for security
    return {
      _id: connection._id,
      githubUsername: connection.githubUsername,
      githubAvatarUrl: connection.githubAvatarUrl,
      githubProfileUrl: connection.githubProfileUrl,
      githubId: connection.githubId,
      connectedAt: connection.connectedAt,
    };
  },
});

// Delete a GitHub connection (disconnect)
export const deleteConnection = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("github_connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (connection) {
      await ctx.db.delete(connection._id);
      return true;
    }

    return false;
  },
});

// INTERNAL: Get the decrypted GitHub token for a user
export const getDecryptedToken = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("github_connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!connection || !connection.githubAccessToken) {
      return null;
    }

    try {
      const decrypted = await decryptToken(connection.githubAccessToken);
      return decrypted;
    } catch (err) {
      console.error("Failed to decrypt GitHub token for user:", args.userId);
      return null;
    }
  },
});

// Link a project to a GitHub repository
export const linkProjectToRepo = mutation({
  args: {
    projectId: v.id("projects"),
    repoId: v.number(),
    repoName: v.string(),
    repoUrl: v.string(),
    defaultBranch: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      githubRepoId: args.repoId,
      githubRepoName: args.repoName,
      githubRepoUrl: args.repoUrl,
      githubRepoDefaultBranch: args.defaultBranch,
      lastSyncedAt: new Date().toISOString(),
    });
  },
});

// Update project sync time
export const updateProjectSyncTime = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      lastSyncedAt: new Date().toISOString(),
    });
  },
});
// INTERNAL: Get project data for publishing
export const getProjectPublishData = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const tasksWithFiles = await Promise.all(
      tasks.map(async (task) => {
        const files = await ctx.db
          .query("files")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();
        return { ...task, files };
      })
    );

    return {
      project,
      tasks: tasksWithFiles,
    };
  },
});
