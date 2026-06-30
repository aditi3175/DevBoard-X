import { query } from "./_generated/server";
import { v } from "convex/values";

export const getWorkspaceAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const projects = await ctx.db.query("projects").withIndex("by_user", q => q.eq("userId", userId)).collect();
    const allTasks = await ctx.db.query("tasks").withIndex("by_user", q => q.eq("userId", userId)).collect();
    const allFiles = await ctx.db.query("files").withIndex("by_user", q => q.eq("userId", userId)).collect();
    const allResources = await ctx.db.query("resources").withIndex("by_user", q => q.eq("userId", userId)).collect();
    const snippets = await ctx.db.query("snippets").withIndex("by_user", q => q.eq("userId", userId)).collect();
    const activities = await ctx.db.query("activity").withIndex("by_user", q => q.eq("userId", userId)).collect();
    const allExecutionLogs = await ctx.db.query("execution_logs").withIndex("by_user", q => q.eq("userId", userId)).collect();

    // Only count active projects for workspace analytics
    const activeProjectIds = new Set(projects.map(p => p._id));
    
    const tasks = allTasks.filter(t => activeProjectIds.has(t.projectId));
    const activeTaskIds = new Set(tasks.map(t => t._id));

    const files = allFiles.filter(f => activeTaskIds.has(f.taskId));
    const resources = allResources.filter(r => activeProjectIds.has(r.projectId));
    const executionLogs = allExecutionLogs.filter(log => activeTaskIds.has(log.taskId));

    // ==========================================
    // WORKSPACE ANALYTICS (CURRENT)
    // ==========================================
    let activeTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let pendingTasks = 0;

    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;

    tasks.forEach(t => {
      if (t.completed) {
        completedTasks++;
      } else {
        activeTasks++;
        if (t.progress > 0) inProgressTasks++;
        else pendingTasks++;
      }

      if (t.priority === "High") highPriority++;
      else if (t.priority === "Medium") mediumPriority++;
      else lowPriority++;
    });

    const completionRate = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);
    
    let totalExecTime = 0;
    let timedRuns = 0;
    executionLogs.forEach(l => {
      if (l.duration) {
        totalExecTime += l.duration;
        timedRuns++;
      }
    });
    const averageExecutionTime = timedRuns === 0 ? 0 : Math.round(totalExecTime / timedRuns);

    const projectPerformance = projects.map(proj => {
      const pTasks = tasks.filter(t => t.projectId === proj._id);
      const pTotal = pTasks.length;
      const pCompleted = pTasks.filter(t => t.completed).length;
      const pProgress = pTotal === 0 ? 0 : Math.round((pCompleted / pTotal) * 100);
      
      const taskIds = new Set(pTasks.map(t => t._id));
      const runs = executionLogs.filter(log => taskIds.has(log.taskId)).length;

      return {
        id: proj._id,
        name: proj.title,
        tasks: pTotal,
        completion: pProgress,
        runs,
        lastActivity: proj.lastUpdatedAt || proj.createdAt || new Date().toISOString()
      };
    });

    // Recent activity grouping for Workspace
    const activityByDate: Record<string, { created: number, completed: number }> = {};
    const now = new Date();
    // Only group the last 7 days of activities to keep it relevant to current workspace
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    activities.forEach(act => {
       const d = new Date(act.createdAt);
       if (d < sevenDaysAgo) return;
       // We use the UTC date string because the frontend will map to it using local formatting equivalent
       const dateStr = [
         d.getFullYear(),
         String(d.getMonth() + 1).padStart(2, '0'),
         String(d.getDate()).padStart(2, '0')
       ].join("-");
       
       if (!activityByDate[dateStr]) {
         activityByDate[dateStr] = { created: 0, completed: 0 };
       }
       if (act.type === "task_created") activityByDate[dateStr].created++;
       if (act.type === "task_completed") activityByDate[dateStr].completed++;
    });

    const workspace = {
      activeProjects: projects.filter(p => p.status !== "Completed").length,
      activeTasks,
      completedTasks,
      completionRate,
      activeFiles: files.length,
      activeResources: resources.length,
      averageExecutionTime,
      pendingTasks,
      highPriority,
      mediumPriority,
      lowPriority,
      projectPerformance: projectPerformance.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()),
      activityByDate
    };

    // ==========================================
    // DEVELOPER INSIGHTS (LIFETIME)
    // ==========================================
    let projectsCreated = 0;
    let tasksCreated = 0;
    let tasksCompleted = 0;
    let filesCreated = 0;
    let resourcesAdded = 0;
    let snippetsSaved = 0;
    let totalExecutions = 0;

    // To calculate average task completion time
    const taskCreatedTimes: Record<string, number> = {};
    let totalTaskCompletionTime = 0;
    let timedCompletedTasks = 0;

    const lifetimeMonthlyActivity: Record<string, number> = {};
    const executionHistory: Record<string, number> = {};

    activities.forEach(act => {
      const ts = new Date(act.createdAt).getTime();
      const monthStr = act.createdAt.substring(0, 7); // "YYYY-MM"
      
      lifetimeMonthlyActivity[monthStr] = (lifetimeMonthlyActivity[monthStr] || 0) + 1;

      switch(act.type) {
        case "project_created": projectsCreated++; break;
        case "task_created": 
          tasksCreated++; 
          if (act.taskId) taskCreatedTimes[act.taskId] = ts;
          break;
        case "task_completed": 
          tasksCompleted++;
          if (act.taskId && taskCreatedTimes[act.taskId]) {
             const timeDiff = ts - taskCreatedTimes[act.taskId];
             totalTaskCompletionTime += timeDiff;
             timedCompletedTasks++;
          }
          break;
        case "file_created": filesCreated++; break;
        case "resource_added": resourcesAdded++; break;
        case "snippet_saved": snippetsSaved++; break;
        case "code_executed": 
          totalExecutions++; 
          executionHistory[monthStr] = (executionHistory[monthStr] || 0) + 1;
          break;
      }
    });

    let avgTaskCompletionTime = 0;
    if (timedCompletedTasks > 0) {
      avgTaskCompletionTime = Math.round(totalTaskCompletionTime / timedCompletedTasks);
    }

    // Most used language (from snippets)
    const languageCounts: Record<string, number> = {};
    let mostUsedLanguage = "None";
    let maxLangCount = 0;
    snippets.forEach(s => {
      if (s.language) {
        languageCounts[s.language] = (languageCounts[s.language] || 0) + 1;
        if (languageCounts[s.language] > maxLangCount) {
          maxLangCount = languageCounts[s.language];
          mostUsedLanguage = s.language;
        }
      }
    });

    const languageDistribution = Object.keys(languageCounts).map(lang => ({
      name: lang,
      value: languageCounts[lang]
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    // Most used snippet
    let mostUsedSnippet = "None";
    let maxSnippetUsage = 0;
    snippets.forEach(s => {
      if ((s.usageCount || 0) > maxSnippetUsage) {
        maxSnippetUsage = s.usageCount!;
        mostUsedSnippet = s.title;
      }
    });

    const monthlyActivityData = Object.keys(lifetimeMonthlyActivity).map(m => ({
      month: m,
      events: lifetimeMonthlyActivity[m]
    })).sort((a, b) => a.month.localeCompare(b.month));

    const executionHistoryData = Object.keys(executionHistory).map(m => ({
      month: m,
      executions: executionHistory[m]
    })).sort((a, b) => a.month.localeCompare(b.month));

    const snippetUsageData = [...snippets]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .map(s => ({ name: s.title, uses: s.usageCount || 0 }));

    const lifetime = {
      projectsCreated,
      tasksCreated,
      tasksCompleted,
      filesCreated,
      resourcesAdded,
      snippetsSaved,
      totalExecutions,
      totalActivityEvents: activities.length,
      averageTaskCompletionTime: avgTaskCompletionTime,
      mostUsedLanguage,
      mostUsedSnippet,
      monthlyActivityData,
      executionHistoryData,
      languageDistribution,
      snippetUsageData
    };

    return { workspace, lifetime };
  }
});

