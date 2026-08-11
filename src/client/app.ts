import { findByCodePoint, loadCatalog, loadDetail, loadManifest } from '../lib/catalog';
import { copyText } from '../lib/clipboard';
import { cssEscape, htmlDecimal, htmlHex, jsEscape, utf8 } from '../lib/encoding';
import { detectLanguage, LANGUAGES, translate } from '../lib/i18n';
import { searchSymbols } from '../lib/search';
import { readList, readValue, writeList, writeValue } from '../lib/storage';
import { categoryLabel } from '../lib/taxonomy';
import type { CatalogSymbol, Language, UnicodeManifest, UnicodeSymbol } from '../lib/types';

const FAVORITES_KEY = 'unicode-picker:favorites';
const RECENT_KEY = 'unicode-picker:recent';
const THEME_KEY = 'unicode-picker:theme';
const LANG_KEY = 'unicode-picker:lang';

const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
};

const searchInput = getElement<HTMLInputElement>('searchInput');
const clearSearch = getElement<HTMLButtonElement>('clearSearch');
const statBar = getElement<HTMLDivElement>('statBar');
const categoryTabs = getElement<HTMLElement>('categoryTabs');
const contentTitle = getElement<HTMLHeadingElement>('contentTitle');
const contentDescription = getElement<HTMLParagraphElement>('contentDescription');
const symbolGrid = getElement<HTMLDivElement>('symbolGrid');
const emptyState = getElement<HTMLDivElement>('emptyState');
const loadMoreButton = getElement<HTMLButtonElement>('loadMore');
const loadMoreSentinel = getElement<HTMLDivElement>('loadMoreSentinel');
const detailPanel = getElement<HTMLElement>('detailPanel');
const toast = getElement<HTMLDivElement>('toast');
const langBtn = getElement<HTMLButtonElement>('langBtn');
const langMenu = getElement<HTMLDivElement>('langMenu');
const themeBtn = getElement<HTMLButtonElement>('themeBtn');
const detailModal = getElement<HTMLElement>('detailModal');
const modalFavorite = getElement<HTMLButtonElement>('modalFavorite');

const state: {
  lang: Language;
  theme: 'light' | 'dark';
  activeCategory: string;
  query: string;
  catalog: CatalogSymbol[];
  manifest: UnicodeManifest | null;
  currentItems: CatalogSymbol[];
  visibleCount: number;
  selectedId: string | null;
  currentDetail: UnicodeSymbol | null;
  favorites: Set<string>;
  recent: string[];
  detailCache: Map<string, UnicodeSymbol>;
} = {
  lang: 'zh-CN',
  theme: 'light',
  activeCategory: 'popular',
  query: '',
  catalog: [],
  manifest: null,
  currentItems: [],
  visibleCount: 240,
  selectedId: null,
  currentDetail: null,
  favorites: new Set(),
  recent: [],
  detailCache: new Map()
};

let toastTimer: number | undefined;
let lastFocused: HTMLElement | null = null;

const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function t(key: string, values: Record<string, string | number> = {}): string {
  return translate(state.lang, key, values);
}

function selectedCatalogSymbol(): CatalogSymbol | undefined {
  return state.catalog.find((symbol) => symbol.id === state.selectedId);
}

function displayName(symbol: CatalogSymbol): string {
  return state.lang === 'zh-CN' ? (symbol.nameZh || symbol.name) : symbol.name;
}

function applyTheme(theme: 'light' | 'dark'): void {
  state.theme = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  themeBtn.innerHTML = theme === 'dark' ? SUN : MOON;
  themeBtn.title = t(theme === 'dark' ? 'themeLight' : 'themeDark');
  themeBtn.setAttribute('aria-label', t(theme === 'dark' ? 'themeLight' : 'themeDark'));
}

