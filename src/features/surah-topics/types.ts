/**
 * «التفصيل الموضوعي» — thematic sections for the surahs of the Mushaf.
 *
 * The dataset mirrors the schema used by the upstream `quran-structure`
 * research (`schemas/section.schema.json`): every section carries its ayah
 * bounds, a descriptive title, a short explanation, the structural markers it
 * leans on, the evidence it cites, and a confidence label. Nothing here is
 * invented: a section exists only when its bounds can be read out of the
 * canonical text or a classical source. Surahs without such a source stay
 * `pending_review` with no sections at all.
 */

/** How firmly a section's bounds and reading are established. */
export type TopicSectionConfidence =
  | 'explicitly_stated_by_classical_mufassir'
  | 'supported_by_multiple_tafsir_sources'
  | 'classical_scholarly_observation'
  | 'textually_observable'
  | 'published_editorial_classification'
  | 'research_hypothesis';

/**
 * `documented` means every ayah of the surah falls inside exactly one
 * source-backed section. `pending_review` means no source-backed division was
 * available, so the record is deliberately left empty.
 */
export type SurahTopicStatus = 'documented' | 'pending_review';

export type TopicSection = {
  /** Stable id, `s<NNN>-<NN>` in Mushaf order. */
  id: string;
  surahNumber: number;
  /** First ayah of the section (inclusive). */
  startAyah: number;
  /** Last ayah of the section (inclusive). */
  endAyah: number;
  /** Descriptive, editorial title — not a claim of scholarly consensus. */
  title: string;
  summary: string;
  /** The textual or classical marker that fixes this section's bounds. */
  structuralObservations: string;
  evidenceIds: string[];
  confidence: TopicSectionConfidence;
};

export type SurahTopicRecord = {
  surahNumber: number;
  surahName: string;
  ayahCount: number;
  status: SurahTopicStatus;
  sections: TopicSection[];
};

export type SurahTopicsMeta = {
  version: string;
  canonicalText: string;
  totalSurahs: number;
  documentedSurahs: number[];
  pendingSurahs: number;
  pendingReason: string;
  disclaimer: string;
  confidenceLegend: Record<string, string>;
};

export type SurahTopicsDataset = {
  meta: SurahTopicsMeta;
  surahs: SurahTopicRecord[];
};

/** A registry entry for one cited evidence source. */
export type TopicEvidenceSource = {
  id: string;
  label: string;
  citation: string;
  kind: 'quran_text' | 'hadith' | 'tafsir' | 'ulum_al_quran';
};

export type TopicsValidationIssue = {
  code:
    | 'surah_count'
    | 'surah_number'
    | 'ayah_count'
    | 'missing_sections'
    | 'unexpected_sections'
    | 'section_order'
    | 'section_bounds'
    | 'coverage_gap'
    | 'coverage_overlap'
    | 'duplicate_section_id'
    | 'unknown_evidence'
    | 'empty_evidence';
  message: string;
  surahNumber?: number;
  sectionId?: string;
};

export type TopicsCoverage = {
  totalSurahs: number;
  documentedSurahs: number;
  pendingSurahs: number;
  totalSections: number;
  coveredAyahs: number;
  totalAyahs: number;
  coveredSurahs: number[];
  pendingSurahsList: number[];
};

export type TopicsValidationResult = {
  ok: boolean;
  issues: TopicsValidationIssue[];
  coverage: TopicsCoverage;
};
