export function getPreferredOrigin(request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto
    ? forwardedProto.split(",")[0].trim()
    : request.nextUrl?.protocol
      ? request.nextUrl.protocol.replace(":", "")
      : "http";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost
    ? forwardedHost.split(",")[0].trim()
    : request.headers.get("host") ?? request.nextUrl?.host;

  if (!hostHeader) return "http://127.0.0.1:3000";

  const { hostname, port } = splitHost(hostHeader);
  const normalizedHostname = normalizeLoopbackHostname(hostname);
  const normalizedHost = joinHost(normalizedHostname, port);

  return `${proto}://${normalizedHost}`;
}

export function normalizeLoopbackUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return urlString;
  try {
    const url = new URL(urlString);
    url.hostname = normalizeLoopbackHostname(url.hostname);
    return url.toString();
  } catch {
    return urlString;
  }
}

function normalizeLoopbackHostname(hostname) {
  if (!hostname) return hostname;
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower === "::1" || lower === "[::1]") return "127.0.0.1";
  return hostname;
}

function splitHost(hostHeader) {
  const value = String(hostHeader).trim();
  if (!value) return { hostname: "", port: "" };

  // IPv6 like: [::1]:3000
  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    if (end === -1) return { hostname: value, port: "" };
    const hostname = value.slice(1, end);
    const rest = value.slice(end + 1);
    const port = rest.startsWith(":") ? rest.slice(1) : "";
    return { hostname, port };
  }

  const [hostname, port] = value.split(":");
  return { hostname: hostname ?? "", port: port ?? "" };
}

function joinHost(hostname, port) {
  if (!hostname) return "";
  return port ? `${hostname}:${port}` : hostname;
}
