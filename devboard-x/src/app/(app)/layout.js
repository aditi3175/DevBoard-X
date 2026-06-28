"use client";

import { Authenticated, AuthLoading } from "convex/react";
import { ProjectProvider } from "@/context/ProjectContext";
import CommandPalette from "@/components/layout/CommandPalette";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-page flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AuthLoading>
      <Authenticated>
        <ProjectProvider>
          <CommandPalette />
          <div className="flex h-screen overflow-hidden w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <Navbar />
              <main className="flex-1 flex flex-col relative w-full">
                {children}
              </main>
            </div>
          </div>
        </ProjectProvider>
      </Authenticated>
    </>
  );
}
