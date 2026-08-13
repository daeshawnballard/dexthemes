import { ImageResponse } from '@vercel/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchCommunityThemes, resolveTheme } from '../server/theme-data.js';
import { getWebsiteThemeId, resolvePluginThemeSourceId } from '../shared/plugin-public-policy.js';
import { CONTENT_ITEMS } from '../shared/generated-content.js';
import { EDITOR_CLASSIC_THEME_IDS, getCatalogThemeId } from '../shared/seo.js';
import {
  buildCollectionSocialCard,
  buildContentSocialCard,
  buildHomeSocialCard,
  buildStaticPageSocialCard,
  buildThemeFallbackSocialCard,
  getContentSocialCardConfig,
} from '../server/social-preview-cards.js';

const themeMap = JSON.parse(
  readFileSync(join(process.cwd(), 'api', 'theme-map.json'), 'utf-8')
);
const dexThemesLogo = `data:image/svg+xml;base64,${Buffer.from(
  readFileSync(join(process.cwd(), 'public', 'favicon.svg'), 'utf-8')
).toString('base64')}`;

const COLLECTION_CARDS = Object.freeze({
  dark: {
    label: 'Dark themes',
    title: 'Dark Codex themes',
    description: 'Low-glare palettes for focused work, from true-black minimalism to warm editor classics.',
    accent: '#47adff',
    filter: (theme) => Boolean(theme?.dark),
    variant: 'dark',
  },
  light: {
    label: 'Light themes',
    title: 'Light Codex themes',
    description: 'Bright workspaces with measured contrast, clear hierarchy, and confident accent colors.',
    accent: '#f4b942',
    filter: (theme) => Boolean(theme?.light),
    variant: 'light',
  },
  'editor-classics': {
    label: 'Editor classics',
    title: 'Editor classic themes',
    description: 'Familiar coding palettes translated across the full Codex workspace.',
    accent: '#8b5cf6',
    filter: (theme) => EDITOR_CLASSIC_THEME_IDS.includes(getCatalogThemeId(theme)),
    variant: null,
  },
  community: {
    label: 'Community',
    title: 'Community Codex themes',
    description: 'Original palettes published by DexThemes creators, ready to preview and share.',
    accent: '#f15bb5',
    filter: (theme) => theme?.category === 'community',
    variant: null,
  },
});

const STATIC_PAGE_CARDS = Object.freeze({
  privacy: {
    label: 'Privacy',
    title: 'DexThemes Privacy Policy',
    description: 'How DexThemes handles account, theme, plugin, and community data.',
    accent: '#8ee3c8',
  },
  terms: {
    label: 'Terms',
    title: 'DexThemes Terms of Service',
    description: 'Terms for the DexThemes website, API, community, and plugin.',
    accent: '#f4b942',
  },
  support: {
    label: 'Support',
    title: 'Get help with DexThemes',
    description: 'Report a bug, request a feature, or find the right path for product and account support.',
    accent: '#47adff',
  },
});