function applyI18n(): void {
  document.documentElement.lang = state.lang;
  document.title = state.lang === 'zh-CN' ? 'Unicode 符号选择器：搜索、复制与码点查询' : 'Unicode Symbol Picker: Search and copy symbols';
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n ?? '');
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((element) => {
    element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder ?? ''));
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((element) => {
    element.title = t(element.dataset.i18nTitle ?? '');
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria ?? ''));
  });
  langBtn.title = t('language');
  langBtn.setAttribute('aria-label', t('language'));
  clearSearch.title = t('clearSearch');
  clearSearch.setAttribute('aria-label', t('clearSearch'));
  applyTheme(state.theme);
  renderLanguageMenu();
}

function renderLanguageMenu(): void {
  langMenu.replaceChildren();
  for (const language of LANGUAGES) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `lang-item${language.code === state.lang ? ' active' : ''}`;
    item.setAttribute('role', 'menuitem');
    item.textContent = language.label;
    const check = document.createElement('span');
    check.className = 'check';
    check.textContent = '✓';
    item.append(check);
    item.addEventListener('click', () => {
      langMenu.classList.remove('show');
      void setLanguage(language.code);
    });
    langMenu.append(item);
  }
}

async function setLanguage(language: Language): Promise<void> {
  if (state.lang === language && state.catalog.length > 0) return;
  state.lang = language;
  writeValue(LANG_KEY, language);
  try {
    state.catalog = await loadCatalog(language);
  } catch {
    // The two catalogs share the same schema; keep the current one if a locale file is unavailable.
  }
  applyI18n();
  renderTabs();
  renderContent();
  if (state.currentDetail) renderDetail(state.currentDetail);
  if (!detailModal.hidden && state.currentDetail) renderDetailModal(state.currentDetail);
}

function readUrlState(): string | null {
  const params = new URLSearchParams(window.location.search);
  state.query = params.get('q') ?? '';
  const category = params.get('category');
  if (category) state.activeCategory = category;
  searchInput.value = state.query;
  clearSearch.hidden = !state.query;
  return params.get('symbol');
}

function updateUrl(): void {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.activeCategory !== 'popular') params.set('category', state.activeCategory);
  const selected = selectedCatalogSymbol();
  if (selected) params.set('symbol', selected.codePoints[0]);
  const query = params.toString();
  const base = import.meta.env.BASE_URL;
  window.history.replaceState({}, '', query ? `${base}?${query}` : base);
}

function categoryName(id: string): string {
  if (id === 'popular') return t('popular');
  if (id === 'recent') return t('recent');
  if (id === 'favorites') return t('favorites');
  if (id === 'all') return t('all');
  const manifestCategory = state.manifest?.categories.find((category) => category.id === id);
  return categoryLabel(id, state.lang, manifestCategory?.names[state.lang]);
}

