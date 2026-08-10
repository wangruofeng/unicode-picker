import assert from 'node:assert/strict';
import test from 'node:test';
import { codePointStrings, cssEscape, htmlDecimal, htmlHex, jsEscape, utf8 } from '../src/lib/encoding';

test('encodes a BMP symbol consistently', () => {
  assert.deepEqual(codePointStrings('⇣'), ['U+21E3']);
  assert.equal(htmlHex('⇣'), '&#x21E3;');
  assert.equal(htmlDecimal('⇣'), '&#8675;');
  assert.equal(cssEscape('⇣'), '\\21E3');
  assert.equal(jsEscape('⇣'), '\\u21E3');
  assert.equal(utf8('⇣'), 'E2 87 A3');
});

test('uses code point escapes for supplementary characters', () => {
  assert.deepEqual(codePointStrings('😀'), ['U+1F600']);
  assert.equal(cssEscape('😀'), '\\1F600');
  assert.equal(jsEscape('😀'), '\\u{1F600}');
});
