import assert from 'node:assert/strict';
import test from 'node:test';
import { categoryLabel, filterSymbolsByCategory, isVirtualCategory } from '../src/lib/taxonomy';
import type { CatalogSymbol } from '../src/lib/types';

const symbols: CatalogSymbol[] = [
  { id: 'u-1f600', value: '😀', codePoints: ['U+1F600'], name: 'GRINNING FACE', nameZh: '笑脸', keywords: ['face'], categories: ['other'], block: 'Emoticons', generalCategory: 'So', isEmoji: true },
  { id: 'u-2193', value: '↓', codePoints: ['U+2193'], name: 'DOWNWARDS ARROW', nameZh: '向下箭头', keywords: ['arrow'], categories: ['arrows'], block: 'Arrows', generalCategory: 'So', isEmoji: false }
];

test('filters the virtual emoji category using the emoji property', () => {
  assert.deepEqual(filterSymbolsByCategory(symbols, 'emoji').map((symbol) => symbol.id), ['u-1f600']);
});

test('keeps existing category filtering behavior', () => {
  assert.deepEqual(filterSymbolsByCategory(symbols, 'all'), symbols);
  assert.deepEqual(filterSymbolsByCategory(symbols, 'arrows').map((symbol) => symbol.id), ['u-2193']);
});

test('recognizes and labels the emoji URL category', () => {
  assert.equal(isVirtualCategory('emoji'), true);
  assert.equal(isVirtualCategory('unknown'), false);
  assert.equal(categoryLabel('emoji', 'zh-CN'), 'Emoji');
  assert.equal(categoryLabel('emoji', 'en'), 'Emoji');
});
