import { TOPIC_EVIDENCE_SOURCES } from '../data/sources';
import { SURAH_TOPICS_DATASET } from '../data/surah-topics.dataset';
import type {
  SurahTopicRecord,
  SurahTopicsDataset,
  TopicSection,
  TopicsValidationResult,
} from '../types';
import { validateSurahTopicsData } from './topics-validation';

export { SURAH_TOPICS_DATASET };

const RECORDS_BY_SURAH = new Map(
  SURAH_TOPICS_DATASET.surahs.map((record) => [record.surahNumber, record]),
);

export function getSurahTopics(surahNumber: number): SurahTopicRecord | null {
  return RECORDS_BY_SURAH.get(surahNumber) ?? null;
}

/** The documented sections of a surah, in Mushaf order; empty when pending. */
export function getTopicSections(surahNumber: number): TopicSection[] {
  return RECORDS_BY_SURAH.get(surahNumber)?.sections ?? [];
}

/** The section an ayah falls inside, or null when the surah is not documented. */
export function getSectionContainingAyah(
  surahNumber: number,
  ayahNumber: number,
): TopicSection | null {
  const record = RECORDS_BY_SURAH.get(surahNumber);
  if (!record) {
    return null;
  }
  return (
    record.sections.find(
      (section) => ayahNumber >= section.startAyah && ayahNumber <= section.endAyah,
    ) ?? null
  );
}

/** Validates the shipped dataset against the registered evidence sources. */
export function validateSurahTopics(
  dataset: SurahTopicsDataset = SURAH_TOPICS_DATASET,
): TopicsValidationResult {
  return validateSurahTopicsData(
    dataset,
    TOPIC_EVIDENCE_SOURCES.map((source) => source.id),
  );
}
