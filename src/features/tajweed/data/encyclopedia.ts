import type {
  TajweedLesson,
  TajweedLessonContent,
  TajweedSection,
  TajweedSectionId,
} from '../types';

const emptyContent = (): TajweedLessonContent => ({
  definition: null,
  explanation: null,
  letters: null,
  examples: null,
  notes: null,
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
  {
    id: 'noon-sakinah',
    title: 'أحكام النون الساكنة والتنوين',
    lessons: [
      { id: 'noon-tanween', title: 'النون الساكنة والتنوين' },
      { id: 'noon-izhar', title: 'الإظهار' },
      { id: 'noon-idgham', title: 'الإدغام' },
      { id: 'noon-iqlab', title: 'الإقلاب' },
      { id: 'noon-ikhfa', title: 'الإخفاء' },
      { id: 'noon-ghunnah', title: 'الغنة' },
    ],
  },
  {
    id: 'meem-sakinah',
    title: 'أحكام الميم الساكنة',
    lessons: [
      { id: 'meem-sakinah', title: 'الميم الساكنة' },
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
