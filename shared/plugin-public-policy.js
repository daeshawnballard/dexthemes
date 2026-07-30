import { normalizeThemeCodeThemeId } from "./codex-theme-contract.js";

const PLUGIN_HIDDEN_UNLOCK_ACTIONS = new Set(["buy_coffee"]);

/**
 * Curated public aliases for DexThemes palettes whose original catalog labels
 * directly reference a third-party franchise or company. The source IDs stay
 * internal so existing website links and saved themes keep working; the MCP
 * surface returns only these original, descriptive labels.
 */
export const PLUGIN_THEME_ALIASES = Object.freeze({
  "ichigo-bankai": {
    id: "crimson-soulblade",
    name: "Crimson Soulblade",
    summary: "Blackened steel, ember orange, and disciplined crimson for focused work under pressure.",
  },
  "ichigo-hollow": {
    id: "ivory-mask-soulblade",
    name: "Ivory Mask Soulblade",
    summary: "Porcelain white, shadow black, and sharp crimson for calm focus with a dangerous edge.",
  },
  "naruto-hidden-leaf": {
    id: "seventh-fire-shadow",
    name: "Seventh Fire Shadow",
    summary: "Leaf-green, ember-orange, and midnight blue for a determined village guardian carrying a legacy forward.",
  },
  "gachiakuta-rudo": {
    id: "groundbound-scavenger",
    name: "Groundbound Scavenger",
    summary: "Salvaged charcoal, oxidized green, and dust-worn neutrals for resourceful work built from scraps.",
  },
  "eren-titan-fall": {
    id: "fallen-colossus",
    name: "Fallen Colossus",
    summary: "Storm-gray stone, weathered earth, and blood-red resolve on an immense, tragic scale.",
  },
  "goku-ultra-instinct": {
    id: "silver-instinct",
    name: "Silver Instinct",
    summary: "Silver light, cool violet, and deep cosmic shadow for effortless precision at full focus.",
  },
  "goku-ssj4": {
    id: "primal-crimson-ascent",
    name: "Primal Crimson Ascent",
    summary: "Wild crimson, midnight black, and electric gold for untamed power climbing higher.",
  },
  "yuji-sukuna": {
    id: "cursed-twin-vessel",
    name: "Cursed Twin Vessel",
    summary: "Inked crimson, bruised violet, and pale neutrals for two forces sharing one dangerous frame.",
  },
  "gojo-limitless": {
    id: "infinite-azure",
    name: "Infinite Azure",
    summary: "Clean white, electric azure, and violet energy for clarity that makes every task feel within reach.",
  },
  "jojo-dio": {
    id: "golden-timebreaker",
    name: "Golden Timebreaker",
    summary: "Royal gold, midnight violet, and sharp green for theatrical confidence that seems to stop the clock.",
  },
  "solo-leveling": {
    id: "solo-shadow-ascent",
    name: "Solo Shadow Ascent",
    summary: "Deep indigo, spectral violet, and cold steel for a solitary climb through gathering shadows.",
  },
  "trigun-gunsmoke": {
    id: "scarlet-gunsmoke",
    name: "Scarlet Gunsmoke",
    summary: "Desert amber, scarlet cloth, and weathered steel for compassionate focus in a restless frontier.",
  },
  "cowboy-bebop": {
    id: "blue-space-jazz",
    name: "Blue Space Jazz",
    summary: "Midnight navy, brass gold, and electric blue for late-night focus with improvisational rhythm.",
  },
  "ghost-in-the-shell": {
    id: "cybernetic-major",
    name: "Cybernetic Major",
    summary: "Cyan circuitry, shell-white highlights, and deep navy for precise work at the edge of self and machine.",
  },
  "gundam-rx-78-2": {
    id: "white-orbital-prototype",
    name: "White Orbital Prototype",
    summary: "Orbital white, signal blue, and warning red for a clean, high-mobility prototype workspace.",
  },
  "gundam-seed-strike": {
    id: "cosmic-strikeframe",
    name: "Cosmic Strikeframe",
    summary: "Cosmic blue, hot crimson, and sunlit yellow for a fast, balanced frame built for decisive work.",
  },
  "gundam-00-exia-trans-am": {
    id: "azure-translight",
    name: "Azure Translight",
    summary: "Azure energy, rose acceleration, and neon cyan for a workspace that shifts into overdrive.",
  },
  "luffy-gear-five": {
    id: "sunlit-rubber-myth",
    name: "Sunlit Rubber Myth",
    summary: "Cloud white, sunrise red, and ocean blue for playful freedom with mythic momentum.",
  },
  "liger-zero-base": {
    id: "zero-mechcat",
    name: "Zero Mechcat",
    summary: "Pearl armor, cobalt mechanics, and bright gold for an agile machine with a fiercely independent spirit.",
  },
  "liger-zero-schneider": {
    id: "zero-bladecat",
    name: "Zero Bladecat",
    summary: "Burnished orange, blade silver, and deep navy for close-range focus with a decisive edge.",
  },
  "liger-zero-jager": {
    id: "zero-swiftcat",
    name: "Zero Swiftcat",
    summary: "Cobalt blue, jet white, and cool cyan for high-speed work with aerodynamic clarity.",
  },
  "liger-zero-panzer": {
    id: "zero-siegecat",
    name: "Zero Siegecat",
    summary: "Forest green, heavy graphite, and artillery gold for patient power built to hold the line.",
  },
  "master-chief": {
    id: "emerald-spartan",
    name: "Emerald Spartan",
    summary: "Armored olive, amber optics, and deep-space black for calm focus against impossible odds.",
  },
  "aloy-horizon": {
    id: "sunset-machine-huntress",
    name: "Sunset Machine Huntress",
    summary: "Desert orange, machine blue, and woven earth tones for patient tracking across a recovering world.",
  },
  "kratos-olympus": {
    id: "ashen-godslayer",
    name: "Ashen Godslayer",
    summary: "Ash-white, blood-red, and weathered bronze for deliberate strength shaped by old consequences.",
  },
  "xbox-neon": {
    id: "neon-console-green",
    name: "Neon Console Green",
    summary: "Electric green on carbon black for a fast, high-contrast console glow.",
  },
  "playstation-cosmos": {
    id: "cosmic-controller",
    name: "Cosmic Controller",
    summary: "Deep-space blue, pearlescent white, and electric violet for a polished controller-inspired workspace.",
  },
  "nintendo-switch": {
    id: "split-screen-neon",
    name: "Split-Screen Neon",
    summary: "Split cyan and coral over graphite for playful motion and handheld energy.",
  },
  "mario-mushroom": {
    id: "scarlet-mushroom-run",
    name: "Scarlet Mushroom Run",
    summary: "Scarlet red, sky blue, and bright gold for buoyant momentum through every level.",
  },
  "sonic-boost": {
    id: "cobalt-speedline",
    name: "Cobalt Speedline",
    summary: "Cobalt blue, ring gold, and clean white for a workspace built to move before hesitation catches up.",
  },
  "jet-set-radio": {
    id: "future-graffiti-radio",
    name: "Future Graffiti Radio",
    summary: "Spray-paint lime, street orange, and asphalt black for rebellious creative momentum.",
  },
  "samus-metroid": {
    id: "orange-star-bounty",
    name: "Orange Star Bounty",
    summary: "Armored orange, nebula violet, and cold blue for solitary exploration through hostile worlds.",
  },
  "pikachu-voltage": {
    id: "pocket-voltage",
    name: "Pocket Voltage",
    summary: "Bright yellow, coal black, and spark-red accents for compact energy that never sits still.",
  },
  "ash-indigo": {
    id: "indigo-field-trainer",
    name: "Indigo Field Trainer",
    summary: "Indigo, field green, and warm cap-red for curious exploration and steady growth.",
  },
  "zelda-hyrule": {
    id: "emerald-kingdom-legend",
    name: "Emerald Kingdom Legend",
    summary: "Forest green, ancient gold, and moonlit blue for quiet courage across a storied kingdom.",
  },
  "doom-slayer": {
    id: "infernal-slayer",
    name: "Infernal Slayer",
    summary: "Hellfire orange, scorched black, and warning red for relentless forward motion.",
  },
  "mega-man-cobalt": {
    id: "cobalt-arm-cannon",
    name: "Cobalt Arm Cannon",
    summary: "Cobalt armor, sky-blue energy, and clean white for precise, modular problem solving.",
  },
  "terminator-future-war": {
    id: "chrome-future-hunter",
    name: "Chrome Future Hunter",
    summary: "Chrome steel, infrared red, and terminal black for cold, methodical focus from tomorrow.",
  },
  "avatar-pandora": {
    id: "bioluminescent-moon",
    name: "Bioluminescent Moon",
    summary: "Bioluminescent cyan, rainforest green, and midnight indigo for an immersive alien wilderness.",
  },
  "kill-bill-bride": {
    id: "golden-bride",
    name: "Golden Bride",
    summary: "Saturated yellow, lacquer black, and blood-red accents for stylish focus with a sharp edge.",
  },
  "batman-knight": {
    id: "nocturnal-vigil",
    name: "Nocturnal Vigil",
    summary: "Carbon black, signal gold, and rain-soaked gray for disciplined focus after dark.",
  },
  "superman-krypton": {
    id: "solar-sentinel",
    name: "Solar Sentinel",
    summary: "Primary blue, solar red, and warm gold for optimistic strength under an open sky.",
  },
  "wonder-woman": {
    id: "amazonian-truth",
    name: "Amazonian Truth",
    summary: "Crimson, antique gold, and midnight blue for principled strength carried with grace.",
  },
  "spider-man": {
    id: "scarlet-webline",
    name: "Scarlet Webline",
    summary: "Scarlet red, electric blue, and city-night charcoal for agile focus across a living skyline.",
  },
  "black-panther": {
    id: "violet-panther-guard",
    name: "Violet Panther Guard",
    summary: "Royal violet, polished silver, and deep black for quiet precision and protected power.",
  },
  "iron-man": {
    id: "crimson-arc-armor",
    name: "Crimson Arc Armor",
    summary: "Crimson metal, reactor blue, and molten gold for inventive confidence inside a polished shell.",
  },
  "daredevil-elektra": {
    id: "scarlet-rooftop-duel",
    name: "Scarlet Rooftop Duel",
    summary: "Scarlet, shadow black, and neon rose for heightened focus above a sleepless city.",
  },
  "avengers-assemble": {
    id: "united-hero-signal",
    name: "United Hero Signal",
    summary: "Signal blue, heroic red, and bright gold for coordinated momentum across a full team.",
  },
  "justice-league": {
    id: "worldwatch-alliance",
    name: "Worldwatch Alliance",
    summary: "Sky blue, watchtower silver, and midnight navy for calm coordination at global scale.",
  },
  "liquid-glass": {
    id: "orchard-glass",
    name: "Orchard Glass",
    summary: "Translucent graphite, refracted color, and cool glass highlights for a layered modern workspace.",
  },
});

