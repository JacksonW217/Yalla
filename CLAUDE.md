# Yalla — notes for whoever works on this next

Yalla is a personal app for learning Arabic from zero, built for one person (the
repo owner). It installs to the iPhone Home Screen and works offline. Read this
before changing anything.

## Who it's for and what they asked for

- Complete beginner, English speaker, learning out of interest. About 30 minutes
  a day. First goal: a short conversation in about 3 months.
- **Speaking is Egyptian Arabic. Reading and writing are formal Arabic (MSA).**
  Keep the two clearly labelled everywhere.
- Not technical. Explain changes in plain language, with steps they can follow
  on a phone. They test on a real iPhone; you can't, so say what you couldn't
  test (audio, the Arabic keyboard, the share sheet).
- Hard rules they set:
  - **Free.** No paid services, no API keys. Hosting is Vercel's free tier.
  - **No streaks, guilt-trip reminders or gamification** beyond plain progress.
  - **Be honest about uncertain Arabic.** Anything the author is less than sure
    of gets `check: true`, shown in the app as a "Check this" badge. Never
    present a guess as certain. No native speaker has reviewed the content.
  - Ask before large changes when unsure; otherwise use judgment and say what
    you chose.

## How it's built

- Vite + React 19 + TypeScript, `vite-plugin-pwa`. Static site on Vercel; a push
  to `main` redeploys and the installed app updates itself on next open.
- All progress is in IndexedDB (Dexie) **on the device only**: tables `stats`,
  `kv`, `cards`. There is no server and no account. Settings has backup/restore.
- Commands: `npm run dev`, `npm test` (Vitest), `npm run build` (type-check +
  build). Run tests and the build before every push.
- Testing UI: `npx vite preview`, then drive it with Playwright using the
  `iPhone 13` device. Headless Chromium has no Arabic voice, so audio can't be
  checked there.

## Where things are

| Path | What |
| --- | --- |
| `src/data/letters.ts` | The 28 letters in 7 shape groups, vowel marks, extras |
| `src/data/lessons.ts` | First Egyptian lessons, formal reading lessons, `PATH` (lesson order) |
| `src/data/egyptian2.ts` | More Egyptian lessons |
| `src/data/dialogues.ts` | Scripted conversations for role-play |
| `src/data/tutor.ts` | Instructions and scenarios for the Claude tutor chat |
| `src/lib/srs.ts` | Spaced-repetition scheduler (SM-2 style, day-based) |
| `src/lib/cards.ts` | Card creation from finished lessons; `buildPlan` for the daily session |
| `src/lib/prompt.ts` | Builds the message pasted into the Claude tutor chat |
| `src/components/TraceCanvas.tsx` | Finger-writing pad and its shape check |
| `src/screens/` | Today, Lessons, Practice, Speak (tabs); lesson, review, drill screens |

## Conventions that matter

- **Pronunciation guide** (the style Egyptians text in): `3`=ع `7`=ح `2`=ء,
  `kh gh sh`, capitals `S D T Z` for ص ض ط ظ, doubled vowel = long. Egyptian ج
  is `g`, ق is usually `2`. Keep it consistent across lessons, dialogues and the
  tutor instructions.
- **m/f variants:** `f` on a phrase is the form said *to* a woman, unless
  `self: true`, in which case it is the form a woman *says about herself*.
- **Reading lessons** (`kind: 'reading'`) store fully vowelled words; the app
  strips marks itself (`stripMarks`) in round two and once a card has 2+ reps.
- **Cards only come from finished lessons.** `markDone` schedules them for
  tomorrow; `syncCards` backfills on startup. Card ids are `<kind>:<ref>` and
  phrase/letter ids are stable keys in saved progress: **never rename an id**.
  Adding phrases to an existing lesson is safe (cards are backfilled).
- New lessons go in `PATH`; tests check every lesson is on the path exactly once.
- Letter shapes are produced with zero-width joiners (`form()`), not hard-coded
  presentation forms.
- The writing check compares strokes with the rendered glyph (coverage, stray
  ink, every dot present). It cannot judge stroke order; the UI says so. The
  owner asked for it to be strict.
- In a letter lesson every shape must be written correctly before "Next letter"
  unlocks (owner's request). There is a skip link after 4 failed tries.

## Known gaps and ideas

- Audio uses the device's standard Arabic voice, not an Egyptian accent, so
  there are deliberately no listening drills.
- Content covers roughly the first several weeks. Natural next steps: numbers
  11–100 and prices, basic verbs with past/future, more conversations.
- No dark mode yet.
- A second careful review of all Arabic was done on 2026-11-16, but it was by
  the same author, not a native speaker. The in-app flag button collects things
  the owner finds wrong (Settings lists them).