export const getProjectAnalytics = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const tasks = await ctx.db.query("tasks").withIndex("by_project", q => q.eq("projectId", args.projectId)).collect();
    const resources = await ctx.db.query("resources").withIndex("by_project", q => q.eq("projectId", args.projectId)).collect();
    
    const userTasks = tasks.filter(t => t.userId === userId);
    const userResources = resources.filter(r => r.userId === userId);

    let totalTasks = userTasks.length;
    let completedTasks = userTasks.filter(t => t.completed).length;
    let completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    return {
      totalTasks,
      completedTasks,
      completionRate,
      totalResources: userResources.length,
    };
  }
});

export const getExecutionAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const logs = await ctx.db.query("execution_logs").withIndex("by_user", q => q.eq("userId", userId)).collect();
    let totalRuns = logs.length;
    let successfulRuns = logs.filter(l => l.status === "success").length;
    let failedRuns = logs.filter(l => l.status === "error").length;
    
    let totalTime = 0;
    let timedRuns = 0;
    logs.forEach(l => {
      if (l.duration) {
        totalTime += l.duration;
        timedRuns++;
      }
    });
    
    return {
      totalRuns,
      successfulRuns,
      failedRuns,
      averageExecutionTime: timedRuns === 0 ? 0 : Math.round(totalTime / timedRuns),
    };
  }
});

export const getSnippetAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const snippets = await ctx.db.query("snippets").withIndex("by_user", q => q.eq("userId", userId)).collect();
    
    let favoriteSnippets = snippets.filter(s => s.favorite).length;
    let totalUsageCount = snippets.reduce((acc, s) => acc + (s.usageCount || 0), 0);
    
    let mostUsedSnippets = [...snippets].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 5);
    
    return {
      totalSnippets: snippets.length,
      favoriteSnippets,
      totalUsageCount,
      mostUsedSnippets,
    };
  }
});
