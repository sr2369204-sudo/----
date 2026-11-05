export type TajweedSectionId =
  | 'intro'
  | 'noon-sakinah'
  | 'meem-sakinah'
  | 'madd'
  | 'raa'
  | 'waqf-ibtida'
  | 'qalqala'
  | 'letters-idgham';

export type TajweedLessonContent = {
  definition: string | null;
  explanation: string | null;
  ruling: string | null;
  letters: string | null;
  examples: string | null;
  notes: string | null;
  cases: string | null;
};

export type TajweedLesson = {
  id: string;
  sectionId: TajweedSectionId;
  title: string;
  content: TajweedLessonContent;
};

export type TajweedSection = {
  id: TajweedSectionId;
  title: string;
  lessonIds: readonly string[];
};
