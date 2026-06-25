"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

// Initialize the Convex client.
// NEXT_PUBLIC_CONVEX_URL is automatically added to .env.local by `npx convex dev`
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({ children }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
