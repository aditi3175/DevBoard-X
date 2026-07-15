import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { logActivityEvent } from "./activity";

export const getAllTasks = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    return await ctx.db.query("tasks").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").collect();
  },
});

export const getTasks = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    
    // We fetch tasks by project, but filter by userId in JS or use filter
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
      
    return tasks.filter(t => t.userId === userId);
  },
});

export const getTask = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) return null;
    return task;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    
    const newTaskId = await ctx.db.insert("tasks", {
      ...args,
      userId,
    });

    await logActivityEvent(ctx, {
      type: "task_created",
      message: `Created task: ${args.title}`,
      projectId: args.projectId,
      taskId: newTaskId,
    });

    const now = new Date().toISOString();

    const insertFile = async (name: string, type: "file" | "folder", parentId?: any, code: string = "") => {
      return await ctx.db.insert("files", {
        userId,
        taskId: newTaskId,
        parentId,
        name,
        type,
        order: 0,
        code: type === "file" ? code : undefined,
        createdAt: now,
        updatedAt: now,
      });
    };

    if (args.template === "HTML") {
      await insertFile("index.html", "file", undefined, `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>HTML Starter</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello HTML Starter!</h1>\n  <script src="script.js"></script>\n</body>\n</html>`);
      await insertFile("style.css", "file", undefined, `body {\n  font-family: sans-serif;\n  padding: 2rem;\n}`);
      await insertFile("script.js", "file", undefined, `console.log("Hello from script.js");`);
      await insertFile("assets", "folder");
    } else if (args.template === "React") {
      const srcId = await insertFile("src", "folder");
      await insertFile("public", "folder");
      await insertFile("package.json", "file", undefined, `{\n  "name": "react-starter",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.2.1",\n    "vite": "^5.0.8"\n  }\n}`);
      await insertFile("vite.config.js", "file", undefined, `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})`);
      
      await insertFile("main.jsx", "file", srcId, `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)`);
      await insertFile("App.jsx", "file", srcId, `export default function App() {\n  return (\n    <div>\n      <h1>Hello React Starter!</h1>\n    </div>\n  );\n}`);
      await insertFile("index.css", "file", srcId, `body {\n  font-family: sans-serif;\n  padding: 2rem;\n}`);
    } else if (args.template === "Next.js") {
      const appId = await insertFile("app", "folder");
      await insertFile("components", "folder");
      await insertFile("public", "folder");
      await insertFile("package.json", "file", undefined, `{\n  "name": "nextjs-starter",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "lint": "next lint"\n  },\n  "dependencies": {\n    "next": "14.0.0",\n    "react": "^18",\n    "react-dom": "^18"\n  }\n}`);
      
      await insertFile("layout.js", "file", appId, `import './globals.css'\n\nexport const metadata = {\n  title: 'Next.js Starter',\n  description: 'Generated by DevBoard X',\n}\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  )\n}`);
      await insertFile("page.js", "file", appId, `export default function Home() {\n  return (\n    <main>\n      <h1>Hello Next.js Starter!</h1>\n    </main>\n  )\n}`);
      await insertFile("globals.css", "file", appId, `body {\n  font-family: sans-serif;\n  padding: 2rem;\n}`);
    } else if (args.template === "Node.js") {
      await insertFile("index.js", "file", undefined, `console.log("Hello Node.js Starter!");`);
      await insertFile("package.json", "file", undefined, `{\n  "name": "node-starter",\n  "version": "1.0.0",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}`);
      await insertFile(".env", "file", undefined, `PORT=3000`);
    } else if (args.template === "Express") {
      await insertFile("server.js", "file", undefined, `const express = require('express');\nconst app = express();\nconst port = process.env.PORT || 3000;\n\napp.get('/', (req, res) => {\n  res.send('Hello Express Starter!');\n});\n\napp.listen(port, () => {\n  console.log(\`Server listening on port \${port}\`);\n});`);
      await insertFile("routes", "folder");
      await insertFile("controllers", "folder");
      await insertFile("middlewares", "folder");
      await insertFile("package.json", "file", undefined, `{\n  "name": "express-starter",\n  "version": "1.0.0",\n  "main": "server.js",\n  "scripts": {\n    "start": "node server.js"\n  },\n  "dependencies": {\n    "express": "^4.18.2"\n  }\n}`);
      await insertFile(".env", "file", undefined, `PORT=3000`);
    } else if (args.template === "Blank") {
      await insertFile("README.md", "file", undefined, `# Blank Starter\n\nStart writing your code here.`);
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
    fileEdited: v.optional(v.boolean()),
    userMarkedFinished: v.optional(v.boolean()),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(id, updates);

    let isCompleted = false;
    if (updates.completed && !existing.completed) {
      isCompleted = true;
    }

    if (isCompleted) {
      await logActivityEvent(ctx, {
        type: "task_completed",
        message: `Completed task: ${existing.title}`,
        projectId: existing.projectId,
        taskId: id,
      });
    } else {
      await logActivityEvent(ctx, {
        type: "task_updated",
        message: `Updated task: ${updates.title || existing.title}`,
        projectId: existing.projectId,
        taskId: id,
      });
    }
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;
    const existing = await ctx.db.get(args.id);
    if (existing && existing.userId === userId) {
      await logActivityEvent(ctx, {
        type: "task_deleted",
        message: `Deleted task: ${existing.title}`,
        projectId: existing.projectId,
      });

      // Cascade delete files and execution logs
      const files = await ctx.db.query("files").withIndex("by_task", q => q.eq("taskId", args.id)).collect();
      for (const f of files) await ctx.db.delete(f._id);
      
      const logs = await ctx.db.query("execution_logs").withIndex("by_task", q => q.eq("taskId", args.id)).collect();
      for (const log of logs) await ctx.db.delete(log._id);

      await ctx.db.delete(args.id);
    }
  },
});
