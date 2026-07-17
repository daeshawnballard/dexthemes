import { createRemoteJWKSet, jwtVerify } from "jose";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createDexThemesMcpServer, MCP_RESOURCE } from "../server/dexthemes-mcp.js";

const ALLOWED_HOSTS = new Set([
  "dexthemes.com",
  "www.dexthemes.com",
  ...(process.env.MCP_ALLOWED_HOSTS || "").split(",").map((host) => host.trim()).filter(Boolean),
]);
const GITHUB_SUBJECT = /^github\|[A-Za-z0-9_-]{1,100}$/;
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

export default async function handler(req, res) {
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
    req.auth = await verifyAuthorization(req);
  } catch {
    return sendJson(res, 401, { error: "invalid_token" }, {
      "WWW-Authenticate": `Bearer resource_metadata="https://www.dexthemes.com/.well-known/oauth-protected-resource", error="invalid_token", error_description="The DexThemes access token could not be verified"`,
    });
  }

  const server = createDexThemesMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("DexThemes MCP request failed", error);
    if (!res.headersSent) sendJson(res, 500, { error: "MCP request failed" });
  } finally {
    await transport.close().catch(() => {});
    await server.close().catch(() => {});
  }
}
