import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const REFRESH_BUFFER_SEC = 5 * 60; // Refresh 5 min before expiry

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const expiresAtStr = cookieStore.get("access_token_expires_at")?.value;
  const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : 0;
  const nowSec = Math.floor(Date.now() / 1000);
  const isExpiredOrMissing = !expiresAt || nowSec >= expiresAt - REFRESH_BUFFER_SEC;
  const needsRefresh = refreshToken && (!accessToken || isExpiredOrMissing);

  if (needsRefresh) {
    const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    if (CLIENT_ID && CLIENT_SECRET) {
      try {
        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
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
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.access_token;
          if (accessToken) {
            const expiresIn = tokenData.expires_in || 3600;
            const isProduction = process.env.NODE_ENV === "production";
            const cookieOptions = {
              httpOnly: true,
              secure: isProduction,
              sameSite: "lax",
              path: "/",
              maxAge: expiresIn,
            };
            const res = NextResponse.json({ ok: true, accessToken });
            res.cookies.set("access_token", accessToken, cookieOptions);
            res.cookies.set("access_token_expires_at", String(Math.floor(Date.now() / 1000) + expiresIn), { ...cookieOptions, maxAge: expiresIn });
            if (tokenData.refresh_token) {
              res.cookies.set("refresh_token", tokenData.refresh_token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
            }
            return res;
          }
        }
      } catch {
        // fall through to return existing or 401
      }
    }
  }

  if (!accessToken) {
    return NextResponse.json({ ok: false, accessToken: null }, { status: 401 });
  }

  return NextResponse.json({ ok: true, accessToken });
}
