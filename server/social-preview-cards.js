const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
const INK = '#f7f8fb';
const MUTED = 'rgba(247,248,251,0.58)';
const BORDER = 'rgba(255,255,255,0.11)';
const SWATCHES = ['#47adff', '#8b5cf6', '#f15bb5', '#ffb84d', '#2bd576'];

const CONTENT_CONFIG = Object.freeze({
  guides: {
    label: 'GUIDE',
    hubLabel: 'DEXTHEMES GUIDES',
    hubTitle: 'Make Codex yours,\nwith confidence.',
    accent: '#47adff',
    description: 'Practical guides to choose, create, import, share, and troubleshoot Codex themes.',
  },
  features: {
    label: 'FEATURE',
    hubLabel: 'DEXTHEMES FEATURES',
    hubTitle: 'One theme system,\nfrom idea to import.',
    accent: '#f15bb5',
    description: 'Explore DexThemes from first discovery to a theme ready for Codex, with creation, community, and rewards along the way.',
  },
  articles: {
    label: 'ARTICLE',
    hubLabel: 'DEXTHEMES ARTICLES',
    hubTitle: 'Better themes begin\nwith better decisions.',
    accent: '#f4b942',
    description: 'Field notes, comparisons, and practical design guidance for a Codex workspace that stays readable.',
  },
  reference: {
    label: 'REFERENCE',
    hubLabel: 'DEXTHEMES REFERENCE',
    hubTitle: 'The details,\nwithout the guesswork.',
    accent: '#8ee3c8',
    description: 'Technical reference for the DexThemes theme format and its safe handoff into Codex.',
  },
});

function h(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.length === 1 ? children[0] : children.length ? children : undefined,
    },
  };
}

function background(children, accent = '#47adff') {
  return h('div', {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      padding: '40px 42px 34px',
      background: 'linear-gradient(135deg, #08090c 0%, #0b0e14 54%, #11101a 100%)',
      color: INK,
      fontFamily: SANS,
    },
  },
    h('div', {
      style: {
        position: 'absolute',
        width: '440px',
        height: '440px',
        right: '-165px',
        top: '-225px',
        borderRadius: '50%',
        border: `1px solid ${withOpacity(accent, 0.28)}`,
        boxShadow: `0 0 130px ${withOpacity(accent, 0.10)}`,
      },
    }),
    h('div', {
      style: {
        position: 'absolute',
        width: '540px',
        height: '540px',
        left: '-330px',
        bottom: '-410px',
        borderRadius: '50%',
        border: '1px solid rgba(241,91,181,0.20)',
        boxShadow: '0 0 130px rgba(241,91,181,0.07)',
      },
    }),
    ...children,
    h('div', {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '7px',
        display: 'flex',
      },
    }, ...SWATCHES.map((color) => h('span', {
      style: { display: 'flex', flex: 1, background: color },
    }))),
  );
}

function brand(logo, eyebrow = 'CODEX COLOR STUDIO') {
  return h('div', {
    style: { display: 'flex', alignItems: 'center', gap: '13px' },
  },
    h('img', {
      src: logo,
      width: 42,
      height: 42,
      style: {
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        boxShadow: '0 10px 32px rgba(71,173,255,0.18)',
      },
    }),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
      h('span', {
        style: { fontSize: '18px', fontWeight: 800, letterSpacing: '0.16em' },
      }, 'DEXTHEMES'),
      h('span', {
        style: {
          color: 'rgba(255,255,255,0.42)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.18em',
        },
      }, eyebrow),
    ),
  );
}

function pill(label, color) {
  return h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      padding: '10px 14px',
      borderRadius: '999px',
      border: `1px solid ${BORDER}`,
      background: 'rgba(255,255,255,0.045)',
      color: 'rgba(255,255,255,0.74)',
      fontSize: '14px',
      fontWeight: 700,
    },
  },
    h('span', {
      style: {
        width: '8px',
        height: '8px',
        borderRadius: '999px',
        background: color,
        boxShadow: `0 0 18px ${color}`,
      },
    }),
    label,
  );
}

