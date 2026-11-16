import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS, setKV, type Settings } from './db';
import { dayKey } from './srs';

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const row = useLiveQuery(() => db.kv.get('settings'), []);
  const s = { ...DEFAULT_SETTINGS, ...((row?.value as Partial<Settings>) ?? {}) };
  return [s, (patch) => void setKV('settings', { ...s, ...patch })];
}

/** Set of completed unit keys, or undefined while loading. */
export function useDone(): Set<string> | undefined {
  return useLiveQuery(async () => {
    const rows = await db.kv.where('key').startsWith('done:').toArray();
    return new Set(rows.map((r) => r.key.slice(5)));
  }, []);
}

export function useStats() {
  return useLiveQuery(async () => Object.fromEntries((await db.stats.toArray()).map((s) => [s.id, s])), []);
}

/** All cards, or undefined while loading. */
export function useCards() {
  return useLiveQuery(() => db.cards.toArray(), []);
}

export function useToday() {
  return useLiveQuery(async () => ((await db.kv.get(`day:${dayKey()}`))?.value as { reviews: number } | undefined) ?? { reviews: 0 }, []);
}

/** Content the learner flagged as possibly wrong: phrase id → note. */
export function useFlags(): Record<string, string> {
  return (
    useLiveQuery(async () => {
      const rows = await db.kv.where('key').startsWith('flag:').toArray();
      return Object.fromEntries(rows.map((r) => [r.key.slice(5), String(r.value ?? '')]));
    }, []) ?? {}
  );
}

/** Core-vocabulary progress: words learned so far, and how many were introduced today. */
export function useCore() {
  return useLiveQuery(async () => {
    const learned = Number((await db.kv.get('core:learned'))?.value ?? 0);
    const today = Number((await db.kv.get(`core:${dayKey()}`))?.value ?? 0);
    return { learned, today };
  }, []);
}
