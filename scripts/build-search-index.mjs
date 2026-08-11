import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { CATEGORY_DEFINITIONS, FEATURED_IDS, slugify } from './classify-symbols.mjs';

const VERSION = process.env.UNICODE_VERSION ?? '17.0.0';
const inputPath = resolve(process.cwd(), 'data', 'generated', 'symbols.json');
const outputRoot = resolve(process.cwd(), 'public', 'data', VERSION);
const source = JSON.parse(await readFile(inputPath, 'utf8'));
const symbols = source.symbols;

const writeJson = async (relativePath, value) => {
  const filePath = join(outputRoot, relativePath);
  await mkdir(resolve(filePath, '..'), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value)}\n`);
};

const indexItem = (symbol) => ({
  id: symbol.id,
  value: symbol.value,
  codePoints: symbol.codePoints,
  name: symbol.name,
  nameZh: symbol.nameZh,
  keywords: symbol.keywords,
  categories: symbol.categories,
  block: symbol.block,
  generalCategory: symbol.generalCategory,
  isEmoji: symbol.isEmoji
});

const catalog = symbols.map(indexItem);
const featured = FEATURED_IDS.map((id) => catalog.find((symbol) => symbol.id === id)).filter(Boolean);
const blocks = new Map();
const categories = new Map(CATEGORY_DEFINITIONS.map((definition) => [definition.id, []]));
categories.set('popular', featured.map((symbol) => symbol.id));

for (const symbol of catalog) {
  const blockSlug = slugify(symbol.block);
  const blockList = blocks.get(blockSlug) ?? { slug: blockSlug, name: symbol.block, items: [] };
  blockList.items.push(symbol.id);
  blocks.set(blockSlug, blockList);
  for (const category of symbol.categories) {
    const list = categories.get(category) ?? [];
    list.push(symbol.id);
    categories.set(category, list);
  }
}

const detailByBlock = new Map();
for (const symbol of symbols) {
  const blockSlug = slugify(symbol.block);
  const details = detailByBlock.get(blockSlug) ?? {};
  details[symbol.id] = symbol;
  detailByBlock.set(blockSlug, details);
}

const checksum = createHash('sha256').update(JSON.stringify(symbols)).digest('hex');
const generatedAt = process.env.GENERATED_AT ?? new Date().toISOString();
const manifest = {
  unicodeVersion: VERSION,
  generatedAt,
  symbolCount: symbols.length,
  schemaVersion: 1,
  checksum,
  categories: CATEGORY_DEFINITIONS.map((definition) => ({
    id: definition.id,
    names: definition.names,
    count: (categories.get(definition.id) ?? []).length
  })),
  blocks: [...blocks.values()].sort((a, b) => a.name.localeCompare(b.name)).map(({ slug, name, items }) => ({ slug, name, count: items.length })),
  featuredIds: featured.map((symbol) => symbol.id)
};

await mkdir(outputRoot, { recursive: true });
await writeJson('manifest.json', manifest);
await writeJson('catalog.zh-CN.json', catalog);
await writeJson('catalog.en.json', catalog);
await writeJson('hot.json', featured);

for (const [category, ids] of categories) await writeJson(`categories/${category}.json`, { category, ids });
for (const [block, data] of blocks) await writeJson(`blocks/${block}.json`, data);
for (const [block, data] of detailByBlock) await writeJson(`details/${block}.json`, data);

// Must match `site` + `base` in astro.config.mjs. Overridable via env so CI
// can point the sitemap at a preview/staging origin without code changes.
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://blog.wangruofeng007.com/unicode-picker';
const lastmod = generatedAt.split('T')[0];
const sitemapEntries = [
  `${SITE_ORIGIN}/`,
  ...manifest.categories.map((category) => `${SITE_ORIGIN}/category/${category.id}/`),
  ...manifest.blocks.map((block) => `${SITE_ORIGIN}/block/${block.slug}/`),
  ...catalog.map((symbol) => `${SITE_ORIGIN}/symbol/${symbol.id}/`)
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map((url) => `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(resolve(process.cwd(), 'public', 'sitemap.xml'), sitemap);

console.log(`Built catalog, ${categories.size} category shards, ${blocks.size} block shards, and ${detailByBlock.size} detail shards`);
