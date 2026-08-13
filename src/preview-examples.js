// ================================================
// DexThemes — Preview Conversation Examples
// ================================================

import { getPlatform } from '../shared/platform-registry.js';

export const EXAMPLES = [
  {
    user: 'Spawn a subagent to fix lint errors',
    intro: 'Here’s how to spawn a Codex subagent for automated lint fixing:',
    comment: '// agents/lintFixer.ts',
    code: [
      { type: 'kw', text: 'import' }, ' { ', { type: 'fn', text: 'CodexAgent' }, ' } ', { type: 'kw', text: 'from' }, ' ', { type: 'str', text: "'@openai/codex'" }, ';\n',
      '\n',
      { type: 'kw', text: 'const' }, ' agent = ', { type: 'kw', text: 'new' }, ' ', { type: 'fn', text: 'CodexAgent' }, '({\n',
      '  model: ', { type: 'str', text: "'codex-1'" }, ',\n',
      '  sandbox: ', { type: 'kw', text: 'true' }, ',\n',
      '  allowNet: ', { type: 'kw', text: 'false' }, ',\n',
      '});\n',
      '\n',
      { type: 'kw', text: 'const' }, ' result = ', { type: 'kw', text: 'await' }, ' agent.', { type: 'fn', text: 'run' }, '({\n',
      '  task: ', { type: 'str', text: "'Fix all ESLint errors in src/'" }, ',\n',
      '  workDir: ', { type: 'str', text: "'./project'" }, ',\n',
      '});\n',
      '\n',
      { type: 'fn', text: 'console.log' }, '(result.diff);'
    ],
    followUp: 'Now run the test suite against the patched files'
  },
  {
    user: 'Fetch themes from the DexThemes API',
    intro: 'Here’s how to pull themes and apply one programmatically:',
    comment: '// scripts/fetchThemes.ts',
    code: [
      { type: 'kw', text: 'const' }, ' res = ', { type: 'kw', text: 'await' }, ' ', { type: 'fn', text: 'fetch' }, '(\n',
      '  ', { type: 'str', text: "'https://www.dexthemes.com/api/themes'" }, '\n',
      ');\n',
      { type: 'kw', text: 'const' }, ' payload = ', { type: 'kw', text: 'await' }, ' res.', { type: 'fn', text: 'json' }, '();\n',
      { type: 'kw', text: 'const' }, ' themes = payload.themes;\n',
      '\n',
      { type: 'kw', text: 'const' }, ' top = themes.', { type: 'fn', text: 'sort' }, '(\n',
      '  (a, b) => b.copies - a.copies\n',
      ')[0];\n',
      '\n',
      { type: 'fn', text: 'console.log' }, '(', { type: 'str', text: "'Top theme:'" }, ', top.name);\n',
      { type: 'fn', text: 'console.log' }, '(', { type: 'str', text: "'Accent:'" }, ', top.dark?.accent);'
    ],
    followUp: 'Apply this theme to my Codex config'
  },
  {
    user: 'Stream a database migration with Codex',
    intro: 'Here’s a streaming migration using the Codex responses API:',
    comment: '// migrations/streamMigrate.ts',
    code: [
      { type: 'kw', text: 'import' }, ' ', { type: 'fn', text: 'OpenAI' }, ' ', { type: 'kw', text: 'from' }, ' ', { type: 'str', text: "'openai'" }, ';\n',
      '\n',
      { type: 'kw', text: 'const' }, ' client = ', { type: 'kw', text: 'new' }, ' ', { type: 'fn', text: 'OpenAI' }, '();\n',
      { type: 'kw', text: 'const' }, ' stream = ', { type: 'kw', text: 'await' }, ' client.responses.', { type: 'fn', text: 'create' }, '({\n',
      '  model: ', { type: 'str', text: "'codex-1'" }, ',\n',
      '  stream: ', { type: 'kw', text: 'true' }, ',\n',
      '  input: ', { type: 'str', text: "'Migrate users table to v2 schema'" }, ',\n',
      '});\n',
      '\n',
      { type: 'kw', text: 'for await' }, ' (', { type: 'kw', text: 'const' }, ' event ', { type: 'kw', text: 'of' }, ' stream) {\n',
      '  ', { type: 'fn', text: 'process.stdout.write' }, '(event.delta ?? ', { type: 'str', text: "''" }, ');\n',
      '}'
    ],
    followUp: 'Add a rollback step if the migration fails'
  },
  {
    user: 'Submit a theme to DexThemes from the CLI',
    intro: 'Here’s how to submit a custom theme via the API:',
    comment: '// scripts/submitTheme.ts',
    code: [
      { type: 'kw', text: 'const' }, ' theme = {\n',
      '  themeId: ', { type: 'str', text: "'midnight-bloom'" }, ',\n',
      '  name: ', { type: 'str', text: "'Midnight Bloom'" }, ',\n',
      '  summary: ', { type: 'str', text: "'Deep purple garden at night'" }, ',\n',
      '  dark: {\n',
      '    surface: ', { type: 'str', text: "'#1a0e2e'" }, ', ink: ', { type: 'str', text: "'#e8dff5'" }, ',\n',
      '    accent: ', { type: 'str', text: "'#b388ff'" }, ', contrast: 60,\n',
      '    diffAdded: ', { type: 'str', text: "'#69f0ae'" }, ',\n',
      '    diffRemoved: ', { type: 'str', text: "'#ff5252'" }, ',\n',
      '    skill: ', { type: 'str', text: "'#ea80fc'" }, ',\n',
      '  },\n',
      '  accents: [', { type: 'str', text: "'#b388ff'" }, '],\n',
      '};\n',
      '\n',
      { type: 'kw', text: 'await' }, ' ', { type: 'fn', text: 'fetch' }, '(url, {\n',
      '  method: ', { type: 'str', text: "'POST'" }, ',\n',
      '  headers: { Authorization: ', { type: 'str', text: "'Bearer '" }, ' + token },\n',
      '  body: JSON.', { type: 'fn', text: 'stringify' }, '(theme),\n',
      '});'
    ],
    followUp: 'Generate the import string for Codex settings'
  },
  {
    user: 'Run a code review on my latest PR',
    intro: 'Here’s how to use Codex for automated code review:',
    comment: '// tools/codeReview.ts',
    code: [
      { type: 'kw', text: 'import' }, ' ', { type: 'fn', text: 'OpenAI' }, ' ', { type: 'kw', text: 'from' }, ' ', { type: 'str', text: "'openai'" }, ';\n',
      '\n',
      { type: 'kw', text: 'const' }, ' client = ', { type: 'kw', text: 'new' }, ' ', { type: 'fn', text: 'OpenAI' }, '();\n',
      { type: 'kw', text: 'const' }, ' review = ', { type: 'kw', text: 'await' }, ' client.responses.', { type: 'fn', text: 'create' }, '({\n',
      '  model: ', { type: 'str', text: "'codex-1'" }, ',\n',
      '  input: ', { type: 'str', text: "'Review PR #42 for bugs and style issues'" }, ',\n',
      '  tools: [{ type: ', { type: 'str', text: "'file_search'" }, ' }],\n',
      '});\n',
      '\n',
      { type: 'fn', text: 'console.log' }, '(review.output_text);'
    ],
    followUp: 'Now auto-fix the issues it found'
  },
  {
    user: 'Browse trending DexThemes this week',
    intro: 'Here’s how to fetch trending themes with the DexThemes API:',
    comment: '// scripts/trending.ts',
    code: [
      { type: 'kw', text: 'const' }, ' res = ', { type: 'kw', text: 'await' }, ' ', { type: 'fn', text: 'fetch' }, '(\n',
      '  ', { type: 'str', text: "'https://www.dexthemes.com/api/themes'" }, '\n',
      ');\n',
      { type: 'kw', text: 'const' }, ' payload = ', { type: 'kw', text: 'await' }, ' res.', { type: 'fn', text: 'json' }, '();\n',
      { type: 'kw', text: 'const' }, ' themes = payload.themes;\n',
      '\n',
      { type: 'kw', text: 'const' }, ' trending = themes\n',
      '  .', { type: 'fn', text: 'filter' }, '(t => t.likes > 5)\n',
      '  .', { type: 'fn', text: 'sort' }, '((a, b) => b.likes - a.likes)\n',
      '  .', { type: 'fn', text: 'slice' }, '(0, 10);\n',
      '\n',
      'trending.', { type: 'fn', text: 'forEach' }, '(t =>\n',
      '  ', { type: 'fn', text: 'console.log' }, '(', { type: 'str', text: '`${t.name}: ${t.likes} likes`' }, ')\n',
      ');'
    ],
    followUp: 'Apply the top one to my Codex config'
  },
  {
    user: 'Generate unit tests for my auth module',
    intro: 'Here’s how to use Codex to generate tests automatically:',
    comment: '// scripts/genTests.ts',
    code: [
      { type: 'kw', text: 'import' }, ' { ', { type: 'fn', text: 'CodexAgent' }, ' } ', { type: 'kw', text: 'from' }, ' ', { type: 'str', text: "'@openai/codex'" }, ';\n',
      '\n',
      { type: 'kw', text: 'const' }, ' agent = ', { type: 'kw', text: 'new' }, ' ', { type: 'fn', text: 'CodexAgent' }, '({\n',
      '  model: ', { type: 'str', text: "'codex-1'" }, ',\n',
      '  sandbox: ', { type: 'kw', text: 'true' }, ',\n',
      '});\n',
      '\n',
      { type: 'kw', text: 'const' }, ' result = ', { type: 'kw', text: 'await' }, ' agent.', { type: 'fn', text: 'run' }, '({\n',
      '  task: ', { type: 'str', text: "'Write tests for src/auth.ts'" }, ',\n',
      '  workDir: ', { type: 'str', text: "'./project'" }, ',\n',
      '});\n',
      '\n',
      { type: 'fn', text: 'console.log' }, '(result.files);'
    ],
    followUp: 'Run the tests and show me the coverage report'
  },
  {
    user: 'Like a theme on DexThemes programmatically',
    intro: 'Here’s how to like a community theme via the API:',
    comment: '// scripts/likeTheme.ts',
    code: [
      { type: 'kw', text: 'const' }, ' themeId = ', { type: 'str', text: "'midnight-bloom'" }, ';\n',
      '\n',
      { type: 'kw', text: 'const' }, ' res = ', { type: 'kw', text: 'await' }, ' ', { type: 'fn', text: 'fetch' }, '(\n',
      '  ', { type: 'str', text: '`https://www.dexthemes.com/themes/like`' }, ',\n',
      '  {\n',
      '    method: ', { type: 'str', text: "'POST'" }, ',\n',
      '    headers: {\n',
      '      Authorization: ', { type: 'str', text: "'Bearer '" }, ' + token,\n',
      '      ', { type: 'str', text: "'Content-Type'" }, ': ', { type: 'str', text: "'application/json'" }, ',\n',
      '    },\n',
      '    body: JSON.', { type: 'fn', text: 'stringify' }, '({ themeId }),\n',
      '  }\n',
      ');\n',
      '\n',
      { type: 'fn', text: 'console.log' }, '(', { type: 'str', text: "'Liked!'" }, ', ', { type: 'kw', text: 'await' }, ' res.', { type: 'fn', text: 'json' }, '());'
    ],
    followUp: 'Show me my total likes across all themes'
  },
  {
    user: 'Refactor this file to use async/await',
    intro: 'Here’s a Codex call to refactor callback-heavy code:',
    comment: '// tools/refactor.ts',
    code: [
      { type: 'kw', text: 'import' }, ' ', { type: 'fn', text: 'OpenAI' }, ' ', { type: 'kw', text: 'from' }, ' ', { type: 'str', text: "'openai'" }, ';\n',
      { type: 'kw', text: 'import' }, ' { ', { type: 'fn', text: 'readFileSync' }, ' } ', { type: 'kw', text: 'from' }, ' ', { type: 'str', text: "'fs'" }, ';\n',
      '\n',
      { type: 'kw', text: 'const' }, ' code = ', { type: 'fn', text: 'readFileSync' }, '(', { type: 'str', text: "'src/api.js'" }, ', ', { type: 'str', text: "'utf-8'" }, ');\n',
      { type: 'kw', text: 'const' }, ' client = ', { type: 'kw', text: 'new' }, ' ', { type: 'fn', text: 'OpenAI' }, '();\n',
      '\n',
      { type: 'kw', text: 'const' }, ' res = ', { type: 'kw', text: 'await' }, ' client.responses.', { type: 'fn', text: 'create' }, '({\n',
      '  model: ', { type: 'str', text: "'codex-1'" }, ',\n',
      '  input: ', { type: 'str', text: "'Convert to async/await:\\n'" }, ' + code,\n',
      '});\n',
      '\n',
      { type: 'fn', text: 'console.log' }, '(res.output_text);'
    ],
    followUp: 'Write the refactored code back to the file'
  },
  {
    user: 'Get the import string for a DexTheme',
    intro: 'Here’s how to generate a Codex import string from a theme:',
    comment: '// scripts/importString.ts',
    code: [
      { type: 'kw', text: 'const' }, ' res = ', { type: 'kw', text: 'await' }, ' ', { type: 'fn', text: 'fetch' }, '(\n',
      '  ', { type: 'str', text: "'https://www.dexthemes.com/api/themes'" }, '\n',
      ');\n',
      { type: 'kw', text: 'const' }, ' payload = ', { type: 'kw', text: 'await' }, ' res.', { type: 'fn', text: 'json' }, '();\n',
      { type: 'kw', text: 'const' }, ' themes = payload.themes;\n',
      { type: 'kw', text: 'const' }, ' theme = themes.', { type: 'fn', text: 'find' }, '(\n',
      '  t => t.id === ', { type: 'str', text: "'midnight-bloom'" }, '\n',
      ');\n',
      '\n',
      { type: 'kw', text: 'const' }, ' importStr = ', { type: 'str', text: "'codex-theme-v1:'" }, '\n',
      '  + JSON.', { type: 'fn', text: 'stringify' }, '({\n',
      '    theme: theme.dark,\n',
      '    variant: ', { type: 'str', text: "'dark'" }, ',\n',
      '  });\n',
      '\n',
      { type: 'fn', text: 'console.log' }, '(importStr);'
    ],
    followUp: 'Paste that into my Codex settings'
  }
];

