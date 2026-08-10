import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { blockSlug } from './catalog';
import type { CatalogSymbol, UnicodeManifest } from './types';
import type { UnicodeSymbol } from './types';

const dataRoot = resolve(process.cwd(), 'public', 'data', '17.0.0');

export function readManifest(): UnicodeManifest {
  return JSON.parse(readFileSync(resolve(dataRoot, 'manifest.json'), 'utf8')) as UnicodeManifest;
}

export function readCatalog(): CatalogSymbol[] {
  return JSON.parse(readFileSync(resolve(dataRoot, 'catalog.en.json'), 'utf8')) as CatalogSymbol[];
}

export function blockSymbols(slug: string): CatalogSymbol[] {
  const manifest = readManifest();
  const block = manifest.blocks.find((item) => item.slug === slug);
  if (!block) return [];
  const catalog = readCatalog();
  const ids = new Set(JSON.parse(readFileSync(resolve(dataRoot, 'blocks', `${slug}.json`), 'utf8')).items as string[]);
  return catalog.filter((symbol) => ids.has(symbol.id));
}

export function readSymbolDetail(symbol: CatalogSymbol): UnicodeSymbol {
  const details = JSON.parse(readFileSync(resolve(dataRoot, 'details', `${blockSlug(symbol.block)}.json`), 'utf8')) as Record<string, UnicodeSymbol>;
  return details[symbol.id];
}
