"use client";

import { useEffect, useRef, useState } from "react";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Terminal as TerminalIcon, Workflow, Zap } from "lucide-react";

const Particles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    // Read accent color from CSS variables
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue("--accent").trim() || "#c8f135";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() * 0.3) - 0.15;
        this.speedY = (Math.random() * 0.3) - 0.15;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

const LiveLog = () => {
  const [logs, setLogs] = useState([
    { id: 1, time: "00:00:01", tag: "inf", msg: "Initialized workspace environment", color: "text-info" }
  ]);

  useEffect(() => {
    const possibleLogs = [
      { tag: "ok", msg: "Compiled successfully in 124ms", color: "text-success" },
      { tag: "ok", msg: "Connected to Convex deployment", color: "text-success" },
      { tag: "wrn", msg: "Deprecation warning in route configuration", color: "text-warning" },
      { tag: "err", msg: "Module not found: @core/utils", color: "text-danger" },
      { tag: "inf", msg: "Waiting for file changes...", color: "text-info" },
      { tag: "ok", msg: "HMR update applied", color: "text-success" },
    ];

    const interval = setInterval(() => {
      setLogs(prev => {
        const nextLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
        const date = new Date();
        const time = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`;
        const newEntry = { id: Date.now(), time, ...nextLog };
        const newLogs = [newEntry, ...prev].slice(0, 5);
        return newLogs;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-20 border-t border-border pt-10 font-mono">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="eyebrow">Live Output Stream</span>
      </div>
      <div className="space-y-3 h-[140px] overflow-hidden relative">
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-start gap-4 text-sm"
            >
              <span className="text-text-muted shrink-0">{log.time}</span>
              <span className={`shrink-0 ${log.color}`}>[ {log.tag} ]</span>
              <span className="text-text-sub">{log.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-text-sub selection:bg-accent selection:text-text-on-lime relative overflow-hidden font-sans">
      <Particles />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6">
        {/* NAV */}
        <nav className="flex items-center justify-between py-6">
          <div className="text-accent font-bold text-xl font-mono">
            DevBoard<span className="text-text-main">_X</span>
          </div>
          <div className="flex items-center gap-8 text-sm">

            <SignInButton mode="modal">
              <button className="hover:text-text-main transition-[color] duration-[120ms]">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-accent text-text-on-lime px-5 py-2.5 rounded-[5px] font-bold hover:bg-accent-hover transition-[background] duration-[120ms]">
                Get started
              </button>
            </SignUpButton>
          </div>
        </nav>

        {/* HERO */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-24 pb-32 items-center min-h-[70vh]">
          <div className="space-y-8">
            <h1 className="text-6xl lg:text-7xl font-bold text-text-main tracking-[-0.02em] leading-[1.05]">
              The workspace <br /> for <span className="text-accent">builders.</span>
            </h1>
            <p className="text-lg text-text-sub max-w-lg leading-relaxed">
              Execute code, manage complex environments, and orchestrate projects in a fully isolated terminal-first dashboard.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <SignUpButton mode="modal">
                <button className="bg-accent text-text-on-lime px-8 py-4 rounded-[5px] font-bold hover:bg-accent-hover transition-[background] duration-[120ms] active:scale-[0.97]">
                  Start building now
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="border border-border px-8 py-4 rounded-[5px] font-bold text-text-main hover:bg-surface transition-[background] duration-[120ms]">
                  Open terminal
                </button>
              </SignInButton>
            </div>
            <div className="pt-4 flex items-center gap-3 text-sm text-text-muted font-mono">
              <div className="flex gap-1 text-accent">
                {[...Array(5)].map((_,i) => <span key={i}>★</span>)}
              </div>
              <span>TRUSTED BY 10,000+ DEVS</span>
            </div>
          </div>

          <div className="relative h-[500px] w-full hidden lg:block">
            {/* Mock Editor Window */}
            <div className="absolute top-0 right-10 w-[500px] h-[320px] bg-page border border-border rounded-[8px] overflow-hidden z-20">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-page-raised">
                <div className="w-2.5 h-2.5 rounded-full bg-danger" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="ml-4 text-xs text-text-muted font-mono">server.ts</span>
              </div>
              <div className="p-4 text-sm leading-relaxed font-mono">
                <div className="text-text-sub">
                  <span className="text-accent">import</span> {"{"} createServer {"}"} <span className="text-accent">from</span> <span className="text-info">&apos;http&apos;</span>;
                </div>
                <div className="text-text-sub mt-2">
                  <span className="text-accent">const</span> server = createServer((req, res) ={">"} {"{"}
                </div>
                <div className="text-text-sub pl-4">
                  res.writeHead(<span className="text-warning">200</span>, {"{"} <span className="text-info">&apos;Content-Type&apos;</span>: <span className="text-info">&apos;text/plain&apos;</span> {"}"});
                </div>
                {/* Autocomplete dropdown */}
                <div className="ml-4 mt-1 w-[200px] bg-surface border border-border rounded-[4px] relative z-30">
                  <div className="px-3 py-1.5 border-b border-border text-text-on-lime bg-accent font-bold">res.end()</div>
                  <div className="px-3 py-1.5 text-text-muted">res.destroy()</div>
                  <div className="px-3 py-1.5 text-text-muted">res.cork()</div>
                </div>
              </div>
            </div>
            
            {/* Mock Terminal Window */}
            <div className="absolute bottom-10 left-0 w-[450px] h-[240px] bg-page border border-border rounded-[8px] overflow-hidden z-10">
              <div className="p-4 text-sm space-y-2 font-mono">
                <div className="flex gap-2">
                  <span className="text-accent">~</span>
                  <span className="text-text-main">$</span>
                  <span className="text-text-sub">npm run dev</span>
                </div>
                <div className="text-text-muted">
                  {">"} devboard-x@0.1.0 dev
                </div>
                <div className="text-text-muted">
                  {">"} next dev
                </div>
                <div className="text-info mt-4">
                  ready - started server on 0.0.0.0:3000
                </div>
                <div className="text-accent">
                  event - compiled client and server successfully in 1240 ms
                </div>
                <div className="text-text-main animate-pulse">_</div>
              </div>
            </div>
          </div>
        </main>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border">
          {[
            { val: "0.5", unit: "ms", label: "P99 Latency" },
            { val: "99.9", unit: "%", label: "Uptime SLA" },
            { val: "10", unit: "M+", label: "Queries/sec" },
            { val: "Zero", unit: "", label: "Config needed" }
          ].map((stat, i) => (
            <div key={i} className="border-r border-b border-border p-8">
              <div className="text-4xl font-bold text-text-main mb-2 font-mono">
                {stat.val}<span className="text-accent">{stat.unit}</span>
              </div>
              <div className="eyebrow">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 mt-20 border-t border-l border-border mb-32">
          {[
            { icon: TerminalIcon, title: "Cloud Terminal", desc: "Native terminal access within the browser powered by WebContainers." },
            { icon: Code2, title: "Isolated Snippets", desc: "Save and execute secure sandboxed functions directly from the dashboard." },
            { icon: Workflow, title: "Workflow Orchestration", desc: "Chain commands and deployments together into single-click workflows." },
            { icon: Zap, title: "Instant Environments", desc: "Boot up a completely configured dev environment in under 2 seconds." }
          ].map((feat, i) => (
            <div key={i} className="border-r border-b border-border p-10 flex flex-col items-start hover:bg-surface-hover transition-[background] duration-[120ms]">
              <div className="w-10 h-10 border border-border flex items-center justify-center text-accent mb-6">
                <feat.icon size={20} />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-3 tracking-tight">{feat.title}</h3>
              <p className="text-text-sub mb-8 leading-relaxed max-w-sm">{feat.desc}</p>

            </div>
          ))}
        </div>

        {/* LIVE LOG */}
        <LiveLog />
        
        <footer className="py-12 border-t border-border flex items-center justify-between mt-20 text-sm text-text-muted font-mono">
          <div>© 2026 DevBoard_X. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-main transition-[color] duration-[120ms]">Terms</a>
            <a href="#" className="hover:text-text-main transition-[color] duration-[120ms]">Privacy</a>
            <a href="#" className="hover:text-text-main transition-[color] duration-[120ms]">Security</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
