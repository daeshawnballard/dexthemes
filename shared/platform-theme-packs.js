const DARK_SEMANTICS = Object.freeze({
  contrast: 64,
  diffAdded: '#43C983',
  diffRemoved: '#F06A6A',
});

const LIGHT_SEMANTICS = Object.freeze({
  contrast: 48,
  diffAdded: '#16844A',
  diffRemoved: '#C73535',
});

function variant(mode, palette) {
  return Object.freeze({
    ...(mode === 'dark' ? DARK_SEMANTICS : LIGHT_SEMANTICS),
    ...palette,
  });
}

function platformTheme(category, definition) {
  const dark = variant('dark', definition.dark);
  const light = variant('light', definition.light);
  return Object.freeze({
    id: definition.id,
    name: definition.name,
    summary: definition.summary,
    category,
    codeThemeId: 'codex',
    copies: 0,
    dateAdded: '2026-08-21',
    dark,
    light,
    accents: Object.freeze([...new Set([dark.accent, light.accent])]),
  });
}

function pack(category, definitions) {
  return Object.freeze(definitions.map((definition) => platformTheme(category, definition)));
}

export const PLATFORM_THEME_PACKS = Object.freeze({
  claude: pack('claude', [
    {
      id: 'quiet-anthracite',
      name: 'Quiet Anthracite',
      summary: 'Warm charcoal, parchment white, and terracotta signal tones for deliberate long-form work.',
      dark: { surface: '#171512', ink: '#F5EFE5', accent: '#D97757', sidebar: '#100F0D', codeBg: '#0B0A09', skill: '#E4B860' },
      light: { surface: '#FBF6EC', ink: '#2B241E', accent: '#A94F35', sidebar: '#F1E7D8', codeBg: '#FFFDF8', skill: '#7C5A2B' },
    },
    {
      id: 'parchment-signal',
      name: 'Parchment Signal',
      summary: 'Cream paper, ember orange, and cool editorial blue for thoughtful terminal conversations.',
      dark: { surface: '#201A16', ink: '#FFEBD1', accent: '#E6A15C', sidebar: '#17120F', codeBg: '#100D0B', skill: '#9FC5E8' },
      light: { surface: '#FFF9EC', ink: '#33271D', accent: '#B86A22', sidebar: '#F4E8D2', codeBg: '#FFFCF4', skill: '#4F78A6' },
    },
  ]),
  antigravity: pack('antigravity', [
    {
      id: 'orbital-ink',
      name: 'Orbital Ink',
      summary: 'Electric blue, spectral violet, and crisp white arranged like ink moving through a weightless workspace.',
      dark: { surface: '#0B1020', ink: '#ECF4FF', accent: '#5C8DFF', sidebar: '#070B16', codeBg: '#040711', skill: '#C875FF' },
      light: { surface: '#F7F9FF', ink: '#18213A', accent: '#315DD4', sidebar: '#EAF0FF', codeBg: '#FFFFFF', skill: '#8B4EC4' },
    },
    {
      id: 'sunward-grid',
      name: 'Sunward Grid',
      summary: 'Sunlit gold, clean cyan, and deep navy for exploratory work held to a precise visual grid.',
      dark: { surface: '#101827', ink: '#F7F7EB', accent: '#F2B84B', sidebar: '#0A101A', codeBg: '#060B12', skill: '#40D7C5' },
      light: { surface: '#FFF9E8', ink: '#282314', accent: '#B87912', sidebar: '#F6ECCF', codeBg: '#FFFCF4', skill: '#087F75' },
    },
  ]),
  qwen: pack('qwen', [
    {
      id: 'jade-relay',
      name: 'Jade Relay',
      summary: 'Luminous jade, cool cyan, and ink-dark surfaces for fast handoffs across a focused workflow.',
      dark: { surface: '#071813', ink: '#E5FFF7', accent: '#21C98E', sidebar: '#04100D', codeBg: '#020B08', skill: '#7BDFF2' },
      light: { surface: '#F0FFF8', ink: '#143129', accent: '#0B8F62', sidebar: '#E1F6EB', codeBg: '#F9FFFC', skill: '#197C94' },
    },
    {
      id: 'saffron-vector',
      name: 'Saffron Vector',
      summary: 'Saffron gold, evergreen signal tones, and graphite depth for clear directional work.',
      dark: { surface: '#1A1208', ink: '#FFF1D6', accent: '#F59E0B', sidebar: '#120C05', codeBg: '#0D0903', skill: '#6EE7B7' },
      light: { surface: '#FFF8E7', ink: '#35220C', accent: '#B66A00', sidebar: '#F4E8CC', codeBg: '#FFFCF5', skill: '#14765A' },
    },
  ]),
  opencode: pack('opencode', [
    {
      id: 'carbon-current',
      name: 'Carbon Current',
      summary: 'Carbon black, tidal teal, and cool blue for an open, low-friction coding rhythm.',
      dark: { surface: '#071417', ink: '#DDF8F5', accent: '#20C7B7', sidebar: '#041012', codeBg: '#020A0C', skill: '#63A9FF' },
      light: { surface: '#F2FCFA', ink: '#16302F', accent: '#0B8C80', sidebar: '#E5F4F1', codeBg: '#FBFFFE', skill: '#2F63B8' },
    },
    {
      id: 'paper-terminal',
      name: 'Paper Terminal',
      summary: 'Soft paper, moss green, and brass accents for a terminal palette with tactile restraint.',
      dark: { surface: '#181817', ink: '#F0EEE4', accent: '#A4C27A', sidebar: '#111110', codeBg: '#0C0C0B', skill: '#D1A85A' },
      light: { surface: '#FBFAF4', ink: '#272821', accent: '#66863C', sidebar: '#F1F0E7', codeBg: '#FFFFFF', skill: '#9A6A16' },
    },
  ]),
  pi: pack('pi', [
    {
      id: 'copper-loop',
      name: 'Copper Loop',
      summary: 'Burnished copper, quiet teal, and kiln-dark surfaces for iterative work with a warm pulse.',
      dark: { surface: '#1B110D', ink: '#FFE9DC', accent: '#D77A45', sidebar: '#130B08', codeBg: '#0D0705', skill: '#67C6C2' },
      light: { surface: '#FFF6F0', ink: '#382118', accent: '#A64F24', sidebar: '#F3E5DC', codeBg: '#FFFCFA', skill: '#26807D' },
    },
    {
      id: 'orchid-runtime',
      name: 'Orchid Runtime',
      summary: 'Deep orchid, fresh mint, and pale lilac for compact tools with a vivid runtime glow.',
      dark: { surface: '#170D20', ink: '#F6E9FF', accent: '#B46DE0', sidebar: '#100716', codeBg: '#0B0410', skill: '#55D6BE' },
      light: { surface: '#FAF3FF', ink: '#2F1B39', accent: '#8241AC', sidebar: '#F0E4F7', codeBg: '#FFFBFF', skill: '#178879' },
    },
  ]),
  zed: pack('zed', [
    {
      id: 'razor-mint',
      name: 'Razor Mint',
      summary: 'Sharp mint, cool blue, and near-black panels for fast editing with clean visual edges.',
      dark: { surface: '#071512', ink: '#E7FFF7', accent: '#54E1B1', sidebar: '#03100C', codeBg: '#020A07', skill: '#68A7FF' },
      light: { surface: '#F1FFF9', ink: '#15352B', accent: '#14865E', sidebar: '#E3F6EC', codeBg: '#FBFFFD', skill: '#315FB1' },
    },
    {
      id: 'vector-noir',
      name: 'Vector Noir',
      summary: 'Noir surfaces, signal red, and ultraviolet function tones for decisive high-speed edits.',
      dark: { surface: '#100D12', ink: '#F8F2F7', accent: '#F05266', sidebar: '#0A080C', codeBg: '#060507', skill: '#A984FF' },
      light: { surface: '#FFF6F7', ink: '#321C21', accent: '#BB2F45', sidebar: '#F7E7E9', codeBg: '#FFFCFC', skill: '#724BC0' },
    },
  ]),
  cursor: pack('cursor', [
    {
      id: 'kinetic-violet',
      name: 'Kinetic Violet',
      summary: 'Kinetic violet, cool mint, and midnight plum for fluid movement through dense code.',
      dark: { surface: '#100B1D', ink: '#F4EFFF', accent: '#8B5CF6', sidebar: '#0B0714', codeBg: '#07040E', skill: '#46D4C6' },
      light: { surface: '#F8F5FF', ink: '#261B3A', accent: '#6742C6', sidebar: '#EDE7FA', codeBg: '#FEFCFF', skill: '#137D76' },
    },
    {
      id: 'ghost-pointer',
      name: 'Ghost Pointer',
      summary: 'Icy blue, spectral lavender, and deep slate for quiet navigation across a living workspace.',
      dark: { surface: '#0B1420', ink: '#ECF7FF', accent: '#59B8FF', sidebar: '#07101A', codeBg: '#040A10', skill: '#B089FF' },
      light: { surface: '#F4FAFF', ink: '#183044', accent: '#247BB8', sidebar: '#E6F3FC', codeBg: '#FFFFFF', skill: '#7651B6' },
    },
  ]),
  t3code: pack('t3code', [
    {
      id: 'magenta-stack',
      name: 'Magenta Stack',
      summary: 'Saturated magenta, bright cyan, and plum-black layers for a confident typed stack.',
      dark: { surface: '#190A16', ink: '#FFEAF8', accent: '#E94CBB', sidebar: '#11070F', codeBg: '#0B0409', skill: '#69D7FF' },
      light: { surface: '#FFF5FB', ink: '#35152D', accent: '#B52B87', sidebar: '#F7E5F1', codeBg: '#FFFCFE', skill: '#277EAA' },
    },
    {
      id: 'typecraft-dusk',
      name: 'Typecraft Dusk',
      summary: 'Dusk indigo, rose syntax, and cool white for exacting work with a softer edge.',
      dark: { surface: '#0D1020', ink: '#EEF0FF', accent: '#6E7BFF', sidebar: '#080A16', codeBg: '#050610', skill: '#F29BD0' },
      light: { surface: '#F6F7FF', ink: '#20254A', accent: '#4655CF', sidebar: '#E9EBFA', codeBg: '#FDFDFF', skill: '#AD477F' },
    },
  ]),
  conductor: pack('conductor', [
    {
      id: 'midnight-switchyard',
      name: 'Midnight Switchyard',
      summary: 'Midnight blue, signal gold, and rail-light cyan for coordinating parallel work clearly.',
      dark: { surface: '#08111B', ink: '#EAF4FF', accent: '#4D9EFF', sidebar: '#050B12', codeBg: '#03070B', skill: '#F2B84B' },
      light: { surface: '#F4F8FC', ink: '#1C2B3A', accent: '#2A6FB3', sidebar: '#E7EEF5', codeBg: '#FFFFFF', skill: '#A66A12' },
    },
    {
      id: 'copper-schedule',
      name: 'Copper Schedule',
      summary: 'Copper markers, softened stone, and measured green for an orderly multi-track cadence.',
      dark: { surface: '#18100C', ink: '#F7EBE3', accent: '#C27645', sidebar: '#100A07', codeBg: '#0B0604', skill: '#7AB6A1' },
      light: { surface: '#FCF7F2', ink: '#33231B', accent: '#96512B', sidebar: '#F1E7DE', codeBg: '#FFFDFA', skill: '#3B7B67' },
    },
  ]),
  grok: pack('grok', [
    {
      id: 'signal-horizon',
      name: 'Signal Horizon',
      summary: 'Near-black depth, horizon orange, and cool signal blue for a compact limited-color workspace.',
      dark: { surface: '#0B0C0F', ink: '#F4F5F7', accent: '#F0703C', sidebar: '#060709', codeBg: '#030405', skill: '#58A6FF' },
      light: { surface: '#F7F8FA', ink: '#202329', accent: '#B94C22', sidebar: '#ECEEF1', codeBg: '#FFFFFF', skill: '#276FA8' },
    },
    {
      id: 'ember-query',
      name: 'Ember Query',
      summary: 'Ember red, mineral gray, and pale cyan for direct questions in a deliberately reduced palette.',
      dark: { surface: '#111214', ink: '#F2F0ED', accent: '#DC5A4A', sidebar: '#0A0B0D', codeBg: '#060708', skill: '#77C8D5' },
      light: { surface: '#FAF8F5', ink: '#292624', accent: '#A93B31', sidebar: '#F0ECE8', codeBg: '#FFFFFF', skill: '#2D7B87' },
    },
  ]),
});

export const PLATFORM_THEMES = Object.freeze(Object.values(PLATFORM_THEME_PACKS).flat());

export function getPlatformThemePack(platformId) {
  return PLATFORM_THEME_PACKS[String(platformId || '').toLowerCase()] || Object.freeze([]);
}
