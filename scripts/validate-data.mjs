import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const VERSION = process.env.UNICODE_VERSION ?? '17.0.0';
const EXPECTED_COUNT = 9555;
const root = resolve(process.cwd(), 'public', 'data', VERSION);
const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
const catalog = JSON.parse(await readFile(join(root, 'catalog.en.json'), 'utf8'));
const catalogZh = JSON.parse(await readFile(join(root, 'catalog.zh-CN.json'), 'utf8'));
const allowedCategories = new Set(['Sm', 'Sc', 'Sk', 'So', 'Pc', 'Pd', 'Ps', 'Pe', 'Pi', 'Pf', 'Po']);
const includedNumberBlocks = new Set(['Enclosed Alphanumerics']);
const catalogZhById = new Map(catalogZh.map((symbol) => [symbol.id, symbol]));

if (manifest.symbolCount !== EXPECTED_COUNT || catalog.length !== EXPECTED_COUNT || catalogZh.length !== EXPECTED_COUNT) {
  throw new Error(`Expected ${EXPECTED_COUNT} records, got manifest=${manifest.symbolCount}, catalog.en=${catalog.length}, catalog.zh-CN=${catalogZh.length}`);
}

const ids = new Set();
for (const symbol of catalog) {
  if (ids.has(symbol.id)) throw new Error(`Duplicate symbol id: ${symbol.id}`);
  ids.add(symbol.id);
  if (!symbol.value || symbol.codePoints.length === 0) throw new Error(`Missing value/code point for ${symbol.id}`);
  if (!allowedCategories.has(symbol.generalCategory)
    && !(symbol.generalCategory === 'No' && includedNumberBlocks.has(symbol.block))) {
    throw new Error(`Invalid category for ${symbol.id}: ${symbol.generalCategory}`);
  }
  const expectedValue = String.fromCodePoint(...symbol.codePoints.map((value) => Number.parseInt(value.slice(2), 16)));
  if (expectedValue !== symbol.value) throw new Error(`Code point round-trip failed for ${symbol.id}`);
  if (!symbol.block || !Array.isArray(symbol.categories) || symbol.categories.length === 0) throw new Error(`Missing taxonomy for ${symbol.id}`);
  const chineseName = catalogZhById.get(symbol.id)?.nameZh;
  if (!chineseName || chineseName === symbol.name || /^字符 U\+[0-9A-F]+$/.test(chineseName)) {
    throw new Error(`Missing Simplified Chinese name for ${symbol.id}: ${symbol.name}`);
  }
}

console.log(`Validated Unicode ${VERSION}: ${catalog.length} records, ${ids.size} unique IDs`);