function titleBlock(title, accent, maxWidth = '650px') {
  const length = String(title).replaceAll('\n', ' ').length;
  const size = length > 68 ? 48 : length > 46 ? 56 : length > 28 ? 64 : 72;
  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth,
      marginTop: '54px',
      fontSize: `${size}px`,
      fontWeight: 760,
      lineHeight: 1.01,
      letterSpacing: '-0.045em',
    },
  }, ...String(title).split('\n').map((line, index) => h('span', {
    style: { color: index === 1 ? accent : INK },
  }, line)));
}

function productWindow(accent = '#47adff') {
  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: '405px',
      height: '472px',
      borderRadius: '28px',
      border: `1px solid ${BORDER}`,
      overflow: 'hidden',
      background: '#0d1016',
      boxShadow: '0 34px 100px rgba(0,0,0,0.55)',
    },
  },
    h('div', { style: { display: 'flex', height: '7px' } },
      ...SWATCHES.map((color) => h('span', { style: { display: 'flex', flex: 1, background: color } })),
    ),
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        height: '54px',
        padding: '0 18px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      },
    },
      h('div', { style: { display: 'flex', gap: '8px' } },
        ...['#f15bb5', '#ffb84d', '#2bd576'].map((color) => h('span', {
          style: { width: '10px', height: '10px', borderRadius: '50%', background: color },
        })),
      ),
      h('span', {
        style: { marginLeft: 'auto', color: 'rgba(255,255,255,0.42)', fontSize: '13px', fontWeight: 700 },
      }, 'Codex · Preview'),
    ),
    h('div', { style: { display: 'flex', flex: 1 } },
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '58px',
          alignItems: 'center',
          gap: '15px',
          paddingTop: '24px',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          background: '#0a0c11',
        },
      },
        h('span', { style: { width: '25px', height: '25px', borderRadius: '8px', background: accent } }),
        ...[0.18, 0.10, 0.10].map((opacity) => h('span', {
          style: { width: '18px', height: '7px', borderRadius: '99px', background: `rgba(255,255,255,${opacity})` },
        })),
      ),
      h('div', { style: { display: 'flex', flexDirection: 'column', flex: 1, padding: '23px 22px 20px' } },
        h('div', {
          style: {
            display: 'flex',
            alignSelf: 'flex-end',
            maxWidth: '255px',
            padding: '13px 17px',
            borderRadius: '18px 18px 6px 18px',
            background: withOpacity(accent, 0.16),
            color: 'rgba(255,255,255,0.88)',
            fontSize: '15px',
            lineHeight: 1.28,
          },
        }, 'Give my workspace a sharper point of view.'),
        h('span', {
          style: { marginTop: '24px', color: 'rgba(255,255,255,0.86)', fontSize: '18px', fontWeight: 750 },
        }, 'Your palette, in context.'),
        h('span', {
          style: { marginTop: '8px', color: 'rgba(255,255,255,0.40)', fontSize: '13px', lineHeight: 1.35 },
        }, 'Preview conversation, code, and semantic states before you import.'),
        h('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '13px',
            marginTop: '22px',
            padding: '17px',
            borderRadius: '17px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: '#090b0f',
          },
        }, ...[
          ['ACCENT', accent, 112], ['SKILL', '#a86cff', 86], ['ADDED', '#2bd576', 132], ['REMOVED', '#f15b72', 72],
        ].map(([label, color, width]) => h('div', {
          style: { display: 'flex', alignItems: 'center', gap: '11px' },
        },
          h('span', { style: { width: '11px', height: '11px', borderRadius: '4px', background: color } }),
          h('span', { style: { width: `${width}px`, height: '9px', borderRadius: '99px', background: 'rgba(255,255,255,0.16)' } }),
          h('span', { style: { marginLeft: 'auto', color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 700 } }, label),
        ))),
        h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            height: '48px',
            marginTop: 'auto',
            padding: '0 10px 0 17px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.10)',
            background: '#090b0f',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '14px',
          },
        },
          'Ask anything...',
          h('span', {
            style: {
              display: 'flex', width: '32px', height: '32px', marginLeft: 'auto', alignItems: 'center',
              justifyContent: 'center', borderRadius: '50%', background: accent, color: '#fff', fontSize: '18px', fontWeight: 800,
            },
          }, '↑'),
        ),
      ),
    ),
  );
}

