import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  getClientIP,
  getSessionToken,
  RATE_LIMITS,
  resolveUser,
  type DexHttpRouter,
} from "./http_helpers";

export const COLOR_ME_LUCKY_SUBMISSION_MAX_BODY_BYTES = 8 * 1024;

function submissionResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function requestTooLargeError() {
  return Object.assign(new Error("Request body too large"), { code: "request_too_large" });
}

async function readSubmissionJson(request: Request): Promise<any> {
  const declaredLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declaredLength) && declaredLength > COLOR_ME_LUCKY_SUBMISSION_MAX_BODY_BYTES) {
    throw requestTooLargeError();
  }

  const reader = request.body?.getReader();
  if (!reader) return JSON.parse("");

  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      received += value.byteLength;
      if (received > COLOR_ME_LUCKY_SUBMISSION_MAX_BODY_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // The size decision is authoritative even if the client stream is already broken.
        }
        throw requestTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function apiRandomHue() { return Math.floor(Math.random() * 360); }
function apiRandomInRange(min: number, max: number) { return min + Math.random() * (max - min); }
function apiHslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const API_HARMONIES = [
  { name: "complementary", offsets: (h: number) => [h, (h + 180) % 360] },
  { name: "analogous", offsets: (h: number) => [h, (h + 30) % 360, (h + 330) % 360] },
  { name: "triadic", offsets: (h: number) => [h, (h + 120) % 360, (h + 240) % 360] },
  { name: "split-complementary", offsets: (h: number) => [h, (h + 150) % 360, (h + 210) % 360] },
  { name: "tetradic", offsets: (h: number) => [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360] },
  { name: "monochromatic", offsets: (h: number) => [h] },
];

const API_NAME_MOODS = [
  "Midnight", "Twilight", "Dawn", "Dusk", "Eclipse", "Solstice", "Ember", "Frost",
  "Storm", "Haze", "Mirage", "Vapor", "Zenith", "Abyss", "Cascade", "Prism",
  "Nebula", "Aurora", "Tempest", "Phantom", "Reverie", "Ether", "Velvet",
  "Obsidian", "Ivory", "Carbon", "Horizon", "Cosmos", "Oasis", "Nova", "Pulse",
  "Drift", "Atlas", "Flare", "Helix", "Onyx", "Terra", "Catalyst", "Nexus",
  "Halcyon", "Fractal", "Meridian", "Vortex", "Spectrum", "Epoch", "Genesis",
  "Beacon", "Forge", "Crucible", "Archive", "Relic", "Shrine", "Sanctum", "Haven",
];
const API_NAME_PREFIXES = [
  "Neo", "Deep", "Soft", "Hyper", "Ultra", "Pure", "Vivid", "Muted",
  "Warm", "Cool", "Neon", "Retro", "Synth", "Raw", "Zen", "Arctic",
  "Solar", "Lunar", "Electric", "Cyber", "Shadow", "Silent", "Faded",
  "Hazy", "Dusty", "Polished", "Matte", "Liquid", "Molten", "Atomic",
  "Quantum", "Radiant", "Lucid", "Astral", "Ethereal", "Primal", "Minimal",
  "Ambient", "Serene", "Fierce", "Gentle", "Bold",
];
const API_NAME_SUFFIXES = [
  "Wave", "Glow", "Shift", "Tone", "Spark", "Flow", "Fade", "Bloom",
  "Core", "Edge", "Rush", "Hue", "Lux", "Flux", "Drift", "Pulse",
  "Echo", "Dust", "Wash", "Cast", "Frost", "Heat", "Shade", "Light",
  "Code", "Mode", "Craft", "Stack", "Chrome", "Glass", "Stone", "Silk",
];

function apiPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generateApiThemeName(): string {
  const r = Math.random();
  if (r < 0.4) return `${apiPick(API_NAME_PREFIXES)} ${apiPick(API_NAME_MOODS)}`;
  if (r < 0.7) return `${apiPick(API_NAME_MOODS)} ${apiPick(API_NAME_SUFFIXES)}`;
  return `${apiPick(API_NAME_PREFIXES)} ${apiPick(API_NAME_SUFFIXES)}`;
}

