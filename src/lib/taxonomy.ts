import type { CatalogSymbol, Language } from './types';

export const VIRTUAL_CATEGORY_IDS = ['all', 'recent', 'favorites', 'emoji'] as const;

export function isVirtualCategory(id: string): boolean {
  return (VIRTUAL_CATEGORY_IDS as readonly string[]).includes(id);
}

export function filterSymbolsByCategory(symbols: CatalogSymbol[], category: string): CatalogSymbol[] {
  if (category === 'all') return symbols;
  if (category === 'emoji') return symbols.filter((symbol) => symbol.isEmoji);
  return symbols.filter((symbol) => symbol.categories.includes(category));
}

export const CATEGORY_ORDER = [
  'all', 'recent', 'favorites', 'emoji', 'popular', 'arrows', 'math', 'currency', 'punctuation', 'brackets-quotes',
  'geometric', 'stars-decoration', 'checks-status', 'ui-keyboard', 'box-drawing', 'circles',
  'superscripts-subscripts', 'music', 'games-chess', 'astronomy-zodiac', 'religion-culture', 'weather-nature', 'other'
] as const;

export function categoryLabel(id: string, language: Language, manifestName?: string): string {
  if (manifestName) return manifestName;
  const labels: Record<string, Record<Language, string>> = {
    all: { 'zh-CN': '全部', en: 'All' },
    recent: { 'zh-CN': '最近使用', en: 'Recent' },
    favorites: { 'zh-CN': '收藏', en: 'Favorites' },
    emoji: { 'zh-CN': 'Emoji', en: 'Emoji' }
  };
  return labels[id]?.[language] ?? id;
}
