import { v } from "convex/values";
import { query } from "./_generated/server";

export const globalSearch = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const queryLower = args.query.toLowerCase();
    
    // We fetch everything and filter in-memory since Convex doesn't have 
    // built-in full-text search without specific index configurations,
    // and this is sufficient for a workspace OS scale.
    
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
      
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
      
    const snippets = await ctx.db
      .query("snippets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
      
    const resources = await ctx.db
      .query("resources")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const results = [];

    // Search Projects
    for (const p of projects) {
      if (p.title.toLowerCase().includes(queryLower) || 
          (p.description && p.description.toLowerCase().includes(queryLower))) {
        results.push({
          id: `project-${p._id}`,
          category: "project",
          title: p.title,
          subtitle: p.description || "No description",
          route: `/projects/${p._id}`
        });
      }
    }

    // Search Tasks
    for (const t of tasks) {
      if (t.title.toLowerCase().includes(queryLower)) {
        
        const project = projects.find(p => p._id === t.projectId);
        results.push({
          id: `task-${t._id}`,
          category: "task",
          title: t.title,
          subtitle: `In ${project?.title || "Unknown Project"}`,
          route: `/projects/${t.projectId}/tasks/${t._id}`
        });
      }
    }

    // Search Snippets
    for (const s of snippets) {
      if (s.title.toLowerCase().includes(queryLower) || 
          (s.description && s.description.toLowerCase().includes(queryLower)) ||
          s.language.toLowerCase().includes(queryLower)) {
        results.push({
          id: `snippet-${s._id}`,
          category: "snippet",
          title: s.title,
          subtitle: s.description || `Language: ${s.language}`,
          route: `/snippets`
        });
      }
    }

    // Search Resources
    for (const r of resources) {
      if (r.title.toLowerCase().includes(queryLower) || 
          (r.description && r.description.toLowerCase().includes(queryLower)) ||
          r.url.toLowerCase().includes(queryLower)) {
        const project = projects.find(p => p._id === r.projectId);
        results.push({
          id: `resource-${r._id}`,
          category: "resource",
          title: r.title,
          subtitle: r.url,
          route: `/projects/${r.projectId}/resources`
        });
      }
    }

    return results;
  }
});
