export type Language = 'zh-CN' | 'en';

export interface CatalogSymbol {
  id: string;
  value: string;
  codePoints: string[];
  name: string;
  nameZh: string;
  keywords: string[];
  categories: string[];
  block: string;
  generalCategory: string;
  isEmoji: boolean;
}

export interface UnicodeSymbol extends CatalogSymbol {
  aliases: string[];
  script: string;
  plane: number;
  unicodeVersion: string;
  isInvisible: boolean;
  isCombining: boolean;
  htmlHex: string;
  htmlDecimal: string;
  cssEscape: string;
  jsEscape: string;
  utf8: string;
}

export interface CategoryMeta {
  id: string;
  names: Record<Language, string>;
  count: number;
}

export interface BlockMeta {
  slug: string;
  name: string;
  count: number;
}

export interface UnicodeManifest {
  unicodeVersion: string;
  generatedAt: string;
  symbolCount: number;
  schemaVersion: number;
  checksum: string;
  categories: CategoryMeta[];
  blocks: BlockMeta[];
  featuredIds: string[];
}
