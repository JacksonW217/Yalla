/**
 * The Arabic alphabet, taught in shape families (letters that share a body and
 * differ only by dots are learned together).
 *
 * Pronunciation guide used across the app (the style Egyptians text in):
 *   3 = ع   7 = ح   2 = ء (the catch in "uh-oh")   kh = خ   gh = غ   sh = ش
 *   capital S D T Z = the "heavy" letters ص ض ط ظ   doubled vowel = long vowel
 */

export interface Letter {
  id: string;
  char: string;
  /** Name in Latin letters, e.g. "baa". */
  name: string;
  /** Name written in Arabic (what the voice reads). */
  nameAr: string;
  /** How it appears in the pronunciation guide. */
  guide: string;
  /** Plain-English description of the sound. */
  sound: string;
  /** True for the six letters that never join to the letter after them. */
  nonConnector?: boolean;
  /** How Egyptians usually say it, when that differs from formal Arabic. */
  egypt?: string;
  /** A tip for telling it apart or writing it. */
  tip?: string;
  word: { ar: string; guide: string; en: string; egypt?: string };
}

export interface LetterGroup {
  id: string;
  title: string;
  blurb: string;
  letters: string[]; // letter ids
}

const L = (
  id: string,
  char: string,
  name: string,
  nameAr: string,
  guide: string,
  sound: string,
  word: Letter['word'],
  extra: Partial<Letter> = {},
): Letter => ({ id, char, name, nameAr, guide, sound, word, ...extra });

