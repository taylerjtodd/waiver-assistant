import { ParsedRankingItem } from '../rankings/types';

const STORAGE_KEYS = {
  RANKINGS_ITEMS: 'waiver_assistant_parsed_rankings_v1',
  RANKINGS_FILENAME: 'waiver_assistant_rankings_filename_v1',
};

export interface StoredRankings {
  filename: string;
  items: ParsedRankingItem[];
  savedAt: number;
}

export function getStoredRankings(): StoredRankings | null {
  try {
    const rawItems = localStorage.getItem(STORAGE_KEYS.RANKINGS_ITEMS);
    const filename = localStorage.getItem(STORAGE_KEYS.RANKINGS_FILENAME) || 'Rankings.csv';
    if (!rawItems) return null;
    const items = JSON.parse(rawItems) as ParsedRankingItem[];
    if (!Array.isArray(items) || items.length === 0) return null;
    return {
      filename,
      items,
      savedAt: Date.now(),
    };
  } catch (err) {
    console.warn('[Storage] Failed to load stored rankings:', err);
    return null;
  }
}

export function saveStoredRankings(filename: string, items: ParsedRankingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RANKINGS_FILENAME, filename);
    localStorage.setItem(STORAGE_KEYS.RANKINGS_ITEMS, JSON.stringify(items));
  } catch (err) {
    console.warn('[Storage] Failed to save rankings to storage:', err);
  }
}

export function clearStoredRankings(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RANKINGS_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.RANKINGS_FILENAME);
  } catch (err) {
    console.warn('[Storage] Failed to clear rankings storage:', err);
  }
}