function renderTabs(): void {
  categoryTabs.replaceChildren();
  const categoryIds = ['all', 'recent', 'favorites', ...(state.manifest?.categories.map((category) => category.id) ?? [])];
  for (const id of categoryIds) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-tab${state.activeCategory === id ? ' active' : ''}`;
    button.dataset.category = id;
    button.setAttribute('aria-pressed', String(state.activeCategory === id));
    button.textContent = categoryName(id);
    categoryTabs.append(button);
  }
}

function idsToSymbols(ids: string[]): CatalogSymbol[] {
  const byId = new Map(state.catalog.map((symbol) => [symbol.id, symbol]));
  return ids.map((id) => byId.get(id)).filter((symbol): symbol is CatalogSymbol => Boolean(symbol));
}

function baseItems(): CatalogSymbol[] {
  if (state.activeCategory === 'recent') return idsToSymbols(state.recent);
  if (state.activeCategory === 'favorites') return idsToSymbols([...state.favorites]);
  if (state.activeCategory === 'popular') return idsToSymbols(state.manifest?.featuredIds ?? []);
  if (state.activeCategory === 'all') return state.catalog;
  return state.catalog.filter((symbol) => symbol.categories.includes(state.activeCategory));
}

function filteredItems(): CatalogSymbol[] {
  const base = baseItems();
  if (!state.query.trim()) return base;
  const searchPool = ['recent', 'favorites'].includes(state.activeCategory) ? base : state.catalog;
  return searchSymbols(searchPool, state.query);
}

function renderStat(items: CatalogSymbol[]): void {
  statBar.replaceChildren();
  const text = t('resultCount', { n: items.length, total: state.catalog.length });
  const parts = text.split(/(\d[\d,]*)/g);
  for (const part of parts) {
    if (!part) continue;
    if (/^\d[\d,]*$/.test(part)) {
      const strong = document.createElement('strong');
      strong.textContent = part;
      statBar.append(strong);
    } else {
      statBar.append(document.createTextNode(part));
    }
  }
}

function renderEmpty(kind: 'search' | 'favorites' | 'recent'): void {
  emptyState.replaceChildren();
  const mark = document.createElement('div');
  mark.className = 'empty-mark';
  mark.textContent = kind === 'favorites' ? '☆' : kind === 'recent' ? '◷' : '⌕';
  const heading = document.createElement('h2');
  heading.textContent = t(kind === 'favorites' ? 'emptyFavorites' : kind === 'recent' ? 'emptyRecent' : 'emptySearch');
  const hint = document.createElement('p');
  hint.textContent = t(kind === 'favorites' ? 'emptyFavoritesHint' : kind === 'recent' ? 'emptyRecentHint' : 'emptySearchHint');
  emptyState.append(mark, heading, hint);
  emptyState.hidden = false;
}

function renderContent(): void {
  const items = filteredItems();
  state.currentItems = items;
  state.visibleCount = Math.min(Math.max(state.visibleCount, 240), Math.max(240, items.length));
  renderStat(items);
  contentTitle.textContent = state.query.trim() ? (state.lang === 'zh-CN' ? '搜索结果' : 'Search results') : categoryName(state.activeCategory);
  contentDescription.textContent = state.query.trim()
    ? (state.lang === 'zh-CN' ? '按匹配程度排序，最多显示 200 个结果。' : 'Results are ranked by match quality, with up to 200 results shown.')
    : t('seoDescription');
  symbolGrid.replaceChildren();
  emptyState.hidden = true;

  if (items.length === 0) {
    const kind = state.activeCategory === 'favorites' ? 'favorites' : state.activeCategory === 'recent' ? 'recent' : 'search';
    renderEmpty(kind);
  } else {
    const fragment = document.createDocumentFragment();
    for (const symbol of items.slice(0, state.visibleCount)) fragment.append(buildTile(symbol));
    symbolGrid.append(fragment);
  }

  loadMoreButton.textContent = t('loadMore');
  loadMoreButton.hidden = items.length <= state.visibleCount;
}

function loadNextPage(): void {
  if (state.visibleCount >= state.currentItems.length) return;
  state.visibleCount += 240;
  renderContent();
}

function tileTooltip(symbol: CatalogSymbol): string {
  const name = displayName(symbol);
  const codePoint = symbol.codePoints.join(' ');
  return state.lang === 'zh-CN' ? `${name}（${codePoint}）` : `${name} (${codePoint})`;
}

function buildTile(symbol: CatalogSymbol): HTMLElement {
  const tile = document.createElement('div');
  tile.className = 'symbol-tile';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'symbol-cell';
  button.dataset.symbolId = symbol.id;
  const tooltip = tileTooltip(symbol);
  button.setAttribute('aria-label', `${tooltip} ${symbol.block}`);
  button.title = tooltip;
  button.setAttribute('aria-pressed', String(symbol.id === state.selectedId));
  const character = document.createElement('span');
  character.className = 'symbol-char';
  character.textContent = symbol.value;
  character.setAttribute('aria-hidden', 'true');
  button.append(character);
  const favorite = document.createElement('button');
  favorite.type = 'button';
  favorite.className = `tile-favorite${state.favorites.has(symbol.id) ? ' active' : ''}`;
  favorite.dataset.favoriteId = symbol.id;
  favorite.setAttribute('aria-label', t(state.favorites.has(symbol.id) ? 'unfavorite' : 'favorite'));
  favorite.title = t(state.favorites.has(symbol.id) ? 'unfavorite' : 'favorite');
  favorite.textContent = state.favorites.has(symbol.id) ? '★' : '☆';
  tile.append(button, favorite);
  return tile;
}

function fallbackDetail(symbol: CatalogSymbol): UnicodeSymbol {
  const decimal = Array.from(symbol.value).map((character) => String(character.codePointAt(0) ?? 0)).join(' ');
  return {
    ...symbol,
    aliases: [],
    script: '—',
    plane: Math.floor((symbol.value.codePointAt(0) ?? 0) / 0x10000),
    unicodeVersion: state.manifest?.unicodeVersion ?? '17.0.0',
    isInvisible: false,
    isCombining: false,
    htmlHex: htmlHex(symbol.value),
    htmlDecimal: htmlDecimal(symbol.value),
    cssEscape: cssEscape(symbol.value),
    jsEscape: jsEscape(symbol.value),
    utf8: utf8(symbol.value),
    keywords: [...symbol.keywords, decimal]
  };
}

function setDetailText(id: string, value: string): void {
  getElement<HTMLElement>(id).textContent = value || '—';
}

function renderDetail(detail: UnicodeSymbol): void {
  state.currentDetail = detail;
  const detailChar = getElement<HTMLDivElement>('detailChar');
  detailChar.textContent = detail.value;
  detailChar.setAttribute('aria-label', displayName(detail));
  setDetailText('detailName', displayName(detail));
  setDetailText('detailNameEn', detail.name);
  getElement<HTMLElement>('detailNameEn').hidden = state.lang === 'zh-CN' && Boolean(detail.nameZh);
  setDetailText('detailCodePoint', detail.codePoints.join(' '));
  setDetailText('detailDecimal', Array.from(detail.value).map((character) => String(character.codePointAt(0) ?? 0)).join(' '));
  setDetailText('detailUtf8', detail.utf8);
  setDetailText('detailHtmlHex', detail.htmlHex);
  setDetailText('detailHtmlDecimal', detail.htmlDecimal);
  setDetailText('detailCss', detail.cssEscape);
  setDetailText('detailJs', detail.jsEscape);
  setDetailText('detailGeneralCategory', detail.generalCategory);
  setDetailText('detailBlock', detail.block);
  setDetailText('detailScript', detail.script);
  setDetailText('detailPlane', String(detail.plane));
  setDetailText('detailAge', detail.unicodeVersion);

  const warning = getElement<HTMLDivElement>('detailWarning');
  warning.hidden = !(detail.isInvisible || detail.isCombining);
  warning.textContent = t('invisibleWarning');

  const tags = getElement<HTMLDivElement>('detailCategories');
  tags.replaceChildren();
  for (const category of detail.categories) {
    const tag = document.createElement('span');
    tag.className = 'detail-tag';
    tag.textContent = categoryName(category);
    tags.append(tag);
  }

  const aliases = getElement<HTMLDivElement>('detailAliases');
  aliases.replaceChildren();
  aliases.hidden = detail.aliases.length === 0;
  if (detail.aliases.length > 0) {
    const label = document.createElement('strong');
    label.textContent = t('aliases');
    aliases.append(label, document.createTextNode(detail.aliases.join(' · ')));
  }

  const emojiLink = getElement<HTMLDivElement>('detailEmojiLink');
  emojiLink.hidden = !detail.isEmoji;
  const emojiAnchor = emojiLink.querySelector('a');
  if (emojiAnchor) emojiAnchor.href = `https://emoji-picker.wangruofeng007.com/?q=${encodeURIComponent(detail.value)}`;

  const favoriteButton = getElement<HTMLButtonElement>('detailFavorite');
  const isFavorite = state.favorites.has(detail.id);
  favoriteButton.classList.toggle('active', isFavorite);
  favoriteButton.textContent = isFavorite ? '★' : '☆';
  favoriteButton.title = t(isFavorite ? 'unfavorite' : 'favorite');
  favoriteButton.setAttribute('aria-label', t(isFavorite ? 'unfavorite' : 'favorite'));

  const relatedList = getElement<HTMLDivElement>('relatedList');
  relatedList.replaceChildren();
  const related = state.catalog
    .filter((symbol) => symbol.id !== detail.id)
    .map((symbol) => ({ symbol, score: (symbol.block === detail.block ? 3 : 0) + (symbol.categories.some((category) => detail.categories.includes(category)) ? 2 : 0) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.symbol.id.localeCompare(b.symbol.id))
    .slice(0, 6);
  for (const { symbol } of related) {
    const relatedButton = document.createElement('button');
    relatedButton.type = 'button';
    relatedButton.className = 'related-item symbol-char';
    relatedButton.dataset.symbolId = symbol.id;
    relatedButton.textContent = symbol.value;
    relatedButton.title = `${displayName(symbol)} ${symbol.codePoints[0]}`;
    relatedList.append(relatedButton);
  }
  detailPanel.classList.remove('hidden');
}

function copyFromButton(button: HTMLButtonElement): void {
  const target = document.getElementById(button.dataset.copyTarget ?? '');
  if (target) void copyText(target.textContent ?? '').then((copied) => copied && showToast(t('copiedShort')));
}

function renderDetailModal(detail: UnicodeSymbol): void {
  getElement<HTMLDivElement>('modalChar').textContent = detail.value;
  setDetailText('modalCharName', displayName(detail));
  setDetailText('modalCharNameEn', detail.name);
  getElement<HTMLElement>('modalCharNameEn').hidden = state.lang === 'zh-CN' && Boolean(detail.nameZh);
  setDetailText('modalCodePoint', detail.codePoints.join(' '));
  setDetailText('modalDecimal', Array.from(detail.value).map((character) => String(character.codePointAt(0) ?? 0)).join(' '));
  setDetailText('modalUtf8', detail.utf8);
  setDetailText('modalHtmlHex', detail.htmlHex);
  setDetailText('modalHtmlDecimal', detail.htmlDecimal);
  setDetailText('modalCss', detail.cssEscape);
  setDetailText('modalJs', detail.jsEscape);
  setDetailText('modalGeneralCategory', detail.generalCategory);
  setDetailText('modalBlock', detail.block);
  setDetailText('modalScript', detail.script);
  setDetailText('modalPlane', String(detail.plane));
  setDetailText('modalAge', detail.unicodeVersion);

  const warning = getElement<HTMLDivElement>('modalWarning');
  warning.hidden = !(detail.isInvisible || detail.isCombining);
  warning.textContent = t('invisibleWarning');

  const tags = getElement<HTMLDivElement>('modalCategories');
  tags.replaceChildren();
  for (const category of detail.categories) {
    const tag = document.createElement('span');
    tag.className = 'detail-tag';
    tag.textContent = categoryName(category);
    tags.append(tag);
  }

  const aliases = getElement<HTMLDivElement>('modalAliases');
  aliases.replaceChildren();
  aliases.hidden = detail.aliases.length === 0;
  if (detail.aliases.length > 0) {
    const label = document.createElement('strong');
    label.textContent = t('aliases');
    aliases.append(label, document.createTextNode(detail.aliases.join(' · ')));
  }

  const isFavorite = state.favorites.has(detail.id);
  modalFavorite.classList.toggle('active', isFavorite);
  modalFavorite.textContent = isFavorite ? '★' : '☆';
  modalFavorite.title = t(isFavorite ? 'unfavorite' : 'favorite');
  modalFavorite.setAttribute('aria-label', t(isFavorite ? 'unfavorite' : 'favorite'));
}

function openDetailModal(): void {
  if (!state.currentDetail || !detailModal.hidden) return;
  renderDetailModal(state.currentDetail);
  lastFocused = document.activeElement as HTMLElement | null;
  detailModal.hidden = false;
  document.body.classList.add('modal-open');
  getElement<HTMLButtonElement>('detailModalClose').focus();
}

function closeDetailModal(): void {
  if (detailModal.hidden) return;
  detailModal.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastFocused && lastFocused.isConnected && lastFocused.offsetParent !== null) {
    lastFocused.focus();
  }
  lastFocused = null;
}

async function selectSymbol(id: string, { copy = true, updateHistory = true } = {}): Promise<void> {
  const symbol = state.catalog.find((item) => item.id === id);
  if (!symbol) return;
  state.selectedId = symbol.id;
  const fallback = fallbackDetail(symbol);
  renderDetail(fallback);
  if (updateHistory) updateUrl();
  if (copy) {
    addRecent(symbol.id);
    if (await copyText(symbol.value)) showToast(t('copied', { x: symbol.value }));
  }
  const cached = state.detailCache.get(symbol.id);
  if (cached) {
    renderDetail(cached);
    return;
  }
  try {
    const detail = await loadDetail(symbol);
    state.detailCache.set(symbol.id, detail);
    if (state.selectedId === symbol.id) renderDetail(detail);
  } catch {
    // The catalog still contains enough information for the core copy workflow.
  }
}

function addRecent(id: string): void {
  state.recent = [id, ...state.recent.filter((item) => item !== id)].slice(0, 100);
  writeList(RECENT_KEY, state.recent, 100);
}

function toggleFavorite(id: string): void {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  writeList(FAVORITES_KEY, [...state.favorites], 100);
  renderContent();
  if (state.currentDetail?.id === id) {
    renderDetail(state.currentDetail);
    if (!detailModal.hidden) renderDetailModal(state.currentDetail);
  }
}

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1700);
}

