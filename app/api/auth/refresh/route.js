import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPreferredOrigin } from "../_utils/url";

export const runtime = "nodejs";

function safeNextPath(value) {
  if (!value || typeof value !== "string") return "/";
  // Prevent open redirects
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  // Block attempts like "/http:/127.0.0.1:3000" which browsers treat as a local path.
  if (/^\/https?:/i.test(value)) return "/";
  // Block any scheme-like substring anywhere in the path.
  if (value.includes("://")) return "/";
  return value;
}

export async function GET(request) {
  const origin = getPreferredOrigin(request);
  const url = new URL(request.url);
  const nextPath = safeNextPath(url.searchParams.get("next"));

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login?error=no_refresh_token", origin));
  }

  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const { CLIENT_SECRET, NODE_ENV } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/login?error=config_error", origin));
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      const details = encodeURIComponent(errorText.slice(0, 500));
      return NextResponse.redirect(new URL(`/login?error=refresh_failed&details=${details}`, origin));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", origin));
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
    response.cookies.set("access_token", accessToken, {
      ...cookieOptions,
      maxAge: expiresIn,
    });
    response.cookies.set("access_token_expires_at", String(Math.floor(Date.now() / 1000) + expiresIn), {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    // Spotify sometimes returns a new refresh token; keep it if present.
    if (tokenData.refresh_token) {
      response.cookies.set("refresh_token", tokenData.refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (e) {
    return NextResponse.redirect(new URL("/login?error=server_error", origin));
  }
}