const ALIAS_SOURCE_BY_ID = new Map(
  Object.entries(PLUGIN_THEME_ALIASES).map(([sourceId, alias]) => [alias.id, sourceId]),
);

// Search-only vocabulary keeps familiar user intent discoverable without
// returning those third-party labels in MCP results.
const PLUGIN_THEME_SEARCH_TERMS = Object.freeze({
  "ichigo-bankai": ["bleach"],
  "ichigo-hollow": ["bleach"],
  "naruto-hidden-leaf": ["seventh hokage", "hokage"],
  "eren-titan-fall": ["attack on titan"],
  "goku-ultra-instinct": ["dragon ball"],
  "goku-ssj4": ["dragon ball"],
  "yuji-sukuna": ["jujutsu kaisen"],
  "gojo-limitless": ["jujutsu kaisen"],
  "jojo-dio": ["bizarre adventure"],
  "solo-leveling": ["solo leveling"],
  "luffy-gear-five": ["one piece"],
  "liger-zero-base": ["zoids"],
  "liger-zero-schneider": ["zoids"],
  "liger-zero-jager": ["zoids"],
  "liger-zero-panzer": ["zoids"],
  "master-chief": ["halo", "halo reach"],
  "aloy-horizon": ["horizon zero dawn"],
  "kratos-olympus": ["god of war"],
  "mario-mushroom": ["super mario"],
  "sonic-boost": ["sonic the hedgehog"],
  "pikachu-voltage": ["pokemon"],
  "ash-indigo": ["pokemon"],
  "zelda-hyrule": ["legend of zelda"],
  "doom-slayer": ["doom eternal"],
  "avatar-pandora": ["avatar pandora"],
});

