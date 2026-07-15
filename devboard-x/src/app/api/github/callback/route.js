import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle user denial
  if (error) {
    return NextResponse.redirect(
      new URL("/settings?github=denied", request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?github=error&reason=missing_params", request.url)
    );
  }

  // Validate CSRF state
  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL("/settings?github=error&reason=state_mismatch", request.url)
    );
  }

  // Clear the state cookie
  cookieStore.delete("github_oauth_state");

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/github/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token exchange error:", tokenData.error, tokenData.error_description);
      return NextResponse.redirect(
        new URL(`/settings?github=error&reason=token_exchange:${tokenData.error}`, request.url)
      );
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userResponse.ok) {
      console.error("GitHub user fetch error:", userResponse.status);
      return NextResponse.redirect(
        new URL("/settings?github=error&reason=profile_fetch", request.url)
      );
    }

    const githubUser = await userResponse.json();

    // Get the current Clerk user ID
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(
        new URL("/settings?github=error&reason=not_authenticated", request.url)
      );
    }

    // Store connection in Convex
    await convex.mutation(api.github.storeConnection, {
      userId,
      githubAccessToken: accessToken,
      githubUsername: githubUser.login,
      githubAvatarUrl: githubUser.avatar_url || undefined,
      githubProfileUrl: githubUser.html_url,
      githubId: githubUser.id,
    });

    return NextResponse.redirect(
      new URL("/settings?github=connected", request.url)
    );
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/settings?github=error&reason=unknown", request.url)
    );
  }
}