export function buildHomeSocialCard({ logo }) {
  return background([
    h('div', {
      style: { display: 'flex', flexDirection: 'column', width: '620px', height: '100%' },
    },
      brand(logo),
      titleBlock('Make Codex\nyours.', '#47adff'),
      h('div', {
        style: { display: 'flex', width: '530px', marginTop: '25px', color: MUTED, fontSize: '21px', lineHeight: 1.38 },
      }, 'Discover, preview, create, and share palettes built for the way you work.'),
      h('div', { style: { display: 'flex', gap: '10px', marginTop: 'auto' } },
        pill('Dark + light', '#47adff'),
        pill('Community-built', '#f15bb5'),
        pill('Safe import', '#2bd576'),
      ),
    ),
    h('div', {
      style: { display: 'flex', width: '490px', marginLeft: 'auto', alignItems: 'center', justifyContent: 'center' },
    }, productWindow('#47adff')),
  ]);
}

export function buildThemeFallbackSocialCard({ logo }) {
  return background([
    h('div', {
      style: { display: 'flex', flexDirection: 'column', width: '620px', height: '100%' },
    },
      brand(logo, 'COMMUNITY THEME · DEXTHEMES'),
      titleBlock('A Codex theme,\nmade to share.', '#f15bb5'),
      h('div', {
        style: { display: 'flex', width: '540px', marginTop: '25px', color: MUTED, fontSize: '21px', lineHeight: 1.38 },
      }, 'The live palette is refreshing. Open the theme on DexThemes to preview it before importing.'),
      h('div', { style: { display: 'flex', gap: '10px', marginTop: 'auto' } },
        pill('Community-built', '#f15bb5'),
        pill('Preview before import', '#2bd576'),
      ),
    ),
    h('div', {
      style: { display: 'flex', width: '490px', marginLeft: 'auto', alignItems: 'center', justifyContent: 'center' },
    }, productWindow('#f15bb5')),
  ], '#f15bb5');
}

function guideVisual(accent) {
  return h('div', {
    style: { display: 'flex', flexDirection: 'column', width: '410px', gap: '15px' },
  }, ...[
    ['01', 'Choose the right surface'], ['02', 'Preview it in context'], ['03', 'Import with confidence'],
  ].map(([number, text], index) => h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      height: '112px',
      padding: '0 24px',
      borderRadius: '22px',
      border: `1px solid ${index === 1 ? withOpacity(accent, 0.52) : BORDER}`,
      background: index === 1 ? withOpacity(accent, 0.10) : 'rgba(255,255,255,0.035)',
      transform: `translateX(${index === 1 ? -18 : index === 2 ? 14 : 0}px)`,
      boxShadow: index === 1 ? `0 26px 70px ${withOpacity(accent, 0.10)}` : 'none',
    },
  },
    h('span', { style: { color: accent, fontSize: '16px', fontWeight: 800, letterSpacing: '0.12em' } }, number),
    h('span', { style: { marginLeft: '24px', fontSize: '21px', fontWeight: 680 } }, text),
    h('span', { style: { marginLeft: 'auto', color: 'rgba(255,255,255,0.28)', fontSize: '25px' } }, '→'),
  )));
}

