const PLUGIN_HIDDEN_UNLOCK_ACTIONS = new Set(["buy_coffee"]);

/**
 * Curated public aliases for DexThemes palettes whose original catalog labels
 * directly reference a third-party franchise or company. The source IDs stay
 * internal so existing website links and saved themes keep working; the MCP
 * surface returns only these original, descriptive labels.
 */
export const PLUGIN_THEME_ALIASES = Object.freeze({
  "ichigo-bankai": { id: "crimson-soulblade", name: "Crimson Soulblade" },
  "ichigo-hollow": { id: "ivory-mask-soulblade", name: "Ivory Mask Soulblade" },
  "naruto-hidden-leaf": {
    id: "seventh-fire-shadow",
    name: "Seventh Fire Shadow",
    summary: "A leaf-green and ember-orange palette for a steadfast village guardian.",
  },
  "gachiakuta-rudo": { id: "groundbound-scavenger", name: "Groundbound Scavenger" },
  "eren-titan-fall": { id: "fallen-colossus", name: "Fallen Colossus" },
  "goku-ultra-instinct": { id: "silver-instinct", name: "Silver Instinct" },
  "goku-ssj4": { id: "primal-crimson-ascent", name: "Primal Crimson Ascent" },
  "yuji-sukuna": { id: "cursed-twin-vessel", name: "Cursed Twin Vessel" },
  "gojo-limitless": { id: "infinite-azure", name: "Infinite Azure" },
  "jojo-dio": { id: "golden-timebreaker", name: "Golden Timebreaker" },
  "solo-leveling": { id: "solo-shadow-ascent", name: "Solo Shadow Ascent" },
  "trigun-gunsmoke": { id: "scarlet-gunsmoke", name: "Scarlet Gunsmoke" },
  "cowboy-bebop": { id: "blue-space-jazz", name: "Blue Space Jazz" },
  "ghost-in-the-shell": { id: "cybernetic-major", name: "Cybernetic Major" },
  "gundam-rx-78-2": { id: "white-orbital-prototype", name: "White Orbital Prototype" },
  "gundam-seed-strike": { id: "cosmic-strikeframe", name: "Cosmic Strikeframe" },
  "gundam-00-exia-trans-am": { id: "azure-translight", name: "Azure Translight" },
  "luffy-gear-five": { id: "sunlit-rubber-myth", name: "Sunlit Rubber Myth" },
  "liger-zero-base": { id: "zero-mechcat", name: "Zero Mechcat" },
  "liger-zero-schneider": { id: "zero-bladecat", name: "Zero Bladecat" },
  "liger-zero-jager": { id: "zero-swiftcat", name: "Zero Swiftcat" },
  "liger-zero-panzer": { id: "zero-siegecat", name: "Zero Siegecat" },
  "master-chief": {
    id: "emerald-spartan",
    name: "Emerald Spartan",
    summary: "A military sci-fi palette in armored green, amber, and deep-space black.",
  },
  "aloy-horizon": { id: "sunset-machine-huntress", name: "Sunset Machine Huntress" },
  "kratos-olympus": { id: "ashen-godslayer", name: "Ashen Godslayer" },
  "xbox-neon": { id: "neon-console-green", name: "Neon Console Green" },
  "playstation-cosmos": { id: "cosmic-controller", name: "Cosmic Controller" },
  "nintendo-switch": { id: "split-screen-neon", name: "Split-Screen Neon" },
  "mario-mushroom": { id: "scarlet-mushroom-run", name: "Scarlet Mushroom Run" },
  "sonic-boost": { id: "cobalt-speedline", name: "Cobalt Speedline" },
  "jet-set-radio": { id: "future-graffiti-radio", name: "Future Graffiti Radio" },
  "samus-metroid": { id: "orange-star-bounty", name: "Orange Star Bounty" },
  "pikachu-voltage": { id: "pocket-voltage", name: "Pocket Voltage" },
  "ash-indigo": { id: "indigo-field-trainer", name: "Indigo Field Trainer" },
  "zelda-hyrule": { id: "emerald-kingdom-legend", name: "Emerald Kingdom Legend" },
  "doom-slayer": { id: "infernal-slayer", name: "Infernal Slayer" },
  "mega-man-cobalt": { id: "cobalt-arm-cannon", name: "Cobalt Arm Cannon" },
  "terminator-future-war": { id: "chrome-future-hunter", name: "Chrome Future Hunter" },
  "avatar-pandora": { id: "bioluminescent-moon", name: "Bioluminescent Moon" },
  "kill-bill-bride": { id: "golden-bride", name: "Golden Bride" },
  "batman-knight": { id: "nocturnal-vigil", name: "Nocturnal Vigil" },
  "superman-krypton": { id: "solar-sentinel", name: "Solar Sentinel" },
  "wonder-woman": { id: "amazonian-truth", name: "Amazonian Truth" },
  "spider-man": { id: "scarlet-webline", name: "Scarlet Webline" },
  "black-panther": { id: "violet-panther-guard", name: "Violet Panther Guard" },
  "iron-man": { id: "crimson-arc-armor", name: "Crimson Arc Armor" },
  "daredevil-elektra": { id: "scarlet-rooftop-duel", name: "Scarlet Rooftop Duel" },
  "avengers-assemble": { id: "united-hero-signal", name: "United Hero Signal" },
  "justice-league": { id: "worldwatch-alliance", name: "Worldwatch Alliance" },
  "liquid-glass": { id: "orchard-glass", name: "Orchard Glass" },
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
  "halo",
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

  const sanitized = { ...theme };
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