function renderError(): void {
  contentTitle.textContent = t('dataError');
  contentDescription.textContent = t('dataErrorHint');
  statBar.textContent = '';
  symbolGrid.replaceChildren();
  renderEmpty('search');
}

function bindEvents(): void {
  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    state.visibleCount = 240;
    clearSearch.hidden = !state.query;
    updateUrl();
    renderContent();
  });
  clearSearch.addEventListener('click', () => {
    state.query = '';
    searchInput.value = '';
    clearSearch.hidden = true;
    searchInput.focus();
    updateUrl();
    renderContent();
  });
  categoryTabs.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-category]');
    if (!target) return;
    state.activeCategory = target.dataset.category ?? 'popular';
    state.visibleCount = 240;
    updateUrl();
    renderTabs();
    renderContent();
    if (window.innerWidth <= 720) detailPanel.classList.add('hidden');
  });
  symbolGrid.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const favoriteId = target.closest<HTMLElement>('[data-favorite-id]')?.dataset.favoriteId;
    if (favoriteId) {
      toggleFavorite(favoriteId);
      return;
    }
    const symbolId = target.closest<HTMLElement>('[data-symbol-id]')?.dataset.symbolId;
    if (symbolId) void selectSymbol(symbolId);
  });
  getElement<HTMLDivElement>('relatedList').addEventListener('click', (event) => {
    const symbolId = (event.target as HTMLElement).closest<HTMLElement>('[data-symbol-id]')?.dataset.symbolId;
    if (symbolId) void selectSymbol(symbolId);
  });
  loadMoreButton.addEventListener('click', loadNextPage);
  const autoLoadObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadNextPage();
  }, { rootMargin: '360px 0px' });
  autoLoadObserver.observe(loadMoreSentinel);
  getElement<HTMLButtonElement>('detailFavorite').addEventListener('click', () => {
    if (state.selectedId) toggleFavorite(state.selectedId);
  });
  getElement<HTMLButtonElement>('detailClose').addEventListener('click', () => {
    detailModal.hidden = true;
    document.body.classList.remove('modal-open');
    lastFocused = null;
    detailPanel.classList.add('hidden');
    state.selectedId = null;
    state.currentDetail = null;
    updateUrl();
    renderContent();
  });
  detailPanel.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const copyButton = target.closest<HTMLButtonElement>('[data-copy-target]');
    if (copyButton) { copyFromButton(copyButton); return; }
    if (target.closest('[data-zoom-detail]')) openDetailModal();
  });
  detailModal.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-modal-close]')) { closeDetailModal(); return; }
    const copyButton = target.closest<HTMLButtonElement>('[data-copy-target]');
    if (copyButton) copyFromButton(copyButton);
  });
  getElement<HTMLButtonElement>('shareButton').addEventListener('click', () => {
    void copyText(window.location.href).then((copied) => copied && showToast(t('copiedShort')));
  });
  modalFavorite.addEventListener('click', () => {
    if (state.selectedId) toggleFavorite(state.selectedId);
  });
  getElement<HTMLButtonElement>('modalShare').addEventListener('click', () => {
    void copyText(window.location.href).then((copied) => copied && showToast(t('copiedShort')));
  });
  langBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    langMenu.classList.toggle('show');
  });
  document.addEventListener('click', (event) => {
    if (!(event.target as HTMLElement).closest('.lang-wrap')) langMenu.classList.remove('show');
  });
  themeBtn.addEventListener('click', () => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    writeValue(THEME_KEY, next);
    applyTheme(next);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!detailModal.hidden) closeDetailModal();
      else if (langMenu.classList.contains('show')) langMenu.classList.remove('show');
      else if (state.query) {
        state.query = '';
        searchInput.value = '';
        clearSearch.hidden = true;
        updateUrl();
        renderContent();
      } else if (!detailPanel.classList.contains('hidden')) {
        getElement<HTMLButtonElement>('detailClose').click();
      }
      return;
    }
    if (event.key === '/' && document.activeElement !== searchInput) {
      event.preventDefault();
      searchInput.focus();
      return;
    }
    if (!detailModal.hidden && event.key === 'Tab') {
      const focusables = Array.from(detailModal.querySelectorAll<HTMLElement>('button, [href], [tabindex="0"]')).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && (event.target as HTMLElement)?.closest('[data-zoom-detail]')) {
      event.preventDefault();
      openDetailModal();
    }
  });
}

