import { createRemoteJWKSet, jwtVerify } from "jose";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createDexThemesMcpServer, MCP_RESOURCE } from "../server/dexthemes-mcp.js";

const ALLOWED_HOSTS = new Set([
  "dexthemes.com",
  "www.dexthemes.com",
  ...(process.env.MCP_ALLOWED_HOSTS || "").split(",").map((host) => host.trim()).filter(Boolean),
]);
const GITHUB_SUBJECT = /^github\|[A-Za-z0-9_-]{1,100}$/;
export const ANONYMOUS_MCP_ROUTE_PROFILES = Object.freeze({
  deepseek_harness: Object.freeze({ profile: "deepseek_harness", allowAuthorization: false }),
  cursor_discovery: Object.freeze({ profile: "cursor_discovery", allowAuthorization: false }),
  antigravity_preview: Object.freeze({ profile: "antigravity_preview", allowAuthorization: false }),
});
let jwks;

function sendJson(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end(JSON.stringify(body));
}

function normalizeIssuer(value) {
  return value && value.endsWith("/") ? value : value ? `${value}/` : "";
}

function acceptsMcpResponseType(header, type, { includeWildcard = true } = {}) {
  if (typeof header !== "string") return false;
  return header.split(",").some((entry) => {
    const [mediaType, ...parameters] = entry.trim().toLowerCase().split(";");
    if (mediaType !== type && (!includeWildcard || mediaType !== "*/*")) return false;
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    return quality === undefined || Number(quality.trim().slice(2)) > 0;
  });
}

function withStreamableMcpAccept(req) {
  const accept = Array.isArray(req.headers?.accept) ? req.headers.accept.join(",") : req.headers?.accept;
  if (
    !acceptsMcpResponseType(accept, "application/json")
    || acceptsMcpResponseType(accept, "text/event-stream", { includeWildcard: false })
  ) {
    return req;
  }

  const normalizedAccept = acceptsMcpResponseType(accept, "application/json", { includeWildcard: false })
    ? `${accept}, text/event-stream`
    : `${accept}, application/json, text/event-stream`;
  const rawHeaders = Array.isArray(req.rawHeaders)
    ? req.rawHeaders.flatMap((value, index, values) => {
      if (index % 2 === 1) return [];
      return [value, value.toLowerCase() === "accept" ? normalizedAccept : values[index + 1]];
    })
    : req.rawHeaders;

  return Object.assign(Object.create(req), {
    headers: {
      ...req.headers,
      accept: normalizedAccept,
    },
    rawHeaders,
  });
}

function isAllowedPluginSubject(subject) {
  if (typeof subject !== "string") return false;
  if (GITHUB_SUBJECT.test(subject)) return true;
  const reviewerSubject = (process.env.DEXTHEMES_OPENAI_REVIEWER_SUBJECT || "").trim();
  return reviewerSubject.length > 0 && subject === reviewerSubject;
}

async function verifyAuthorization(req) {
  const header = req.headers.authorization || "";
  if (!header) return undefined;
  if (!header.startsWith("Bearer ")) throw new Error("invalid_authorization_header");
  const issuer = normalizeIssuer(process.env.DEXTHEMES_AUTH_ISSUER);
  const audience = process.env.DEXTHEMES_AUTH_AUDIENCE || MCP_RESOURCE;
  if (!issuer) throw new Error("oauth_not_configured");
  jwks ||= createRemoteJWKSet(new URL(process.env.DEXTHEMES_AUTH_JWKS_URI || `${issuer}.well-known/jwks.json`));
  const token = header.slice(7);
  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience,
    algorithms: ["RS256"],
    requiredClaims: ["exp"],
  });
  const scopes = String(payload.scope || "").split(/\s+/).filter(Boolean);
  if (!isAllowedPluginSubject(payload.sub)) {
    throw new Error("invalid_token_claims");
  }
  return {
    token,
    clientId: String(payload.azp || payload.client_id || "unknown"),
    scopes,
    expiresAt: payload.exp,
    resource: new URL(MCP_RESOURCE),
    extra: { sub: payload.sub },
  };
}

export async function handleMcpRequest(req, res, {
  profile = "full",
  allowAuthorization = true,
} = {}) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID");
  res.setHeader("Access-Control-Expose-Headers", "MCP-Protocol-Version, MCP-Session-Id");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();

  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(":")[0].toLowerCase();
  const isVercelPreview = process.env.VERCEL_ENV !== "production" && host.endsWith(".vercel.app");
  if (!ALLOWED_HOSTS.has(host) && !isVercelPreview) {
    return sendJson(res, 421, { error: "Unrecognized host" });
  }

  try {
    req.auth = allowAuthorization ? await verifyAuthorization(req) : undefined;
  } catch {
    return sendJson(res, 401, { error: "invalid_token" }, {
      "WWW-Authenticate": `Bearer resource_metadata="https://www.dexthemes.com/.well-known/oauth-protected-resource", error="invalid_token", error_description="The DexThemes access token could not be verified"`,
    });
  }

  const server = createDexThemesMcpServer({ profile });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(withStreamableMcpAccept(req), res, req.body);
  } catch (error) {
    console.error("DexThemes MCP request failed", error);
    if (!res.headersSent) sendJson(res, 500, { error: "MCP request failed" });
  } finally {
    await transport.close().catch(() => {});
    await server.close().catch(() => {});
  }
}

export function resolveMcpProfile(req) {
  let requestedProfile = req.query?.profile;
  if (requestedProfile === undefined) {
    try {
      requestedProfile = new URL(req.url || "/api/mcp", "https://www.dexthemes.com").searchParams.get("profile");
    } catch {
      return null;
    }
  }

  if (requestedProfile === undefined || requestedProfile === null || requestedProfile === "") {
    return Object.freeze({ profile: "full", allowAuthorization: true });
  }
  if (typeof requestedProfile === "string" && Object.hasOwn(ANONYMOUS_MCP_ROUTE_PROFILES, requestedProfile)) {
    return ANONYMOUS_MCP_ROUTE_PROFILES[requestedProfile];
  }
  return null;
}

export default async function handler(req, res) {
  const profile = resolveMcpProfile(req);
  if (!profile) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    return sendJson(res, 400, { error: "unsupported_mcp_profile" });
  }
  return handleMcpRequest(req, res, profile);
}
