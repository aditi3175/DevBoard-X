import { query } from "./_generated/server";

export const getWorkspaceMetrics = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter out orphaned tasks and files
    const validProjectIds = new Set(projects.map(p => p._id));
    tasks = tasks.filter(t => validProjectIds.has(t.projectId));
    
    const validTaskIds = new Set(tasks.map(t => t._id));
    files = files.filter(f => validTaskIds.has(f.taskId));

    const resources = await ctx.db
      .query("resources")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const snippets = await ctx.db
      .query("snippets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const executions = await ctx.db
      .query("execution_logs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const activity = await ctx.db
      .query("activity")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status !== "Completed" && p.status !== "On Hold").length;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const totalFiles = files.length;
    const totalResources = resources.length;
    const totalSnippets = snippets.length;
    
    const totalExecutions = executions.length;
    const avgExecutionTime = totalExecutions === 0 ? 0 : 
      Math.round(executions.reduce((acc, log) => acc + (log.duration || 0), 0) / totalExecutions);

    const activeTasks = tasks.filter(t => !t.completed).length;
    const pendingTasks = activeTasks; // alias for dashboard compatibility
    const highPriority = tasks.filter(t => t.priority === "High").length;
    const mediumPriority = tasks.filter(t => t.priority === "Medium").length;
    const lowPriority = tasks.filter(t => t.priority === "Low").length;
    
    // Group activity by date
    const activityByDate = activity.reduce((acc: Record<string, { created: number; completed: number }>, act) => {
      const dateStr = act.createdAt.split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { created: 0, completed: 0 };
      if (act.type === 'task_created') acc[dateStr].created++;
      if (act.type === 'task_completed') acc[dateStr].completed++;
      return acc;
    }, {});
    // Calculate project performance
    const projectPerformance = projects.map(p => {
      const pTasks = tasks.filter(t => t.projectId === p._id);
      const tCount = pTasks.length;
      const completed = pTasks.filter(t => t.completed).length;
      
      const pExecs = executions.filter(e => pTasks.some(t => t._id === e.taskId)).length;
      const pActivity = activity.filter(a => a.projectId === p._id);
      const lastActivity = pActivity.length > 0 ? pActivity[0].createdAt : p.lastUpdatedAt;

      return {
        id: p._id,
        name: p.title,
        tasks: tCount,
        completion: tCount === 0 ? 0 : Math.round((completed / tCount) * 100),
        runs: pExecs,
        lastActivity
      };
    });

    return {
      workspace: {
        totalProjects,
        activeProjects,
        totalTasks,
        activeTasks,
        pendingTasks,
        completedTasks,
        completionRate,
        highPriority,
        mediumPriority,
        lowPriority,
        activeFiles: totalFiles,
        activeResources: totalResources,
        totalSnippets,
        totalExecutions,
        averageExecutionTime: avgExecutionTime,
        activityByDate,
        projectPerformance
      },
      lifetime: (() => {
        // Completed tasks for average completion time
        const completedTasksList = tasks.filter(t => t.completed);
        let averageTaskCompletionTime = 0;
        if (completedTasksList.length > 0) {
          const totalCompletionMs = completedTasksList.reduce((sum, t) => {
            const created = new Date(t.createdAt).getTime();
            const updated = new Date(t.updatedAt).getTime();
            return sum + (updated - created);
          }, 0);
          averageTaskCompletionTime = totalCompletionMs / completedTasksList.length;
        }

        // Most used language from snippets
        const langCounts: Record<string, number> = {};
        snippets.forEach(s => {
          langCounts[s.language] = (langCounts[s.language] || 0) + 1;
        });
        const mostUsedLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

        // Most used snippet
        const topSnippet = [...snippets].sort((a, b) => b.usageCount - a.usageCount)[0];
        const mostUsedSnippet = topSnippet?.title || "N/A";

        // Monthly activity data (last 6 months)
        const monthlyActivityData: { month: string; events: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStr = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const count = activity.filter(a => a.createdAt.startsWith(yearMonth)).length;
          monthlyActivityData.push({ month: monthStr, events: count });
        }

        // Execution history data (last 6 months)
        const executionHistoryData: { month: string; executions: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStr = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const count = executions.filter(e => e.startedAt.startsWith(yearMonth)).length;
          executionHistoryData.push({ month: monthStr, executions: count });
        }

        // Language distribution from snippets
        const languageDistribution = Object.entries(langCounts).map(([name, value]) => ({ name, value }));

        // Snippet usage data (top 5)
        const snippetUsageData = [...snippets]
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, 5)
          .map(s => ({ name: s.title.length > 15 ? s.title.slice(0, 15) + "…" : s.title, uses: s.usageCount }));

        // Calculate lifetime creations from activity history
        const projectsCreated = activity.filter(a => a.type === "project_created").length;
        const tasksCreated = activity.filter(a => a.type === "task_created").length;
        const tasksCompleted = activity.filter(a => a.type === "task_completed").length;
        const filesCreated = activity.filter(a => a.type === "file_created").length;
        const resourcesAdded = activity.filter(a => a.type === "resource_added").length;
        const snippetsSaved = activity.filter(a => a.type === "snippet_created").length;

        return {
          projectsCreated,
          tasksCreated,
          tasksCompleted,
          filesCreated,
          resourcesAdded,
          snippetsSaved,
          totalExecutions,
          totalActivityEvents: activity.length,
          averageTaskCompletionTime,
          mostUsedLanguage,
          mostUsedSnippet,
          monthlyActivityData,
          executionHistoryData,
          languageDistribution,
          snippetUsageData
        };
      })(),
      recentActivity: activity.slice(0, 10),
      executionHistory: executions.slice(0, 50)
    };
  }
});
