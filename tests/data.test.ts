import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import type { CatalogSymbol, UnicodeManifest } from '../src/lib/types';

const root = resolve(process.cwd(), 'public', 'data', '17.0.0');
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8')) as UnicodeManifest;
const catalog = JSON.parse(readFileSync(resolve(root, 'catalog.en.json'), 'utf8')) as CatalogSymbol[];

test('generated catalog matches the Unicode 17.0 MVP contract', () => {
  assert.equal(manifest.symbolCount, 9473);
  assert.equal(catalog.length, 9473);
  assert.equal(new Set(catalog.map((symbol) => symbol.id)).size, catalog.length);
  assert.ok(catalog.every((symbol) => symbol.value && symbol.block && symbol.categories.length > 0));
});

test('generated code points round-trip to their characters', () => {
  for (const symbol of catalog) {
    const value = String.fromCodePoint(...symbol.codePoints.map((codePoint) => Number.parseInt(codePoint.slice(2), 16)));
    assert.equal(value, symbol.value, symbol.id);
  }
});
