import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { classifySymbol } from './classify-symbols.mjs';
import { getChineseName } from './name-zh.mjs';

const VERSION = process.env.UNICODE_VERSION ?? '17.0.0';
const EXPECTED_COUNT = 9555;
const root = resolve(process.cwd(), 'data', 'ucd', VERSION, 'raw');
const outputDir = resolve(process.cwd(), 'data', 'generated');
const ALLOWED_CATEGORIES = new Set(['Sm', 'Sc', 'Sk', 'So', 'Pc', 'Pd', 'Ps', 'Pe', 'Pi', 'Pf', 'Po']);
// Other-number characters are normally excluded, but these enclosed forms are
// commonly used as symbols for lists, labels, and shortcuts.
const INCLUDED_NUMBER_BLOCKS = new Set(['Enclosed Alphanumerics']);

const sourcePath = (name) => join(root, name);

function parseRange(value) {
  const [start, end = start] = value.trim().split('..');
  return [Number.parseInt(start, 16), Number.parseInt(end, 16)];
}

async function linesAt(file) {
  return (await readFile(file, 'utf8')).split(/\r?\n/);
}

function parsePropertyRanges(lines, { property = null } = {}) {
  const ranges = [];
  for (const line of lines) {
    const clean = line.split('#', 1)[0].trim();
    if (!clean) continue;
    const [rangeText, rawProperty] = clean.split(';').map((part) => part.trim());
    if (property && rawProperty !== property) continue;
    const [start, end] = parseRange(rangeText);
    ranges.push({ start, end, property: rawProperty });
  }
  return ranges;
}

function valueFor(ranges, codePoint, fallback = '') {
  for (const range of ranges) {
    if (codePoint >= range.start && codePoint <= range.end) return range.property;
  }
  return fallback;
}

function setFromRanges(ranges) {
  const result = new Set();
  for (const { start, end } of ranges) {
    for (let codePoint = start; codePoint <= end; codePoint += 1) result.add(codePoint);
  }
  return result;
}

function codePointText(codePoint) {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
}

function codePointHex(codePoint) {
  return codePoint.toString(16).toUpperCase().padStart(4, '0');
}

function codePointValues(value) {
  return Array.from(value).map((character) => character.codePointAt(0));
}

function htmlHex(value) {
  return codePointValues(value).map((codePoint) => `&#x${codePoint.toString(16).toUpperCase()};`).join(' ');
}

function htmlDecimal(value) {
  return codePointValues(value).map((codePoint) => `&#${codePoint};`).join(' ');
}

function cssEscape(value) {
  return codePointValues(value).map((codePoint) => `\\${codePoint.toString(16).toUpperCase()}`).join(' ');
}

