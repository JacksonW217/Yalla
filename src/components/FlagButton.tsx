import { Flag } from 'lucide-react';
import { db, setKV } from '../lib/db';
import { useFlags } from '../lib/hooks';

/** Mark a word or phrase as "this looks wrong" so it can be checked and fixed later. */
export function FlagButton({ id }: { id: string }) {
  const flags = useFlags();
  const on = id in flags;
  const toggle = async () => {
    if (on) {
      if (confirm('Remove your “looks wrong” flag from this one?')) await db.kv.delete(`flag:${id}`);
      return;
    }
    const note = prompt('What looks wrong? (optional)\nFor example: a different spelling, pronunciation or meaning you found.', '');
    if (note === null) return;
    await setKV(`flag:${id}`, note.trim());
  };
  return (
    <button type="button" className={`flag${on ? ' on' : ''}`} onClick={toggle} aria-label={on ? 'Flagged as possibly wrong. Tap to remove.' : 'This looks wrong'} title="This looks wrong">
      <Flag size={15} fill={on ? 'currentColor' : 'none'} />
    </button>
  );
}
