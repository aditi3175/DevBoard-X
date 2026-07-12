import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";

// Helper for making GitHub API requests
async function githubRequest(path: string, token: string, options: RequestInit = {}) {
  const url = `https://api.github.com${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = `GitHub API Error (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg += `: ${errorData.message || JSON.stringify(errorData)}`;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;
  return response.json();
}

// 1. List Repositories
export const listRepositories = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const token = await ctx.runQuery(internal.github.getDecryptedToken, { userId });
    if (!token) throw new Error("GitHub not connected or token unavailable.");

    // Sort by updated, max 100
    const repos = await githubRequest("/user/repos?sort=updated&per_page=100", token);
    return repos;
  },
});

// 2. Create Repository
export const createRepository = action({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    private: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const token = await ctx.runQuery(internal.github.getDecryptedToken, { userId });
    if (!token) throw new Error("GitHub not connected or token unavailable.");

    const repo = await githubRequest("/user/repos", token, {
      method: "POST",
      body: JSON.stringify({
        name: args.name,
        description: args.description,
        private: args.private,
        auto_init: true, // creates initial commit with README so we have a branch
      }),
    });
    
    return repo;
  },
});

// Helper: build full file path for GitHub
// Reconstructs folders inside the task
function getFilePath(file: any, allFiles: any[]): string {
  if (!file.parentId) return file.name;
  const parent = allFiles.find((f: any) => f._id === file.parentId);
  if (!parent) return file.name; // Fallback
  return `${getFilePath(parent, allFiles)}/${file.name}`;
}

// 3. Publish Project
export const publishProject = action({
  args: {
    projectId: v.id("projects"),
    commitMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.subject;

    const token = await ctx.runQuery(internal.github.getDecryptedToken, { userId });
    if (!token) throw new Error("GitHub not connected or token unavailable.");

    const publishData = await ctx.runQuery(internal.github.getProjectPublishData, { projectId: args.projectId });
    if (!publishData || !publishData.project) throw new Error("Project not found.");

    const { project, tasks } = publishData;
    
    // VALIDATION: No tasks
    if (!tasks || tasks.length === 0) {
      return { success: false, validationError: "This project doesn't have any tasks yet." };
    }

    // VALIDATION: No files across all tasks
    const totalFiles = tasks.reduce((acc: number, task: any) => {
      return acc + task.files.filter((f: any) => f.type === "file").length;
    }, 0);
    
    if (totalFiles === 0) {
      return { success: false, validationError: "No project files found." };
    }
    
    if (!project.githubRepoName) throw new Error("No GitHub repository linked to this project.");
    const ownerRepo = project.githubRepoName; // "username/repo" format assuming it's fullName

    // We need the owner and repo from the full name
    // Assuming githubRepoName is storing "owner/repo" (full_name)
    const repoPath = `/repos/${ownerRepo}`;

    const defaultBranch = project.githubRepoDefaultBranch || "main";

    // 1. Get latest commit SHA
    let latestCommitSha;
    try {
      const refData = await githubRequest(`${repoPath}/git/ref/heads/${defaultBranch}`, token);
      latestCommitSha = refData.object.sha;
    } catch (e: any) {
      throw new Error(`Failed to get branch '${defaultBranch}'. Ensure the repository is initialized with a commit (e.g. add a README). Details: ${e.message}`);
    }

    // 2. Get base tree SHA
    const commitData = await githubRequest(`${repoPath}/git/commits/${latestCommitSha}`, token);
    const baseTreeSha = commitData.tree.sha;

    // 3. Create Blobs and Tree objects
    const treePayload: any[] = [];

    // For every task
    for (const task of tasks) {
      // Clean up the task name for the folder so it doesn't break pathing
      const safeTitle = task.title.replace(/[\/\\]/g, "-");
      const taskFolder = `Task ${task._id.substring(0, 4)} - ${safeTitle}`;
      
      const fileNodes = task.files.filter((f: any) => f.type === "file");
      
      for (const file of fileNodes) {
        if (file.code === undefined || file.code === null) continue; // Skip if no content

        // Create Blob
        const blobData = await githubRequest(`${repoPath}/git/blobs`, token, {
          method: "POST",
          body: JSON.stringify({
            content: file.code,
            encoding: "utf-8",
          }),
        });

        // Compute relative path
        const relativePath = getFilePath(file, task.files);
        const fullPath = `${taskFolder}/${relativePath}`;

        treePayload.push({
          path: fullPath,
          mode: "100644", // standard file
          type: "blob",
          sha: blobData.sha,
        });
      }
    }

    // VALIDATION: All files are empty
    if (treePayload.length === 0) {
      return { success: false, validationError: "Your project only contains empty files." };
    }

    // 4. Create Tree
    const newTreeData = await githubRequest(`${repoPath}/git/trees`, token, {
      method: "POST",
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treePayload,
      }),
    });

    // 5. Create Commit
    const newCommitData = await githubRequest(`${repoPath}/git/commits`, token, {
      method: "POST",
      body: JSON.stringify({
        message: args.commitMessage,
        tree: newTreeData.sha,
        parents: [latestCommitSha],
      }),
    });

    // 6. Update HEAD
    await githubRequest(`${repoPath}/git/refs/heads/${defaultBranch}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        sha: newCommitData.sha,
        force: false,
      }),
    });

    // 7. Update sync time in db
    await ctx.runMutation(api.github.updateProjectSyncTime, { projectId: args.projectId });

    return { success: true, commitUrl: newCommitData.html_url, commitSha: newCommitData.sha };
  },
});
