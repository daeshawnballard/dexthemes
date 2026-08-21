import { getPlatform } from './platform-registry.js';

export const UNIVERSAL_EASTER_EGGS = Object.freeze([
  Object.freeze({ id: 'color-me-lucky', label: 'Color me lucky', action: 'open_creator_lucky' }),
  Object.freeze({ id: 'paired-preview', label: 'Show me both sides', action: 'preview_light_dark' }),
]);

export const PLATFORM_EASTER_EGG_PACKS = Object.freeze({
  codex: Object.freeze([
    Object.freeze({ id: 'codex-settings', label: 'Open the appearance hatch', action: 'show_copy_handoff' }),
  ]),
  deepseek: Object.freeze([
    Object.freeze({ id: 'deep-current', label: 'Take the deep current', action: 'show_plugin_setup' }),
  ]),
  claude: Object.freeze([]),
  antigravity: Object.freeze([]),
  qwen: Object.freeze([]),
  opencode: Object.freeze([]),
  pi: Object.freeze([]),
  zed: Object.freeze([]),
  cursor: Object.freeze([]),
  t3code: Object.freeze([]),
  conductor: Object.freeze([]),
  grok: Object.freeze([]),
});

export function getPlatformEasterEggs(platformId) {
  const platform = getPlatform(platformId);
  return Object.freeze([
    ...UNIVERSAL_EASTER_EGGS,
    ...(PLATFORM_EASTER_EGG_PACKS[platform.easterEggNamespace] || []),
  ]);
}
