import Dexie, { type EntityTable } from 'dexie';

/** Per-item practice history. Phase 2 adds spaced-repetition fields to this row. */
export interface Stat {
  id: string; // "letter:baa", "phrase:ahlan", "mark:fat7a"
  seen: number;
  right: number;
  wrong: number;
  last: string; // ISO
}
export interface KV {
  key: string;
  value: unknown;
}

export const db = new Dexie('yalla') as Dexie & {
  stats: EntityTable<Stat, 'id'>;
  kv: EntityTable<KV, 'key'>;
};
db.version(1).stores({ stats: 'id', kv: 'key' });

export async function record(id: string, correct: boolean) {
  const s = (await db.stats.get(id)) ?? { id, seen: 0, right: 0, wrong: 0, last: '' };
  s.seen += 1;
  if (correct) s.right += 1;
  else s.wrong += 1;
  s.last = new Date().toISOString();
  await db.stats.put(s);
}

export const setKV = (key: string, value: unknown) => db.kv.put({ key, value });
export const markDone = (unit: string) => setKV(`done:${unit}`, new Date().toISOString());

export interface Settings {
  showGuide: boolean;
  rate: number;
}
export const DEFAULT_SETTINGS: Settings = { showGuide: true, rate: 0.8 };

export async function requestPersistence() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    /* best effort */
  }
}

export async function resetAll() {
  await db.transaction('rw', db.stats, db.kv, async () => {
    await db.stats.clear();
    await db.kv.clear();
  });
}
