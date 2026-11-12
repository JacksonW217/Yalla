/**
 * Egyptian Arabic speaking lessons.
 *
 * Honesty rules for this file:
 * - Egyptian is a spoken dialect with no single official spelling, so the
 *   Arabic-script spellings here are common ones, not the only ones.
 * - Anything the author is less than confident about carries `check: true`
 *   and is shown to the learner with a "Check this" badge.
 * - `m` / `f` variants are who you are talking TO, unless `self` is set, in
 *   which case they depend on who is SPEAKING.
 */

export interface Phrase {
  id: string;
  ar: string;
  guide: string;
  en: string;
  /** Feminine variant. */
  f?: { ar: string; guide: string };
  /** m/f depends on the speaker rather than the listener. */
  self?: boolean;
  /** The usual reply. */
  reply?: { ar: string; guide: string; en: string };
  note?: string;
  /** Formal (Modern Standard) equivalent, when it differs. */
  formal?: { ar: string; guide: string };
  /** Author is not fully confident: verify with a second source. */
  check?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  blurb: string;
  minutes: number;
  intro: string[];
  phrases: Phrase[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'greetings',
    title: 'Saying hello',
    blurb: 'Greet someone, ask how they are, and say goodbye.',
    minutes: 10,
    intro: [
      'Greetings in Egypt come in pairs: there is a set phrase and a set reply. Learn them together.',
      'Arabic changes some words depending on whether you are talking to a man or a woman. You will see both versions.',
    ],
    phrases: [
      { id: 'ahlan', ar: 'أهلاً', guide: 'ahlan', en: 'Hi / welcome', reply: { ar: 'أهلاً بيك', guide: 'ahlan biik', en: 'Hi to you (to a man; to a woman: ahlan biiki)' } },
      {
        id: 'salaam',
        ar: 'السلام عليكم',
        guide: 'es-salaamu 3aleekum',
        en: 'Hello (literally: peace be upon you)',
        reply: { ar: 'وعليكم السلام', guide: 'wa 3aleekum es-salaam', en: 'And upon you be peace' },
        note: 'The most widely used greeting. Works at any time of day.',
      },
      { id: 'sabaa7', ar: 'صباح الخير', guide: 'Sabaa7 el-kheer', en: 'Good morning', reply: { ar: 'صباح النور', guide: 'Sabaa7 en-nuur', en: 'Good morning (literally: morning of light)' } },
      { id: 'masaa2', ar: 'مساء الخير', guide: 'masaa2 el-kheer', en: 'Good afternoon / evening', reply: { ar: 'مساء النور', guide: 'masaa2 en-nuur', en: 'Good evening (reply)' } },
      {
        id: 'ezzayyak',
        ar: 'إزيك؟',
        guide: 'ezzayyak?',
        en: 'How are you?',
        f: { ar: 'إزيك؟', guide: 'ezzayyik?' },
        note: 'Spelled the same to a man or a woman. Only the ending sound changes: -ak to a man, -ik to a woman.',
        formal: { ar: 'كيف حالك؟', guide: 'kayfa 7aaluk?' },
      },
      { id: '3aamel-eeh', ar: 'عامل إيه؟', guide: '3aamel eeh?', en: 'How are you doing?', f: { ar: 'عاملة إيه؟', guide: '3amla eeh?' }, note: 'Very common and friendly. Literally: what are you doing?' },
      { id: 'kwayyis', ar: 'كويس', guide: 'kwayyis', en: 'Good / fine', f: { ar: 'كويسة', guide: 'kwayyisa' }, self: true, note: 'Say kwayyis if you are a man, kwayyisa if you are a woman.' },
      { id: 'el7amdulillaah', ar: 'الحمد لله', guide: 'el-7amdu lillaah', en: 'I’m well (literally: praise be to God)', note: 'The most common answer to "how are you?", used by everyone regardless of religion.' },
      { id: 'tamaam', ar: 'تمام', guide: 'tamaam', en: 'Fine / OK / perfect' },
      { id: 'wenta', ar: 'وإنت؟', guide: 'w-enta?', en: 'And you?', f: { ar: 'وإنتي؟', guide: 'w-enti?' } },
      { id: 'ma3a-ssalaama', ar: 'مع السلامة', guide: 'ma3a s-salaama', en: 'Goodbye (literally: with safety)', reply: { ar: 'الله يسلمك', guide: 'allaah yisallimak', en: 'God keep you safe (to a man; to a woman: yisallimik)' } },
      { id: 'ashuufak', ar: 'أشوفك بعدين', guide: 'ashuufak ba3deen', en: 'See you later', f: { ar: 'أشوفك بعدين', guide: 'ashuufik ba3deen' }, check: true },
    ],
  },
  {
    id: 'introductions',
    title: 'Introducing yourself',
    blurb: 'Say your name, where you’re from, and that you’re learning.',
    minutes: 10,
    intro: [
      'Egyptian has no word for "am", "is" or "are" in simple sentences. "I from America" is a complete sentence.',
      'To say "my", add -i to the end of a word: ism (name) becomes ismi (my name). For "your", add -ak to a man and -ik to a woman.',
    ],
    phrases: [
      { id: 'ana', ar: 'أنا', guide: 'ana', en: 'I / me' },
      { id: 'ismi', ar: 'اسمي ...', guide: 'ismi ...', en: 'My name is ...' },
      { id: 'ismak-eeh', ar: 'اسمك إيه؟', guide: 'ismak eeh?', en: 'What’s your name?', f: { ar: 'اسمك إيه؟', guide: 'ismik eeh?' }, note: 'The question word comes at the end: literally "your name what?"', formal: { ar: 'ما اسمك؟', guide: 'maa ismuk?' } },
      { id: 'ana-min', ar: 'أنا من أمريكا', guide: 'ana min amriika', en: 'I’m from America' },
      { id: 'enta-mneen', ar: 'إنت منين؟', guide: 'enta mneen?', en: 'Where are you from?', f: { ar: 'إنتي منين؟', guide: 'enti mneen?' }, formal: { ar: 'من أين أنت؟', guide: 'min ayna anta?' } },
      { id: 'tasharrafna', ar: 'تشرفنا', guide: 'tasharrafna', en: 'Nice to meet you (literally: we are honoured)' },
      { id: 'forsa', ar: 'فرصة سعيدة', guide: 'forSa sa3iida', en: 'Pleased to meet you (literally: happy occasion)', check: true, note: 'Slightly more formal than tasharrafna.' },
      { id: 'bat3allem', ar: 'أنا بتعلم عربي', guide: 'ana bat3allem 3arabi', en: 'I’m learning Arabic' },
      { id: 'shwayya', ar: 'شوية', guide: 'shwayya', en: 'A little', note: 'Useful answer when someone asks if you speak Arabic.' },
      { id: 'bititkallem', ar: 'بتتكلم إنجليزي؟', guide: 'bititkallem engliizi?', en: 'Do you speak English?', f: { ar: 'بتتكلمي إنجليزي؟', guide: 'bititkallemi engliizi?' } },
      { id: 'mish-faahem', ar: 'أنا مش فاهم', guide: 'ana mish faahem', en: 'I don’t understand', f: { ar: 'أنا مش فاهمة', guide: 'ana mish fahma' }, self: true, note: 'mish means "not". Put it before a word to make it negative.' },
      { id: 'taani', ar: 'ممكن تاني؟', guide: 'momken taani?', en: 'Can you say that again?', note: 'momken = possible / may I. taani = again.' },
      { id: 'birraa7a', ar: 'بالراحة', guide: 'bir-raa7a', en: 'Slowly / take it easy' },
    ],
  },
  {
    id: 'polite',
    title: 'Polite words',
    blurb: 'Please, thank you, sorry, yes and no.',
    minutes: 5,
    intro: ['These few words carry a lot. Egyptians are generous with politeness, so use them often.'],
    phrases: [
      { id: 'shukran', ar: 'شكراً', guide: 'shukran', en: 'Thank you', reply: { ar: 'العفو', guide: 'el-3afw', en: 'You’re welcome' } },
      { id: 'min-fadlak', ar: 'من فضلك', guide: 'min faDlak', en: 'Please', f: { ar: 'من فضلك', guide: 'min faDlik' } },
      { id: 'law-sama7t', ar: 'لو سمحت', guide: 'law sama7t', en: 'Excuse me / please', f: { ar: 'لو سمحتي', guide: 'law sama7ti' }, note: 'Use this to get someone’s attention or to ask for something.' },
      { id: 'aasif', ar: 'آسف', guide: 'aasif', en: 'Sorry', f: { ar: 'آسفة', guide: 'asfa' }, self: true },
      { id: 'ma3lesh', ar: 'معلش', guide: 'ma3lesh', en: 'Never mind / sorry about that / it’s OK', note: 'A very Egyptian word. Used to apologise, to comfort and to brush things off.' },
      { id: 'aywa', ar: 'أيوه', guide: 'aywa', en: 'Yes', formal: { ar: 'نعم', guide: 'na3am' } },
      { id: 'la2', ar: 'لأ', guide: 'la2', en: 'No', formal: { ar: 'لا', guide: 'laa' } },
      { id: 'maashi', ar: 'ماشي', guide: 'maashi', en: 'OK / alright' },
      { id: 'inshaallaah', ar: 'إن شاء الله', guide: 'in shaa2 allaah', en: 'God willing / hopefully', note: 'Said about anything in the future.' },
      { id: 'yalla', ar: 'يلا', guide: 'yalla', en: 'Let’s go / come on' },
    ],
  },
  {
    id: 'questions',
    title: 'Question words',
    blurb: 'What, where, who, how and how much.',
    minutes: 5,
    intro: ['In Egyptian the question word usually goes at the end of the sentence, where the answer would go.'],
    phrases: [
      { id: 'eeh', ar: 'إيه؟', guide: 'eeh?', en: 'What?', formal: { ar: 'ماذا؟', guide: 'maadhaa?' } },
      { id: 'feen', ar: 'فين؟', guide: 'feen?', en: 'Where?', formal: { ar: 'أين؟', guide: 'ayna?' } },
      { id: 'miin', ar: 'مين؟', guide: 'miin?', en: 'Who?', formal: { ar: 'مَن؟', guide: 'man?' } },
      { id: 'emta', ar: 'إمتى؟', guide: 'emta?', en: 'When?', formal: { ar: 'متى؟', guide: 'mataa?' } },
      { id: 'leeh', ar: 'ليه؟', guide: 'leeh?', en: 'Why?', formal: { ar: 'لماذا؟', guide: 'limaadhaa?' } },
      { id: 'ezzaay', ar: 'إزاي؟', guide: 'ezzaay?', en: 'How?', formal: { ar: 'كيف؟', guide: 'kayfa?' } },
      { id: 'bikaam', ar: 'بكام؟', guide: 'bikaam?', en: 'How much (does it cost)?' },
      { id: 'da-eeh', ar: 'ده إيه؟', guide: 'da eeh?', en: 'What is this?', note: 'da = this (for masculine things), di = this (for feminine things).' },
      { id: 'el7ammaam-feen', ar: 'الحمام فين؟', guide: 'el-7ammaam feen?', en: 'Where is the bathroom?' },
    ],
  },
  {
    id: 'numbers',
    title: 'Numbers 1 to 10',
    blurb: 'Count to ten and read Arabic numerals.',
    minutes: 5,
    intro: [
      'Arabic has its own numerals, used widely in Egypt on prices, signs and number plates.',
      'Words are written right to left, but numbers are written left to right, the same as in English.',
    ],
    phrases: [
      { id: 'n1', ar: 'واحد', guide: 'waa7ed', en: '1 — written ١' },
      { id: 'n2', ar: 'اتنين', guide: 'etneen', en: '2 — written ٢', formal: { ar: 'اثنان', guide: 'ithnaan' } },
      { id: 'n3', ar: 'تلاتة', guide: 'talaata', en: '3 — written ٣', formal: { ar: 'ثلاثة', guide: 'thalaatha' } },
      { id: 'n4', ar: 'أربعة', guide: 'arba3a', en: '4 — written ٤' },
      { id: 'n5', ar: 'خمسة', guide: 'khamsa', en: '5 — written ٥' },
      { id: 'n6', ar: 'ستة', guide: 'setta', en: '6 — written ٦' },
      { id: 'n7', ar: 'سبعة', guide: 'sab3a', en: '7 — written ٧' },
      { id: 'n8', ar: 'تمانية', guide: 'tamanya', en: '8 — written ٨', formal: { ar: 'ثمانية', guide: 'thamaaniya' } },
      { id: 'n9', ar: 'تسعة', guide: 'tes3a', en: '9 — written ٩' },
      { id: 'n10', ar: 'عشرة', guide: '3ashara', en: '10 — written ١٠' },
    ],
  },
];

export const LESSON_MAP: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

/**
 * The learning path: reading and speaking alternate so each day mixes both.
 * `marks` is the vowel-marks unit.
 */
export type Unit = { kind: 'letters'; id: string } | { kind: 'lesson'; id: string } | { kind: 'marks'; id: 'marks' };

export const PATH: Unit[] = [
  { kind: 'letters', id: 'g1' },
  { kind: 'lesson', id: 'greetings' },
  { kind: 'letters', id: 'g2' },
  { kind: 'marks', id: 'marks' },
  { kind: 'lesson', id: 'introductions' },
  { kind: 'letters', id: 'g3' },
  { kind: 'lesson', id: 'polite' },
  { kind: 'letters', id: 'g4' },
  { kind: 'letters', id: 'g5' },
  { kind: 'lesson', id: 'questions' },
  { kind: 'letters', id: 'g6' },
  { kind: 'letters', id: 'g7' },
  { kind: 'lesson', id: 'numbers' },
];

export const unitKey = (u: Unit) => `${u.kind}:${u.id}`;