export const LETTERS: Letter[] = [
  L('alif', 'ا', 'alif', 'أَلِف', 'aa', 'A long "aa" as in "father". At the start of a word it carries a short vowel (a, i or u).', { ar: 'أَسَد', guide: 'asad', en: 'lion' }, {
    nonConnector: true,
    tip: 'A single stroke, top to bottom. It never joins to the letter after it.',
  }),
  L('baa', 'ب', 'baa', 'باء', 'b', '"b" as in "bed".', { ar: 'بَيْت', guide: 'bayt', en: 'house', egypt: 'beet' }, { tip: 'One dot below the boat.' }),
  L('taa', 'ت', 'taa', 'تاء', 't', '"t" as in "top".', { ar: 'تُفَّاح', guide: 'tuffaa7', en: 'apples' }, { tip: 'Two dots above the boat.' }),
  L('thaa', 'ث', 'thaa', 'ثاء', 'th', '"th" as in "think".', { ar: 'ثَلْج', guide: 'thalj', en: 'snow, ice', egypt: 'talg' }, {
    egypt: 'In everyday Egyptian this is usually said as "t" or "s".',
    tip: 'Three dots above the boat.',
  }),

  L('jiim', 'ج', 'jiim', 'جيم', 'j / g', 'Formal Arabic: "j" as in "jam". Egyptian: a hard "g" as in "go".', { ar: 'جَمَل', guide: 'jamal', en: 'camel', egypt: 'gamal' }, {
    egypt: 'Egyptians say a hard "g". This is one of the clearest marks of the Egyptian accent, and Egyptians call this letter "giim".',
    tip: 'One dot inside the belly.',
  }),
  L('7aa', 'ح', '7aa', 'حاء', '7', 'A strong, breathy "h" from deep in the throat, like fogging up a mirror. No English equivalent.', { ar: 'حُبّ', guide: '7ubb', en: 'love' }, { tip: 'Same shape as ج with no dot.' }),
  L('khaa', 'خ', 'khaa', 'خاء', 'kh', 'A raspy sound at the back of the mouth, like the "ch" in Scottish "loch" or German "Bach".', { ar: 'خُبْز', guide: 'khubz', en: 'bread', egypt: 'Egyptians say 3eesh for bread' }, { tip: 'Same shape with one dot on top.' }),

  L('daal', 'د', 'daal', 'دال', 'd', '"d" as in "door".', { ar: 'دَرْس', guide: 'dars', en: 'lesson' }, { nonConnector: true, tip: 'Never joins to the letter after it.' }),
  L('dhaal', 'ذ', 'dhaal', 'ذال', 'dh', '"th" as in "this" (the buzzing th).', { ar: 'ذَهَب', guide: 'dhahab', en: 'gold', egypt: 'dahab' }, {
    nonConnector: true,
    egypt: 'In everyday Egyptian this is usually said as "d" or "z".',
    tip: 'Like د with one dot on top.',
  }),
  L('raa', 'ر', 'raa', 'راء', 'r', 'A tapped or lightly rolled "r", like Spanish "pero".', { ar: 'رَجُل', guide: 'rajul', en: 'man', egypt: 'raagil' }, { nonConnector: true, tip: 'Drops below the line. Never joins to the letter after it.' }),
  L('zaay', 'ز', 'zaay', 'زاي', 'z', '"z" as in "zoo".', { ar: 'زَيْت', guide: 'zayt', en: 'oil', egypt: 'zeet' }, { nonConnector: true, tip: 'Like ر with one dot on top.' }),

  L('siin', 'س', 'siin', 'سين', 's', '"s" as in "sun".', { ar: 'سَمَك', guide: 'samak', en: 'fish' }, { tip: 'Three little teeth, no dots.' }),
  L('shiin', 'ش', 'shiin', 'شين', 'sh', '"sh" as in "ship".', { ar: 'شَمْس', guide: 'shams', en: 'sun' }, { tip: 'Like س with three dots on top.' }),
  L('saad', 'ص', 'Saad', 'صاد', 'S', 'A heavy "s" said with the tongue low and the mouth hollow. It darkens the vowels around it.', { ar: 'صَباح', guide: 'Sabaa7', en: 'morning' }, { tip: 'A loop, then a small tooth.' }),
  L('daad', 'ض', 'Daad', 'ضاد', 'D', 'A heavy "d", said with the mouth hollow.', { ar: 'ضَوْء', guide: 'Daw2', en: 'light' }, { tip: 'Like ص with one dot on top.' }),

  L('taa2', 'ط', 'Taa', 'طاء', 'T', 'A heavy "t", said with the mouth hollow.', { ar: 'طالِب', guide: 'Taalib', en: 'student' }, { tip: 'A loop with a tall stroke. It looks the same in every position.' }),
  L('zaa2', 'ظ', 'Zaa', 'ظاء', 'Z', 'Formal Arabic: a heavy buzzing "th". Egyptian: a heavy "z".', { ar: 'ظَرْف', guide: 'Zarf', en: 'envelope' }, {
    egypt: 'Egyptians usually say a heavy "z".',
    tip: 'Like ط with one dot on top.',
  }),
  L('3ayn', 'ع', '3ayn', 'عَيْن', '3', 'A squeezed sound from deep in the throat, like saying "aah" while tightening your throat. No English equivalent. Expect this one to take practice.', { ar: 'عَيْن', guide: '3ayn', en: 'eye', egypt: '3een' }, {
    tip: 'Its shape changes a lot between positions, so practise all four.',
  }),
  L('ghayn', 'غ', 'ghayn', 'غَيْن', 'gh', 'A gargled sound, like a French "r".', { ar: 'غَداء', guide: 'ghadaa2', en: 'lunch', egypt: 'ghada' }, { tip: 'Like ع with one dot on top.' }),

  L('faa', 'ف', 'faa', 'فاء', 'f', '"f" as in "fun".', { ar: 'فيل', guide: 'fiil', en: 'elephant' }, { tip: 'One dot above a small loop.' }),
  L('qaaf', 'ق', 'qaaf', 'قاف', 'q / 2', 'Formal Arabic: a "k" made far back in the throat. Egyptian: usually a catch in the throat, like the break in "uh-oh".', { ar: 'قَلَم', guide: 'qalam', en: 'pen', egypt: '2alam' }, {
    egypt: 'In most Egyptian words this letter is not pronounced as "q". It becomes a catch in the throat (written 2).',
    tip: 'Two dots above a loop. Alone or at the end, its tail drops below the line.',
  }),
  L('kaaf', 'ك', 'kaaf', 'كاف', 'k', '"k" as in "kite".', { ar: 'كِتاب', guide: 'kitaab', en: 'book' }, { tip: 'Alone or at the end it has a small mark inside. At the start and middle it has a slanted top stroke.' }),
  L('laam', 'ل', 'laam', 'لام', 'l', '"l" as in "light".', { ar: 'لَيْمون', guide: 'laymuun', en: 'lemon', egypt: 'lamoon' }, { tip: 'A tall stroke with a hook. Unlike alif, it joins to the next letter.' }),

  L('miim', 'م', 'miim', 'ميم', 'm', '"m" as in "moon".', { ar: 'ماء', guide: 'maa2', en: 'water', egypt: 'mayya' }, { tip: 'A small round loop.' }),
  L('nuun', 'ن', 'nuun', 'نون', 'n', '"n" as in "nice".', { ar: 'نور', guide: 'nuur', en: 'light' }, { tip: 'One dot above. At the start and middle it looks like ب with the dot on top.' }),
  L('haa', 'ه', 'haa', 'هاء', 'h', 'A light "h" as in "hello".', { ar: 'هَرَم', guide: 'haram', en: 'pyramid' }, { tip: 'Looks very different in each position, so practise all four.' }),
  L('waaw', 'و', 'waaw', 'واو', 'w / uu', '"w" as in "water", or a long "oo" as in "moon".', { ar: 'وَلَد', guide: 'walad', en: 'boy' }, { nonConnector: true, tip: 'Never joins to the letter after it.' }),
  L('yaa', 'ي', 'yaa', 'ياء', 'y / ii', '"y" as in "yes", or a long "ee" as in "see".', { ar: 'يَد', guide: 'yad', en: 'hand', egypt: 'iid' }, { tip: 'Two dots below. At the start and middle it looks like ب with two dots.' }),
];