function featureVisual(accent) {
  return h('div', {
    style: {
      display: 'flex', flexDirection: 'column', width: '420px', padding: '24px', borderRadius: '28px',
      border: `1px solid ${BORDER}`, background: '#0c0f15', boxShadow: '0 30px 90px rgba(0,0,0,0.5)',
    },
  },
    h('div', { style: { display: 'flex', alignItems: 'center' } },
      h('span', { style: { fontSize: '15px', fontWeight: 800, letterSpacing: '0.11em' } }, 'DEXTHEMES'),
      h('span', { style: { marginLeft: 'auto', padding: '8px 12px', borderRadius: '99px', background: withOpacity(accent, 0.14), color: accent, fontSize: '12px', fontWeight: 800 } }, 'LIVE PREVIEW'),
    ),
    h('div', { style: { display: 'flex', gap: '12px', marginTop: '24px' } },
      ...['Discover', 'Create', 'Share'].map((label, index) => h('div', {
        style: {
          display: 'flex', flexDirection: 'column', flex: 1, height: '118px', padding: '15px', borderRadius: '17px',
          border: `1px solid ${index === 1 ? withOpacity(accent, 0.46) : BORDER}`,
          background: index === 1 ? withOpacity(accent, 0.10) : 'rgba(255,255,255,0.025)',
        },
      },
        h('span', { style: { width: '28px', height: '28px', borderRadius: '9px', background: SWATCHES[index + 1] } }),
        h('span', { style: { marginTop: 'auto', fontSize: '14px', fontWeight: 750 } }, label),
      )),
    ),
    h('div', {
      style: { display: 'flex', flexDirection: 'column', marginTop: '16px', padding: '18px', borderRadius: '18px', background: '#080a0e', border: `1px solid ${BORDER}` },
    },
      h('span', { style: { color: MUTED, fontSize: '12px', fontWeight: 750, letterSpacing: '0.12em' } }, 'THEME PALETTE'),
      h('div', { style: { display: 'flex', height: '76px', gap: '9px', marginTop: '14px' } },
        ...SWATCHES.map((color, index) => h('span', { style: { display: 'flex', flex: index === 0 ? 1.8 : 1, borderRadius: '12px', background: color } })),
      ),
    ),
  );
}

function articleVisual(accent) {
  return h('div', {
    style: { display: 'flex', width: '425px', height: '430px', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  },
    h('div', {
      style: { position: 'absolute', width: '330px', height: '390px', borderRadius: '25px', border: `1px solid ${withOpacity(accent, 0.35)}`, transform: 'rotate(-5deg)', background: withOpacity(accent, 0.045) },
    }),
    h('div', {
      style: { display: 'flex', flexDirection: 'column', width: '350px', height: '400px', padding: '30px', borderRadius: '25px', border: `1px solid ${BORDER}`, background: '#0d1015', boxShadow: '0 30px 90px rgba(0,0,0,0.52)' },
    },
      h('span', { style: { color: accent, fontSize: '64px', lineHeight: 0.75, fontFamily: 'Georgia, serif' } }, '“'),
      h('span', { style: { marginTop: '24px', fontSize: '26px', fontWeight: 720, lineHeight: 1.18 } }, 'Good themes are decisions, not decoration.'),
      h('div', { style: { display: 'flex', gap: '8px', marginTop: '26px' } },
        ...SWATCHES.map((color) => h('span', { style: { width: '44px', height: '44px', borderRadius: '13px', background: color } })),
      ),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' } },
        h('span', { style: { width: '100%', height: '8px', borderRadius: '9px', background: 'rgba(255,255,255,0.16)' } }),
        h('span', { style: { width: '82%', height: '8px', borderRadius: '9px', background: 'rgba(255,255,255,0.10)' } }),
        h('span', { style: { width: '58%', height: '8px', borderRadius: '9px', background: 'rgba(255,255,255,0.08)' } }),
      ),
    ),
  );
}

