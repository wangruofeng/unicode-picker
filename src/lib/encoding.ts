export function codePointValues(value: string): number[] {
  return Array.from(value).map((character) => character.codePointAt(0) ?? 0);
}

export function codePointStrings(value: string): string[] {
  return codePointValues(value).map((codePoint) => `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`);
}

export function htmlHex(value: string): string {
  return codePointValues(value).map((codePoint) => `&#x${codePoint.toString(16).toUpperCase()};`).join(' ');
}

export function htmlDecimal(value: string): string {
  return codePointValues(value).map((codePoint) => `&#${codePoint};`).join(' ');
}

export function cssEscape(value: string): string {
  return codePointValues(value).map((codePoint) => `\\${codePoint.toString(16).toUpperCase()}`).join(' ');
}

export function jsEscape(value: string): string {
  return codePointValues(value).map((codePoint) => codePoint <= 0xffff
    ? `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
    : `\\u{${codePoint.toString(16).toUpperCase()}}`).join(' ');
}

export function utf8(value: string): string {
  return Array.from(new TextEncoder().encode(value), (byte) => byte.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}
