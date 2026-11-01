export type AnnotationTarget =
  | {
      type: 'word';
      surahNumber: number;
      ayahNumber: number;
      wordId: string;
    }
  | {
      type: 'ayah';
      surahNumber: number;
      ayahNumber: number;
    }
  | {
      type: 'range';
      surahNumber: number;
      ayahNumber: number;
      startWordId: string;
      endWordId: string;
    };

export type Highlight = {
  id: string;
  target: AnnotationTarget;
  color: string;
  opacity: number;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  target: AnnotationTarget;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateHighlightInput = {
  target: AnnotationTarget;
  color: string;
  opacity: number;
};

export type CreateNoteInput = {
  target: AnnotationTarget;
  body: string;
};