const DEEPSEEK_EXAMPLES = Object.freeze([
  {
    user: 'Find a calm dark theme for DeepSeek Harness',
    intro: 'Browse matching palettes in Settings → Plugins → DexThemes, then preview both modes before applying.',
    comment: '// Installed Harness plugin',
    code: [
      { type: 'kw', text: 'const' }, ' handoff = {\n',
      '  location: ', { type: 'str', text: "'Settings > Plugins > DexThemes'" }, ',\n',
      '  preview: ', { type: 'str', text: "'light + dark'" }, ',\n',
      '  action: ', { type: 'str', text: "'Apply'" }, ',\n',
      '  reversible: ', { type: 'kw', text: 'true' }, ',\n',
      '};',
    ],
    followUp: 'Show me the light version before I apply it',
  },
  {
    user: 'Color me lucky',
    intro: 'In an installed Harness session, Creator mode can draft a paired palette without reading your workspace.',
    comment: '// DexThemes Creator mode',
    code: [
      { type: 'kw', text: 'const' }, ' request = {\n',
      '  mode: ', { type: 'str', text: "'Creator'" }, ',\n',
      '  variants: [', { type: 'str', text: "'dark'" }, ', ', { type: 'str', text: "'light'" }, '],\n',
      '  prompt: ', { type: 'str', text: "'Color me lucky'" }, ',\n',
      '};',
    ],
    followUp: 'Preview the pair and keep fonts unchanged',
  },
  {
    user: 'Apply this palette in Harness',
    intro: 'One-click Apply is available inside the installed DexThemes plugin through Harness’s supported theme service.',
    comment: '// User-initiated and reversible',
    code: [
      { type: 'kw', text: 'const' }, ' lifecycle = {\n',
      '  apply: ', { type: 'str', text: "'Apply to DeepSeek'" }, ',\n',
      '  restore: ', { type: 'str', text: "'Revert'" }, ',\n',
      '  fonts: ', { type: 'str', text: "'unchanged'" }, ',\n',
      '};',
    ],
    followUp: 'Revert to the Harness default',
  },
  {
    user: 'Browse community themes without connecting an account',
    intro: 'Public discovery and preview stay available anonymously; connecting DexThemes is optional for account-bound features.',
    comment: '// Public catalog',
    code: [
      { type: 'kw', text: 'const' }, ' access = {\n',
      '  browse: ', { type: 'kw', text: 'true' }, ',\n',
      '  preview: ', { type: 'kw', text: 'true' }, ',\n',
      '  account: ', { type: 'str', text: "'optional'" }, ',\n',
      '};',
    ],
    followUp: 'Filter to paired light and dark palettes',
  },
]);

