import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPreferredOrigin, normalizeLoopbackUrl } from "../_utils/url";

export const runtime = "nodejs";

function safeNextPath(value) {
  if (!value || typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//")) return "/dashboard";
  // Block attempts like "/http:/127.0.0.1:3000" which browsers treat as a local path.
  if (/^\/https?:/i.test(value)) return "/dashboard";
  // Block any scheme-like substring anywhere in the path.
  if (value.includes("://")) return "/dashboard";
  return value;
}

export async function GET(request) {
  const origin = getPreferredOrigin(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("spotify_auth_state")?.value;
  const nextCookie = cookieStore.get("spotify_auth_next")?.value;
  const nextPath = safeNextPath(nextCookie);

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, origin));
  }

  // CSRF protection: ensure state matches.
  if (expectedState && state && expectedState !== state) {
    const response = NextResponse.redirect(new URL("/login?error=state_mismatch", origin));
    response.cookies.set("spotify_auth_state", "", { path: "/", maxAge: 0 });
    response.cookies.set("spotify_auth_next", "", { path: "/", maxAge: 0 });
    return response;
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", origin));
  }

  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const { CLIENT_SECRET, NODE_ENV } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Missing required environment variables");
    return NextResponse.redirect(new URL("/login?error=config_error", origin));
  }

  // Must match the Redirect URI in the Spotify Dashboard exactly.
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ??
    process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ??
    "http://127.0.0.1:3000/api/auth/callback";

  const normalizedRedirectUri = normalizeLoopbackUrl(redirectUri);

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: normalizedRedirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error_description: errorText };
      }
      
      console.error("=== Spotify Token Exchange Failed ===");
      console.error("Status:", tokenResponse.status, tokenResponse.statusText);
      console.error("Error Response:", errorData);
      console.error("Redirect URI used:", normalizedRedirectUri);
      console.error("Client ID: [redacted]");
      console.error("=====================================");
      
      // Include error details in the redirect for debugging
      const errorParam = errorData.error ? `&details=${encodeURIComponent(errorData.error_description || errorData.error)}` : '';
      return NextResponse.redirect(
        new URL(`/login?error=token_exchange_failed${errorParam}`, origin)
      );
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("No access token in response");
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", origin)
      );
    }

    const response = NextResponse.redirect(new URL(nextPath, origin));
    
    const isProduction = NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    };
    
    const expiresIn = tokenData.expires_in || 3600;
    response.cookies.set("access_token", tokenData.access_token, {
      ...cookieOptions,
      maxAge: expiresIn,
    });
    response.cookies.set("access_token_expires_at", String(Math.floor(Date.now() / 1000) + expiresIn), {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    if (tokenData.refresh_token) {
      response.cookies.set("refresh_token", tokenData.refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    // Clear transient auth cookies.
    response.cookies.set("spotify_auth_state", "", { path: "/", maxAge: 0 });
    response.cookies.set("spotify_auth_next", "", { path: "/", maxAge: 0 });

    return response;
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=server_error", origin)
    );
  }
}
