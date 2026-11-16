/**
 * Short scripted conversations built from lesson phrases. You read one
 * through, then play your part from memory. Written for a man speaking to a
 * man; the screen reminds women which endings change.
 */
export interface Line {
  /** 'you' = the learner's part. */
  who: 'you' | 'them';
  ar: string;
  guide: string;
  en: string;
  /** A word or phrase not taught in any lesson, explained here. */
  fresh?: string;
}

export interface Dialogue {
  id: string;
  title: string;
  setting: string;
  /** Who the other person is. */
  them: string;
  /** Lesson ids to finish first. */
  requires: string[];
  lines: Line[];
  check?: boolean;
}

const them = (ar: string, guide: string, en: string, fresh?: string): Line => ({ who: 'them', ar, guide, en, fresh });
const you = (ar: string, guide: string, en: string, fresh?: string): Line => ({ who: 'you', ar, guide, en, fresh });

export const DIALOGUES: Dialogue[] = [
  {
    id: 'meeting',
    title: 'Meeting someone',
    setting: 'A man called Ahmed starts talking to you in Cairo.',
    them: 'Ahmed',
    requires: ['greetings', 'introductions', 'polite'],
    lines: [
      them('السلام عليكم', 'es-salaamu 3aleekum', 'Hello'),
      you('وعليكم السلام', 'wa 3aleekum es-salaam', 'Hello (the reply)'),
      them('إزيك؟', 'ezzayyak?', 'How are you?'),
      you('الحمد لله، وإنت؟', 'el-7amdu lillaah, w-enta?', 'I’m well, and you?'),
      them('تمام. اسمك إيه؟', 'tamaam. ismak eeh?', 'Fine. What’s your name?'),
      you('اسمي ... وإنت؟', 'ismi ..., w-enta?', 'My name is ... And you?'),
      them('اسمي أحمد. إنت منين؟', 'ismi a7mad. enta mneen?', 'My name is Ahmed. Where are you from?'),
      you('أنا من أمريكا', 'ana min amriika', 'I’m from America'),
      them('أهلاً بيك في مصر!', 'ahlan biik fi maSr!', 'Welcome to Egypt!', 'fi maSr = in Egypt'),
      you('شكراً. تشرفنا', 'shukran. tasharrafna', 'Thank you. Nice to meet you'),
    ],
  },
  {
    id: 'cafe',
    title: 'At a café',
    setting: 'You sit down at a café in the evening and the waiter comes over.',
    them: 'The waiter',
    requires: ['polite', 'wants', 'food'],
    lines: [
      them('مساء الخير. عايز إيه؟', 'masaa2 el-kheer. 3aayez eeh?', 'Good evening. What would you like?'),
      you('مساء النور. عايز قهوة لو سمحت', 'masaa2 en-nuur. 3aayez 2ahwa, law sama7t', 'Good evening. I’d like a coffee, please'),
      them('سكر؟', 'sukkar?', 'Sugar?'),
      you('من غير سكر', 'min gheer sukkar', 'Without sugar'),
      them('حاجة تانية؟', '7aaga tanya?', 'Anything else?', '7aaga = thing, tanya = other / another'),
      you('مية كمان', 'mayya kamaan', 'Water too'),
      them('حاضر', '7aaDir', 'Right away', '7aaDir = certainly / at your service'),
      you('الحساب لو سمحت', 'el-7isaab, law sama7t', 'The bill, please'),
      them('خمسين جنيه', 'khamsiin gineeh', 'Fifty pounds', 'khamsiin = 50, gineeh = Egyptian pound'),
      you('اتفضل. شكراً', 'etfaDDal. shukran', 'Here you go. Thank you', 'etfaDDal = here you are / go ahead (to a man)'),
    ],
  },
  {
    id: 'taxi',
    title: 'Taking a taxi',
    setting: 'You flag down a taxi to the airport and agree a price.',
    them: 'The driver',
    requires: ['questions', 'numbers', 'around'],
    check: true,
    lines: [
      you('تاكسي! عايز أروح المطار', 'taksi! 3aayez aruu7 el-maTaar', 'Taxi! I want to go to the airport'),
      them('ماشي. اتفضل', 'maashi. etfaDDal', 'OK. Get in', 'etfaDDal = go ahead / please (to a man)'),
      you('بكام؟', 'bikaam?', 'How much?'),
      them('مية جنيه', 'miit gineeh', 'A hundred pounds', 'miyya = 100 (miit before a noun), gineeh = Egyptian pound'),
      you('غالي أوي! خمسين؟', 'ghaali awi! khamsiin?', 'Too expensive! Fifty?', 'khamsiin = 50'),
      them('لأ، تمانين', 'la2, tamaniin', 'No, eighty', 'tamaniin = 80'),
      you('ماشي', 'maashi', 'OK'),
      them('إنت منين؟', 'enta mneen?', 'Where are you from?'),
      you('أنا من أمريكا. بتعلم عربي', 'ana min amriika. bat3allem 3arabi', 'I’m from America. I’m learning Arabic'),
      them('عربيك كويس أوي!', '3arabiik kwayyis awi!', 'Your Arabic is very good!', '3arabiik = your Arabic'),
      you('شكراً. هنا كويس', 'shukran. hena kwayyis', 'Thank you. Here is fine'),
    ],
  },
  {
    id: 'knowing',
    title: 'Getting to know someone',
    setting: 'You have been chatting with someone for a few minutes and they get curious.',
    them: 'Your new friend',
    requires: ['family', 'smalltalk'],
    lines: [
      them('بتشتغل إيه؟', 'bitishtaghal eeh?', 'What do you do for work?'),
      you('أنا طالب. وإنت؟', 'ana Taalib. w-enta?', 'I’m a student. And you?'),
      them('أنا مهندس. ساكن فين؟', 'ana mohandis. saakin feen?', 'I’m an engineer. Where do you live?', 'mohandis = engineer'),
      you('أنا ساكن في أمريكا', 'ana saakin fi amriika', 'I live in America'),
      them('عندك إخوات؟', '3andak ekhwaat?', 'Do you have brothers and sisters?'),
      you('أيوه، عندي أخ واحد', 'aywa, 3andi akh waa7ed', 'Yes, I have one brother'),
      them('بتحب مصر؟', 'bit7ebb maSr?', 'Do you like Egypt?'),
      you('أيوه، بحبها. مصر حلوة أوي', 'aywa, ba7ebbaha. maSr 7elwa awi', 'Yes, I love it. Egypt is very nice'),
      them('إن شاء الله تيجي تاني', 'in shaa2 allaah tiigi taani', 'God willing, you’ll come again', 'tiigi = you come, taani = again'),
      you('إن شاء الله', 'in shaa2 allaah', 'God willing'),
    ],
  },
  {
    id: 'plans',
    title: 'Making plans',
    setting: 'A friend asks what you’re doing tomorrow and suggests dinner.',
    them: 'Your friend',
    requires: ['time', 'gym', 'verbs-future'],
    lines: [
      them('هتعمل إيه بكرة؟', 'hati3mil eeh bukra?', 'What are you doing tomorrow?'),
      you('هروح الجيم الصبح', 'haruu7 el-jim eS-Sub7', 'I’ll go to the gym in the morning'),
      them('وبعدين؟', 'wi ba3deen?', 'And then?'),
      you('بعدين عندي شغل', 'ba3deen 3andi shughl', 'Then I have work'),
      them('عايز تاكل معايا بالليل؟', '3aayez taakul ma3aaya bil-leel?', 'Do you want to eat with me in the evening?', 'ma3aaya = with me'),
      you('أيوه، يا ريت. فين؟', 'aywa, ya reet. feen?', 'Yes, I’d love to. Where?', 'ya reet = I wish / I’d love to'),
      them('فيه مطعم كويس جنب البيت', 'fiih maT3am kwayyis gamb el-beet', 'There’s a good restaurant next to the house', 'maT3am = restaurant, gamb = next to'),
      you('تمام. الساعة كام؟', 'tamaam. es-saa3a kaam?', 'Great. What time?'),
      them('الساعة تمانية', 'es-saa3a tamanya', 'At eight o’clock'),
      you('ماشي، هشوفك بكرة', 'maashi, hashuufak bukra', 'OK, I’ll see you tomorrow'),
    ],
  },
];

export const DIALOGUE_MAP: Record<string, Dialogue> = Object.fromEntries(DIALOGUES.map((d) => [d.id, d]));
