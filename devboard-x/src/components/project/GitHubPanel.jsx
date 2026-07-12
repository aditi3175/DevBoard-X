"use client"

import React, { useState, useEffect } from 'react';
import { useAction, useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Loader2, CheckCircle2, ExternalLink, ShieldAlert, FileUp 
} from 'lucide-react';
import ToastNotification from '@/components/layout/ToastNotification';

// The inline Github Icon
const GithubIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

export default function GitHubPanel({ project }) {
  const { user } = useUser();
  const clerkUserId = user?.id;

  const githubConnection = useQuery(
    api.github.getConnection,
    clerkUserId ? { userId: clerkUserId } : "skip"
  );

  const listRepositories = useAction(api.githubActions.listRepositories);
  const createRepository = useAction(api.githubActions.createRepository);
  const publishProject = useAction(api.githubActions.publishProject);
  const linkProjectToRepo = useMutation(api.github.linkProjectToRepo);

  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [creatingRepo, setCreatingRepo] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [commitMessage, setCommitMessage] = useState("Update project from DevBoard X");
  
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = React.useCallback((message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 4000);
  }, []);

  const loadRepos = React.useCallback(async () => {
    setLoadingRepos(true);
    try {
      const data = await listRepositories();
      setRepos(data || []);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoadingRepos(false);
    }
  }, [listRepositories, showToast]);

  useEffect(() => {
    if (githubConnection && !project.githubRepoId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRepos();
    }
  }, [githubConnection, project.githubRepoId, loadRepos]);

  const handleCreateRepo = async () => {
    if (!newRepoName) return showToast("Repository name required", "error");
    setCreatingRepo(true);
    try {
      const repo = await createRepository({
        name: newRepoName,
        private: newRepoPrivate
      });
      await linkProjectToRepo({
        projectId: project._id,
        repoId: repo.id,
        repoName: repo.full_name,
        repoUrl: repo.html_url,
        defaultBranch: repo.default_branch
      });
      showToast("Repository created and linked!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCreatingRepo(false);
    }
  };

  const handleSelectRepo = async (repoId) => {
    if (!repoId) return;
    const repo = repos.find(r => r.id.toString() === repoId);
    if (!repo) return;
    
    try {
      await linkProjectToRepo({
        projectId: project._id,
        repoId: repo.id,
        repoName: repo.full_name,
        repoUrl: repo.html_url,
        defaultBranch: repo.default_branch
      });
      showToast("Repository linked!", "success");
    } catch (err) {
      showToast("Failed to link repository.", "error");
    }
  };

  const handlePublish = async () => {
    if (!commitMessage) return showToast("Commit message required", "error");
    setPublishing(true);
    try {
      const result = await publishProject({
        projectId: project._id,
        commitMessage
      });
      
      if (result && result.validationError) {
        showToast(result.validationError, "warning");
      } else {
        showToast("Project published successfully!", "success");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setPublishing(false);
    }
  };

  if (githubConnection === undefined) {
    return (
      <Card className="flex items-center justify-center py-6">
        <Loader2 size={24} className="animate-spin text-text-secondary" />
      </Card>
    );
  }

  if (githubConnection === null) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <GithubIcon size={48} className="text-text-muted mb-4" />
          <h3 className="text-xl font-bold mb-2">GitHub Not Connected</h3>
          <p className="text-text-secondary mb-6 max-w-md">
            Connect your GitHub account in Settings to enable publishing projects directly to repositories.
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/settings'}>
            Go to Settings
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      {toast.show && (
        <ToastNotification 
          message={toast.message} 
          type={toast.type} 
          visible={toast.show}
          onClose={() => setToast({ show: false, message: "", type: "success" })} 
        />
      )}
      
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2">
          <GithubIcon size={24} className="text-text-main" />
          <h2 className="text-xl font-bold">GitHub Publishing</h2>
        </div>
        
        {project.githubRepoId ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/20">
            <CheckCircle2 size={14} /> Ready
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/15 text-warning border border-warning/20">
            <ShieldAlert size={14} /> Not Linked
          </span>
        )}
      </div>

      {!project.githubRepoId ? (
        <div className="space-y-6">
          <div className="bg-bg-active p-4 rounded-xl space-y-4">
            <h3 className="font-semibold">Link Existing Repository</h3>
            {loadingRepos ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Loader2 size={16} className="animate-spin" /> Fetching your repositories...
              </div>
            ) : (
              <select 
                className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                onChange={(e) => handleSelectRepo(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Select a repository to link</option>
                {repos.map(r => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-border-subtle flex-1"></div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">OR</span>
            <div className="h-px bg-border-subtle flex-1"></div>
          </div>

          <div className="bg-bg-active p-4 rounded-xl space-y-4">
            <h3 className="font-semibold">Create New Repository</h3>
            <div className="space-y-3">
              <Input 
                placeholder="Repository Name (e.g. devboard-x-app)" 
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
              />
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="private-repo" 
                  checked={newRepoPrivate}
                  onChange={(e) => setNewRepoPrivate(e.target.checked)}
                  className="rounded border-border-subtle bg-surface text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="private-repo" className="text-sm cursor-pointer select-none">Private Repository</label>
              </div>
              <Button 
                variant="primary" 
                onClick={handleCreateRepo} 
                disabled={creatingRepo || !newRepoName}
                className="w-full mt-4"
              >
                {creatingRepo ? <Loader2 size={16} className="animate-spin" /> : <GithubIcon size={16} />}
                {creatingRepo ? "Creating..." : "Create & Link Repository"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-bg-active border border-border-subtle">
            <div className="flex-1 space-y-1">
              <p className="text-sm text-text-secondary">Linked Repository</p>
              <a 
                href={project.githubRepoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-bold hover:underline hover:text-primary flex items-center gap-2"
              >
                {project.githubRepoName} <ExternalLink size={14} />
              </a>
              <div className="flex flex-wrap gap-3 mt-2 text-xs font-medium text-text-muted">
                <span className="bg-surface px-2 py-0.5 rounded border border-border-subtle">{project.githubRepoDefaultBranch}</span>
                {project.lastSyncedAt && (
                  <span className="flex items-center gap-1">
                    Last synced: {new Date(project.lastSyncedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Publish Changes</h3>
            <Input 
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message"
            />
            <Button 
              variant="primary" 
              onClick={handlePublish}
              disabled={publishing || !commitMessage}
              className="w-full flex justify-center items-center gap-2"
            >
              {publishing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <FileUp size={16} /> Push Project
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