export const LETTER_MAP: Record<string, Letter> = Object.fromEntries(LETTERS.map((l) => [l.id, l]));

export const LETTER_GROUPS: LetterGroup[] = [
  { id: 'g1', title: 'Alif and the boat letters', blurb: 'ا ب ت ث — a straight line, and one shape with three dot patterns.', letters: ['alif', 'baa', 'taa', 'thaa'] },
  { id: 'g2', title: 'The hook letters', blurb: 'ج ح خ — one shape, told apart by a dot.', letters: ['jiim', '7aa', 'khaa'] },
  { id: 'g3', title: 'Letters that don’t join forward', blurb: 'د ذ ر ز — four of the six letters that never connect to the next one.', letters: ['daal', 'dhaal', 'raa', 'zaay'] },
  { id: 'g4', title: 'The teeth letters', blurb: 'س ش ص ض — light s and sh, then their heavy cousins.', letters: ['siin', 'shiin', 'saad', 'daad'] },
  { id: 'g5', title: 'Heavy and throat letters', blurb: 'ط ظ ع غ — the sounds English doesn’t have.', letters: ['taa2', 'zaa2', '3ayn', 'ghayn'] },
  { id: 'g6', title: 'Loops and tall letters', blurb: 'ف ق ك ل — two loops and two tall strokes.', letters: ['faa', 'qaaf', 'kaaf', 'laam'] },
  { id: 'g7', title: 'The last five', blurb: 'م ن ه و ي — and you know the whole alphabet.', letters: ['miim', 'nuun', 'haa', 'waaw', 'yaa'] },
];

export type Position = 'isolated' | 'initial' | 'medial' | 'final';
export const POSITIONS: Position[] = ['isolated', 'initial', 'medial', 'final'];
export const POSITION_LABEL: Record<Position, string> = { isolated: 'Alone', initial: 'Start', medial: 'Middle', final: 'End' };

const ZWJ = '‍';

/**
 * The letter as it looks in a given position. Uses zero-width joiners so the
 * font draws the real joined shape, rather than hard-coding presentation forms.
 * Non-connectors have no distinct start/middle shape (they look alone / final).
 */
export function form(letter: Letter, pos: Position): string {
  const c = letter.char;
  if (pos === 'isolated') return c;
  if (letter.nonConnector) return pos === 'initial' ? c : ZWJ + c;
  if (pos === 'initial') return c + ZWJ;
  if (pos === 'medial') return ZWJ + c + ZWJ;
  return ZWJ + c;
}

/** Short vowel marks and other signs, taught after the first letters. */
export interface Mark {
  id: string;
  /** Shown on the carrier letter ب. */
  sample: string;
  name: string;
  guide: string;
  explain: string;
}

export const MARKS: Mark[] = [
  { id: 'fat7a', sample: 'بَ', name: 'fat7a', guide: 'ba', explain: 'A small dash above the letter. Adds a short "a".' },
  { id: 'kasra', sample: 'بِ', name: 'kasra', guide: 'bi', explain: 'A small dash below the letter. Adds a short "i".' },
  { id: 'Damma', sample: 'بُ', name: 'Damma', guide: 'bu', explain: 'A tiny و above the letter. Adds a short "u".' },
  { id: 'sukuun', sample: 'بْ', name: 'sukuun', guide: 'b', explain: 'A small circle above the letter. It means no vowel follows.' },
  { id: 'shadda', sample: 'بّ', name: 'shadda', guide: 'bb', explain: 'A small w shape above the letter. Hold the letter twice as long.' },
  { id: 'long-a', sample: 'با', name: 'long aa', guide: 'baa', explain: 'A letter followed by ا makes a long "aa".' },
  { id: 'long-u', sample: 'بو', name: 'long uu', guide: 'buu', explain: 'A letter followed by و makes a long "oo".' },
  { id: 'long-i', sample: 'بي', name: 'long ii', guide: 'bii', explain: 'A letter followed by ي makes a long "ee".' },
];

/** Extra shapes you will meet early in real text. */
export const EXTRAS = [
  { id: 'hamza', char: 'ء', name: 'hamza', guide: '2', explain: 'The catch in the throat in "uh-oh". It often sits on a carrier: أ إ ؤ ئ.' },
  { id: 'taa-marbuuTa', char: 'ة', name: 'taa marbuuTa', guide: 'a', explain: 'Only at the end of words, usually feminine ones. Sounds like a short "a".' },
  { id: 'alif-maqSuura', char: 'ى', name: 'alif maqSuura', guide: 'aa', explain: 'A ي with no dots at the end of a word. Sounds like a long "aa". Egyptians often write a final ي this way too.' },
  { id: 'laam-alif', char: 'لا', name: 'laam-alif', guide: 'laa', explain: 'When ل is followed by ا they merge into this single shape. It is also the word for "no".' },
];
