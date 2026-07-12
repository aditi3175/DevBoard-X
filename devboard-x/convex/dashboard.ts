import { query } from "./_generated/server";

export const getDashboardMetrics = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    // Get 5 most recent projects
    const recentProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    // Get 10 recent activity logs
    const recentActivity = await ctx.db
      .query("activity")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);

    // Get upcoming tasks (incomplete, order by nearest due date or just latest)
    // Convex doesn't support complex multi-field sorts easily without custom indexes, 
    // so we'll just fetch recent incomplete tasks
    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const upcomingTasks = allTasks.filter(t => !t.completed).slice(0, 5);
    const upcomingTasksWithProjects = await Promise.all(upcomingTasks.map(async (t) => {
      const project = await ctx.db.get(t.projectId);
      return { ...t, projectTitle: project?.title || "Unknown" };
    }));

    const recentProjectsWithStats = recentProjects.map((p) => {
      const pTasks = allTasks.filter(t => t.projectId === p._id);
      const total = pTasks.length;
      const completed = pTasks.filter(t => t.completed).length;
      const overdue = pTasks.filter(t => 
        !t.completed && t.dueDate && new Date(t.dueDate).setHours(23, 59, 59, 999) < Date.now()
      ).length;
      return { ...p, taskStats: { total, completed, overdue } };
    });

    const rawRecentFiles = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);
      
    const recentFiles = await Promise.all(rawRecentFiles.map(async (f) => {
      const task = await ctx.db.get(f.taskId);
      return { ...f, projectId: task?.projectId, taskTitle: task?.title || "Unknown" };
    }));

    return {
      recentProjects: recentProjectsWithStats,
      recentActivity,
      upcomingTasks: upcomingTasksWithProjects,
      recentFiles
    };
  }
});
