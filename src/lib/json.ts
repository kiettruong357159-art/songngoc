// Safe JSON helpers
export function safeParseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value || typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeParseJsonArray(value: string | null | undefined, fallback: string[] = []): string[] {
  const parsed = safeParseJson<unknown>(value, fallback);
  return Array.isArray(parsed) ? (parsed as string[]) : fallback;
}
