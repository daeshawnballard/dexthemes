import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = 1;
const DEFAULT_TTL_MS = 5 * 60 * 1000;

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((key) => value[key] !== undefined)
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function digest(value) {
  return createHash("sha256").update(value).digest("base64url");
}

function signingSecret(explicitSecret) {
  const secret = explicitSecret || process.env.DEXTHEMES_CONFIRMATION_SECRET || "";
  if (secret.length < 32) {
    throw new Error("Theme publication confirmation is not configured");
  }
  return secret;
}

function signature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSubmissionConfirmation(theme, accessToken, options = {}) {
  const now = options.now ?? Date.now();
  const claims = {
    v: TOKEN_VERSION,
    exp: now + (options.ttlMs ?? DEFAULT_TTL_MS),
    theme: digest(JSON.stringify(canonicalize(theme))),
    identity: digest(String(accessToken)),
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${signature(payload, signingSecret(options.secret))}`;
}

export function verifySubmissionConfirmation(token, theme, accessToken, options = {}) {
  const [payload, suppliedSignature, extra] = String(token || "").split(".");
  if (!payload || !suppliedSignature || extra) throw new Error("Invalid publication confirmation");
  const expectedSignature = signature(payload, signingSecret(options.secret));
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    throw new Error("Invalid publication confirmation");
  }

  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid publication confirmation");
  }
  if (claims.v !== TOKEN_VERSION || !Number.isFinite(claims.exp) || claims.exp < (options.now ?? Date.now())) {
    throw new Error("Publication confirmation expired; review the theme again");
  }
  if (claims.theme !== digest(JSON.stringify(canonicalize(theme)))) {
    throw new Error("Theme changed after review; review the exact payload again");
  }
  if (claims.identity !== digest(String(accessToken))) {
    throw new Error("Publication confirmation belongs to a different sign-in session");
  }
  return true;
}
