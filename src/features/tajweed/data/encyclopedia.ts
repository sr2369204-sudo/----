import type {
  TajweedLesson,
  TajweedLessonContent,
  TajweedSection,
  TajweedSectionId,
} from '../types';

const emptyContent = (): TajweedLessonContent => ({
  definition: null,
  explanation: null,
  ruling: null,
  letters: null,
  examples: null,
  notes: null,
  cases: null,
});

const sectionDefinitions: {
  id: TajweedSectionId;
  title: string;
  lessons: {
    id: string;
    title: string;
    content?: Partial<TajweedLessonContent>;
  }[];
}[] = [
  {
    id: 'intro',
    title: 'الاستعاذة والبسملة',
    lessons: [
      {
        id: 'istiadha',
        title: 'الاستعاذة',
        content: {
          definition: 'الالتجاء إلى الله والتحصن به من شر الشيطان الرجيم ووساوسه وهمزه ونفخه ونفثه.',
          ruling: 'الندب والاستحباب عند جمهور العلماء، وذهب بعض أهل العلم إلى وجوبها لأمر الله بها.',
          explanation: 'تكون قبل القراءة، وليست من القرآن. صيغها المشهورة: "أعوذ بالله من الشيطان الرجيم".',
          cases: 'يجهر بها إذا كان يقرأ جهراً وهناك من يسمعه، أو في بداية الدرس. ويسر بها في الصلاة، أو إذا كان يقرأ في جماعة ولم يكن هو المبتدئ، أو إذا كان لوحده.',
          notes: 'إذا عرض للقارئ عارض اضطراري (سعال أو عطاس) لم يعد التعوذ، أما العارض الاختياري (كلام خارج التلاوة) فإنه يعيد التعوذ.',
        },
      },
      {
        id: 'basmala',
        title: 'البسملة',
        content: {
          definition: 'مصدر فعل بسمل أي قال "بسم الله الرحمن الرحيم".',
          ruling: 'واجبة عند بداية كل سورة ما عدا سورة التوبة. أما وسط السور فالقارئ مخير.',
          explanation: 'اتفق العلماء أنها جزء من آية في سورة النمل. اختلفوا في كونها آية من كل سورة أو آية مستقلة للفصل بين السور.',
          cases: 'في رواية حفص عن عاصم، لا بد من البسملة بين كل سورتين عدا الأنفال والتوبة.',
          notes: 'لا تبدأ سورة التوبة بالبسملة. الجعبري ذهب إلى منعها في وسط سورة التوبة أيضاً.',
        },
      },
      {
        id: 'istiadha-basmala-cases',
        title: 'أوجه الاستعاذة والبسملة',
        content: {
          explanation: 'هناك أوجه مختلفة للجمع بين الاستعاذة والبسملة وبداية السورة.',
          cases: 'عند بدء السورة (عدا التوبة): 1. قطع الجميع. 2. وصل الجميع. 3. وصل الأول بالثاني وقطع الثالث. 4. قطع الأول ووصل الثاني بالثالث.\n\nبين سورتين: 1. قطع الجميع. 2. قطع الأول ووصل الثاني بالثالث. 3. وصل الجميع.\n\nبين الأنفال والتوبة: 1. الوصل. 2. الوقف. 3. السكت.',
          notes: 'لا يجوز وصل آخر السورة بالبسملة ثم الوقف عليها والبدء بالسورة التالية، لأن البسملة لأوائل السور لا لأواخرها.',
        },
      },
    ],
  },
  {
    id: 'noon-sakinah',
    title: 'أحكام النون الساكنة والتنوين',
    lessons: [
      {
        id: 'noon-tanween-intro',
        title: 'مقدمة الأحكام',
        content: {
          definition: 'النون الساكنة: نون خالية من الحركة تثبت وصلاً ووقفاً. التنوين: نون ساكنة زائدة تلحق آخر الأسماء لفظاً لا خطاً.',
          explanation: 'للنون الساكنة والتنوين أربعة أحكام: الإظهار، الإدغام، الإقلاب، الإخفاء.',
          notes: 'قد يُحرك النون أو يُكسر التنوين منعاً لالتقاء الساكنين (مثل: "مِنَ الَّذِينَ"، "عَدْنٍ الَّتِي")، وفي هذه الحالة لا تنطبق عليه أحكام النون الساكنة.',
        },
      },
      {
        id: 'noon-izhar',
        title: 'الإظهار الحلقي',
        content: {
          definition: 'إخراج الحرف من مخرجه من غير غنة زائدة.',
          letters: 'الهمزة والهاء، والعين والحاء، والغين والخاء (ء هـ ع ح غ خ).',
          examples: 'مَنْ آمَنَ، يَنْأَوْنَ، كُفُوًا أَحَدٌ، مِنْ هَادٍ، يَنْهَوْنَ، سَلَامٌ هِيَ.',
          notes: 'مجموعة في أوائل كلمات: (أخي هاك علماً حازه غير خاسر).',
        },
      },
      {
        id: 'noon-idgham',
        title: 'الإدغام',
        content: {
          definition: 'التقاء حرف ساكن بمتحرك بحيث يصيران حرفاً واحداً مشدداً كالثاني.',
          letters: 'مجموعة في كلمة (يرملون).',
          explanation: 'ينقسم إلى: 1. إدغام بغنة (ي، ن، م، و). 2. إدغام بلا غنة (ل، ر).\n\nمن حيث الكمال والنقصان: كامل بغنة (ن، م)، ناقص بغنة (و، ي)، كامل بدون غنة (ل، ر).',
          examples: 'من مَّاء، من نَّصيب، من لَّدنه، من رَّزق.',
          notes: 'يشترط أن يكون في كلمتين. فإذا التقيا في كلمة واحدة وجب الإظهار المطلق (دنيا، صنوان، قنوان، بنيان).',
        },
      },
      {
        id: 'noon-iqlab',
        title: 'الإقلاب',
        content: {
          definition: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند الباء.',
          letters: 'حرف الباء (ب).',
          examples: 'أَنْبَأَكَ، مِنْ بَعْدِ، سَمِيعٌ بَصِيرٌ.',
          notes: 'يُشار إليه في المصحف بميم صغيرة فوق النون الساكنة.',
        },
      },
      {
        id: 'noon-ikhfa',
        title: 'الإخفاء الحقيقي',
        content: {
          definition: 'حالة بين الإظهار والإدغام عارٍ عن التشديد مع بقاء الغنة.',
          letters: 'خمسة عشر حرفاً مجموعة في أوائل كلمات بيت: صف ذا ثنا كم جاد شخص قد سما...',
          explanation: 'يُنطق بالنون بصفة بين الإظهار والإدغام مع مراعاة الغنة حركتين.',
          examples: 'عَنْ صَلَاتِهِمْ، مَنْ ذَا الَّذِي، مِنْ ثَمَرَةٍ، أَنْزَلْنَا.',
          notes: 'تتبع الغنة ما بعدها تفخيماً وترقيقاً.',
        },
      },
      {
        id: 'tajweed-ghunnah',
        title: 'حكم الغنة',
        content: {
          definition: 'صوت رخيم يخرج من الخيشوم ملازم للنون والميم.',
          explanation: 'يجب إظهار غنة الميم والنون المشددتين بمقدار حركتين.',
          cases: 'مراتب الغنة: 1. أكمل ما تكون (المشدد والمدغم). 2. كاملة (المخفي). 3. ناقصة (الساكن المظهر). 4. أنقص ما تكون (المتحرك).',
          examples: 'إنَّ، الجنَّة، أمَّة، ثمَّ.',
        },
      },
    ],
  },
  {
    id: 'qalqala',
    title: 'أحكام القلقلة',
    lessons: [
      {
        id: 'qalqala-definition',
        title: 'تعريف القلقلة',
        content: {
          definition: 'اضطراب المخرج عند النطق بالحرف الساكن حتى يُسمع له نبرة قوية.',
          letters: 'خمسة أحرف يجمعها قول: "قُطْبُ جَدٍ".',
          explanation: 'تحدث بسبب اجتماع صفتي الجهر والشدة في هذه الحروف.',
        },
      },
      {
        id: 'qalqala-levels',
        title: 'مراتب القلقلة',
        content: {
          explanation: 'تنقسم القلقلة إلى ثلاث مراتب بحسب قوة النطق.',
          cases: '1. صغرى: في وسط الكلمة (يَقْطعون). 2. كبرى: عند الوقف على حرف غير مشدد (الْفَلَقْ). 3. أكبر: عند الوقف على حرف مشدد (وتبَّ).',
          notes: 'القلقلة صفة لازمة لهذه الحروف عند سكونها فقط.',
        },
      },
    ],
  },
  {
    id: 'meem-sakinah',
    title: 'أحكام الميم الساكنة',
    lessons: [
      {
        id: 'meem-sakinah-intro',
        title: 'الميم الساكنة',
        content: {
          definition: 'ميم خالية من الحركة تقع بعد جميع الحروف الهجائية سوى حروف المد.',
          explanation: 'للميم الساكنة ثلاثة أحكام: الإخفاء الشفوي، إدغام المتماثلين الصغير، الإظهار الشفوي.',
        },
      },
      { id: 'meem-idgham-shafawi', title: 'الإدغام الشفوي' },
      { id: 'meem-izhar-shafawi', title: 'الإظهار الشفوي' },
      { id: 'meem-ikhfa-shafawi', title: 'الإخفاء الشفوي' },
    ],
  },
  {
    id: 'madd',
    title: 'أحكام المد في التجويد',
    lessons: [
      { id: 'madd-types', title: 'أقسام المد' },
      { id: 'madd-tabii', title: 'المد الطبيعي' },
      { id: 'madd-badal', title: 'مد البدل' },
      { id: 'madd-wajib-muttasil', title: 'المد الواجب المتصل' },
      { id: 'madd-jaiz-munfasil', title: 'المد الجائز المنفصل' },
      { id: 'madd-lazim', title: 'المد اللازم' },
      { id: 'madd-arid-lissukun', title: 'المد العارض للسكون' },
      { id: 'madd-silah', title: 'مد الصلة' },
    ],
  },
  {
    id: 'raa',
    title: 'أحكام الراءات',
    lessons: [
      { id: 'raa-rules', title: 'أحكام الراء' },
      { id: 'raa-tafkhim', title: 'تفخيم الراء' },
      { id: 'raa-tarqiq', title: 'ترقيق الراء' },
      { id: 'raa-two-options', title: 'جواز الوجهين' },
    ],
  },
  {
    id: 'waqf-ibtida',
    title: 'أحكام الوقف والابتداء',
    lessons: [
      { id: 'waqf-rules', title: 'أحكام الوقف' },
      { id: 'waqf-types', title: 'أنواع الوقف' },
      { id: 'waqf-sakt', title: 'السكت' },
      { id: 'waqf-rawm-ishmam', title: 'الروم والإشمام' },
      { id: 'waqf-signs', title: 'علامات الوقف' },
      { id: 'hamzat-qat-wasl', title: 'همزتا القطع والوصل' },
    ],
  },
  {
    id: 'letters-idgham',
    title: 'إدغام الحروف',
    lessons: [
      { id: 'idgham-definition', title: 'تعريف الإدغام' },
      { id: 'idgham-types', title: 'أقسام الإدغام' },
      { id: 'idgham-identical', title: 'إدغام المتماثلين' },
      { id: 'idgham-homogeneous', title: 'إدغام المتجانسين' },
      { id: 'idgham-proximate', title: 'إدغام المتقاربين' },
    ],
  },
];

export const tajweedEncyclopediaSections: readonly TajweedSection[] =
  sectionDefinitions.map(({ id, title, lessons }) => ({
    id,
    title,
    lessonIds: lessons.map((lesson) => lesson.id),
  }));

export const tajweedEncyclopediaLessons: readonly TajweedLesson[] =
  sectionDefinitions.flatMap(({ id: sectionId, lessons }) =>
    lessons.map(({ id, title, content }) => ({
      id,
      sectionId,
      title,
      content: { ...emptyContent(), ...content },
    })),
  );

export function getTajweedLesson(id: string): TajweedLesson | undefined {
  return tajweedEncyclopediaLessons.find((lesson) => lesson.id === id);
}

export function getTajweedSection(id: TajweedSectionId): TajweedSection | undefined {
  return tajweedEncyclopediaSections.find((section) => section.id === id);
}
