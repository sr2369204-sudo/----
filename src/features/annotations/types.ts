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

export type Bookmark = {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  createdAt: string;
};

export type SavedWord = {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  wordId: string;
  wordText: string;
  createdAt: string;
};

export type CreateSavedWordInput = {
  surahNumber: number;
  ayahNumber: number;
  wordId: string;
  wordText: string;
};

/** A voice note the reader recorded for one word of the Mushaf. */
export type WordVoiceNote = {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  wordId: string;
  /** Persistent location of the recorded audio file on the device. */
  fileUri: string;
  durationMs: number;
  createdAt: string;
};

export type CreateWordVoiceNoteInput = {
  surahNumber: number;
  ayahNumber: number;
  wordId: string;
  fileUri: string;
  durationMs: number;
};
