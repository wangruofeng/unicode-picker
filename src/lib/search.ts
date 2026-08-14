import type { CatalogSymbol } from './types';

export function normalizeSearch(value: string): string {
  return value.normalize('NFKC').toLowerCase().trim();
}

function codePointQuery(value: string): string | null {
  const normalized = value.replace(/^u\+/i, '').replace(/^&#x/i, '').replace(/;$/, '');
  return /^[0-9a-f]{4,6}$/i.test(normalized) ? normalized.toUpperCase() : null;
}

export function scoreSymbol(symbol: CatalogSymbol, query: string): number {
  const exactQuery = query.trim();
  const normalized = normalizeSearch(query);
  if (!normalized) return 0;
  const codePoint = codePointQuery(normalized);
  const lowerName = symbol.name.toLowerCase();
  const lowerChineseName = symbol.nameZh.toLowerCase();
  const searchText = [symbol.value, ...symbol.codePoints, symbol.name, symbol.nameZh, ...symbol.keywords, ...symbol.categories, symbol.block]
    .join('\u0001')
    .normalize('NFKC')
    .toLowerCase();

  // Check the original input first: NFKC folds compatibility characters such
  // as ① into 1, which would otherwise lose the user's exact character query.
  if (symbol.value === exactQuery) return 0;
  if (codePoint && symbol.codePoints.some((value) => value.slice(2) === codePoint)) return 1;
  if (lowerName === normalized) return 2;
  if (lowerName.startsWith(normalized) || lowerChineseName.startsWith(normalized)) return 3;
  if (lowerChineseName.includes(normalized)) return 4;
  if (symbol.keywords.some((keyword) => keyword.toLowerCase() === normalized)) return 5;
  if (searchText.includes(normalized)) return 6;
  const queryWords = normalized.split(/\s+/).filter(Boolean);
  if (queryWords.length > 1 && queryWords.every((word) => searchText.includes(word))) return 6;
  return -1;
}

export function searchSymbols(symbols: CatalogSymbol[], query: string, limit = 200): CatalogSymbol[] {
  const normalized = normalizeSearch(query);
  if (!normalized) return symbols;
  return symbols
    .map((symbol, index) => ({ symbol, score: scoreSymbol(symbol, query), index }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ symbol }) => symbol);
}
