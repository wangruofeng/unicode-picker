import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import type { CatalogSymbol, UnicodeManifest } from '../src/lib/types';

const root = resolve(process.cwd(), 'public', 'data', '17.0.0');
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8')) as UnicodeManifest;
const catalog = JSON.parse(readFileSync(resolve(root, 'catalog.en.json'), 'utf8')) as CatalogSymbol[];
const catalogZh = JSON.parse(readFileSync(resolve(root, 'catalog.zh-CN.json'), 'utf8')) as CatalogSymbol[];

test('generated catalog matches the Unicode 17.0 MVP contract', () => {
  assert.equal(manifest.symbolCount, 9555);
  assert.equal(catalog.length, 9555);
  assert.equal(new Set(catalog.map((symbol) => symbol.id)).size, catalog.length);
  assert.ok(catalog.every((symbol) => symbol.value && symbol.block && symbol.categories.length > 0));
});

test('generated catalog includes enclosed alphanumeric symbols', () => {
  const circledOne = catalog.find((symbol) => symbol.id === 'u-2460');
  assert.deepEqual(circledOne && {
    value: circledOne.value,
    block: circledOne.block,
    generalCategory: circledOne.generalCategory,
    categories: circledOne.categories
  }, {
    value: '①',
    block: 'Enclosed Alphanumerics',
    generalCategory: 'No',
    categories: ['circles']
  });
});

test('generated code points round-trip to their characters', () => {
  for (const symbol of catalog) {
    const value = String.fromCodePoint(...symbol.codePoints.map((codePoint) => Number.parseInt(codePoint.slice(2), 16)));
    assert.equal(value, symbol.value, symbol.id);
  }
});

test('generated Simplified Chinese catalog has a translated name for every symbol', () => {
  assert.equal(catalogZh.length, catalog.length);
  assert.ok(catalogZh.every((symbol) => (
    symbol.nameZh &&
    symbol.nameZh !== symbol.name &&
    !/^字符 U\+[0-9A-F]+$/.test(symbol.nameZh)
  )));
});