function h(type, props, ...children) {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children.length ? children : undefined } };
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers?.host || 'www.dexthemes.com'}`);
  const card = String(url.searchParams.get('card') || '').toLowerCase();

  if (card) {
    const element = await resolveSocialCard(card, url, res);
    if (!element) return;
    await sendImageResponse(res, url, element);
    return;
  }

  const themeId = url.searchParams.get('theme') || 'codex';
  const variantKey = url.searchParams.get('variant') || 'dark';
  if (!['dark', 'light'].includes(variantKey)) {
    res.status(404).send('Variant not found');
    return;
  }

  let theme;
  try {
    theme = await resolveTheme(
      themeMap,
      getWebsiteThemeId(resolvePluginThemeSourceId(themeId)),
    );
  } catch (error) {
    console.warn(`Unable to resolve OG image theme "${themeId}":`, error);
    res.dexthemesSocialPreviewFallback = true;
    await sendImageResponse(res, url, buildThemeFallbackSocialCard({ logo: dexThemesLogo }));
    return;
  }
  if (!theme) { res.status(404).send('Theme not found'); return; }

  const v = theme[variantKey];
  if (!v) { res.status(404).send('Variant not found'); return; }

  let likes = 0;
  try {
    const likesRes = await fetch('https://acrobatic-corgi-867.convex.site/themes/likes/counts');
    if (likesRes.ok) {
      const counts = await likesRes.json();
      likes = counts[theme.sourceId || themeId] || 0;
    }
  } catch (e) { /* fail silently */ }

  const isDark = isColorDark(v.surface);
  const codeBg = v.codeBg || v.surface;
  const sidebar = v.sidebar || v.surface;
  const accent = v.accent;
  const variantLabel = variantKey === 'light' ? 'Light' : 'Dark';
  const mono = 'Menlo, monospace';
  const sans = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';

  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const borderStrong = isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)';
  const muted = isDark ? 'rgba(255,255,255,0.54)' : 'rgba(0,0,0,0.54)';
  const faint = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const titleSize = theme.name.length > 22 ? 38 : theme.name.length > 14 ? 44 : 52;
  const likesDisplay = likes >= 5 ? formatLikes(likes) : null;

  const codeLines = [
    [
      { text: 'const', color: accent },
      { text: ' theme = {', color: v.ink },
    ],
    [
      { text: '  accent', color: v.ink },
      { text: ': ', color: muted },
      { text: `'${accent}'`, color: v.skill },
      { text: ',', color: v.ink },
    ],
  ];

  const palette = [
    { label: 'Surface', value: v.surface },
    { label: 'Accent', value: accent },
    { label: 'Skill', value: v.skill },
    { label: 'Added', value: v.diffAdded },
    { label: 'Removed', value: v.diffRemoved },
    { label: 'Ink', value: v.ink },
  ];

  const element = h('div', {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      background: v.surface,
      color: v.ink,
      fontFamily: sans,
      overflow: 'hidden',
      padding: '26px 36px 28px',
    },
  },
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
      },
    },
      h('div', { style: { display: 'flex', flexDirection: 'column' } },
        h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '6px',
            color: muted,
            fontSize: '15px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          },
        },
          h('img', {
            src: dexThemesLogo,
            width: 30,
            height: 30,
            style: {
              display: 'flex',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              flexShrink: 0,
            },
          }),
          h('span', {}, 'DexThemes Preview'),
        ),
        h('div', {
          style: {
            fontSize: `${Math.min(titleSize, 44)}px`,
            fontWeight: 760,
            lineHeight: 1.02,
            letterSpacing: '0',
            color: v.ink,
          },
        }, theme.name),
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        ...(likesDisplay ? [
          h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: `1px solid ${border}`,
              borderRadius: '999px',
              padding: '10px 14px',
              color: v.ink,
              background: faint,
              fontSize: '16px',
              fontWeight: 700,
            },
          },
            h('span', { style: { color: v.skill, fontSize: '18px' } }, 'heart'),
            h('span', {}, likesDisplay),
          ),
        ] : []),
        h('div', {
          style: {
            border: `1px solid ${border}`,
            borderRadius: '999px',
            padding: '10px 16px',
            color: v.ink,
            background: withOpacity(accent, 0.14),
            fontSize: '16px',
            fontWeight: 800,
          },
        }, variantLabel),
      ),
    ),

    h('div', { style: { display: 'flex', flex: 1, gap: '26px', minHeight: 0 } },
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          borderRadius: '24px',
          border: `1px solid ${borderStrong}`,
          overflow: 'hidden',
          background: v.surface,
          boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.36)' : '0 24px 80px rgba(25,25,60,0.14)',
        },
      },
        h('div', {
          style: {
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: sidebar,
            borderBottom: `1px solid ${border}`,
          },
        },
          h('div', {
            style: {
              position: 'absolute',
            left: '22px',
              display: 'flex',
              gap: '10px',
            },
          },
            h('div', { style: { width: '15px', height: '15px', borderRadius: '50%', background: withOpacity(v.ink, 0.14) } }),
            h('div', { style: { width: '15px', height: '15px', borderRadius: '50%', background: withOpacity(v.ink, 0.14) } }),
            h('div', { style: { width: '15px', height: '15px', borderRadius: '50%', background: withOpacity(v.ink, 0.14) } }),
          ),
          h('div', { style: { fontSize: '20px', color: withOpacity(v.ink, 0.42), fontWeight: 650 } }, 'Codex'),
        ),

        h('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '24px 40px 22px',
            gap: '18px',
          },
        },
          h('div', {
            style: {
              alignSelf: 'flex-end',
              maxWidth: '560px',
              borderRadius: '26px 26px 8px 26px',
              padding: '17px 24px',
              background: withOpacity(accent, 0.18),
              color: v.ink,
              fontSize: '24px',
              lineHeight: 1.28,
              fontWeight: 560,
            },
          }, 'Preview this theme in Codex'),

          h('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'flex-start',
              width: '690px',
              maxWidth: '100%',
              color: v.ink,
              fontSize: '22px',
              lineHeight: 1.35,
              gap: '18px',
            },
          },
            h('div', {}, 'Here is how the theme looks in the editor:'),
            h('div', {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderRadius: '20px',
                border: `1px solid ${border}`,
                background: codeBg,
                padding: '14px 20px',
                fontFamily: mono,
                fontSize: '16px',
                lineHeight: 1.28,
                overflow: 'hidden',
              },
            },
                  h('div', { style: { display: 'flex', gap: '8px', marginBottom: '4px' } },
                h('span', {
                  style: {
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${border}`,
                    color: v.diffAdded,
                    fontSize: '13px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  },
                }, '+ Added'),
                h('span', {
                  style: {
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${border}`,
                    color: v.skill,
                    fontSize: '13px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  },
                }, 'Function'),
              ),
              h('div', { style: { color: withOpacity(v.ink, 0.36) } }, '// theme-preview.ts'),
              ...codeLines.map((line) =>
                h('div', { style: { display: 'flex', whiteSpace: 'pre' } },
                  ...line.map((part) => h('span', { style: { color: part.color } }, part.text)),
                )
              ),
            ),
          ),
        ),

        h('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '17px 40px 20px',
            background: sidebar,
            borderTop: `1px solid ${border}`,
          },
        },
          h('div', { style: { color: muted, fontSize: '16px', fontWeight: 750 } }, 'Prompt'),
          h('div', {
            style: {
              height: '58px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 14px 0 24px',
              background: codeBg,
              border: `1px solid ${border}`,
              color: withOpacity(v.ink, 0.30),
              fontSize: '21px',
            },
          },
            h('span', {}, 'Ask anything...'),
            h('div', {
              style: {
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: accent,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 800,
              },
            }, '^'),
          ),
        ),
      ),

      h('div', {
        style: {
          width: '286px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          borderRadius: '24px',
          border: `1px solid ${border}`,
          background: sidebar,
          padding: '22px',
        },
      },
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          h('div', {
            style: {
              color: muted,
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            },
          }, 'Theme palette'),
          h('div', { style: { color: v.ink, fontSize: '25px', lineHeight: 1.14, fontWeight: 780 } }, 'Ready for Codex'),
        ),

        h('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '8px',
          },
        },
          ...palette.map((item) =>
            h('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px',
                borderRadius: '12px',
                border: `1px solid ${border}`,
                background: withOpacity(v.ink, isDark ? 0.035 : 0.05),
              },
            },
              h('div', {
                style: {
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: item.value,
                  border: `1px solid ${border}`,
                },
              }),
              h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                h('div', { style: { color: v.ink, fontSize: '13px', fontWeight: 740 } }, item.label),
                h('div', { style: { color: muted, fontSize: '11px', fontFamily: mono } }, item.value),
              ),
            )
          ),
        ),

        h('div', {
          style: {
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: muted,
            fontSize: '15px',
            fontWeight: 700,
          },
        },
          h('div', { style: { width: '16px', height: '16px', borderRadius: '4px', background: accent } }),
          h('span', {}, 'dexthemes.com'),
        ),
      ),
    ),
  );

  await sendImageResponse(res, url, element);
}

async function resolveSocialCard(card, url, res) {
  if (card === 'home') return buildHomeSocialCard({ logo: dexThemesLogo });

  if (card === 'content') {
    const section = String(url.searchParams.get('section') || '').toLowerCase();
    const slug = String(url.searchParams.get('slug') || '').toLowerCase();
    if (!getContentSocialCardConfig(section)) return sendNotFoundImage(res, 'Content section not found');
    const items = CONTENT_ITEMS.filter((item) => item.routeSection === section);
    const item = slug ? items.find((candidate) => candidate.slug === slug) : null;
    if (slug && !item) return sendNotFoundImage(res, 'Content page not found');
    return buildContentSocialCard({ logo: dexThemesLogo, section, item, count: items.length });
  }

  if (card === 'collection') {
    const slug = String(url.searchParams.get('slug') || '').toLowerCase();
    if (!slug) {
      return buildCollectionSocialCard({
        logo: dexThemesLogo,
        title: 'Find your corner\nof the catalog.',
        description: 'Browse low-glare dark palettes, bright themes, editor classics, and original community work.',
        label: 'Collections',
        accent: '#f15bb5',
        count: 4,
        hub: true,
      });
    }

    const config = COLLECTION_CARDS[slug];
    if (!config) return sendNotFoundImage(res, 'Collection not found');
    let communityThemes = [];
    let catalogAvailable = true;
    try {
      communityThemes = await fetchCommunityThemes();
    } catch (error) {
      if (slug === 'community') {
        console.warn('Unable to resolve community collection OG image:', error);
        catalogAvailable = false;
        res.dexthemesSocialPreviewFallback = true;
      }
    }
    const themes = [...Object.values(themeMap), ...communityThemes]
      .filter((theme) => getCatalogThemeId(theme) && config.filter(theme));
    const ordered = slug === 'community'
      ? themes.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0) || safeText(a.name).localeCompare(safeText(b.name)))
      : themes.sort((a, b) => safeText(a.name).localeCompare(safeText(b.name)));
    const previews = ordered.map((theme) => prepareCollectionTheme(theme, config.variant));
    return buildCollectionSocialCard({
      logo: dexThemesLogo,
      title: config.title,
      description: config.description,
      label: config.label,
      accent: config.accent,
      count: catalogAvailable ? previews.length : null,
      themes: previews,
    });
  }

  if (card === 'page') {
    const page = String(url.searchParams.get('page') || '').toLowerCase();
    const config = STATIC_PAGE_CARDS[page];
    if (!config) return sendNotFoundImage(res, 'Page not found');
    return buildStaticPageSocialCard({ logo: dexThemesLogo, ...config });
  }

  return sendNotFoundImage(res, 'Card not found');
}

function prepareCollectionTheme(theme, requestedVariant) {
  const variant = requestedVariant || (theme.dark ? 'dark' : 'light');
  const palette = theme[variant] || {};
  const surface = safeHex(palette.surface, variant === 'light' ? '#f4f1ea' : '#0d1016');
  const ink = safeHex(palette.ink, variant === 'light' ? '#15171c' : '#f7f8fb');
  return {
    name: safeText(theme.name, 'Untitled theme'),
    variant,
    surface,
    ink,
    colors: [
      surface,
      safeHex(palette.accent, '#47adff'),
      safeHex(palette.skill, '#8b5cf6'),
      safeHex(palette.diffAdded, '#2bd576'),
    ],
  };
}

function safeText(value, fallback = '') {
  return (String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim() || fallback).slice(0, 48);
}

function safeHex(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value) : fallback;
}

function sendNotFoundImage(res, message) {
  res.status(404).send(message);
  return null;
}

async function sendImageResponse(res, url, element) {
  const imageResponse = new ImageResponse(element, { width: 1200, height: 630 });
  const buffer = await imageResponse.arrayBuffer();
  const versioned = url.searchParams.has('v');
  const transientFallback = res.dexthemesSocialPreviewFallback === true;
  res.setHeader('Content-Type', 'image/png');
  res.setHeader(
    'Cache-Control',
    transientFallback
      ? 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600'
      : versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
  );
  res.setHeader(
    'Vercel-CDN-Cache-Control',
    `public, max-age=${transientFallback ? 300 : versioned ? 31536000 : 86400}`,
  );
  res.send(Buffer.from(buffer));
}

function isColorDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function withOpacity(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function formatLikes(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}
