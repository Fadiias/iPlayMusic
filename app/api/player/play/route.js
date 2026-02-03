import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getDevices,
  SpotifyApiError,
  SpotifyAuthError,
  startPlayback,
  transferPlayback,
} from "@/app/lib/spotify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/player/play" });
}

export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const deviceId = typeof payload?.deviceId === "string" ? payload.deviceId : undefined;
  const uri = typeof payload?.uri === "string" ? payload.uri : undefined;
  const uris = Array.isArray(payload?.uris) ? payload.uris.filter((u) => typeof u === "string") : undefined;
  const positionMs = Number.isFinite(Number(payload?.positionMs)) ? Number(payload.positionMs) : 0;
  const offset = payload?.offset;

  if (!uri && !(Array.isArray(uris) && uris.length)) {
    return NextResponse.json(
      { ok: false, error: "MISSING_URI" },
      { status: 400 }
    );
  }

  try {
    const requestedUris = Array.isArray(uris) && uris.length ? uris : [uri];

    try {
      await startPlayback(accessToken, {
        deviceId,
        uris: requestedUris,
        positionMs,
        offset,
      });
    } catch (error) {
      // 404: Try transferring to our device first (Web Playback SDK device)
      if (error instanceof SpotifyApiError && error.status === 404 && deviceId) {
        try {
          await transferPlayback(accessToken, deviceId, false);
          await startPlayback(accessToken, {
            deviceId,
            uris: requestedUris,
            positionMs,
            offset,
          });
        } catch (retryError) {
          const devicesResponse = await getDevices(accessToken);
          const devices = Array.isArray(devicesResponse?.devices) ? devicesResponse.devices : [];
          const bestDevice = devices.find((d) => d?.id === deviceId) || devices.find((d) => d?.is_active) || devices[0];
          if (bestDevice?.id) {
            await transferPlayback(accessToken, bestDevice.id, true);
            await startPlayback(accessToken, { deviceId: bestDevice.id, uris: requestedUris, positionMs, offset });
          } else {
            throw retryError;
          }
        }
      } else if (error instanceof SpotifyApiError && error.status === 404) {
        const devicesResponse = await getDevices(accessToken);
        const devices = Array.isArray(devicesResponse?.devices) ? devicesResponse.devices : [];
        const bestDevice = devices.find((d) => d?.is_active) || devices.find((d) => d?.id) || null;
        if (bestDevice?.id) {
          await transferPlayback(accessToken, bestDevice.id, true);
          await startPlayback(accessToken, { deviceId: bestDevice.id, uris: requestedUris, positionMs, offset });
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SpotifyAuthError) {
      return NextResponse.json(
        { ok: false, error: "SPOTIFY_AUTH_ERROR", details: error.details || error.message },
        { status: error.status || 401 }
      );
    }

    if (error instanceof SpotifyApiError) {
      // Common case: 404 "No active device found".
      return NextResponse.json(
        { ok: false, error: "SPOTIFY_API_ERROR", details: error.details || error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}
