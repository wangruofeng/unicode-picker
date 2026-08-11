import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { blockSlug } from './catalog';
import type { CatalogSymbol, UnicodeManifest } from './types';
import type { UnicodeSymbol } from './types';

const dataRoot = resolve(process.cwd(), 'public', 'data', '17.0.0');

// Build-time JSON cache. Every reader below is invoked once per generated
// page (Astro re-runs page frontmatter per path), and at ~9.5k symbol pages
// re-reading+parsing the same shard per call is prohibitively slow. This map
// makes each data file parse exactly once for the whole build. Build-only —
// the client app fetches JSON over HTTP and never touches this module.
const jsonCache = new Map<string, unknown>();
const readJson = <T>(resolvedPath: string): T => {
  const cached = jsonCache.get(resolvedPath);
  if (cached !== undefined) return cached as T;
  const parsed = JSON.parse(readFileSync(resolvedPath, 'utf8')) as T;
  jsonCache.set(resolvedPath, parsed);
  return parsed;
};

export function readManifest(): UnicodeManifest {
  return readJson<UnicodeManifest>(resolve(dataRoot, 'manifest.json'));
}

export function readCatalog(): CatalogSymbol[] {
  return readJson<CatalogSymbol[]>(resolve(dataRoot, 'catalog.en.json'));
}

export function readCatalogById(): Map<string, CatalogSymbol> {
  return new Map(readCatalog().map((symbol) => [symbol.id, symbol]));
}

export function blockSymbols(slug: string): CatalogSymbol[] {
  const manifest = readManifest();
  if (!manifest.blocks.some((block) => block.slug === slug)) return [];
  const catalog = readCatalog();
  const ids = new Set(readJson<{ items: string[] }>(resolve(dataRoot, 'blocks', `${slug}.json`)).items);
  return catalog.filter((symbol) => ids.has(symbol.id));
}

export function readSymbolDetail(symbol: CatalogSymbol): UnicodeSymbol {
  const details = readJson<Record<string, UnicodeSymbol>>(resolve(dataRoot, 'details', `${blockSlug(symbol.block)}.json`));
  return details[symbol.id];
}

// All symbols with full detail. readSymbolDetail is cached per block shard,
// so this parses each of the ~201 detail files exactly once.
export function readAllSymbols(): UnicodeSymbol[] {
  return readCatalog().map(readSymbolDetail);
}
