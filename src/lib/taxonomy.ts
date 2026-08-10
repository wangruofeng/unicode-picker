import type { Language } from './types';

export const CATEGORY_ORDER = [
  'all', 'recent', 'favorites', 'popular', 'arrows', 'math', 'currency', 'punctuation', 'brackets-quotes',
  'geometric', 'stars-decoration', 'checks-status', 'ui-keyboard', 'box-drawing', 'circles',
  'superscripts-subscripts', 'music', 'games-chess', 'astronomy-zodiac', 'religion-culture', 'weather-nature', 'other'
] as const;

export function categoryLabel(id: string, language: Language, manifestName?: string): string {
  if (manifestName) return manifestName;
  const labels: Record<string, Record<Language, string>> = {
    all: { 'zh-CN': '全部', en: 'All' },
    recent: { 'zh-CN': '最近使用', en: 'Recent' },
    favorites: { 'zh-CN': '收藏', en: 'Favorites' }
  };
  return labels[id]?.[language] ?? id;
}
