import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS, setKV, type Settings } from './db';

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