function generateApiThemeColors(variant: "dark" | "light") {
  const baseHue = apiRandomHue();
  const harmony = apiPick(API_HARMONIES);
  const hues = harmony.offsets(baseHue);
  const accentHue = hues.length > 1 ? hues[1] : baseHue;
  const secondaryHue = hues.length > 2 ? hues[2] : (baseHue + 120) % 360;
  const accentSat = Math.round(apiRandomInRange(60, 90));
  const surfaceSat = Math.round(apiRandomInRange(8, 25));

  let colors;
  if (variant === "dark") {
    const surfaceL = Math.round(apiRandomInRange(5, 14));
    colors = {
      surface: apiHslToHex(baseHue, surfaceSat, surfaceL),
      ink: apiHslToHex(baseHue, Math.round(apiRandomInRange(5, 15)), Math.round(apiRandomInRange(85, 95))),
      accent: apiHslToHex(accentHue, accentSat, Math.round(apiRandomInRange(52, 68))),
      sidebar: apiHslToHex(baseHue, surfaceSat, Math.max(3, surfaceL - 3)),
      codeBg: apiHslToHex(baseHue, surfaceSat, Math.max(2, surfaceL - 4)),
      diffAdded: apiHslToHex(Math.round(apiRandomInRange(110, 150)), Math.round(apiRandomInRange(50, 70)), Math.round(apiRandomInRange(48, 62))),
      diffRemoved: apiHslToHex(Math.round(apiRandomInRange(0, 15)), Math.round(apiRandomInRange(55, 75)), Math.round(apiRandomInRange(48, 58))),
      skill: apiHslToHex(secondaryHue, Math.round(apiRandomInRange(45, 65)), Math.round(apiRandomInRange(58, 72))),
      contrast: Math.round(apiRandomInRange(50, 75)),
    };
  } else {
    const surfaceL = Math.round(apiRandomInRange(93, 98));
    colors = {
      surface: apiHslToHex(baseHue, surfaceSat, surfaceL),
      ink: apiHslToHex(baseHue, Math.round(apiRandomInRange(10, 20)), Math.round(apiRandomInRange(8, 18))),
      accent: apiHslToHex(accentHue, accentSat, Math.round(apiRandomInRange(38, 52))),
      sidebar: apiHslToHex(baseHue, surfaceSat, Math.max(88, surfaceL - 5)),
      codeBg: apiHslToHex(baseHue, surfaceSat, Math.max(86, surfaceL - 7)),
      diffAdded: apiHslToHex(Math.round(apiRandomInRange(110, 150)), Math.round(apiRandomInRange(50, 70)), Math.round(apiRandomInRange(32, 42))),
      diffRemoved: apiHslToHex(Math.round(apiRandomInRange(0, 15)), Math.round(apiRandomInRange(55, 75)), Math.round(apiRandomInRange(36, 48))),
      skill: apiHslToHex(secondaryHue, Math.round(apiRandomInRange(45, 65)), Math.round(apiRandomInRange(38, 52))),
      contrast: Math.round(apiRandomInRange(40, 55)),
    };
  }
  return { colors, harmony: harmony.name, baseHue };
}

function buildImportString(colors: any, variant: string) {
  return `codex-theme-v1:${JSON.stringify({
    codeThemeId: "codex",
    theme: {
      accent: colors.accent,
      contrast: colors.contrast,
      fonts: { code: null, ui: null },
      ink: colors.ink,
      opaqueWindows: true,
      semanticColors: {
        diffAdded: colors.diffAdded,
        diffRemoved: colors.diffRemoved,
        skill: colors.skill,
      },
      surface: colors.surface,
    },
    variant,
  })}`;
}

function openApiResponse(body: any) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Cache-Control": "no-store",
    },
  });
}

function openApiOptionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export function registerColorMeLuckyRoutes(http: DexHttpRouter) {
  http.route({
    path: "/api/color-me-lucky",
    method: "OPTIONS",
    handler: httpAction(async () => openApiOptionsResponse()),
  });

  http.route({
    path: "/api/color-me-lucky",
    method: "GET",
    handler: httpAction(async (_ctx, request) => {
      const url = new URL(request.url);
      const variant = url.searchParams.get("variant") === "light" ? "light" : "dark" as const;
      const customName = url.searchParams.get("name");
      const { colors, harmony, baseHue } = generateApiThemeColors(variant);
      const name = customName || generateApiThemeName();

      return openApiResponse({
        name,
        variant,
        harmony,
        baseHue,
        colors,
        importString: buildImportString(colors, variant),
      });
    }),
  });

  http.route({
    path: "/api/color-me-lucky/submit",
    method: "OPTIONS",
    handler: httpAction(async () => openApiOptionsResponse()),
  });

  http.route({
    path: "/api/color-me-lucky/submit",
    method: "POST",
    handler: httpAction(handleColorMeLuckySubmission),
  });
}

export async function handleColorMeLuckySubmission(ctx: any, request: Request) {
  const token = getSessionToken(request);
  if (!token) {
    return submissionResponse(
      { error: "Sign in to DexThemes first to submit themes. Visit https://dexthemes.com" },
      401,
    );
  }

  const ip = await getClientIP(ctx, request);
  const networkRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
    key: `submit:network:${ip}`,
    ...RATE_LIMITS.themeSubmitNetwork,
  });
  if (!networkRate.allowed) {
    return submissionResponse({
      error: "Too many submission attempts. Try again later.",
      retryAfter: networkRate.retryAfter,
    }, 429);
  }

  const user = await resolveUser(ctx, token);
  if (!user) return submissionResponse({ error: "Unauthorized" }, 401);
  const identityRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
    key: `submit:user:${String(user._id)}`,
    ...RATE_LIMITS.themeSubmit,
  });
  if (!identityRate.allowed) {
    return submissionResponse({
      error: "Too many submissions. Try again later.",
      retryAfter: identityRate.retryAfter,
    }, 429);
  }

  try {
    const body = await readSubmissionJson(request);
    const name = body.name;
    const variant = body.variant === "light" ? "light" : "dark";
    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return submissionResponse({ error: "A theme name is required" }, 400);
    }

    const themeId = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

    let dark, light;
    if (body.colors) {
      const c = body.colors;
      const variantObj = {
        surface: c.surface, ink: c.ink, accent: c.accent,
        contrast: c.contrast ?? (variant === "dark" ? 64 : 46),
        diffAdded: c.diffAdded, diffRemoved: c.diffRemoved, skill: c.skill,
        sidebar: c.sidebar, codeBg: c.codeBg,
      };
      if (variant === "dark") dark = variantObj;
      else light = variantObj;
    } else {
      const { colors } = generateApiThemeColors(variant as "dark" | "light");
      const variantObj = { ...colors };
      if (variant === "dark") dark = variantObj;
      else light = variantObj;
    }

    const result = await ctx.runMutation(internal.themes.submit, {
      authToken: token,
      themeId,
      name: name.trim(),
      summary: body.summary || `Generated with Color Me Lucky`,
      dark: dark || undefined,
      light: light || undefined,
      accents: [(dark || light)!.accent].filter(Boolean),
      codeThemeId: { dark: "codex", light: "codex" },
    });

    return submissionResponse({
      success: true,
      theme: result,
      message: "Theme submitted to DexThemes! View it at https://dexthemes.com",
    }, 201);
  } catch (e: any) {
    if (e?.code === "request_too_large") {
      return submissionResponse({ error: "Request body too large" }, 413);
    }
    const status = e.message === "Unauthorized" ? 401 : 400;
    return submissionResponse({ error: e.message }, status);
  }
}
