import { createRemoteJWKSet, jwtVerify } from "jose";

const MCP_RESOURCE = "https://www.dexthemes.com/api/mcp";
const AUTH0_CLAIM_NAMESPACE = "https://dexthemes.com/";
const GITHUB_SUBJECT = /^github\|([A-Za-z0-9_-]{1,100})$/;
const OPENAI_REVIEWER_GITHUB_ID = "openai-plugin-reviewer";
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

function identityClaim(payload: Record<string, unknown>, name: string) {
  return payload[name] ?? payload[`${AUTH0_CLAIM_NAMESPACE}${name}`];
}

function resolvePluginIdentity(payload: Record<string, unknown>) {
  const subject = payload.sub;
  const githubMatch = typeof subject === "string" ? GITHUB_SUBJECT.exec(subject) : null;
  if (githubMatch) return { githubId: githubMatch[1], isReviewer: false };

  const reviewerSubject = (process.env.DEXTHEMES_OPENAI_REVIEWER_SUBJECT || "").trim();
  if (reviewerSubject && subject === reviewerSubject) {
    return { githubId: OPENAI_REVIEWER_GITHUB_ID, isReviewer: true };
  }
  throw new Error("DexThemes sign-in required");
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
  const identity = resolvePluginIdentity(payload);

  return {
    githubId: identity.githubId,
    username: identity.isReviewer
      ? OPENAI_REVIEWER_GITHUB_ID
      : safeClaim(identityClaim(payload, "nickname") || identityClaim(payload, "preferred_username"), "", 100),
    displayName: identity.isReviewer
      ? "OpenAI Plugin Reviewer"
      : safeClaim(identityClaim(payload, "name"), "", 160),
    avatarUrl: identity.isReviewer ? "" : safeClaim(identityClaim(payload, "picture"), "", 500),
    isOpenAIEmployee: identity.isReviewer ? false : exactVerifiedOpenAIDomain(
      identityClaim(payload, "email"),
      identityClaim(payload, "email_verified"),
    ),
  };
}
