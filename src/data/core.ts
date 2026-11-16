/**
 * Core vocabulary: very common everyday Egyptian words that the lessons don't
 * already teach, introduced a few per day and each shown in a short sentence.
 *
 * Honesty note: this is a hand-built list of words the author knows to be
 * extremely common in everyday Egyptian speech, ordered roughly from most to
 * least essential. It is NOT taken from a ranked frequency corpus. Items the
 * author is less sure of carry `check: true`.
 *
 * Ids are stable keys in saved progress: never rename or reorder-by-id. New
 * words are appended; the daily pointer walks the array in order.
 */
import type { Phrase } from './lessons';

const C = (
  id: string,
  ar: string,
  guide: string,
  en: string,
  ex: [ar: string, guide: string, en: string],
  extra: Partial<Phrase> = {},
): Phrase => ({ id: `c-${id}`, ar, guide, en, ex: { ar: ex[0], guide: ex[1], en: ex[2] }, ...extra });

export const CORE: Phrase[] = [
  // ── The glue: words that hold every sentence together
  C('wi', 'و', 'wi', 'And', ['أنا وإنت', 'ana w-enta', 'Me and you'], { note: 'Shortens to “w-” before a vowel.' }),
  C('fi', 'في', 'fi', 'In / at', ['أنا في البيت', 'ana fil-beet', 'I’m at home'], { note: 'fi + el- (the) merge into “fil-”.' }),
  C('fiih', 'فيه', 'fiih', 'There is / there are', ['فيه قهوة؟', 'fiih 2ahwa?', 'Is there coffee?']),
  C('mafiish', 'مفيش', 'mafiish', 'There isn’t / there’s no', ['مفيش مشكلة', 'mafiish mushkila', 'No problem'], { note: 'mafiish mushkila is one of the most useful phrases in Egypt.' }),
  C('mish', 'مش', 'mish', 'Not', ['أنا مش تعبان', 'ana mish ta3baan', 'I’m not tired']),
  C('ma3a', 'مع', 'ma3a', 'With', ['أنا مع صاحبي', 'ana ma3a Sa7bi', 'I’m with my friend']),
  C('3ala', 'على', '3ala', 'On', ['الكتاب على المكتب', 'el-kitaab 3alal-maktab', 'The book is on the desk']),
  C('3ashaan', 'عشان', '3ashaan', 'Because / for / so that', ['عشان أنا تعبان', '3ashaan ana ta3baan', 'Because I’m tired']),
  C('walla', 'ولا', 'walla', 'Or (in a question)', ['شاي ولا قهوة؟', 'shaay walla 2ahwa?', 'Tea or coffee?']),
  C('kull', 'كل', 'kull', 'Every / all', ['كل يوم', 'kull yoom', 'Every day']),

  C('7aaga', 'حاجة', '7aaga', 'Thing / something', ['عايز حاجة؟', '3aayez 7aaga?', 'Do you want anything?']),
  C('kitiir', 'كتير', 'kitiir', 'A lot / many / much', ['شكراً كتير', 'shukran kitiir', 'Thanks a lot']),
  C('lissa', 'لسه', 'lissa', 'Still / not yet', ['لسه شوية', 'lissa shwayya', 'A little longer (not yet)']),
  C('khalaas', 'خلاص', 'khalaaS', 'Done / enough / that’s it', ['خلاص، شكراً', 'khalaaS, shukran', 'That’s all, thanks']),
  C('tayyib', 'طيب', 'Tayyib', 'OK / well then', ['طيب، يلا', 'Tayyib, yalla', 'OK then, let’s go']),
  C('ya3ni', 'يعني', 'ya3ni', 'I mean / like / sort of', ['يعني إيه؟', 'ya3ni eeh?', 'What does that mean?'], { note: 'The Egyptian filler word. “ya3ni eeh …?” asks what a word means.' }),
  C('tab3an', 'طبعاً', 'Tab3an', 'Of course', ['طبعاً ممكن', 'Tab3an momken', 'Of course you can']),
  C('laazim', 'لازم', 'laazim', 'Must / have to', ['لازم أروح', 'laazim aruu7', 'I have to go']),
  C('kida', 'كده', 'kida', 'Like this / so', ['مش كده', 'mish kida', 'Not like that']),
  C('bardo', 'برضه', 'barDo', 'Also / too / still', ['وأنا برضه', 'w-ana barDo', 'Me too']),

  // ── I know / I don't know
  C('3aarif', 'أنا عارف', 'ana 3aarif', 'I know', ['أنا عارف الشارع ده', 'ana 3aarif esh-shaari3 da', 'I know this street'], { f: { ar: 'أنا عارفة', guide: 'ana 3arfa' }, self: true }),
  C('mish-3aarif', 'مش عارف', 'mish 3aarif', 'I don’t know', ['آسف، مش عارف', 'aasif, mish 3aarif', 'Sorry, I don’t know'], { f: { ar: 'مش عارفة', guide: 'mish 3arfa' }, self: true }),
  C('akiid', 'أكيد', 'akiid', 'Sure / definitely', ['أكيد، مفيش مشكلة', 'akiid, mafiish mushkila', 'Sure, no problem']),
  C('yimkin', 'يمكن', 'yimkin', 'Maybe', ['يمكن بكرة', 'yimkin bukra', 'Maybe tomorrow']),
  C('bigadd', 'بجد؟', 'bigadd?', 'Really? / seriously?', ['بجد؟ مش عارف', 'bigadd? mish 3aarif', 'Really? I don’t know']),

  // ── People and things
  C('raagil', 'راجل', 'raagil', 'Man', ['الراجل ده مين؟', 'er-raagil da miin?', 'Who is this man?']),
  C('sitt', 'ست', 'sitt', 'Woman', ['الست دي', 'es-sitt di', 'This woman']),
  C('naas', 'ناس', 'naas', 'People', ['ناس كتير', 'naas kitiir', 'A lot of people']),
  C('beet', 'بيت', 'beet', 'House / home', ['أنا في البيت', 'ana fil-beet', 'I’m at home'], { formal: { ar: 'بَيْت', guide: 'bayt' } }),
  C('shughl', 'شغل', 'shughl', 'Work', ['عندي شغل', '3andi shughl', 'I have work']),

  C('filuus', 'فلوس', 'filuus', 'Money', ['معنديش فلوس', 'ma3andiish filuus', 'I don’t have money']),
  C('3arabiyya', 'عربية', '3arabiyya', 'Car', ['العربية فين؟', 'el-3arabiyya feen?', 'Where is the car?'], { formal: { ar: 'سَيَّارَة', guide: 'sayyaara' } }),
  C('tilifoon', 'تليفون', 'tilifoon', 'Phone', ['تليفوني فين؟', 'tilifooni feen?', 'Where’s my phone?']),
  C('shaari3', 'شارع', 'shaari3', 'Street', ['الشارع ده', 'esh-shaari3 da', 'This street']),
  C('ma7all', 'محل', 'ma7all', 'Shop', ['المحل قريب', 'el-ma7all 2urayyib', 'The shop is near']),

  C('wa2t', 'وقت', 'wa2t', 'Time', ['معنديش وقت', 'ma3andiish wa2t', 'I don’t have time']),
  C('marra', 'مرة', 'marra', 'Once / one time', ['مرة تانية', 'marra tanya', 'One more time']),
  C('balad', 'بلد', 'balad', 'Country / town', ['مصر بلد حلوة', 'maSr balad 7elwa', 'Egypt is a nice country']),
  C('mushkila', 'مشكلة', 'mushkila', 'Problem', ['فيه مشكلة؟', 'fiih mushkila?', 'Is there a problem?']),
  C('kilma', 'كلمة', 'kilma', 'Word', ['الكلمة دي يعني إيه؟', 'el-kilma di ya3ni eeh?', 'What does this word mean?']),

  // ── Describing things
  C('kibiir', 'كبير', 'kibiir', 'Big / old (of a person)', ['البيت كبير', 'el-beet kibiir', 'The house is big'], { formal: { ar: 'كَبِير', guide: 'kabiir' } }),
  C('sughayyar', 'صغير', 'Sughayyar', 'Small / young', ['المحل صغير', 'el-ma7all Sughayyar', 'The shop is small']),
  C('gidiid', 'جديد', 'gidiid', 'New', ['تليفون جديد', 'tilifoon gidiid', 'A new phone']),
  C('2adiim', 'قديم', '2adiim', 'Old (of a thing)', ['بيت قديم', 'beet 2adiim', 'An old house']),
  C('sahl', 'سهل', 'sahl', 'Easy', ['العربي مش سهل', 'el-3arabi mish sahl', 'Arabic isn’t easy']),

  C('sa3b', 'صعب', 'Sa3b', 'Hard / difficult', ['صعب شوية', 'Sa3b shwayya', 'A bit hard']),
  C('rikhiis', 'رخيص', 'rikhiiS', 'Cheap', ['ده رخيص أوي', 'da rikhiiS awi', 'This is very cheap']),
  C('sukhn', 'سخن', 'sukhn', 'Hot', ['الشاي سخن', 'esh-shaay sukhn', 'The tea is hot']),
  C('saa2i3', 'ساقع', 'saa2i3', 'Cold (drinks, weather)', ['مية ساقعة', 'mayya sa23a', 'Cold water'], { f: { ar: 'ساقعة', guide: 'sa23a' }, note: 'sa23a is the feminine form, used with feminine words like mayya.' }),
  C('ta3baan', 'تعبان', 'ta3baan', 'Tired / unwell', ['أنا تعبان النهارده', 'ana ta3baan en-naharda', 'I’m tired today'], { f: { ar: 'تعبانة', guide: 'ta3baana' }, self: true }),

  C('mabsuut', 'مبسوط', 'mabsuuT', 'Happy / pleased', ['أنا مبسوط أوي', 'ana mabsuuT awi', 'I’m very happy'], { f: { ar: 'مبسوطة', guide: 'mabsuuTa' }, self: true }),
  C('za3laan', 'زعلان', 'za3laan', 'Upset / sad', ['إنت زعلان؟', 'enta za3laan?', 'Are you upset?'], { f: { ar: 'زعلانة', guide: 'za3laana' }, self: true }),
  C('mashghuul', 'مشغول', 'mashghuul', 'Busy', ['أنا مشغول دلوقتي', 'ana mashghuul delwa2ti', 'I’m busy right now'], { f: { ar: 'مشغولة', guide: 'mashghuula' }, self: true }),
  C('gaahiz', 'جاهز', 'gaahiz', 'Ready', ['أنا جاهز', 'ana gaahiz', 'I’m ready'], { f: { ar: 'جاهزة', guide: 'gahza' }, self: true }),
  C('sa77', 'صح', 'Sa77', 'Right / correct', ['صح كده؟', 'Sa77 kida?', 'Is that right?']),

  C('ghalat', 'غلط', 'ghalaT', 'Wrong / a mistake', ['لأ، ده غلط', 'la2, da ghalaT', 'No, that’s wrong']),
  C('muhimm', 'مهم', 'muhimm', 'Important', ['ده مهم أوي', 'da muhimm awi', 'This is very important']),
  C('taani', 'تاني', 'taani', 'Again / another / second', ['مرة تانية لو سمحت', 'marra tanya, law sama7t', 'Once more, please'], { f: { ar: 'تانية', guide: 'tanya' } }),
  C('awwil', 'أول', 'awwil', 'First', ['أول مرة', 'awwil marra', 'The first time']),
  C('aakhir', 'آخر', 'aakhir', 'Last', ['آخر مرة', 'aakhir marra', 'The last time']),

  // ── Where things are
  C('2abl', 'قبل', '2abl', 'Before', ['قبل الشغل', '2abl esh-shughl', 'Before work']),
  C('ba3d', 'بعد', 'ba3d', 'After', ['بعد الأكل', 'ba3d el-akl', 'After eating']),
  C('gamb', 'جنب', 'gamb', 'Next to', ['جنب الفندق', 'gamb el-fundu2', 'Next to the hotel']),
  C('2uddaam', 'قدام', '2uddaam', 'In front of', ['قدام البيت', '2uddaam el-beet', 'In front of the house']),
  C('wara', 'ورا', 'wara', 'Behind', ['ورا المحل', 'wara l-ma7all', 'Behind the shop']),

  C('foo2', 'فوق', 'foo2', 'Up / above / upstairs', ['هو فوق', 'howwa foo2', 'He’s upstairs']),
  C('ta7t', 'تحت', 'ta7t', 'Down / under / downstairs', ['أنا تحت', 'ana ta7t', 'I’m downstairs']),
  C('guwwa', 'جوه', 'guwwa', 'Inside', ['هي جوه', 'heyya guwwa', 'She’s inside']),
  C('barra', 'بره', 'barra', 'Outside / abroad', ['أنا بره', 'ana barra', 'I’m outside']),
  C('min', 'من', 'min', 'From / than', ['من هنا', 'min hena', 'From here']),

  // ── How often
  C('dayman', 'دايماً', 'dayman', 'Always', ['أنا دايماً هنا', 'ana dayman hena', 'I’m always here']),
  C('sa3aat', 'ساعات', 'sa3aat', 'Sometimes', ['ساعات بروح الجيم', 'sa3aat baruu7 el-jim', 'Sometimes I go to the gym']),
  C('abadan', 'أبداً', 'abadan', 'Never / not at all', ['لأ، أبداً', 'la2, abadan', 'No, never']),
  C('saa3a', 'ساعة', 'saa3a', 'Hour / clock / watch', ['بعد ساعة', 'ba3d saa3a', 'In an hour']),
  C('di2ii2a', 'دقيقة', 'di2ii2a', 'Minute', ['دقيقة واحدة', 'di2ii2a wa7da', 'One minute'], { note: 'wa7da is the feminine of waa7ed (one).' }),

  C('shahr', 'شهر', 'shahr', 'Month', ['كل شهر', 'kull shahr', 'Every month']),
  C('sana', 'سنة', 'sana', 'Year', ['سنة جديدة', 'sana gidiida', 'A new year']),

  // ── Things you say all the time
  C('akhbaar', 'إيه الأخبار؟', 'eeh el-akhbaar?', 'What’s up? / what’s new?', ['أهلاً، إيه الأخبار؟', 'ahlan, eeh el-akhbaar?', 'Hi, what’s new?'], { reply: { ar: 'كله تمام', guide: 'kullu tamaam', en: 'Everything’s fine' } }),
  C('kullu-tamaam', 'كله تمام', 'kullu tamaam', 'Everything’s fine', ['الحمد لله، كله تمام', 'el-7amdu lillaah, kullu tamaam', 'Thank God, all good']),
  C('wallaahi', 'والله', 'wallaahi', 'I swear / honestly', ['والله مش عارف', 'wallaahi mish 3aarif', 'Honestly, I don’t know'], { note: 'Used constantly for emphasis, by everyone.' }),

  C('itfaddal', 'اتفضل', 'itfaDDal', 'Here you go / come in / go ahead', ['اتفضل، الشاي', 'itfaDDal, esh-shaay', 'Here you go, the tea'], { f: { ar: 'اتفضلي', guide: 'itfaDDali' } }),
  C('7aadir', 'حاضر', '7aaDir', 'Yes, will do / right away', ['حاضر، دقيقة واحدة', '7aaDir, di2ii2a wa7da', 'Sure, one minute']),
  C('3an-iznak', 'عن إذنك', '3an iznak', 'Excuse me (to pass or leave)', ['عن إذنك، لازم أروح', '3an iznak, laazim aruu7', 'Excuse me, I have to go'], { f: { ar: 'عن إذنك', guide: '3an iznik' } }),
  C('mabruuk', 'مبروك', 'mabruuk', 'Congratulations', ['مبروك!', 'mabruuk!', 'Congratulations!'], { reply: { ar: 'الله يبارك فيك', guide: 'allaah yibaarik fiik', en: 'God bless you (the set reply, to a man)' } }),
  C('ya-reet', 'يا ريت', 'ya reet', 'I wish / if only', ['يا ريت!', 'ya reet!', 'I wish!']),

  C('khalli-baalak', 'خلي بالك', 'khalli baalak', 'Be careful / watch out', ['خلي بالك من العربية', 'khalli baalak min el-3arabiyya', 'Watch out for the car'], { f: { ar: 'خلي بالك', guide: 'khalli baalik' } }),
  C('istanna', 'استنى', 'istanna', 'Wait!', ['استنى دقيقة', 'istanna di2ii2a', 'Wait a minute'], { f: { ar: 'استني', guide: 'istanni' } }),
  C('me7taag', 'محتاج', 'me7taag', 'I need', ['أنا محتاج مية', 'ana me7taag mayya', 'I need water'], { f: { ar: 'محتاجة', guide: 'me7taaga' }, self: true }),
  C('nafs', 'نفس', 'nafs', 'The same', ['نفس الحاجة', 'nafs el-7aaga', 'The same thing']),
  C('su2aal', 'سؤال', 'su2aal', 'Question', ['عندي سؤال', '3andi su2aal', 'I have a question']),
];
