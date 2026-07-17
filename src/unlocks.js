// ================================================
// DexThemes — Unlock Definitions
// ================================================

// Unlockable themes — each maps an action to a theme
export const UNLOCK_THEMES = {
  buy_coffee:     { themeId: 'patron',          name: 'Patron',         description: 'Opulent gold and warm marble for a quiet, supporter-only lounge.', prompt: 'Buy a coffee to unlock', link: 'https://buymeacoffee.com/daeshawn' },
  create_theme:   { themeId: 'seraphim',        name: 'Seraphim',       description: 'Celestial blue light and cathedral calm with a soft, angelic glow.', prompt: 'Create your first theme to unlock', deeplink: 'create' },
  share_x:        { themeId: 'mint-condition',  name: 'Mint Condition', description: 'Vault greens and crisp paper whites with polished prosperity energy.', prompt: 'Share a theme on X to unlock', deeplink: 'share' },
  sign_in:        { themeId: 'cupids-code',     name: "Cupid's Code",   description: 'Romantic rose warmth and velvet reds written like a love letter.', prompt: 'Sign in to unlock', deeplink: 'signin' },
  like_theme:     { themeId: 'heartbeat',       name: 'Heartbeat',      description: 'A pulsing cherry red palette with bright warmth and steady momentum.', prompt: 'Like a theme to unlock', deeplink: 'like' },
  top10_monthly:  { themeId: 'summit',          name: 'Summit',         description: 'Alpine slate and gold peak accents for a sharp, high-altitude focus.', prompt: 'Reach the Top 10 this month to unlock', deeplink: 'leaderboard' },
  use_api:        { themeId: 'the-builder',     name: 'The Builder',    description: 'Dark steel and workshop orange with the energy of making something real.', prompt: 'Make an API call to unlock', deeplink: 'api' },
  color_me_lucky: { themeId: 'kaleidoscope',    name: 'Kaleidoscope',   description: 'A prismatic burst of neon color that turns every pane into confetti.', prompt: 'Use Color Me Lucky to unlock', deeplink: 'lucky' },
  agent_use:      { themeId: 'agent-claw',      name: 'Agent Claw',     description: 'Circuit-board greens and luminous traces for a tool-built, agentic feel.', prompt: 'Register an AI agent to unlock', deeplink: 'agent' },
  install_pwa:    { themeId: 'homebase',        name: 'Homebase',       description: 'Warm amber wood, soft evening light, and the comfort of being back home.', prompt: 'Add to your home screen to unlock', deeplink: 'install' },
  complete_pair:  { themeId: 'yin-yang',        name: 'Yin & Yang',     description: 'Pure black and white duality balanced into a calm, minimal pair.', prompt: 'Submit a theme with both dark & light variants to unlock', deeplink: 'pair' },
  use_plugin:     { themeId: 'plugged-in',       name: 'Plugged In',     description: 'Electric indigo and bright cyan for creators working directly through the DexThemes plugin.', prompt: 'Use the DexThemes plugin while signed in to unlock', deeplink: 'plugin' },
  create_theme_with_plugin: { themeId: 'voiceprint', name: 'Voiceprint', description: 'A vivid waveform palette for turning a spoken or written idea into a personal theme.', prompt: 'Create a theme with the DexThemes plugin to unlock', deeplink: 'plugin-create' },
  openai_employee: { themeId: 'builder-of-agi',  name: 'Human Spark', achievement: 'OpenAI is nothing without its people', description: 'A people-first achievement for builders whose verified GitHub identity includes an eligible OpenAI work email.', prompt: 'Verify an eligible OpenAI work email through GitHub sign-in to unlock', deeplink: 'signin' },
  theme_of_day: { themeId: 'golden-hour', name: 'Golden Hour', achievement: 'Theme of the Day', description: 'Sunrise gold and vivid coral for the creator whose theme leads a UTC day.', prompt: 'Have the most popular qualified theme of a UTC day to unlock', deeplink: 'leaderboard' },
  theme_of_week: { themeId: 'headliner', name: 'Headliner', achievement: 'Theme of the Week', description: 'Electric blue and spotlight gold for the creator whose theme leads a UTC week.', prompt: 'Have the most popular qualified theme of a UTC week to unlock', deeplink: 'leaderboard' },
};

// Reverse map: themeId → action key
export const THEME_ID_TO_ACTION = Object.fromEntries(
  Object.entries(UNLOCK_THEMES).map(([action, value]) => [value.themeId, action])
);

// All locked theme IDs (used for sidebar lock icons and selection interception)
export const SUPPORTER_THEME_IDS = Object.values(UNLOCK_THEMES).map((value) => value.themeId);
export const SUPPORTER_THEME_ID = UNLOCK_THEMES.buy_coffee.themeId;

export function getUnlockActionForThemeId(themeId) {
  return THEME_ID_TO_ACTION[themeId] || null;
}

export function getUnlockConfigForThemeId(themeId) {
  const action = getUnlockActionForThemeId(themeId);
  return action ? UNLOCK_THEMES[action] : null;
}

export function isThemeLockedForUser(themeId, unlockedThemeIds) {
  const action = getUnlockActionForThemeId(themeId);
  if (!action) return false;
  return !unlockedThemeIds.has(themeId);
}
