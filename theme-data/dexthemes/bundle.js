(function () {
  const DARK_DEFAULTS = { diffAdded: '#40c977', diffRemoved: '#fa423e', skill: '#ad7bf9' };
  const LIGHT_DEFAULTS = { diffAdded: '#00a240', diffRemoved: '#ba2623', skill: '#924ff7' };

  function clamp(value) {
    return Math.max(0, Math.min(255, value));
  }

  function shiftHex(hex, amount) {
    const r = clamp(parseInt(hex.slice(1, 3), 16) + amount);
    const g = clamp(parseInt(hex.slice(3, 5), 16) + amount);
    const b = clamp(parseInt(hex.slice(5, 7), 16) + amount);
    return `#${[r, g, b].map((part) => part.toString(16).padStart(2, '0')).join('')}`;
  }

  function createVariant(mode, variant) {
    const defaults = mode === 'dark' ? DARK_DEFAULTS : LIGHT_DEFAULTS;
    const sidebarShift = mode === 'dark' ? -7 : -10;
    const codeBgShift = mode === 'dark' ? -12 : -14;
    return {
      contrast: mode === 'dark' ? 64 : 46,
      ...defaults,
      ...variant,
      sidebar: variant.sidebar || shiftHex(variant.surface, sidebarShift),
      codeBg: variant.codeBg || shiftHex(variant.surface, codeBgShift),
    };
  }

  function createDexTheme({
    id,
    name,
    dateAdded = '2026-03-14',
    copies = 0,
    accents,
    light,
    dark,
    variants,
    _company,
    _locked,
  }) {
    const theme = {
      id,
      name,
      codeThemeId: 'codex',
      copies,
      dateAdded,
    };

    if (_company) theme._company = _company;
    if (_locked) theme._locked = _locked;

    if (dark) theme.dark = createVariant('dark', dark);
    if (light) theme.light = createVariant('light', light);
    if (variants) theme.variants = variants;

    theme.accents =
      accents ||
      [theme.dark?.accent, theme.light?.accent].filter((value, index, array) => value && array.indexOf(value) === index);

    return theme;
  }

  function registerDexThemesPack(group, themes) {
    const root = (window.DEXTHEMES_PACKS ||= { dexthemes: {} });
    root.dexthemes[group] = themes.map((theme) => ({
      ...theme,
      category: 'dexthemes',
      subgroup: group,
    }));
  }

  window.createDexTheme = createDexTheme;
  window.registerDexThemesPack = registerDexThemesPack;
  window.DEXTHEMES_GROUP_LABELS = {
    anime: 'Anime',
    games: 'Video Games',
    movies: 'Movies',
    comics: 'Comics',
    zodiacs: 'Zodiacs',
    lunar: 'Lunar Animals',
    companies: 'Companies',
    originals: 'Originals',
    supporter: 'Unlockables',
  };
})();
registerDexThemesPack('anime', [
  createDexTheme({
    id: 'ichigo-bankai',
    name: 'Ichigo / Bankai',
    copies: 87,
    dateAdded: '2025-12-01',
    dark: { surface: '#121111', ink: '#FFF4EC', accent: '#FF7A1A', diffAdded: '#22C55E', diffRemoved: '#EF4444', skill: '#F59E0B' },
    light: { surface: '#FFF7F2', ink: '#121212', accent: '#F97316', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#F59E0B' },
  }),
  createDexTheme({
    id: 'ichigo-hollow',
    name: 'Ichigo / Hollow Mask',
    copies: 64,
    dark: { surface: '#0E0C10', ink: '#F7F1F8', accent: '#E11D48', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#F8FAFC' },
    light: { surface: '#F6F2F7', ink: '#1A141C', accent: '#111827', diffAdded: '#16A34A', diffRemoved: '#BE123C', skill: '#9F1239' },
  }),
  createDexTheme({
    id: 'naruto-hidden-leaf',
    name: 'Naruto / Hidden Leaf',
    copies: 112,
    dateAdded: '2025-12-01',
    dark: { surface: '#101418', ink: '#F7F3EA', accent: '#FF9F1C', diffAdded: '#22C55E', diffRemoved: '#F97316', skill: '#F59E0B' },
    light: { surface: '#FFF8ED', ink: '#1A1A1A', accent: '#F59E0B', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#EA580C' },
  }),
  createDexTheme({
    id: 'gachiakuta-rudo',
    name: 'Gachiakuta / Rudo',
    copies: 39,
    dark: { surface: '#111417', ink: '#E8EDF1', accent: '#78C6A3', diffAdded: '#22C55E', diffRemoved: '#F87171', skill: '#93C5FD' },
    light: { surface: '#EEE7D8', ink: '#2E2A25', accent: '#4B5563', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#D97706' },
  }),
  createDexTheme({
    id: 'eren-titan-fall',
    name: 'Eren / Titan Fall',
    copies: 58,
    dark: { surface: '#0E1113', ink: '#F3E9D7', accent: '#8B1E1E', diffAdded: '#4ADE80', diffRemoved: '#DC2626', skill: '#F59E0B' },
    light: { surface: '#F7F2EA', ink: '#23211E', accent: '#3B5C74', diffAdded: '#16A34A', diffRemoved: '#B91C1C', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'goku-ultra-instinct',
    name: 'Goku / Ultra Instinct',
    copies: 74,
    dark: { surface: '#161218', ink: '#F9F7FB', accent: '#7C3AED', diffAdded: '#34D399', diffRemoved: '#F472B6', skill: '#F9FAFB' },
    light: { surface: '#F5F9FF', ink: '#18212D', accent: '#A5B4FC', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#60A5FA' },
  }),
  createDexTheme({
    id: 'goku-ssj4',
    name: 'Goku / Super Saiyan 4',
    copies: 51,
    dark: { surface: '#180D11', ink: '#FFF1F2', accent: '#D9465F', diffAdded: '#4ADE80', diffRemoved: '#FB7185', skill: '#F59E0B' },
    light: { surface: '#F8F2ED', ink: '#2C1A1D', accent: '#E76F51', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'yuji-sukuna',
    name: 'Yuji / Sukuna',
    copies: 67,
    dark: { surface: '#110E12', ink: '#FAF5F5', accent: '#D62839', diffAdded: '#22C55E', diffRemoved: '#F87171', skill: '#A855F7' },
    light: { surface: '#FFF7F5', ink: '#251C20', accent: '#F97316', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#7C3AED' },
  }),
  createDexTheme({
    id: 'gojo-limitless',
    name: 'Gojo / Limitless',
    copies: 63,
    dark: { surface: '#0D1220', ink: '#EEF6FF', accent: '#60A5FA', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#A78BFA' },
    light: { surface: '#F5FAFF', ink: '#102132', accent: '#BFDBFE', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#6366F1' },
  }),
  createDexTheme({
    id: 'jojo-dio',
    name: 'JoJo / Dio',
    copies: 44,
    dark: { surface: '#161019', ink: '#F7F3FB', accent: '#D4AF37', diffAdded: '#22C55E', diffRemoved: '#FB7185', skill: '#8B5CF6' },
    light: { surface: '#FFF7D6', ink: '#241A24', accent: '#7C3AED', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#F59E0B' },
  }),
  createDexTheme({
    id: 'solo-leveling',
    name: 'Sung Jinwoo / Igris',
    copies: 59,
    dark: { surface: '#0C1020', ink: '#E6ECFF', accent: '#4C6FFF', diffAdded: '#22C55E', diffRemoved: '#F87171', skill: '#7C3AED' },
    light: { surface: '#F4F7FF', ink: '#1A2238', accent: '#94A3FF', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#4338CA' },
  }),
  createDexTheme({
    id: 'trigun-gunsmoke',
    name: 'Trigun / Gunsmoke',
    copies: 34,
    dark: { surface: '#16110E', ink: '#F8EFE6', accent: '#D97706', diffAdded: '#22C55E', diffRemoved: '#EF4444', skill: '#F59E0B' },
    light: { surface: '#F5E6C8', ink: '#2C221B', accent: '#B45309', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'cowboy-bebop',
    name: 'Cowboy Bebop / Blue Jazz',
    copies: 41,
    dark: { surface: '#111827', ink: '#EAF2FF', accent: '#38BDF8', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#FBBF24' },
    light: { surface: '#F6E8C7', ink: '#1F2937', accent: '#0EA5E9', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#D97706' },
  }),
  createDexTheme({
    id: 'ghost-in-the-shell',
    name: 'Ghost in the Shell / Major',
    copies: 47,
    dark: { surface: '#0B1220', ink: '#E5F4FF', accent: '#00B8D9', diffAdded: '#2DD4BF', diffRemoved: '#FB7185', skill: '#818CF8' },
    light: { surface: '#F2FCFF', ink: '#0F1E2E', accent: '#38BDF8', diffAdded: '#0F766E', diffRemoved: '#DC2626', skill: '#4F46E5' },
  }),
  createDexTheme({
    id: 'gundam-rx-78-2',
    name: 'Gundam / RX-78-2',
    copies: 0,
    dateAdded: '2026-05-15',
    accents: ['#2F6FE4', '#EF3340', '#FACC15'],
    dark: { surface: '#0B1020', ink: '#F4F7FB', accent: '#2F6FE4', diffAdded: '#4ADE80', diffRemoved: '#EF3340', skill: '#FACC15', sidebar: '#070B16', codeBg: '#040711' },
    light: { surface: '#F6F8FC', ink: '#182132', accent: '#2457C5', diffAdded: '#15803D', diffRemoved: '#DC2626', skill: '#B7791F', sidebar: '#E8ECF5', codeBg: '#EEF2F8' },
  }),
  createDexTheme({
    id: 'gundam-seed-strike',
    name: 'Gundam SEED / Strike',
    copies: 0,
    dateAdded: '2026-05-15',
    accents: ['#1D4ED8', '#E11D48', '#FACC15'],
    dark: { surface: '#080D17', ink: '#F8FAFC', accent: '#1D4ED8', diffAdded: '#22C55E', diffRemoved: '#E11D48', skill: '#FACC15', sidebar: '#050914', codeBg: '#030711' },
    light: { surface: '#FBFCFF', ink: '#172033', accent: '#1E40AF', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#C98900', sidebar: '#EEF2F8', codeBg: '#F4F7FB' },
  }),
  createDexTheme({
    id: 'luffy-gear-five',
    name: 'Luffy / Gear Five',
    copies: 57,
    dark: { surface: '#0F172A', ink: '#F8F1DC', accent: '#F87171', diffAdded: '#22C55E', diffRemoved: '#EF4444', skill: '#60A5FA' },
    light: { surface: '#F7F9FF', ink: '#20293A', accent: '#F3F4F6', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#60A5FA', sidebar: '#EEF2FF', codeBg: '#E6EDFF' },
  }),
  createDexTheme({
    id: 'shonen-sunset',
    name: 'Shonen Sunset',
    copies: 76,
    dateAdded: '2026-01-10',
    dark: { surface: '#111827', ink: '#FFF7ED', accent: '#FB923C', diffAdded: '#22C55E', diffRemoved: '#EF4444', skill: '#A855F7' },
    light: { surface: '#FFF7E8', ink: '#161616', accent: '#EA580C', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#7C3AED' },
  }),
]);
registerDexThemesPack('games', [
  createDexTheme({
    id: 'master-chief',
    name: 'Master Chief / Mjolnir',
    copies: 48,
    dark: { surface: '#0F1410', ink: '#E8F3DD', accent: '#7FB069', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#FBBF24' },
    light: { surface: '#EAF0DE', ink: '#1F2A20', accent: '#5E8C31', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'aloy-horizon',
    name: 'Aloy / Horizon',
    copies: 33,
    dark: { surface: '#111926', ink: '#E9F1F8', accent: '#F97316', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#38BDF8' },
    light: { surface: '#F5E7D2', ink: '#2A2A2A', accent: '#EA580C', diffAdded: '#15803D', diffRemoved: '#C2410C', skill: '#0284C7' },
  }),
  createDexTheme({
    id: 'kratos-olympus',
    name: 'Kratos / Olympus',
    copies: 45,
    dark: { surface: '#121010', ink: '#F7F2EE', accent: '#B91C1C', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#D4D4D8' },
    light: { surface: '#F6F1EB', ink: '#2B2321', accent: '#9A3412', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#64748B' },
  }),
  createDexTheme({
    id: 'xbox-neon',
    name: 'Xbox / Neon',
    copies: 52,
    dark: { surface: '#0A0F0A', ink: '#E9FFE9', accent: '#22C55E', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#A3E635' },
    light: { surface: '#F4FFF5', ink: '#12301A', accent: '#16A34A', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#65A30D' },
  }),
  createDexTheme({
    id: 'playstation-cosmos',
    name: 'PlayStation / Cosmos',
    copies: 49,
    dark: { surface: '#0C1124', ink: '#EAF0FF', accent: '#2563EB', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#818CF8' },
    light: { surface: '#F4F7FF', ink: '#1B2A4A', accent: '#1D4ED8', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#4338CA' },
  }),
  createDexTheme({
    id: 'nintendo-switch',
    name: 'Nintendo / Switch Split',
    copies: 61,
    dark: { surface: '#11131A', ink: '#F8FAFC', accent: '#22D3EE', diffAdded: '#14B8A6', diffRemoved: '#FB7185', skill: '#22D3EE' },
    light: { surface: '#FFF4F5', ink: '#141414', accent: '#E11D48', diffAdded: '#14B8A6', diffRemoved: '#E11D48', skill: '#06B6D4' },
  }),
  createDexTheme({
    id: 'mario-mushroom',
    name: 'Mario / Mushroom Kingdom',
    copies: 44,
    dark: { surface: '#15151A', ink: '#FFF8F4', accent: '#EF4444', diffAdded: '#4ADE80', diffRemoved: '#FB7185', skill: '#3B82F6' },
    light: { surface: '#FFF5E8', ink: '#2A1810', accent: '#F59E0B', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'sonic-boost',
    name: 'Sonic / Boost',
    copies: 39,
    dark: { surface: '#0A1326', ink: '#ECF4FF', accent: '#3B82F6', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#FACC15' },
    light: { surface: '#F5FBFF', ink: '#17304F', accent: '#0EA5E9', diffAdded: '#15803D', diffRemoved: '#DC2626', skill: '#EAB308' },
  }),
  createDexTheme({
    id: 'jet-set-radio',
    name: 'Jet Set Radio Future',
    copies: 28,
    dark: { surface: '#12121A', ink: '#F7FFFB', accent: '#22C55E', diffAdded: '#4ADE80', diffRemoved: '#FB7185', skill: '#F97316' },
    light: { surface: '#F9FFE8', ink: '#18231A', accent: '#84CC16', diffAdded: '#16A34A', diffRemoved: '#EA580C', skill: '#FB7185' },
  }),
  createDexTheme({
    id: 'samus-metroid',
    name: 'Samus / Metroid',
    copies: 36,
    dark: { surface: '#120E19', ink: '#FFF2D8', accent: '#F59E0B', diffAdded: '#4ADE80', diffRemoved: '#F97316', skill: '#7C3AED' },
    light: { surface: '#F7EEE1', ink: '#2A1F1A', accent: '#EA580C', diffAdded: '#15803D', diffRemoved: '#C2410C', skill: '#6D28D9' },
  }),
  createDexTheme({
    id: 'pikachu-voltage',
    name: 'Pikachu / Voltage',
    copies: 42,
    dark: { surface: '#171412', ink: '#FFF7D6', accent: '#FACC15', diffAdded: '#4ADE80', diffRemoved: '#FB7185', skill: '#60A5FA' },
    light: { surface: '#FFFBE8', ink: '#2A2412', accent: '#EAB308', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'ash-indigo',
    name: 'Ash / Indigo',
    copies: 27,
    dark: { surface: '#111827', ink: '#EFF6FF', accent: '#EF4444', diffAdded: '#4ADE80', diffRemoved: '#FB7185', skill: '#60A5FA' },
    light: { surface: '#F5F7FF', ink: '#1E293B', accent: '#2563EB', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#DC2626' },
  }),
  createDexTheme({
    id: 'zelda-hyrule',
    name: 'Zelda / Hyrule',
    copies: 53,
    dark: { surface: '#0F1712', ink: '#ECF9F0', accent: '#10B981', diffAdded: '#4ADE80', diffRemoved: '#FB7185', skill: '#EAB308' },
    light: { surface: '#F4F0D7', ink: '#223127', accent: '#0F766E', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'doom-slayer',
    name: 'Doom / Slayer',
    copies: 47,
    dark: { surface: '#0B0D0B', ink: '#E8F5E9', accent: '#22C55E', diffAdded: '#4ADE80', diffRemoved: '#EF4444', skill: '#84CC16' },
    light: { surface: '#E9EFE6', ink: '#1A261A', accent: '#15803D', diffAdded: '#166534', diffRemoved: '#B91C1C', skill: '#65A30D' },
  }),
  createDexTheme({
    id: 'mega-man-cobalt',
    name: 'Mega Man / Cobalt',
    copies: 31,
    dark: { surface: '#0C1326', ink: '#EAF2FF', accent: '#2563EB', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#38BDF8' },
    light: { surface: '#F5FAFF', ink: '#1B2A4A', accent: '#3B82F6', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#0284C7' },
  }),
]);
registerDexThemesPack('movies', [
  createDexTheme({
    id: 'terminator-future-war',
    name: 'Terminator / Future War',
    copies: 29,
    dark: { surface: '#111111', ink: '#F5F5F5', accent: '#DC2626', diffAdded: '#4ADE80', diffRemoved: '#EF4444', skill: '#A1A1AA' },
    light: { surface: '#E7E5E4', ink: '#1C1917', accent: '#78716C', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#52525B' },
  }),
  createDexTheme({
    id: 'avatar-pandora',
    name: 'Avatar / Pandora',
    copies: 26,
    dark: { surface: '#0B1224', ink: '#E0F2FE', accent: '#0EA5E9', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#A78BFA' },
    light: { surface: '#ECFEFF', ink: '#123047', accent: '#14B8A6', diffAdded: '#0F766E', diffRemoved: '#BE123C', skill: '#6366F1' },
  }),
  createDexTheme({
    id: 'kill-bill-bride',
    name: 'Kill Bill / Bride',
    copies: 32,
    dark: { surface: '#121212', ink: '#FFF8CC', accent: '#FACC15', diffAdded: '#4ADE80', diffRemoved: '#EF4444', skill: '#F97316' },
    light: { surface: '#FFFBEA', ink: '#1F1A10', accent: '#EAB308', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#EA580C' },
  }),
]);
registerDexThemesPack('comics', [
  createDexTheme({
    id: 'batman-knight',
    name: 'Batman / Knight',
    copies: 62,
    dark: { surface: '#0D1117', ink: '#E5E7EB', accent: '#FACC15', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#6B7280' },
    light: { surface: '#F4F1E6', ink: '#1F2937', accent: '#111827', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#D97706' },
  }),
  createDexTheme({
    id: 'superman-krypton',
    name: 'Superman / Krypton',
    copies: 58,
    dark: { surface: '#111827', ink: '#F8FAFC', accent: '#DC2626', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#FACC15' },
    light: { surface: '#F5F9FF', ink: '#14213D', accent: '#2563EB', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'wonder-woman',
    name: 'Wonder Woman / Amazon',
    copies: 37,
    dark: { surface: '#16111A', ink: '#FFF7ED', accent: '#E11D48', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#FACC15' },
    light: { surface: '#FFF7E8', ink: '#2D1B24', accent: '#CA8A04', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#DC2626' },
  }),
  createDexTheme({
    id: 'spider-man',
    name: 'Spider-Man / Webline',
    copies: 64,
    dark: { surface: '#111827', ink: '#EFF6FF', accent: '#DC2626', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#60A5FA' },
    light: { surface: '#F8FBFF', ink: '#1E293B', accent: '#2563EB', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#DC2626' },
  }),
  createDexTheme({
    id: 'black-panther',
    name: 'Black Panther / Vibranium',
    copies: 42,
    dark: { surface: '#0E0B12', ink: '#F7F3FB', accent: '#7C3AED', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#A855F7' },
    light: { surface: '#F5F3FF', ink: '#251B2F', accent: '#6D28D9', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#A855F7' },
  }),
  createDexTheme({
    id: 'iron-man',
    name: 'Iron Man / Arc Reactor',
    copies: 54,
    dark: { surface: '#18100F', ink: '#FFF7ED', accent: '#0EA5E9', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#F97316' },
    light: { surface: '#FFF6EE', ink: '#2A1915', accent: '#EA580C', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#0284C7' },
  }),
  createDexTheme({
    id: 'daredevil-elektra',
    name: 'Daredevil / Elektra',
    copies: 35,
    dark: { surface: '#120C10', ink: '#F8F4F5', accent: '#B91C1C', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#FB7185' },
    light: { surface: '#FFF4F4', ink: '#2B1A1C', accent: '#E11D48', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#BE123C' },
  }),
  createDexTheme({
    id: 'avengers-assemble',
    name: 'Avengers / Assemble',
    copies: 46,
    dark: { surface: '#111827', ink: '#F8FAFC', accent: '#3B82F6', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#EF4444' },
    light: { surface: '#F5F7FF', ink: '#1E293B', accent: '#2563EB', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#DC2626' },
  }),
  createDexTheme({
    id: 'justice-league',
    name: 'Justice League / Watchtower',
    copies: 33,
    dark: { surface: '#0F172A', ink: '#EAF2FF', accent: '#60A5FA', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#FACC15' },
    light: { surface: '#F7FBFF', ink: '#1B2A4A', accent: '#2563EB', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#CA8A04' },
  }),
]);
registerDexThemesPack('zodiacs', [
  createDexTheme({
    id: 'aquarius-waterbearer',
    name: 'Aquarius / Waterbearer',
    copies: 22,
    dark: { surface: '#101A26', ink: '#EDF7FF', accent: '#38BDF8', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#A78BFA' },
    light: { surface: '#F3FBFF', ink: '#183246', accent: '#0EA5E9', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#6366F1' },
  }),
  createDexTheme({
    id: 'pisces-dreamtide',
    name: 'Pisces / Dreamtide',
    copies: 18,
    dark: { surface: '#111726', ink: '#EEF2FF', accent: '#7C3AED', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#38BDF8' },
    light: { surface: '#F7F4FF', ink: '#251F3A', accent: '#A78BFA', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#0284C7' },
  }),
  createDexTheme({
    id: 'aries-ember-horn',
    name: 'Aries / Ember Horn',
    copies: 19,
    dark: { surface: '#1A1110', ink: '#FFF1EC', accent: '#F97316', diffAdded: '#4ADE80', diffRemoved: '#FB7185', skill: '#FACC15' },
    light: { surface: '#FFF5EE', ink: '#2B1B16', accent: '#EA580C', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'taurus-verdant-bronze',
    name: 'Taurus / Verdant Bronze',
    copies: 18,
    dark: { surface: '#131712', ink: '#EEF6EA', accent: '#65A30D', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#D97706' },
    light: { surface: '#F4F0E1', ink: '#29261E', accent: '#A16207', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#65A30D' },
  }),
  createDexTheme({
    id: 'gemini-split-signal',
    name: 'Gemini / Split Signal',
    copies: 17,
    dark: { surface: '#111522', ink: '#F1F5FF', accent: '#22C55E', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#60A5FA' },
    light: { surface: '#FFF8EF', ink: '#2A211B', accent: '#F59E0B', diffAdded: '#15803D', diffRemoved: '#C2410C', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'cancer-moontide',
    name: 'Cancer / Moontide',
    copies: 20,
    dark: { surface: '#101827', ink: '#EEF4FF', accent: '#7DD3FC', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#F9A8D4' },
    light: { surface: '#FFF2F6', ink: '#2A1E28', accent: '#F472B6', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#38BDF8' },
  }),
  createDexTheme({
    id: 'leo-goldflare',
    name: 'Leo / Goldflare',
    copies: 19,
    dark: { surface: '#1A130F', ink: '#FFF5E9', accent: '#F59E0B', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#FB7185' },
    light: { surface: '#FFF7E6', ink: '#2B1F13', accent: '#D97706', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#E11D48' },
  }),
  createDexTheme({
    id: 'virgo-garden-script',
    name: 'Virgo / Garden Script',
    copies: 16,
    dark: { surface: '#111713', ink: '#EDF8EF', accent: '#84CC16', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#38BDF8' },
    light: { surface: '#F6F4E8', ink: '#27261F', accent: '#65A30D', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#0284C7' },
  }),
  createDexTheme({
    id: 'libra-rose-scale',
    name: 'Libra / Rose Scale',
    copies: 18,
    dark: { surface: '#15111A', ink: '#FAF3F8', accent: '#F472B6', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#A78BFA' },
    light: { surface: '#FFF4F8', ink: '#2B1D27', accent: '#EC4899', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#8B5CF6' },
  }),
  createDexTheme({
    id: 'scorpio-midnight-venom',
    name: 'Scorpio / Midnight Venom',
    copies: 19,
    dark: { surface: '#120E15', ink: '#F7F2FA', accent: '#A855F7', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#D4A017' },
    light: { surface: '#F7F2FB', ink: '#251F2D', accent: '#7C3AED', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'sagittarius-stararrow',
    name: 'Sagittarius / Stararrow',
    copies: 17,
    dark: { surface: '#101521', ink: '#EEF2FF', accent: '#60A5FA', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#F59E0B' },
    light: { surface: '#FFF7EC', ink: '#2A2219', accent: '#FB923C', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'capricorn-stone-summit',
    name: 'Capricorn / Stone Summit',
    copies: 18,
    dark: { surface: '#131518', ink: '#F1F3F5', accent: '#94A3B8', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#D97706' },
    light: { surface: '#F2EDE4', ink: '#2B251F', accent: '#A16207', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#64748B' },
  }),
]);
registerDexThemesPack('lunar', [
  createDexTheme({
    id: 'rat-streetwire',
    name: 'Rat / Streetwire',
    copies: 14,
    dark: { surface: '#121317', ink: '#F1F5F9', accent: '#94A3B8', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#60A5FA' },
    light: { surface: '#F5F6F8', ink: '#23262B', accent: '#64748B', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'ox-iron-field',
    name: 'Ox / Iron Field',
    copies: 14,
    dark: { surface: '#141612', ink: '#F5F4ED', accent: '#A3A3A3', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#D97706' },
    light: { surface: '#F3EBDD', ink: '#28231D', accent: '#78716C', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#A16207' },
  }),
  createDexTheme({
    id: 'tiger-ember-claw',
    name: 'Tiger / Ember Claw',
    copies: 16,
    dark: { surface: '#1A110E', ink: '#FFF2EB', accent: '#F97316', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#FACC15' },
    light: { surface: '#FFF4E9', ink: '#2B1C15', accent: '#EA580C', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'rabbit-moonburrow',
    name: 'Rabbit / Moonburrow',
    copies: 15,
    dark: { surface: '#15111A', ink: '#FAF4FA', accent: '#F9A8D4', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#C084FC' },
    light: { surface: '#FFF3F8', ink: '#2A1F28', accent: '#F472B6', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#A855F7' },
  }),
  createDexTheme({
    id: 'dragon-celestial-forge',
    name: 'Dragon / Celestial Forge',
    copies: 20,
    dark: { surface: '#0F1422', ink: '#EEF2FF', accent: '#38BDF8', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#D4A017' },
    light: { surface: '#F7F9FF', ink: '#1E2740', accent: '#2563EB', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'snake-jade-venom',
    name: 'Snake / Jade Venom',
    copies: 16,
    dark: { surface: '#101713', ink: '#EEF7F1', accent: '#10B981', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#A855F7' },
    light: { surface: '#F2F7F1', ink: '#1E2A22', accent: '#059669', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#7C3AED' },
  }),
  createDexTheme({
    id: 'horse-sunrunner',
    name: 'Horse / Sunrunner',
    copies: 15,
    dark: { surface: '#16120F', ink: '#FFF3E8', accent: '#FB923C', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#60A5FA' },
    light: { surface: '#FFF5E8', ink: '#2A1E15', accent: '#EA580C', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'goat-cloud-fleece',
    name: 'Goat / Cloud Fleece',
    copies: 13,
    dark: { surface: '#14141A', ink: '#F6F5FA', accent: '#A78BFA', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#F9A8D4' },
    light: { surface: '#F8F7FC', ink: '#242233', accent: '#8B5CF6', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#EC4899' },
  }),
  createDexTheme({
    id: 'monkey-neon-trickster',
    name: 'Monkey / Neon Trickster',
    copies: 15,
    dark: { surface: '#111620', ink: '#EEF8FF', accent: '#22C55E', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#F59E0B' },
    light: { surface: '#FFF8EE', ink: '#2A2319', accent: '#EAB308', diffAdded: '#15803D', diffRemoved: '#C2410C', skill: '#16A34A' },
  }),
  createDexTheme({
    id: 'rooster-dawn-brass',
    name: 'Rooster / Dawn Brass',
    copies: 14,
    dark: { surface: '#181210', ink: '#FFF5ED', accent: '#D97706', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#DC2626' },
    light: { surface: '#FFF7EA', ink: '#2B1E16', accent: '#B45309', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#EA580C' },
  }),
  createDexTheme({
    id: 'dog-hearthguard',
    name: 'Dog / Hearthguard',
    copies: 15,
    dark: { surface: '#151313', ink: '#F8F4F0', accent: '#A16207', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#60A5FA' },
    light: { surface: '#F4ECE4', ink: '#2A231E', accent: '#92400E', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#2563EB' },
  }),
  createDexTheme({
    id: 'pig-velvet-orchard',
    name: 'Pig / Velvet Orchard',
    copies: 14,
    dark: { surface: '#151118', ink: '#FAF4F8', accent: '#EC4899', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#84CC16' },
    light: { surface: '#FFF3F8', ink: '#2A1F27', accent: '#DB2777', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#65A30D' },
  }),
]);
registerDexThemesPack('companies', [
  createDexTheme({
    id: 'liquid-glass',
    name: 'Liquid Glass / Apple',
    copies: 0,
    _company: 'Apple',
    _locked: true,
    dark: { surface: '#1a1d24', ink: '#e4e8ef', accent: '#5ac8fa', diffAdded: '#40c977', diffRemoved: '#fa423e', skill: '#bf7af0', sidebar: '#141720', codeBg: '#12151b' },
    light: { surface: '#f2f4f8', ink: '#1c1e24', accent: '#007aff', diffAdded: '#00a240', diffRemoved: '#ba2623', skill: '#924ff7', sidebar: '#e8ecf2', codeBg: '#e2e6ee' },
    accents: ['#5ac8fa', '#007aff'],
  }),
]);
registerDexThemesPack('originals', [
  createDexTheme({
    id: 'current-valentine',
    name: 'Meridian Bloom',
    copies: 18,
    dark: { surface: '#12131D', ink: '#F3F6FF', accent: '#4F7CFF', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#F472B6' },
    light: { surface: '#FFF4F7', ink: '#201A26', accent: '#7C3AED', diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#EC4899' },
  }),
  createDexTheme({
    id: 'second-tide',
    name: 'Tideglass',
    copies: 16,
    dark: { surface: '#101A24', ink: '#EAF8FF', accent: '#4CC9F0', diffAdded: '#2DD4BF', diffRemoved: '#FB7185', skill: '#A78BFA' },
    light: { surface: '#FFF8F0', ink: '#2A1F1B', accent: '#FF8A5B', diffAdded: '#15803D', diffRemoved: '#C2410C', skill: '#6366F1' },
  }),
  createDexTheme({
    id: 'keepsake-gold',
    name: 'Keepsake Halo',
    copies: 14,
    dark: { surface: '#151112', ink: '#FFF7E8', accent: '#D4A017', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#A78BFA' },
    light: { surface: '#F8F1E3', ink: '#2B241C', accent: '#B45309', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#7C3AED' },
  }),
  createDexTheme({
    id: 'north-current',
    name: 'North Current',
    copies: 14,
    dark: { surface: '#101A28', ink: '#EEF6FF', accent: '#3B82F6', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#C084FC' },
    light: { surface: '#F4FAFF', ink: '#1A2940', accent: '#0EA5E9', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#8B5CF6' },
  }),
  createDexTheme({
    id: 'quiet-orbit',
    name: 'Quiet Orbit',
    copies: 12,
    dark: { surface: '#11121A', ink: '#F4F4FA', accent: '#8B7CF6', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#D4A017' },
    light: { surface: '#F7F3FB', ink: '#251F2D', accent: '#A78BFA', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'lantern-echo',
    name: 'Lantern Echo',
    copies: 13,
    dark: { surface: '#151015', ink: '#FAF3F7', accent: '#EAB308', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#A855F7' },
    light: { surface: '#FFF5EA', ink: '#2B211D', accent: '#CA8A04', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#7C3AED' },
  }),
  createDexTheme({
    id: 'harvest-theory',
    name: 'Harvest Relay',
    copies: 12,
    dark: { surface: '#141814', ink: '#EEF6EA', accent: '#7A8F3B', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#F59E0B' },
    light: { surface: '#F3F0E1', ink: '#2A2921', accent: '#6B8E23', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'blue-halo',
    name: 'Blue Halo',
    copies: 13,
    dark: { surface: '#101827', ink: '#EEF4FF', accent: '#60A5FA', diffAdded: '#34D399', diffRemoved: '#FB7185', skill: '#C084FC' },
    light: { surface: '#F4FBFF', ink: '#1A2840', accent: '#38BDF8', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#8B5CF6' },
  }),
  createDexTheme({
    id: 'may-mosaic',
    name: 'Vernal Mosaic',
    copies: 11,
    dark: { surface: '#121714', ink: '#F1F8EE', accent: '#84CC16', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#F59E0B' },
    light: { surface: '#FFF6E8', ink: '#2C221B', accent: '#F59E0B', diffAdded: '#15803D', diffRemoved: '#C2410C', skill: '#65A30D' },
  }),
  createDexTheme({
    id: 'solar-frequency',
    name: 'Solar Frequency',
    copies: 15,
    dark: { surface: '#1A1210', ink: '#FFF4EC', accent: '#F97316', diffAdded: '#4ADE80', diffRemoved: '#FB7185', skill: '#FACC15' },
    light: { surface: '#FFF7E7', ink: '#2A1C14', accent: '#EA580C', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#CA8A04' },
  }),
  createDexTheme({
    id: 'harbor-lace',
    name: 'Harbor Lace',
    copies: 10,
    dark: { surface: '#11161F', ink: '#EFF7FF', accent: '#7DD3FC', diffAdded: '#34D399', diffRemoved: '#F87171', skill: '#F9A8D4' },
    light: { surface: '#FFF3F6', ink: '#2A1E28', accent: '#F472B6', diffAdded: '#15803D', diffRemoved: '#BE123C', skill: '#38BDF8' },
  }),
  createDexTheme({
    id: 'late-summer-steel',
    name: 'August Alloy',
    copies: 10,
    dark: { surface: '#131619', ink: '#EEF2F4', accent: '#94A3B8', diffAdded: '#4ADE80', diffRemoved: '#F87171', skill: '#F59E0B' },
    light: { surface: '#F5EEE4', ink: '#2D261E', accent: '#A16207', diffAdded: '#15803D', diffRemoved: '#B91C1C', skill: '#64748B' },
  }),
]);
registerDexThemesPack('supporter', [
  // ── Patron ──────────────────────────────────────────────────────────────
  // Opulent gold / luxury theme for supporters. Dark: gold-accented dark room.
  // Light: sunlit marble with warm gold highlights. Unlocked by buying a coffee.
  createDexTheme({
    id: 'patron',
    name: 'Patron',
    copies: 0,
    _summary: 'Opulent gold and warm marble for a quiet, supporter-only lounge.',
    dark: {
      surface: '#0F0D09',
      ink: '#FFF5DC',
      accent: '#D4A54A',
      contrast: 68,
      diffAdded: '#5CB870',
      diffRemoved: '#E05A4F',
      skill: '#C9A0DC',
      sidebar: '#0A0805',
      codeBg: '#080703',
    },
    light: {
      surface: '#FAF5EC',
      ink: '#2C2416',
      accent: '#A87B1E',
      contrast: 50,
      diffAdded: '#1D8A42',
      diffRemoved: '#B33024',
      skill: '#8855BB',
      sidebar: '#F2ECDF',
      codeBg: '#EDE6D6',
    },
    accents: ['#D4A54A', '#A87B1E'],
  }),

  // ── Seraphim ──────────────────────────────────────────────────────────
  // Angelic / ethereal theme. Dark: starlit cathedral with faint gold.
  // Light: clouds at dawn with celestial blues. Unlocked by creating a theme.
  createDexTheme({
    id: 'seraphim',
    name: 'Seraphim',
    copies: 0,
    _summary: 'Celestial blue light and cathedral calm with a soft, angelic glow.',
    dark: {
      surface: '#0B0E18',
      ink: '#EAF0FF',
      accent: '#7EB4F0',
      contrast: 62,
      diffAdded: '#48C78E',
      diffRemoved: '#E86B6B',
      skill: '#D1A6F0',
      sidebar: '#080B14',
      codeBg: '#06080F',
    },
    light: {
      surface: '#F5F8FF',
      ink: '#1C2235',
      accent: '#4A7FCC',
      contrast: 48,
      diffAdded: '#18874A',
      diffRemoved: '#C03030',
      skill: '#9565CC',
      sidebar: '#EBEFFA',
      codeBg: '#E4E9F6',
    },
    accents: ['#7EB4F0', '#4A7FCC'],
  }),

  // ── Mint Condition ────────────────────────────────────────────────────
  // Money / prosperity theme. Dark: vault with deep greens and subtle gold.
  // Light: crisp paper whites with rich currency greens. Unlocked by sharing on X.
  createDexTheme({
    id: 'mint-condition',
    name: 'Mint Condition',
    copies: 0,
    _summary: 'Vault greens and crisp paper whites with polished prosperity energy.',
    dark: {
      surface: '#090E0B',
      ink: '#E8F5EC',
      accent: '#4FBF7A',
      contrast: 65,
      diffAdded: '#44D490',
      diffRemoved: '#E4605A',
      skill: '#B08FDB',
      sidebar: '#060A07',
      codeBg: '#040804',
    },
    light: {
      surface: '#F4FAF5',
      ink: '#1A2B20',
      accent: '#2D8C54',
      contrast: 50,
      diffAdded: '#1A8544',
      diffRemoved: '#B82E2E',
      skill: '#7E52B3',
      sidebar: '#E9F3EB',
      codeBg: '#E0ECDF',
    },
    accents: ['#4FBF7A', '#2D8C54'],
  }),

  // ── Cupid's Code ──────────────────────────────────────────────────────
  // Valentine's / love theme. Romantic rose pinks, deep reds, warm tones.
  // Unlocked by signing in.
  createDexTheme({
    id: 'cupids-code',
    name: "Cupid's Code",
    copies: 0,
    _summary: 'Romantic rose warmth and velvet reds written like a love letter.',
    dark: {
      surface: '#140B0E',
      ink: '#FFE8EE',
      accent: '#E0708A',
      contrast: 63,
      diffAdded: '#50C484',
      diffRemoved: '#D94F5A',
      skill: '#C490D8',
      sidebar: '#100709',
      codeBg: '#0D0507',
    },
    light: {
      surface: '#FFF4F6',
      ink: '#2D1820',
      accent: '#C44466',
      contrast: 48,
      diffAdded: '#1B8946',
      diffRemoved: '#A82D3E',
      skill: '#9A5CB8',
      sidebar: '#F8E9ED',
      codeBg: '#F2DFE5',
    },
    accents: ['#E0708A', '#C44466'],
  }),

  // ── Heartbeat ──────────────────────────────────────────────────────
  // Cherry-red pulse with warm vitality. Unlocked by liking a theme.
  createDexTheme({
    id: 'heartbeat',
    name: 'Heartbeat',
    copies: 0,
    _summary: 'A pulsing cherry red palette with bright warmth and steady momentum.',
    dark: {
      surface: '#180A0A',
      ink: '#FFE0E0',
      accent: '#E84057',
      contrast: 64,
      diffAdded: '#4FCA80',
      diffRemoved: '#E84057',
      skill: '#D88CCF',
      sidebar: '#130606',
      codeBg: '#100404',
    },
    light: {
      surface: '#FFF5F5',
      ink: '#2D1018',
      accent: '#C62840',
      contrast: 48,
      diffAdded: '#1D8848',
      diffRemoved: '#B82030',
      skill: '#A050A8',
      sidebar: '#F8E8EA',
      codeBg: '#F2DEE2',
    },
    accents: ['#E84057', '#C62840'],
  }),

  // ── Summit ─────────────────────────────────────────────────────────
  // Alpine slate with gold peak accents. Unlocked by reaching Top 10 monthly.
  createDexTheme({
    id: 'summit',
    name: 'Summit',
    copies: 0,
    _summary: 'Alpine slate and gold peak accents for a sharp, high-altitude focus.',
    dark: {
      surface: '#0E1018',
      ink: '#E8ECF4',
      accent: '#F0C050',
      contrast: 64,
      diffAdded: '#50C880',
      diffRemoved: '#E86060',
      skill: '#B8A0E0',
      sidebar: '#0A0C14',
      codeBg: '#080A10',
    },
    light: {
      surface: '#F8F6F0',
      ink: '#1C1E28',
      accent: '#C89820',
      contrast: 48,
      diffAdded: '#1A8844',
      diffRemoved: '#B83030',
      skill: '#7850B8',
      sidebar: '#F0ECE4',
      codeBg: '#E8E4DA',
    },
    accents: ['#F0C050', '#C89820'],
  }),

  // ── The Builder ────────────────────────────────────────────────────
  // Industrial workshop orange on dark steel. Unlocked by making an API call.
  createDexTheme({
    id: 'the-builder',
    name: 'The Builder',
    copies: 0,
    _summary: 'Dark steel and workshop orange with the energy of making something real.',
    dark: {
      surface: '#121416',
      ink: '#E8E4E0',
      accent: '#E8802A',
      contrast: 66,
      diffAdded: '#4CC87A',
      diffRemoved: '#E05550',
      skill: '#C090E0',
      sidebar: '#0D0F11',
      codeBg: '#0A0C0E',
    },
    light: {
      surface: '#F8F6F2',
      ink: '#1C1A18',
      accent: '#C06018',
      contrast: 50,
      diffAdded: '#1D8844',
      diffRemoved: '#B83028',
      skill: '#8050B0',
      sidebar: '#F0EEEA',
      codeBg: '#E8E6E0',
    },
    accents: ['#E8802A', '#C06018'],
  }),

  // ── Kaleidoscope ───────────────────────────────────────────────────
  // Vibrant prismatic rainbow. Really colorful. Unlocked by using Color Me Lucky.
  createDexTheme({
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    copies: 0,
    _summary: 'A prismatic burst of neon color that turns every pane into confetti.',
    dark: {
      surface: '#0E0A14',
      ink: '#F0E8FF',
      accent: '#E850E8',
      contrast: 64,
      diffAdded: '#40E890',
      diffRemoved: '#FF5070',
      skill: '#50C8FF',
      sidebar: '#0A0610',
      codeBg: '#08050D',
    },
    light: {
      surface: '#FFF8FC',
      ink: '#1A1028',
      accent: '#C030C0',
      contrast: 48,
      diffAdded: '#18A050',
      diffRemoved: '#D02050',
      skill: '#2090D0',
      sidebar: '#F8F0F8',
      codeBg: '#F0E8F4',
    },
    accents: ['#E850E8', '#FF5070', '#50C8FF', '#40E890'],
  }),

  // ── Agent Claw ─────────────────────────────────────────────────────
  // PCB green traces on dark board. Techy/digital. Unlocked by AI agent usage.
  // A play on OpenClaw.
  createDexTheme({
    id: 'agent-claw',
    name: 'Agent Claw',
    copies: 0,
    _summary: 'Circuit-board greens and luminous traces for a tool-built, agentic feel.',
    dark: {
      surface: '#0A100A',
      ink: '#D8F0D8',
      accent: '#00E870',
      contrast: 66,
      diffAdded: '#40D080',
      diffRemoved: '#E85050',
      skill: '#60C0E0',
      sidebar: '#060C06',
      codeBg: '#040A04',
    },
    light: {
      surface: '#F2FAF2',
      ink: '#0C1C0C',
      accent: '#00A848',
      contrast: 50,
      diffAdded: '#18884A',
      diffRemoved: '#B03030',
      skill: '#2888B0',
      sidebar: '#E8F4E8',
      codeBg: '#E0EEE0',
    },
    accents: ['#00E870', '#00A848'],
  }),

  // ── Homebase ───────────────────────────────────────────────────────
  // Warm amber/wood tones. Cozy home feel. Unlocked by adding to home screen.
  createDexTheme({
    id: 'homebase',
    name: 'Homebase',
    copies: 0,
    _summary: 'Warm amber wood, soft evening light, and the comfort of being back home.',
    dark: {
      surface: '#14100A',
      ink: '#F0E8D8',
      accent: '#E0A040',
      contrast: 64,
      diffAdded: '#50C078',
      diffRemoved: '#E06048',
      skill: '#C898E0',
      sidebar: '#100C06',
      codeBg: '#0D0A04',
    },
    light: {
      surface: '#FAF6F0',
      ink: '#2C2418',
      accent: '#B87818',
      contrast: 48,
      diffAdded: '#1D8840',
      diffRemoved: '#B84028',
      skill: '#8860B8',
      sidebar: '#F2EEE4',
      codeBg: '#EAE6DA',
    },
    accents: ['#E0A040', '#B87818'],
  }),

  // ── Yin & Yang ─────────────────────────────────────────────────────
  // Pure duality. Dark is deep black with white accents, light is pure white
  // with black accents. Unlocked by submitting a theme with both variants.
  createDexTheme({
    id: 'yin-yang',
    name: 'Yin & Yang',
    copies: 0,
    _summary: 'Pure black and white duality balanced into a calm, minimal pair.',
    dark: {
      surface: '#0A0A0A',
      ink: '#F0F0F0',
      accent: '#FFFFFF',
      contrast: 70,
      diffAdded: '#48D080',
      diffRemoved: '#E85050',
      skill: '#B0B0B0',
      sidebar: '#050505',
      codeBg: '#030303',
    },
    light: {
      surface: '#FAFAFA',
      ink: '#0A0A0A',
      accent: '#000000',
      contrast: 50,
      diffAdded: '#1A8848',
      diffRemoved: '#B82828',
      skill: '#505050',
      sidebar: '#F0F0F0',
      codeBg: '#E8E8E8',
    },
    accents: ['#FFFFFF', '#000000'],
  }),
]);
