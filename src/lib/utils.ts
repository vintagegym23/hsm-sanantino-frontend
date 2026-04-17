import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalises a raw subCategories value from the API/DB into a clean string[].
 * Handles: already-parsed JS arrays (pg JSONB auto-parse), JSON strings, null/undefined.
 */
export function normalizeSubCategories(value: unknown): string[] {
  if (!value) return [];

  let parsed: unknown = value;

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return (parsed as unknown[])
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.trim())
    .filter(Boolean);
}
