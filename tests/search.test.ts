import assert from 'node:assert/strict';
import test from 'node:test';
import { searchSymbols } from '../src/lib/search';
import type { CatalogSymbol } from '../src/lib/types';

const symbols: CatalogSymbol[] = [
  { id: 'u-21e3', value: '⇣', codePoints: ['U+21E3'], name: 'DOWNWARDS DASHED ARROW', nameZh: '向下虚线箭头', keywords: ['down', 'arrow'], categories: ['arrows'], block: 'Arrows', generalCategory: 'So', isEmoji: false },
  { id: 'u-2193', value: '↓', codePoints: ['U+2193'], name: 'DOWNWARDS ARROW', nameZh: '向下箭头', keywords: ['down', 'arrow'], categories: ['arrows'], block: 'Arrows', generalCategory: 'So', isEmoji: false },
  { id: 'u-221e', value: '∞', codePoints: ['U+221E'], name: 'INFINITY', nameZh: '无穷大', keywords: ['infinity'], categories: ['math'], block: 'Mathematical Operators', generalCategory: 'Sm', isEmoji: false },
  { id: 'u-2460', value: '①', codePoints: ['U+2460'], name: 'CIRCLED DIGIT ONE', nameZh: '带圈数字一', keywords: ['circled', 'digit', 'one'], categories: ['circles'], block: 'Enclosed Alphanumerics', generalCategory: 'No', isEmoji: false }
];

test('searches by character, code point, English, and Chinese', () => {
  assert.equal(searchSymbols(symbols, '⇣')[0]?.id, 'u-21e3');
  assert.equal(searchSymbols(symbols, 'U+21E3')[0]?.id, 'u-21e3');
  assert.equal(searchSymbols(symbols, 'down arrow')[0]?.id, 'u-21e3');
  assert.equal(searchSymbols(symbols, '无穷')[0]?.id, 'u-221e');
});

test('prioritizes an exact compatibility character over its normalized form', () => {
  assert.equal(searchSymbols(symbols, '①')[0]?.id, 'u-2460');
});
