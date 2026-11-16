import Dexie, { type EntityTable } from 'dexie';
import type { Schedule } from './srs';

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

/** A flashcard and its place in the review schedule. */
export interface Card extends Schedule {
  id: string; // "<kind>:<ref>", e.g. "write:baa"
  kind: CardKind;
  ref: string; // letter / phrase / mark id
  created: string; // day key
  last?: string; // day key of last review
}
export type CardKind = 'letter-read' | 'letter-write' | 'mark-read' | 'phrase-say' | 'phrase-read';

export const db = new Dexie('yalla') as Dexie & {
  stats: EntityTable<Stat, 'id'>;
  kv: EntityTable<KV, 'key'>;
  cards: EntityTable<Card, 'id'>;
};
db.version(1).stores({ stats: 'id', kv: 'key' });
db.version(2).stores({ cards: 'id, due' });

export async function record(id: string, correct: boolean) {
  const s = (await db.stats.get(id)) ?? { id, seen: 0, right: 0, wrong: 0, last: '' };
  s.seen += 1;
  if (correct) s.right += 1;
  else s.wrong += 1;
  s.last = new Date().toISOString();
  await db.stats.put(s);
}

export const setKV = (key: string, value: unknown) => db.kv.put({ key, value });


export interface Settings {
  showGuide: boolean;
  rate: number;
  /** Preferred daily session length. */
  minutes: number;
}
export const DEFAULT_SETTINGS: Settings = { showGuide: true, rate: 0.8, minutes: 20 };

export async function requestPersistence() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    /* best effort */
  }
}

export async function resetAll() {
  await db.transaction('rw', db.stats, db.kv, db.cards, async () => {
    await db.stats.clear();
    await db.kv.clear();
    await db.cards.clear();
  });
}
