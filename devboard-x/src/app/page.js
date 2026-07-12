"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Layout, Terminal, Code2, FolderKanban, Zap, ShieldCheck } from "lucide-react";

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
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-text-main flex flex-col font-sans">
      {/* HEADER */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border-subtle bg-surface">
        <div className="flex items-center gap-2">
          <Terminal className="text-primary" size={28} />
          <span className="text-xl font-bold tracking-tight">DevBoard X</span>
        </div>
        <div className="flex items-center gap-4">
          <SignInButton mode="modal">
            <button className="text-sm font-medium text-text-secondary hover:text-text-main transition">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-blue-600 transition">
              Get Started
            </button>
          </SignUpButton>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-text-main">
            Your Dedicated Workspace for <span className="text-primary">Development</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Manage projects, execute code, and store snippets in a fully isolated, secure environment built for the future of development.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignUpButton mode="modal">
              <button className="px-8 py-4 text-base font-bold bg-primary text-white rounded-xl hover:bg-primary-hover transition border border-primary w-full sm:w-auto">
                Start building
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="px-8 py-4 text-base font-bold bg-surface border border-border-strong text-text-main rounded-xl hover:bg-bg-hover transition w-full sm:w-auto">
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>
      </main>

      {/* FEATURES MATRIX */}
      <section className="py-20 bg-surface border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-border-strong bg-surface">
              <div className="w-12 h-12 bg-bg-active text-primary rounded-xl flex items-center justify-center mb-6 border border-border-subtle">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Isolated Workspaces</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Your data is strictly yours. Powered by Clerk and Convex, every project, task, and snippet is securely isolated from other tenants.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border-strong bg-surface">
              <div className="w-12 h-12 bg-bg-active text-primary rounded-xl flex items-center justify-center mb-6 border border-border-subtle">
                <Code2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Cloud Execution</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Run React, Node, HTML, and more directly in your browser. All code states and virtual file systems are synced instantly.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border-strong bg-surface">
              <div className="w-12 h-12 bg-bg-active text-primary rounded-xl flex items-center justify-center mb-6 border border-border-subtle">
                <FolderKanban size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Project Management</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Keep track of complex architectures with built-in Kanban, priority tracking, resources, and live workspace analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-border-subtle text-center text-sm text-text-muted">
        <p>© 2026 DevBoard X. All rights reserved. Powered by Clerk & Convex.</p>
      </footer>
    </div>
  );
}