function getGenericExamples(platformId) {
  const platform = getPlatform(platformId);
  return Object.freeze([
    {
      user: `Preview this palette for ${platform.displayName}`,
      intro: `DexThemes can preview the palette here. Use ${platform.shortName}’s supported setup to finish the handoff.`,
      comment: '// Preview before setup',
      code: [
        { type: 'kw', text: 'const' }, ' preview = {\n',
        '  platform: ', { type: 'str', text: `'${platform.id}'` }, ',\n',
        '  variants: [', { type: 'str', text: "'dark'" }, ', ', { type: 'str', text: "'light'" }, '],\n',
        '  effectFallback: ', { type: 'str', text: "'solid colors'" }, ',\n',
        '};',
      ],
      followUp: 'Show me the other variant',
    },
    {
      user: 'Find a high-contrast community theme',
      intro: `Search is shared across every source collection; choosing ${platform.shortName} changes the preview and handoff, not the catalog.`,
      comment: '// Theme source stays independent',
      code: [
        { type: 'kw', text: 'const' }, ' filters = {\n',
        '  source: ', { type: 'str', text: "'all'" }, ',\n',
        '  contrast: ', { type: 'str', text: "'high'" }, ',\n',
        '  platform: ', { type: 'str', text: `'${platform.id}'` }, ',\n',
        '};',
      ],
      followUp: 'Open the theme details',
    },
    {
      user: 'Create a paired palette',
      intro: 'The DexThemes creator keeps one portable color model and validates each supported handoff separately.',
      comment: '// Portable DexThemes palette',
      code: [
        { type: 'kw', text: 'const' }, ' draft = {\n',
        '  dark: { surface: ', { type: 'str', text: "'#101216'" }, ' },\n',
        '  light: { surface: ', { type: 'str', text: "'#f7f8fa'" }, ' },\n',
        '  fonts: ', { type: 'str', text: "'unchanged'" }, ',\n',
        '};',
      ],
      followUp: `Preview it for ${platform.shortName}`,
    },
    {
      user: `How do I use this with ${platform.shortName}?`,
      intro: platform.capabilityMessage,
      comment: '// Supported handoff only',
      code: [
        { type: 'kw', text: 'const' }, ' nextStep = {\n',
        '  action: ', { type: 'str', text: `'${platform.actions.website.ctaLabel}'` }, ',\n',
        '  automatic: ', { type: 'kw', text: 'false' }, ',\n',
        '};',
      ],
      followUp: 'Keep browsing before I decide',
    },
  ]);
}

export function getPreviewExamples(platformId = 'codex') {
  if (platformId === 'codex') return EXAMPLES;
  if (platformId === 'deepseek') return DEEPSEEK_EXAMPLES;
  return getGenericExamples(platformId);
}