async function init(): Promise<void> {
  const savedLanguage = readValue(LANG_KEY);
  state.lang = savedLanguage === 'en' || savedLanguage === 'zh-CN' ? savedLanguage : detectLanguage();
  const savedTheme = readValue(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  state.theme = savedTheme === 'dark' ? 'dark' : savedTheme === 'light' ? 'light' : prefersDark ? 'dark' : 'light';
  state.favorites = new Set(readList(FAVORITES_KEY, 100));
  state.recent = readList(RECENT_KEY, 100);
  const pendingSymbol = readUrlState();
  applyI18n();
  bindEvents();
  try {
    const [manifest, catalog] = await Promise.all([loadManifest(), loadCatalog(state.lang)]);
    state.manifest = manifest;
    state.catalog = catalog;
    if (!state.manifest.categories.some((category) => category.id === state.activeCategory) && !['all', 'recent', 'favorites', 'popular'].includes(state.activeCategory)) state.activeCategory = 'popular';
    renderTabs();
    renderContent();
    if (pendingSymbol) {
      const symbol = findByCodePoint(state.catalog, pendingSymbol);
      if (symbol) await selectSymbol(symbol.id, { copy: false, updateHistory: false });
    }
    if ('serviceWorker' in navigator) void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  } catch {
    renderError();
  }
}

void init();
