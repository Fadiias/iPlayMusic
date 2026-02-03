import { NextResponse } from "next/server";
import crypto from "crypto";
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
  const url = new URL(request.url);
  const nextPath = safeNextPath(url.searchParams.get("next"));

  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!CLIENT_ID) {
    return NextResponse.redirect(new URL("/login?error=config_error", origin));
  }

  // Must match Spotify Dashboard Redirect URI exactly.
  // Important: localhost vs 127.0.0.1 mismatch will cause INVALID_CLIENT.
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ??
    process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ??
    "http://127.0.0.1:3000/api/auth/callback";

  const normalizedRedirectUri = normalizeLoopbackUrl(redirectUri);

  const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-private",
    "user-read-email",
    "user-library-read",
    "user-top-read",
    "user-read-recently-played",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
  ].join(" ");

  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: normalizedRedirectUri,
    scope: scopes,
    show_dialog: "true",
    state,
  }).toString()}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  response.cookies.set("spotify_auth_next", nextPath, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