// Deliberately exact and conservative. Generic concepts such as countries,
// sports, colors, "at night", "spartan", and "mushroom" are not blocked.
const PUBLIC_FANDOM_PHRASES = Object.freeze([
  "aloy",
  "apple liquid glass",
  "arc reactor",
  "attack on titan",
  "avatar pandora",
  "avengers",
  "bankai",
  "batman",
  "black panther",
  "cowboy bebop",
  "cortana",
  "daredevil",
  "doom slayer",
  "eren",
  "gachiakuta",
  "gear five",
  "ghost in the shell",
  "gojo",
  "goku",
  "gundam",
  "halo reach",
  "hidden leaf",
  "hokage",
  "hyrule",
  "ichigo",
  "igris",
  "iron man",
  "jet set radio",
  "jojo",
  "justice league",
  "kill bill",
  "konoha",
  "kratos",
  "luffy",
  "liger zero",
  "liquid glass",
  "mario mushroom",
  "master chief",
  "mega man",
  "metroid",
  "mjolnir",
  "mushroom kingdom",
  "naruto",
  "nintendo switch",
  "pikachu",
  "pokemon",
  "playstation",
  "samus",
  "sonic the hedgehog",
  "solo leveling",
  "spartan 117",
  "spider man",
  "sukuna",
  "sung jinwoo",
  "super mario",
  "super saiyan",
  "superman",
  "terminator",
  "trigun",
  "ultra instinct",
  "unsc",
  "uzumaki",
  "vibranium",
  "wonder woman",
  "xbox",
  "yuji itadori",
  "zelda",
  "zoids",
]);

