export type TajweedSectionId =
  | 'letters-idgham'
  | 'noon-sakinah'
  | 'meem-sakinah'
  | 'madd'
  | 'raa'
  | 'waqf-ibtida';

export type TajweedLessonContent = {
  definition: string | null;
  explanation: string | null;
  letters: string | null;
  examples: string | null;
  notes: string | null;
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
