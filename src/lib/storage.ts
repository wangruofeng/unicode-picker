const STORAGE_VERSION = 1;

interface StoredList {
  version: number;
  items: string[];
}

export function readList(key: string, limit = 100): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredList | string[];
    const items = Array.isArray(parsed) ? parsed : parsed.items;
    return Array.isArray(items) ? items.filter((item): item is string => typeof item === 'string').slice(0, limit) : [];
  } catch {
    return [];
  }
}

export function writeList(key: string, items: string[], limit = 100): void {
  try {
    const payload: StoredList = { version: STORAGE_VERSION, items: items.slice(0, limit) };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Private browsing and storage quotas should not block the picker.
  }
}

export function readValue(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore unavailable storage.
  }
}
