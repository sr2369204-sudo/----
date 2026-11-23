import type {
  SurahTopicsDataset,
  TopicsCoverage,
  TopicsValidationIssue,
  TopicsValidationResult,
} from '../types';

/** The Mushaf holds exactly these many surahs; the dataset must match. */
const SURAH_COUNT = 114;
/** The longest surah is Al-Baqarah with 286 ayahs. */
const MAX_AYAHS_PER_SURAH = 286;

/**
 * Checks a thematic-section dataset against the Mushaf it describes: surah
 * numbers are 1..114 in order, ayah counts are plausible, every documented
 * surah's sections tile its ayahs end to end with no gap and no overlap, and
 * every cited evidence id is a registered source. `pending_review` records are
 * expected to be empty and are reported in the coverage summary rather than as
 * errors.
 *
 * The known evidence ids are injected so this stays a pure function of its
 * inputs, with no import side effects.
 */
export function validateSurahTopicsData(
  dataset: SurahTopicsDataset,
  knownEvidenceIds: readonly string[],
): TopicsValidationResult {
  const issues: TopicsValidationIssue[] = [];
  const seenSurahs = new Set<number>();
  const seenSectionIds = new Set<string>();
  const knownEvidence = new Set(knownEvidenceIds);
  const coveredSurahs: number[] = [];
  const pendingSurahsList: number[] = [];
  let totalSections = 0;
  let coveredAyahs = 0;
  let totalAyahs = 0;

  if (dataset.surahs.length !== SURAH_COUNT) {
    issues.push({
      code: 'surah_count',
      message: `المجموعة تحوي ${dataset.surahs.length} سورة بدل ${SURAH_COUNT}.`,
    });
  }

  dataset.surahs.forEach((record, index) => {
    const expectedNumber = index + 1;
    totalAyahs += record.ayahCount;

    if (record.surahNumber !== expectedNumber) {
      issues.push({
        code: 'surah_number',
        message: `ترتيب السور غير متصل عند الموضع ${expectedNumber}: وُجد ${record.surahNumber}.`,
        surahNumber: record.surahNumber,
      });
    }
    if (seenSurahs.has(record.surahNumber)) {
      issues.push({
        code: 'surah_number',
        message: `رقم السورة ${record.surahNumber} مكرَّر.`,
        surahNumber: record.surahNumber,
      });
    }
    seenSurahs.add(record.surahNumber);

    if (
      !Number.isInteger(record.ayahCount) ||
      record.ayahCount < 1 ||
      record.ayahCount > MAX_AYAHS_PER_SURAH
    ) {
      issues.push({
        code: 'ayah_count',
        message: `عدد آيات السورة ${record.surahNumber} غير صحيح (${record.ayahCount}).`,
        surahNumber: record.surahNumber,
      });
    }

    if (record.status === 'pending_review' || record.sections.length === 0) {
      if (record.status === 'documented') {
        issues.push({
          code: 'missing_sections',
          message: `السورة ${record.surahNumber} موسومة موثّقة بلا أي مقطع.`,
          surahNumber: record.surahNumber,
        });
      } else if (record.sections.length > 0) {
        issues.push({
          code: 'unexpected_sections',
          message: `السورة ${record.surahNumber} بحالة pending_review لكنها تحمل مقاطع.`,
          surahNumber: record.surahNumber,
        });
      }
      pendingSurahsList.push(record.surahNumber);
      return;
    }

    // The sections must tile 1..ayahCount exactly: each one starts at the ayah
    // right after the previous one ended, and the last ends on the final ayah.
    let nextExpectedAyah = 1;
    record.sections.forEach((section) => {
      totalSections += 1;

      if (seenSectionIds.has(section.id)) {
        issues.push({
          code: 'duplicate_section_id',
          message: `معرّف المقطع «${section.id}» مكرَّر.`,
          surahNumber: record.surahNumber,
          sectionId: section.id,
        });
      }
      seenSectionIds.add(section.id);

      if (section.surahNumber !== record.surahNumber) {
        issues.push({
          code: 'surah_number',
          message: `المقطع «${section.id}» يحمل رقم سورة غير رقم سورته.`,
          surahNumber: record.surahNumber,
          sectionId: section.id,
        });
      }

      const boundsValid =
        Number.isInteger(section.startAyah) &&
        Number.isInteger(section.endAyah) &&
        section.startAyah >= 1 &&
        section.endAyah <= record.ayahCount &&
        section.startAyah <= section.endAyah;
      if (!boundsValid) {
        issues.push({
          code: 'section_bounds',
          message: `نطاق المقطع «${section.id}» (${section.startAyah}–${section.endAyah}) خارج حدود السورة (${record.ayahCount} آية).`,
          surahNumber: record.surahNumber,
          sectionId: section.id,
        });
        return;
      }

      if (section.evidenceIds.length === 0) {
        issues.push({
          code: 'empty_evidence',
          message: `المقطع «${section.id}» بلا أي مصدر.`,
          surahNumber: record.surahNumber,
          sectionId: section.id,
        });
      }
      section.evidenceIds.forEach((evidenceId) => {
        if (!knownEvidence.has(evidenceId)) {
          issues.push({
            code: 'unknown_evidence',
            message: `المقطع «${section.id}» يستشهد بمصدر غير مسجَّل: ${evidenceId}.`,
            surahNumber: record.surahNumber,
            sectionId: section.id,
          });
        }
      });

      if (section.startAyah > nextExpectedAyah) {
        issues.push({
          code: 'coverage_gap',
          message: `آيات مفقودة في السورة ${record.surahNumber}: من ${nextExpectedAyah} إلى ${section.startAyah - 1}.`,
          surahNumber: record.surahNumber,
          sectionId: section.id,
        });
      } else if (section.startAyah < nextExpectedAyah) {
        issues.push({
          code: 'coverage_overlap',
          message: `تداخل في السورة ${record.surahNumber} عند المقطع «${section.id}»: يبدأ من ${section.startAyah} بعد أن بلغ العدّ ${nextExpectedAyah}.`,
          surahNumber: record.surahNumber,
          sectionId: section.id,
        });
      }

      nextExpectedAyah = Math.max(nextExpectedAyah, section.endAyah + 1);
    });

    if (nextExpectedAyah - 1 !== record.ayahCount) {
      issues.push({
        code: 'coverage_gap',
        message: `السورة ${record.surahNumber} غير مغطّاة كاملة: المغطّى ينتهي عند ${nextExpectedAyah - 1} من ${record.ayahCount}.`,
        surahNumber: record.surahNumber,
      });
      return;
    }

    coveredSurahs.push(record.surahNumber);
    coveredAyahs += record.ayahCount;
  });

  const coverage: TopicsCoverage = {
    totalSurahs: dataset.surahs.length,
    documentedSurahs: coveredSurahs.length,
    pendingSurahs: pendingSurahsList.length,
    totalSections,
    coveredAyahs,
    totalAyahs,
    coveredSurahs,
    pendingSurahsList,
  };

  return { ok: issues.length === 0, issues, coverage };
}
