import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content");
const outputPath = path.join(root, "shared", "generated-content.js");

const SECTION_CONFIG = Object.freeze({
  guides: { kind: "guide", label: "Guides" },
  features: { kind: "feature", label: "Features" },
  articles: { kind: "article", label: "Articles" },
  reference: { kind: "reference", label: "Reference" },
});

const REQUIRED_KEYS = Object.freeze([
  "title",
  "description",
  "slug",
  "kind",
  "section",
  "answer",
  "author",
  "authorUrl",
  "datePublished",
  "dateModified",
  "testedWith",
  "related",
]);
const OPTIONAL_KEYS = Object.freeze(["visibility"]);
const CONTENT_VISIBILITIES = new Set(["public", "status-only"]);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FORBIDDEN_PUBLIC_COPY = Object.freeze([
  "acrobatic-corgi-867",
  "recovery_",
  "OPENAI_APPS_CHALLENGE",
]);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stripOptionalQuotes(value) {
  if (value.length < 2) return value;
  const first = value[0];
  const last = value[value.length - 1];
  return (first === last && (first === '"' || first === "'"))
    ? value.slice(1, -1)
    : value;
}

function parseFrontmatter(source, sourcePath) {
  const normalized = source.replaceAll("\r\n", "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(normalized);
  if (!match) {
    throw new Error(`${sourcePath}: expected --- delimited frontmatter`);
  }

  const metadata = {};
  for (const [index, rawLine] of match[1].split("\n").entries()) {
    if (!rawLine.trim()) continue;
    const lineMatch = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(rawLine);
    if (!lineMatch) {
      throw new Error(`${sourcePath}:${index + 2}: frontmatter values must stay on one line`);
    }
    const [, key, rawValue] = lineMatch;
    if (Object.hasOwn(metadata, key)) {
      throw new Error(`${sourcePath}: duplicate frontmatter key "${key}"`);
    }
    metadata[key] = stripOptionalQuotes(rawValue.trim());
  }

  for (const key of REQUIRED_KEYS) {
    if (!Object.hasOwn(metadata, key)) {
      throw new Error(`${sourcePath}: missing frontmatter key "${key}"`);
    }
  }

  const extraKeys = Object.keys(metadata).filter((key) => (
    !REQUIRED_KEYS.includes(key) && !OPTIONAL_KEYS.includes(key)
  ));
  if (extraKeys.length) {
    throw new Error(`${sourcePath}: unsupported frontmatter keys: ${extraKeys.join(", ")}`);
  }

  return {
    metadata,
    body: match[2].trim(),
    normalized,
  };
}

function stashToken(tokens, html) {
  const index = tokens.push(html) - 1;
  return `\uE000${index}\uE001`;
}

function renderInline(value) {
  const tokens = [];
  let source = String(value);

  source = source.replace(/`([^`\n]+)`/g, (_match, code) => (
    stashToken(tokens, `<code>${escapeHtml(code)}</code>`)
  ));

  source = source.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_match, label, href) => {
    const safeHref = String(href);
    if (!/^(?:https?:\/\/|\/|#)/.test(safeHref)) {
      throw new Error(`Unsupported Markdown link target: ${safeHref}`);
    }
    const external = /^https?:\/\//.test(safeHref);
    return stashToken(
      tokens,
      `<a href="${escapeHtml(safeHref)}"${external ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(label)}</a>`,
    );
  });

  let html = escapeHtml(source);
  html = html.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\uE000(\d+)\uE001/g, (_match, index) => tokens[Number(index)]);
  return html;
}

function headingId(value, counts) {
  const base = String(value)
    .toLowerCase()
    .replace(/`|\*|\[|\]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";
  const count = counts.get(base) || 0;
  counts.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

function isBlockStart(line) {
  return /^(?:```|#{2,3}\s+|-\s+|\d+\.\s+)/.test(line);
}

function renderMarkdown(markdown, sourcePath) {
  if (!markdown) throw new Error(`${sourcePath}: body is empty`);
  if (/^#\s+/m.test(markdown)) {
    throw new Error(`${sourcePath}: body must start below H1; the page title supplies H1`);
  }
  if (/<\/?[a-z][^>]*>/i.test(markdown)) {
    throw new Error(`${sourcePath}: raw HTML is not allowed`);
  }

  const lines = markdown.split("\n");
  const html = [];
  const headingCounts = new Map();
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = /^```([a-z0-9_-]*)\s*$/i.exec(line);
    if (fence) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index >= lines.length) throw new Error(`${sourcePath}: unclosed code fence`);
      index += 1;
      const language = fence[1] ? ` class="language-${escapeHtml(fence[1])}"` : "";
      html.push(`<pre><code${language}>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const id = headingId(heading[2], headingCounts);
      html.push(`<h${level} id="${id}">${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^-\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^-\s+/, ""));
        index += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length
      && lines[index].trim()
      && !isBlockStart(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return html.join("\n");
}

function wordCount(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[\[\]()*_`#+-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function validateMetadata(metadata, sectionSlug, sourcePath, body) {
  const config = SECTION_CONFIG[sectionSlug];
  if (!SLUG_PATTERN.test(metadata.slug)) {
    throw new Error(`${sourcePath}: invalid slug "${metadata.slug}"`);
  }
  if (metadata.kind !== config.kind) {
    throw new Error(`${sourcePath}: kind must be "${config.kind}"`);
  }
  if (metadata.section !== config.label) {
    throw new Error(`${sourcePath}: section must be "${config.label}"`);
  }
  if (metadata.author !== "Daeshawn Ballard") {
    throw new Error(`${sourcePath}: author must be "Daeshawn Ballard"`);
  }
  if (metadata.authorUrl !== "https://x.com/daeshawn") {
    throw new Error(`${sourcePath}: authorUrl must be "https://x.com/daeshawn"`);
  }
  if (!DATE_PATTERN.test(metadata.datePublished) || !DATE_PATTERN.test(metadata.dateModified)) {
    throw new Error(`${sourcePath}: dates must use YYYY-MM-DD`);
  }
  if (metadata.dateModified < metadata.datePublished) {
    throw new Error(`${sourcePath}: dateModified cannot precede datePublished`);
  }
  if (metadata.description.length < 70 || metadata.description.length > 190) {
    throw new Error(`${sourcePath}: description must be 70-190 characters`);
  }
  if (metadata.answer.length < 80 || metadata.answer.length > 420) {
    throw new Error(`${sourcePath}: answer must be 80-420 characters`);
  }
  if (metadata.visibility && !CONTENT_VISIBILITIES.has(metadata.visibility)) {
    throw new Error(`${sourcePath}: visibility must be "public" or "status-only"`);
  }
  if (wordCount(body) < 300) {
    throw new Error(`${sourcePath}: body must contain at least 300 words`);
  }

  const publicCopy = `${Object.values(metadata).join("\n")}\n${body}`;
  for (const forbidden of FORBIDDEN_PUBLIC_COPY) {
    if (publicCopy.includes(forbidden)) {
      throw new Error(`${sourcePath}: public content contains forbidden internal token "${forbidden}"`);
    }
  }
}

async function readSection(sectionSlug) {
  const sectionDir = path.join(contentRoot, sectionSlug);
  const entries = await readdir(sectionDir, { withFileTypes: true }).catch((error) => {
    if (error?.code === "ENOENT") return [];
    throw error;
  });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();

  const items = [];
  for (const fileName of markdownFiles) {
    const absolutePath = path.join(sectionDir, fileName);
    const relativePath = path.relative(root, absolutePath).replaceAll(path.sep, "/");
    const source = await readFile(absolutePath, "utf8");
    const { metadata, body, normalized } = parseFrontmatter(source, relativePath);
    validateMetadata(metadata, sectionSlug, relativePath, body);
    if (fileName !== `${metadata.slug}.md`) {
      throw new Error(`${relativePath}: filename must match slug "${metadata.slug}.md"`);
    }

    const related = metadata.related
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (related.some((route) => !route.startsWith("/"))) {
      throw new Error(`${relativePath}: related routes must be root-relative paths`);
    }

    items.push({
      title: metadata.title,
      description: metadata.description,
      slug: metadata.slug,
      kind: metadata.kind,
      section: metadata.section,
      routeSection: sectionSlug,
      path: `/${sectionSlug}/${metadata.slug}`,
      answer: metadata.answer,
      author: metadata.author,
      authorUrl: metadata.authorUrl,
      datePublished: metadata.datePublished,
      dateModified: metadata.dateModified,
      testedWith: metadata.testedWith,
      visibility: metadata.visibility || "public",
      related,
      wordCount: wordCount(body),
      bodyHtml: renderMarkdown(body, relativePath),
      markdown: normalized.endsWith("\n") ? normalized : `${normalized}\n`,
      sourcePath: relativePath,
    });
  }
  return items;
}

export async function generateContent() {
  const sections = Object.keys(SECTION_CONFIG);
  const items = (await Promise.all(sections.map(readSection)))
    .flat()
    .sort((a, b) => (
      sections.indexOf(a.routeSection) - sections.indexOf(b.routeSection)
      || a.title.localeCompare(b.title)
    ));

  const seenPaths = new Set();
  for (const item of items) {
    if (seenPaths.has(item.path)) throw new Error(`Duplicate content path: ${item.path}`);
    seenPaths.add(item.path);
  }

  const routesBySection = Object.fromEntries(sections.map((section) => [
    section,
    [`/${section}`, ...items.filter((item) => item.routeSection === section).map((item) => item.path)],
  ]));
  const lastModified = items.reduce(
    (latest, item) => item.dateModified > latest ? item.dateModified : latest,
    "2026-07-30",
  );

  const output = `// Generated by scripts/generate-content.mjs from content/**/*.md
// Do not edit this file directly.
export const CONTENT_ITEMS = Object.freeze(${JSON.stringify(items, null, 2)});

export const CONTENT_ROUTES_BY_SECTION = Object.freeze(${JSON.stringify(routesBySection, null, 2)});

export const CONTENT_ROUTE_PATHS = Object.freeze(${JSON.stringify(Object.values(routesBySection).flat(), null, 2)});

export const CONTENT_LAST_MODIFIED = ${JSON.stringify(lastModified)};
`;

  await writeFile(outputPath, output);
  return { items, routesBySection, outputPath };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { items } = await generateContent();
  console.log(`generated ${items.length} content pages`);
}
