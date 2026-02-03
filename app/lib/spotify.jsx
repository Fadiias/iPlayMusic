const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export class SpotifyAuthError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "SpotifyAuthError";
    this.status = status;
    this.details = details;
  }
}

export class SpotifyApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseErrorResponse(response) {
  try {
    const data = await response.json();
    return data.error?.message || data.error || JSON.stringify(data);
  } catch {
    return response.statusText || "Unknown error";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryAfterMs(response) {
  const retryAfter = response.headers.get("Retry-After");
  const retrySeconds = Number(retryAfter);
  if (Number.isFinite(retrySeconds) && retrySeconds > 0) return retrySeconds * 1000;
  return null;
}

async function fetchSpotify(endpoint, accessToken, options = {}) {
  if (!accessToken) {
    throw new SpotifyAuthError("No access token provided", 401);
  }

  const {
    retry = {
      maxRetries: 2,
      baseDelayMs: 350,
    },
    ...fetchOptions
  } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${SPOTIFY_API_BASE}${endpoint}`;

  const maxRetries = Math.max(0, Number(retry?.maxRetries ?? 0));
  const baseDelayMs = Math.max(0, Number(retry?.baseDelayMs ?? 0));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      cache: "no-store",
      ...fetchOptions,
    });

    if (response.status === 429) {
      const retryAfterMs = getRetryAfterMs(response);
      const backoffMs = retryAfterMs ?? baseDelayMs * Math.pow(2, attempt);
      const details = await parseErrorResponse(response);

      if (attempt < maxRetries) {
        await sleep(backoffMs);
        continue;
      }

      throw new SpotifyApiError(`Rate limited. Retry after ${Math.ceil(backoffMs / 1000)}s`, 429, {
        retryAfter: Math.ceil(backoffMs / 1000),
        details,
      });
    }

    if (response.status === 401) {
      const details = await parseErrorResponse(response);
      throw new SpotifyAuthError("Token expired or invalid", 401, details);
    }

    if (response.status === 403) {
      const details = await parseErrorResponse(response);
      throw new SpotifyAuthError("Access forbidden - insufficient scopes", 403, details);
    }

    if (!response.ok) {
      const details = await parseErrorResponse(response);
      throw new SpotifyApiError(`Spotify API error: ${response.status}`, response.status, details);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }
}

export async function getUserProfile(accessToken) {
  return fetchSpotify("/me", accessToken);
}

export async function getDevices(accessToken) {
  return fetchSpotify("/me/player/devices", accessToken);
}

export async function transferPlayback(accessToken, deviceId, play = false) {
  if (!deviceId) throw new SpotifyApiError("No device id provided", 400);
  return fetchSpotify("/me/player", accessToken, {
    method: "PUT",
    body: JSON.stringify({ device_ids: [deviceId], play }),
  });
}

export async function startPlayback(
  accessToken,
  {
    deviceId,
    uris,
    contextUri,
    offset,
    positionMs = 0,
  } = {}
) {
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  const body = { position_ms: positionMs };
  if (Array.isArray(uris) && uris.length) body.uris = uris;
  if (contextUri) body.context_uri = contextUri;
  if (offset && (typeof offset === "object" ? Object.keys(offset).length : true)) body.offset = offset;
  return fetchSpotify(`/me/player/play${qs}`, accessToken, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function pausePlayback(accessToken, deviceId) {
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  return fetchSpotify(`/me/player/pause${qs}`, accessToken, {
    method: "PUT",
  });
}

export async function resumePlayback(accessToken, deviceId) {
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  return fetchSpotify(`/me/player/play${qs}`, accessToken, {
    method: "PUT",
    body: JSON.stringify({}),
  });
}

export async function seekTo(accessToken, positionMs, deviceId) {
  const params = new URLSearchParams({ position_ms: String(Math.max(0, Math.floor(positionMs))) });
  if (deviceId) params.set("device_id", deviceId);
  return fetchSpotify(`/me/player/seek?${params}`, accessToken, {
    method: "PUT",
  });
}

export async function skipToNext(accessToken, deviceId) {
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  return fetchSpotify(`/me/player/next${qs}`, accessToken, { method: "POST" });
}

export async function skipToPrevious(accessToken, deviceId) {
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  return fetchSpotify(`/me/player/previous${qs}`, accessToken, { method: "POST" });
}

export async function getTopTracks(accessToken, limit = 10, timeRange = "short_term") {
  const range = ["short_term", "medium_term", "long_term"].includes(timeRange) ? timeRange : "short_term";
  return fetchSpotify(`/me/top/tracks?limit=${limit}&time_range=${range}`, accessToken);
}

export async function getTopArtists(accessToken, limit = 10) {
  return fetchSpotify(`/me/top/artists?limit=${limit}&time_range=short_term`, accessToken);
}

export async function getRecentlyPlayed(accessToken, limit = 20) {
  return fetchSpotify(`/me/player/recently-played?limit=${limit}`, accessToken);
}

export async function getPlaylists(accessToken, limit = 20) {
  return fetchSpotify(`/me/playlists?limit=${limit}`, accessToken);
}

export async function getCategories(accessToken, limit = 20, country = "US") {
  return fetchSpotify(`/browse/categories?limit=${limit}&country=${country}`, accessToken);
}

export async function getCategory(accessToken, categoryId, country = "US") {
  return fetchSpotify(`/browse/categories/${categoryId}?country=${country}`, accessToken);
}

export async function getCategoryPlaylists(accessToken, categoryId, limit = 20, country = "US") {
  return fetchSpotify(`/browse/categories/${categoryId}/playlists?limit=${limit}&country=${country}`, accessToken);
}

export async function search(accessToken, query, types = ["track", "artist", "album"], limit = 10) {
  const typeString = types.join(",");
  return fetchSpotify(`/search?q=${encodeURIComponent(query)}&type=${typeString}&limit=${limit}`, accessToken);
}

export async function getNewReleases(accessToken, limit = 20, country = "US") {
  return fetchSpotify(`/browse/new-releases?limit=${limit}&country=${country}`, accessToken);
}

export async function getFeaturedPlaylists(accessToken, limit = 20, country = "US", locale) {
  const params = new URLSearchParams({ limit: String(limit), country });
  if (locale) params.set("locale", locale);
  return fetchSpotify(`/browse/featured-playlists?${params}`, accessToken);
}

export async function getCurrentlyPlaying(accessToken) {
  return fetchSpotify(`/me/player/currently-playing`, accessToken);
}

export async function getTrack(accessToken, trackId) {
  return fetchSpotify(`/tracks/${trackId}`, accessToken);
}

export async function getTracks(accessToken, trackIds = []) {
  const ids = (trackIds || []).filter(Boolean).slice(0, 50);
  if (!ids.length) return { tracks: [] };
  return fetchSpotify(`/tracks?ids=${encodeURIComponent(ids.join(","))}`, accessToken);
}

export async function getAlbum(accessToken, albumId) {
  return fetchSpotify(`/albums/${albumId}`, accessToken);
}

export async function getPlaylistTracks(accessToken, playlistId, limit = 50, offset = 0) {
  return fetchSpotify(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`, accessToken);
}
