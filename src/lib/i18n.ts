import type { Language } from './types';

export const LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en', label: 'English' }
];

const MESSAGES: Record<Language, Record<string, string>> = {
  'zh-CN': {
    title: 'Unicode 符号选择器', githubTitle: '查看 GitHub 源码',
    subtitle: 'Unicode 17.0 / 搜索、复制与码点详情',
    searchLabel: '搜索符号', clearSearch: '清空搜索',
    searchPlaceholder: '搜索符号、中文名、英文名或码点（如：⇣、U+21E3、down arrow）…',
    searchShortcut: '按 / 聚焦搜索',
    all: '全部', recent: '最近使用', favorites: '收藏', popular: '热门符号',
    resultCount: '显示 {n} / {total} 个符号',
    categoryCount: '{n} 个符号',
    loadMore: '加载更多',
    copied: '已复制 {x}', copiedShort: '复制成功', copy: '复制', copyUnicode: '复制 Unicode 码点',
    copyUtf8: '复制 UTF-8', copyHtml: '复制 HTML 实体', copyCss: '复制 CSS 转义', copyJs: '复制 JavaScript 转义',
    detail: '符号详情', encoding: '编码信息', properties: 'Unicode 属性', related: '相似字符',
    unicode: 'Unicode', decimal: '十进制', utf8: 'UTF-8', htmlHex: 'HTML 十六进制', htmlDecimal: 'HTML 十进制',
    css: 'CSS content', javascript: 'JavaScript', category: '分类', block: '区段', script: '文字',
    plane: '平面', age: '加入版本', generalCategory: 'General Category', aliases: '别名',
    emojiLink: '查看完整 Emoji、肤色和组合变体 →', invisibleWarning: '这是不可见或具有特殊显示行为的字符，请确认目标环境支持。',
    emojiBadge: 'Emoji 相关', favorite: '收藏', unfavorite: '取消收藏', share: '复制分享链接', close: '关闭详情',
    zoomDetail: '点击放大查看详情', closeModal: '关闭',
    emptySearch: '没有找到匹配的符号', emptySearchHint: '试试输入字符、U+21E3、英文名称或中文关键词。',
    emptyFavorites: '还没有收藏', emptyFavoritesHint: '点击符号右上角的星标，把常用字符留在这里。',
    emptyRecent: '还没有最近使用', emptyRecentHint: '点击任意符号后，最近使用记录会显示在这里。',
    clearRecent: '清空记录', themeLight: '切换到浅色', themeDark: '切换到深色', language: '切换语言',
    dataError: '符号数据加载失败', dataErrorHint: '请刷新页面，或检查网络后重试。',
    seoDescription: '搜索、复制 Unicode 核心符号，并查看码点、UTF-8、HTML、CSS 与 JavaScript 编码。'
  },
  en: {
    title: 'Unicode Symbol Picker', githubTitle: 'View source on GitHub',
    subtitle: 'Unicode 17.0 / search, copy, and code point details',
    searchLabel: 'Search symbols', clearSearch: 'Clear search',
    searchPlaceholder: 'Search symbols, names, or code points (e.g. ⇣, U+21E3, down arrow)…',
    searchShortcut: 'Press / to focus',
    all: 'All', recent: 'Recent', favorites: 'Favorites', popular: 'Popular',
    resultCount: 'Showing {n} / {total} symbols',
    categoryCount: '{n} symbols',
    loadMore: 'Load more',
    copied: 'Copied {x}', copiedShort: 'Copied', copy: 'Copy', copyUnicode: 'Copy Unicode code point',
    copyUtf8: 'Copy UTF-8', copyHtml: 'Copy HTML entity', copyCss: 'Copy CSS escape', copyJs: 'Copy JavaScript escape',
    detail: 'Symbol details', encoding: 'Encoding', properties: 'Unicode properties', related: 'Similar symbols',
    unicode: 'Unicode', decimal: 'Decimal', utf8: 'UTF-8', htmlHex: 'HTML hex', htmlDecimal: 'HTML decimal',
    css: 'CSS content', javascript: 'JavaScript', category: 'Category', block: 'Block', script: 'Script',
    plane: 'Plane', age: 'Introduced', generalCategory: 'General Category', aliases: 'Aliases',
    emojiLink: 'View complete Emoji, skin-tone, and sequence variants →', invisibleWarning: 'This character may be invisible or render specially. Confirm target environment support.',
    emojiBadge: 'Emoji-related', favorite: 'Favorite', unfavorite: 'Remove favorite', share: 'Copy share link', close: 'Close details',
    zoomDetail: 'Click to zoom in for details', closeModal: 'Close',
    emptySearch: 'No matching symbols', emptySearchHint: 'Try a character, U+21E3, an English name, or a keyword.',
    emptyFavorites: 'No favorites yet', emptyFavoritesHint: 'Use the star on a symbol to keep frequently used characters here.',
    emptyRecent: 'No recent symbols', emptyRecentHint: 'Select any symbol and it will appear in your recent list.',
    clearRecent: 'Clear history', themeLight: 'Switch to light', themeDark: 'Switch to dark', language: 'Language',
    dataError: 'Symbol data could not be loaded', dataErrorHint: 'Refresh the page or check the network and try again.',
    seoDescription: 'Search and copy Unicode core symbols with code point, UTF-8, HTML, CSS, and JavaScript encodings.'
  }
};

export function detectLanguage(): Language {
  const language = navigator.language.toLowerCase();
  return language.startsWith('zh') ? 'zh-CN' : 'en';
}

export function translate(language: Language, key: string, values: Record<string, string | number> = {}): string {
  let message = MESSAGES[language][key] ?? MESSAGES.en[key] ?? key;
  return message.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}