function jsEscape(value) {
  return codePointValues(value).map((codePoint) => codePoint <= 0xFFFF
    ? `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
    : `\\u{${codePoint.toString(16).toUpperCase()}}`).join(' ');
}

function utf8(value) {
  return Array.from(new TextEncoder().encode(value), (byte) => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

function productKeywords(name, nameZh, aliases, block) {
  const words = name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const aliasWords = aliases.flatMap((alias) => alias.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  return [...new Set([...words, ...aliasWords, block.toLowerCase(), ...(nameZh ? [nameZh] : [])])];
}

function isIncluded(generalCategory, codePoint, blocks) {
  return ALLOWED_CATEGORIES.has(generalCategory)
    || (generalCategory === 'No' && INCLUDED_NUMBER_BLOCKS.has(valueFor(blocks, codePoint, 'No_Block')));
}

function parseUnicodeData(lines, blocks) {
  const records = [];
  let rangeStart = null;
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const fields = line.split(';');
    const codePoint = Number.parseInt(fields[0], 16);
    const name = fields[1];
    const generalCategory = fields[2];
    const combiningClass = Number.parseInt(fields[3], 10) || 0;
    if (name.endsWith(', First>')) {
      rangeStart = { codePoint, name, generalCategory, combiningClass };
      continue;
    }
    if (name.endsWith(', Last>')) {
      if (rangeStart && isIncluded(rangeStart.generalCategory, rangeStart.codePoint, blocks)) {
        for (let value = rangeStart.codePoint; value <= codePoint; value += 1) {
          records.push({ codePoint: value, name: rangeStart.name.replace(', First>', '').replace(/^<|>$/g, ''), generalCategory: rangeStart.generalCategory, combiningClass: rangeStart.combiningClass });
        }
      }
      rangeStart = null;
      continue;
    }
    if (!isIncluded(generalCategory, codePoint, blocks) || name.startsWith('<')) continue;
    records.push({ codePoint, name, generalCategory, combiningClass });
  }
  return records;
}

function parseAliases(lines) {
  const aliases = new Map();
  for (const line of lines) {
    const clean = line.split('#', 1)[0].trim();
    if (!clean) continue;
    const [codePointText, alias] = clean.split(';').map((part) => part.trim());
    const codePoint = Number.parseInt(codePointText, 16);
    const list = aliases.get(codePoint) ?? [];
    list.push(alias);
    aliases.set(codePoint, list);
  }
  return aliases;
}

const symbolsText = await linesAt(sourcePath('UnicodeData.txt'));
const blocks = parsePropertyRanges(await linesAt(sourcePath('Blocks.txt')));
const symbols = parseUnicodeData(symbolsText, blocks);
const scripts = parsePropertyRanges(await linesAt(sourcePath('Scripts.txt')));
const ages = parsePropertyRanges(await linesAt(sourcePath('DerivedAge.txt')));
const emoji = setFromRanges(parsePropertyRanges(await linesAt(sourcePath('emoji/emoji-data.txt')), { property: 'Emoji' }));
const invisible = setFromRanges(parsePropertyRanges(await linesAt(sourcePath('PropList.txt')), { property: 'Default_Ignorable_Code_Point' }));
const aliases = parseAliases(await linesAt(sourcePath('NameAliases.txt')));

const fullSymbols = symbols
  .sort((a, b) => a.codePoint - b.codePoint)
  .map((symbol) => {
    const value = String.fromCodePoint(symbol.codePoint);
    const block = valueFor(blocks, symbol.codePoint, 'No_Block');
    const script = valueFor(scripts, symbol.codePoint, 'Unknown');
    const unicodeVersion = valueFor(ages, symbol.codePoint, '1.1');
    const nameZh = getChineseName(codePointHex(symbol.codePoint), symbol.name);
    const symbolForClassification = { ...symbol, block };
    const categories = classifySymbol(symbolForClassification);
    const symbolAliases = aliases.get(symbol.codePoint) ?? [];
    return {
      id: `u-${codePointHex(symbol.codePoint).toLowerCase()}`,
      value,
      codePoints: [codePointText(symbol.codePoint)],
      name: symbol.name,
      nameZh,
      aliases: symbolAliases,
      keywords: productKeywords(symbol.name, nameZh, symbolAliases, block),
      generalCategory: symbol.generalCategory,
      block,
      script,
      plane: Math.floor(symbol.codePoint / 0x10000),
      unicodeVersion,
      categories,
      isEmoji: emoji.has(symbol.codePoint),
      isInvisible: invisible.has(symbol.codePoint),
      isCombining: symbol.combiningClass !== 0,
      htmlHex: htmlHex(value),
      htmlDecimal: htmlDecimal(value),
      cssEscape: cssEscape(value),
      jsEscape: jsEscape(value),
      utf8: utf8(value)
    };
  });

if (fullSymbols.length !== EXPECTED_COUNT) {
  throw new Error(`Expected ${EXPECTED_COUNT} symbol code points, parsed ${fullSymbols.length}`);
}

await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, 'symbols.json'), JSON.stringify({ unicodeVersion: VERSION, symbols: fullSymbols }, null, 2));
console.log(`Parsed ${fullSymbols.length} Unicode ${VERSION} symbols`);