function referenceVisual(accent) {
  return h('div', {
    style: { display: 'flex', flexDirection: 'column', width: '435px', padding: '24px', borderRadius: '27px', border: `1px solid ${BORDER}`, background: '#080a0e', fontFamily: 'Menlo, monospace', boxShadow: '0 30px 90px rgba(0,0,0,0.5)' },
  },
    h('div', { style: { display: 'flex', alignItems: 'center', paddingBottom: '18px', borderBottom: `1px solid ${BORDER}` } },
      h('span', { style: { color: MUTED, fontSize: '12px' } }, 'theme.import'),
      h('span', { style: { marginLeft: 'auto', color: accent, fontSize: '12px' } }, 'VALID'),
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '22px', fontSize: '17px', lineHeight: 1.35 } },
      h('span', { style: { color: accent } }, 'codex-theme-v1:'),
      h('span', {}, '{'),
      h('span', { style: { paddingLeft: '18px' } }, h('span', { style: { color: '#f15bb5' } }, '"variant"'), ': ', h('span', { style: { color: '#ffb84d' } }, '"dark"'), ','),
      h('span', { style: { paddingLeft: '18px' } }, h('span', { style: { color: '#f15bb5' } }, '"accent"'), ': ', h('span', { style: { color: '#47adff' } }, '"#47adff"'), ','),
      h('span', { style: { paddingLeft: '18px' } }, h('span', { style: { color: '#f15bb5' } }, '"surface"'), ': ', h('span', { style: { color: '#8ee3c8' } }, '"#0d0f12"')),
      h('span', {}, '}'),
    ),
    h('div', { style: { display: 'flex', gap: '8px', marginTop: '28px' } },
      ...SWATCHES.map((color) => h('span', { style: { flex: 1, height: '9px', borderRadius: '99px', background: color } })),
    ),
  );
}

function contentVisual(section, accent) {
  if (section === 'guides') return guideVisual(accent);
  if (section === 'features') return featureVisual(accent);
  if (section === 'articles') return articleVisual(accent);
  return referenceVisual(accent);
}

export function getContentSocialCardConfig(section) {
  return CONTENT_CONFIG[section] || null;
}

