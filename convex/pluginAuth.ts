import { createRemoteJWKSet, jwtVerify } from "jose";

const MCP_RESOURCE = "https://www.dexthemes.com/api/mcp";
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function normalizeIssuer(value: string | undefined) {
  return value && value.endsWith("/") ? value : value ? `${value}/` : "";
}

function exactVerifiedOpenAIDomain(email: unknown, verified: unknown) {
  if (verified !== true || typeof email !== "string") return undefined;
  const separator = email.lastIndexOf("@");
  return separator > 0 && email.slice(separator + 1).toLowerCase() === "openai.com";
}

function safeClaim(value: unknown, fallback = "", maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

export async function verifyPluginBearer(request: Request, requiredScope: string) {
  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) throw new Error("Unauthorized");
  const issuer = normalizeIssuer(process.env.DEXTHEMES_AUTH_ISSUER);
  const audience = process.env.DEXTHEMES_AUTH_AUDIENCE || MCP_RESOURCE;
  if (!issuer) throw new Error("Plugin OAuth is not configured");
  jwks ||= createRemoteJWKSet(new URL(process.env.DEXTHEMES_AUTH_JWKS_URI || `${issuer}.well-known/jwks.json`));
  const { payload } = await jwtVerify(authorization.slice(7), jwks, {
    issuer,
    audience,
    algorithms: ["RS256"],
    requiredClaims: ["exp"],
  });
  const scopes = String(payload.scope || "").split(/\s+/).filter(Boolean);
  if (!scopes.includes(requiredScope)) throw new Error("Insufficient scope");
  if (typeof payload.sub !== "string" || !payload.sub.startsWith("github|")) {
    throw new Error("GitHub sign-in required");
  }
  const githubId = payload.sub.slice("github|".length);
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(githubId)) throw new Error("Invalid GitHub identity");

  return {
    githubId,
    username: safeClaim(payload.nickname || payload.preferred_username, "", 100),
    displayName: safeClaim(payload.name, "", 160),
    avatarUrl: safeClaim(payload.picture, "", 500),
    isOpenAIEmployee: exactVerifiedOpenAIDomain(payload.email, payload.email_verified),
  };
}
