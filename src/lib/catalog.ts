import type { CatalogSymbol, Language, UnicodeManifest, UnicodeSymbol } from './types';

export const UNICODE_VERSION = '17.0.0';
export const DATA_ROOT = `${import.meta.env.BASE_URL}data/${UNICODE_VERSION}`;

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}: ${response.status}`);
  return response.json() as Promise<T>;
}

export function loadManifest(): Promise<UnicodeManifest> {
  return readJson<UnicodeManifest>(`${DATA_ROOT}/manifest.json`);
}

export function loadCatalog(language: Language): Promise<CatalogSymbol[]> {
  return readJson<CatalogSymbol[]>(`${DATA_ROOT}/catalog.${language}.json`);
}

export function blockSlug(block: string): string {
  return block
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'no-block';
}

export async function loadDetail(symbol: CatalogSymbol): Promise<UnicodeSymbol> {
  const details = await readJson<Record<string, UnicodeSymbol>>(`${DATA_ROOT}/details/${blockSlug(symbol.block)}.json`);
  const detail = details[symbol.id];
  if (!detail) throw new Error(`Missing detail for ${symbol.id}`);
  return detail;
}

export function findByCodePoint(catalog: CatalogSymbol[], value: string): CatalogSymbol | undefined {
  const normalized = value.trim().toUpperCase().replace(/^U\+/, '');
  return catalog.find((symbol) => symbol.codePoints[0]?.slice(2) === normalized || symbol.id === value);
}