function normalizeIdentityText(value) {
  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  return normalized.replace(/\b(?:[a-z0-9]\s+){3,}[a-z0-9]\b/g, (match) => match.replace(/\s/g, ""));
}

function containsPhrase(text, phrase) {
  if (!text || !phrase) return false;
  return ` ${text} `.includes(` ${phrase} `);
}

function hash32(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function accentFamily(theme) {
  const accent = theme?.dark?.accent || theme?.light?.accent || theme?.accents?.[0];
  if (!/^#[0-9A-Fa-f]{6}$/.test(String(accent || ""))) return "Midnight";
  const red = parseInt(accent.slice(1, 3), 16) / 255;
  const green = parseInt(accent.slice(3, 5), 16) / 255;
  const blue = parseInt(accent.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  if (max - min < 0.12) return "Silver";
  let hue;
  if (max === red) hue = 60 * (((green - blue) / (max - min)) % 6);
  else if (max === green) hue = 60 * ((blue - red) / (max - min) + 2);
  else hue = 60 * ((red - green) / (max - min) + 4);
  if (hue < 0) hue += 360;
  if (hue < 20 || hue >= 345) return "Crimson";
  if (hue < 55) return "Amber";
  if (hue < 165) return "Verdant";
  if (hue < 255) return "Azure";
  if (hue < 300) return "Violet";
  return "Rose";
}

export function suggestOriginalPublicNames(theme) {
  const family = accentFamily(theme);
  const nouns = ["Afterglow", "Signal", "Nightfall", "Relay", "Current", "Mosaic", "Pulse", "Foundry"];
  const seed = hash32(`${theme?.name || ""}:${theme?.themeId || theme?.id || ""}`);
  return [0, 1, 2].map((offset) => `${family} ${nouns[(seed + offset * 3) % nouns.length]}`);
}

export function suggestOriginalPublicSummary(theme) {
  return `An original ${accentFamily(theme).toLowerCase()} workspace palette with balanced dark and light variants.`;
}

export function evaluatePublicThemeIdentity(theme) {
  const fields = {
    name: normalizeIdentityText(theme?.name),
    id: normalizeIdentityText(theme?.themeId || theme?.id),
    summary: normalizeIdentityText(theme?.summary),
  };
  const matches = [];
  for (const phrase of PUBLIC_FANDOM_PHRASES) {
    if (Object.values(fields).some((value) => containsPhrase(value, phrase))) matches.push(phrase);
  }
  return {
    allowed: matches.length === 0,
    matches: [...new Set(matches)],
    suggestedNames: matches.length ? suggestOriginalPublicNames(theme) : [],
    suggestedSummary: matches.length ? suggestOriginalPublicSummary(theme) : null,
  };
}

export function isPluginUnlockVisible(unlock) {
  return !PLUGIN_HIDDEN_UNLOCK_ACTIONS.has(String(unlock?.action || ""));
}

export function getPluginThemeAlias(sourceId) {
  return PLUGIN_THEME_ALIASES[String(sourceId || "").toLowerCase()] || null;
}

export function getPluginThemeSearchTerms(sourceId) {
  return PLUGIN_THEME_SEARCH_TERMS[String(sourceId || "").toLowerCase()] || [];
}

export function getWebsiteThemeId(themeOrId) {
  const sourceId = String(
    typeof themeOrId === "object"
      ? themeOrId?.id || themeOrId?.themeId || ""
      : themeOrId || "",
  ).trim().toLowerCase();
  return getPluginThemeAlias(sourceId)?.id || sourceId;
}

/**
 * Website presentation keeps the source ID stable for saved links, likes, and
 * copy counts while sharing the same public-facing identity as the plugin.
 * Unsafe community rows without a curated alias stay out of the public gallery.
 */
export function presentThemeForWebsite(theme) {
  if (!theme || typeof theme !== "object") return null;
  const sourceId = String(theme.id || theme.themeId || "").toLowerCase();
  const alias = getPluginThemeAlias(sourceId);
  const builtInCodex = theme.category === "official" || theme.category === "codex";
  if (!alias && !builtInCodex && !evaluatePublicThemeIdentity(theme).allowed) return null;
  if (!alias) return theme;

  const summary = alias.summary || suggestOriginalPublicSummary(theme);
  return {
    ...theme,
    name: alias.name,
    summary,
    _summary: summary,
  };
}

export function presentThemeForPublicApi(theme) {
  const presented = presentThemeForWebsite(theme);
  if (!presented) return null;
  const publicThemeId = getWebsiteThemeId(theme);
  return {
    ...presented,
    id: publicThemeId,
    themeId: publicThemeId,
  };
}

export function websiteThemeMatchesSearch(theme, query) {
  const normalizedQuery = normalizeIdentityText(query);
  if (!normalizedQuery) return true;
  const sourceId = String(theme?.id || theme?.themeId || "").toLowerCase();
  const searchable = normalizeIdentityText([
    theme?.name,
    sourceId,
    ...getPluginThemeSearchTerms(sourceId),
  ].filter(Boolean).join(" "));
  return normalizedQuery.split(" ").every((term) => searchable.includes(term));
}

export function resolvePluginThemeSourceId(id) {
  const normalized = String(id || "").trim().toLowerCase();
  return ALIAS_SOURCE_BY_ID.get(normalized) || normalized;
}

export function sanitizeThemeForPlugin(theme) {
  if (!theme || typeof theme !== "object") return null;
  const sourceId = String(theme.id || theme.themeId || "").toLowerCase();
  const alias = getPluginThemeAlias(sourceId);
  const builtInCodex = theme.category === "codex";
  if (!alias && !builtInCodex && !evaluatePublicThemeIdentity(theme).allowed) return null;
  const codeThemeId = normalizeThemeCodeThemeId(theme);
  if (!codeThemeId) return null;

  const sanitized = { ...theme, codeThemeId };
  delete sanitized.authorIsSupporter;
  delete sanitized.supporter;
  delete sanitized.supporterStatus;
  delete sanitized.donation;
  if (alias) {
    sanitized.id = alias.id;
    sanitized.themeId = alias.id;
    sanitized.name = alias.name;
    sanitized.summary = alias.summary || null;
    delete sanitized._summary;
  }
  return sanitized;
}

export function sanitizeThemeRowsForPlugin(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((theme) => sanitizeThemeForPlugin(theme))
    .filter(Boolean);
}

export function sanitizeCreatorStatsForPlugin(stats) {
  if (!stats || typeof stats !== "object") return {};
  const sanitized = { ...stats };
  if (Array.isArray(sanitized.themes)) {
    sanitized.themes = sanitizeThemeRowsForPlugin(sanitized.themes);
  }
  if (sanitized.leaderboard && typeof sanitized.leaderboard === "object") {
    sanitized.leaderboard = Object.fromEntries(
      Object.entries(sanitized.leaderboard).map(([period, entry]) => {
        if (Array.isArray(entry)) return [period, sanitizeThemeRowsForPlugin(entry)];
        if (!entry || typeof entry !== "object") return [period, entry];
        return [period, sanitizeThemeForPlugin(entry)];
      }),
    );
  }
  if (sanitized.popularityWins && typeof sanitized.popularityWins === "object") {
    sanitized.popularityWins = {
      ...sanitized.popularityWins,
      recent: sanitizeThemeRowsForPlugin(sanitized.popularityWins.recent),
    };
  }
  return sanitized;
}
