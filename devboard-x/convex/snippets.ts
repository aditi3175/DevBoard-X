import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { logActivityEvent } from "./activity";

export const getSnippets = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const snippets = await ctx.db.query("snippets").withIndex("by_user", q => q.eq("userId", userId)).collect();
    
    return snippets.sort((a, b) => {
      // Sort favorites first
      if (a.favorite !== b.favorite) {
        return a.favorite ? -1 : 1;
      }
      // Then by recency
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending
    });
  },
});

export const getSnippet = query({
  args: { id: v.id("snippets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const snippet = await ctx.db.get(args.id);
    if (!snippet || snippet.userId !== userId) return null;
    return snippet;
  },
});

export const createSnippet = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    code: v.string(),
    language: v.string(),
    tags: v.array(v.string()),
    favorite: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const now = new Date().toISOString();
    const snippetId = await ctx.db.insert("snippets", {
      userId,
      title: args.title,
      description: args.description,
      code: args.code,
      language: args.language,
      tags: args.tags,
      favorite: args.favorite,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await logActivityEvent(ctx, {
      type: "snippet_created",
      message: `Created global snippet: ${args.title}`,
      snippetId,
    });

    return snippetId;
  },
});

export const updateSnippet = mutation({
  args: {
    id: v.id("snippets"),
    title: v.string(),
    description: v.optional(v.string()),
    code: v.string(),
    language: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const snippet = await ctx.db.get(args.id);
    if (!snippet || snippet.userId !== userId) throw new Error("Unauthorized");

    const now = new Date().toISOString();
    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      code: args.code,
      language: args.language,
      tags: args.tags,
      updatedAt: now,
    });
  },
});

export const deleteSnippet = mutation({
  args: { id: v.id("snippets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const snippet = await ctx.db.get(args.id);
    if (snippet && snippet.userId === userId) {
      await logActivityEvent(ctx, {
        type: "snippet_deleted",
        message: `Deleted snippet: ${snippet.title}`,
      });
      await ctx.db.delete(args.id);
    }
  },
});

export const toggleFavorite = mutation({
  args: { 
    id: v.id("snippets"),
    favorite: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const snippet = await ctx.db.get(args.id);
    if (!snippet || snippet.userId !== userId) throw new Error("Unauthorized");

    const now = new Date().toISOString();
    await ctx.db.patch(args.id, {
      favorite: args.favorite,
      updatedAt: now,
    });
  },
});

export const incrementUsage = mutation({
  args: { id: v.id("snippets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const snippet = await ctx.db.get(args.id);
    if (snippet && snippet.userId === userId) {
      await ctx.db.patch(args.id, {
        usageCount: snippet.usageCount + 1,
      });

      await logActivityEvent(ctx, {
        type: "snippet_used",
        message: `Used snippet: ${snippet.title}`,
        snippetId: args.id,
      });
    }
  },
});