export function buildContentSocialCard({ logo, section, item = null, count = 0 }) {
  const config = CONTENT_CONFIG[section];
  const title = item?.title || config.hubTitle;
  const description = item?.description || config.description;
  const label = item ? `${config.label} · DEXTHEMES` : config.hubLabel;
  const meta = item
    ? [`Updated ${item.dateModified}`, `${Number(item.wordCount || 0).toLocaleString('en-US')} words`]
    : [`${count} ${config.label.toLowerCase()}${count === 1 ? '' : 's'}`];

  return background([
    h('div', { style: { display: 'flex', flexDirection: 'column', width: '650px', height: '100%' } },
      brand(logo, label),
      titleBlock(title, config.accent, '650px'),
      h('div', { style: { display: 'flex', width: '600px', marginTop: '22px', color: MUTED, fontSize: '18px', lineHeight: 1.42 } }, description),
      h('div', { style: { display: 'flex', gap: '10px', marginTop: 'auto' } },
        pill(config.label.charAt(0) + config.label.slice(1).toLowerCase(), config.accent),
        ...meta.map((value, index) => pill(value, SWATCHES[(index + 2) % SWATCHES.length])),
      ),
    ),
    h('div', { style: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end' } }, contentVisual(section, config.accent)),
  ], config.accent);
}

function collectionHubVisual() {
  const rows = [
    ['Dark', ['#0d1117', '#161b22', '#58a6ff']],
    ['Light', ['#ffffff', '#f5f3ed', '#f0b429']],
    ['Classics', ['#282a36', '#ff79c6', '#50fa7b']],
    ['Community', ['#0d1b3e', '#6cb4ee', '#f5c84a']],
  ];
  return h('div', { style: { display: 'flex', flexDirection: 'column', width: '430px', gap: '13px' } },
    ...rows.map(([label, colors], index) => h('div', {
      style: { display: 'flex', alignItems: 'center', height: '90px', padding: '0 20px', borderRadius: '20px', border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.035)', transform: `translateX(${index % 2 ? 14 : -8}px)` },
    },
      h('div', { style: { display: 'flex', gap: '7px' } }, ...colors.map((color) => h('span', { style: { width: '42px', height: '42px', borderRadius: '13px', background: color, border: `1px solid ${BORDER}` } }))),
      h('span', { style: { marginLeft: '20px', fontSize: '19px', fontWeight: 730 } }, label),
      h('span', { style: { marginLeft: 'auto', color: 'rgba(255,255,255,0.28)', fontSize: '22px' } }, '→'),
    )),
  );
}

function themeTiles(themes, accent) {
  return h('div', { style: { display: 'flex', flexDirection: 'column', width: '440px', gap: '12px' } },
    ...themes.slice(0, 4).map((theme, index) => h('div', {
      style: {
        display: 'flex', alignItems: 'center', height: '96px', padding: '0 18px', borderRadius: '21px',
        border: `1px solid ${index === 0 ? withOpacity(accent, 0.42) : BORDER}`,
        background: theme.surface || '#0d1016', color: theme.ink || INK,
        transform: `translateX(${index % 2 ? 12 : -8}px)`,
        boxShadow: index === 0 ? `0 22px 70px ${withOpacity(accent, 0.10)}` : 'none',
      },
    },
      h('div', { style: { display: 'flex', gap: '6px' } }, ...theme.colors.slice(0, 4).map((color) => h('span', {
        style: { width: '34px', height: '34px', borderRadius: '11px', background: color, border: '1px solid rgba(255,255,255,0.13)' },
      }))),
      h('div', { style: { display: 'flex', flexDirection: 'column', marginLeft: '16px', minWidth: 0 } },
        h('span', { style: { fontSize: '17px', fontWeight: 760, whiteSpace: 'nowrap' } }, theme.name),
        h('span', { style: { marginTop: '3px', color: withOpacity(theme.ink || '#ffffff', 0.50), fontSize: '11px', fontWeight: 700, letterSpacing: '0.10em' } }, theme.variant.toUpperCase()),
      ),
    )),
  );
}

export function buildCollectionSocialCard({ logo, title, description, label, accent, count, themes = [], hub = false }) {
  const countLabel = Number.isInteger(count)
    ? `${count} ${count === 1 ? 'theme' : 'themes'}`
    : 'Creator-made palettes';
  return background([
    h('div', { style: { display: 'flex', flexDirection: 'column', width: '640px', height: '100%' } },
      brand(logo, `${label.toUpperCase()} · THEME COLLECTION`),
      titleBlock(title, accent, '620px'),
      h('div', { style: { display: 'flex', width: '580px', marginTop: '23px', color: MUTED, fontSize: '19px', lineHeight: 1.42 } }, description),
      h('div', { style: { display: 'flex', gap: '10px', marginTop: 'auto' } },
        pill(label, accent),
        pill(hub ? '4 collections' : countLabel, '#8b5cf6'),
        pill('Preview before import', '#2bd576'),
      ),
    ),
    h('div', { style: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end' } },
      hub ? collectionHubVisual() : themes.length ? themeTiles(themes, accent) : featureVisual(accent),
    ),
  ], accent);
}

export function buildStaticPageSocialCard({ logo, title, description, label, accent = '#8b5cf6' }) {
  return background([
    h('div', { style: { display: 'flex', flexDirection: 'column', width: '680px', height: '100%' } },
      brand(logo, `${label.toUpperCase()} · DEXTHEMES`),
      titleBlock(title, accent, '660px'),
      h('div', { style: { display: 'flex', width: '590px', marginTop: '24px', color: MUTED, fontSize: '20px', lineHeight: 1.42 } }, description),
      h('div', { style: { display: 'flex', gap: '10px', marginTop: 'auto' } }, pill(label, accent), pill('dexthemes.com', '#47adff')),
    ),
    h('div', { style: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end' } }, referenceVisual(accent)),
  ], accent);
}

function withOpacity(hex, opacity) {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex));
  if (!match) return `rgba(255,255,255,${opacity})`;
  return `rgba(${parseInt(match[1], 16)},${parseInt(match[2], 16)},${parseInt(match[3], 16)},${opacity})`;
}
