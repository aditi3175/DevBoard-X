"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Activity, CheckCircle2, Code2, FileCode, FolderKanban, Play, Terminal } from "lucide-react";

const PreviewRow = ({ label, value, tone = "primary" }) => {
  const tones = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info"
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-page/70 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${tones[tone]}`} />
        <span className="text-sm font-bold text-text-main">{label}</span>
      </div>
      <span className="rounded-md bg-bg-active px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-text-secondary">
        {value}
      </span>
    </div>
  );
};

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return (
      <div className="workspace-canvas flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="workspace-canvas min-h-screen text-text-main">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Terminal size={22} />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">DevBoard X</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Build space</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <button className="text-sm font-bold text-text-secondary transition hover:text-text-main">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-hover">
              Get Started
            </button>
          </SignUpButton>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 pb-12 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary panel-shadow">
            <Activity size={14} />
            Developer workspace
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight md:text-6xl">
            Your projects, tasks, files, and snippets in one workspace.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary md:text-lg">
            DevBoard X keeps your development work organized with project health, task progress, code snippets, resources, and execution history.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-primary px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-primary-hover">
                Start building
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="rounded-xl border border-border-strong bg-surface px-6 py-3 text-sm font-black text-text-main transition hover:-translate-y-0.5 hover:bg-bg-hover">
                Open workspace
              </button>
            </SignInButton>
          </div>
        </section>

        <section className="rounded-3xl border border-border-subtle bg-surface/95 p-4 panel-shadow md:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <p className="text-sm font-black">Workspace preview</p>
              <p className="text-xs text-text-muted">Project activity and progress</p>
            </div>
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-danger" />
              <span className="h-3 w-3 rounded-full bg-warning" />
              <span className="h-3 w-3 rounded-full bg-success" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.85fr]">
            <div className="space-y-3">
              <PreviewRow label="Auth refresh" value="76%" />
              <PreviewRow label="Editor shell" value="ready" tone="success" />
              <PreviewRow label="Deploy notes" value="draft" tone="warning" />

              <div className="rounded-2xl border border-border-subtle bg-page/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black">
                  <FolderKanban size={17} className="text-primary" />
                  Project health
                </div>
                <div className="space-y-3">
                  <div className="h-2 overflow-hidden rounded-full bg-bg-active">
                    <div className="h-full w-[72%] rounded-full bg-primary" />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-text-muted">
                    <span>8 tasks active</span>
                    <span>43 files tracked</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  [FileCode, "Files", "43", "text-info"],
                  [Code2, "Snips", "4", "text-warning"],
                  [Play, "Runs", "16", "text-success"],
                  [Activity, "Tasks", "8", "text-primary"]
                ].map(([Icon, label, value, toneClass]) => (
                  <div key={label} className="rounded-2xl border border-border-subtle bg-page/70 p-3">
                    <Icon size={18} className={`mb-3 ${toneClass}`} />
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-text-muted">{label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border-subtle bg-page/70 p-4">
                <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-text-muted">
                  <Activity size={14} className="text-primary" />
                  Recent activity
                </p>
                <div className="space-y-3">
                  {[
                    ["Updated task", "Auth refresh", CheckCircle2, "text-success"],
                    ["Saved snippet", "route-helper", Code2, "text-info"],
                    ["Ran preview", "Editor shell", Play, "text-primary"]
                  ].map(([label, value, Icon, color]) => (
                    <div key={`${label}-${value}`} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2">
                      <Icon size={15} className={color} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-text-main">{label}</p>
                        <p className="truncate text-[11px] text-text-muted">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
