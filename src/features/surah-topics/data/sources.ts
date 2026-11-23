import type { TopicEvidenceSource } from '../types';

/**
 * Evidence registry for the thematic sections. The classical entries mirror
 * `research/source-register.json` in the upstream `quran-structure` project, so
 * an `evidenceId` here means exactly the same work there.
 */
export const TOPIC_EVIDENCE_SOURCES: TopicEvidenceSource[] = [
  {
    id: 'quran_hafs_tanzil',
    label: 'نصّ المصحف (حفص عن عاصم)',
    citation: 'Tanzil Project — Tanzil Verified Quran Text, Uthmani, riwāyat Ḥafṣ ʿan ʿĀṣim (ed. 1.0.2).',
    kind: 'quran_text',
  },
  {
    id: 'hadith_muslim_395',
    label: 'صحيح مسلم',
    citation:
      'صحيح مسلم، كتاب الصلاة، حديث «قسمتُ الصلاة بيني وبين عبدي نصفين ولعبدي ما سأل».',
    kind: 'hadith',
  },
  {
    id: 'qul_tarteel_ayah_themes',
    label: 'موضوعات الآيات — مكتبة QUL',
    citation:
      'Quranic Universal Library (QUL), Tarteel AI — Ayah Themes: 1049 thematic segments covering all 114 surahs (open data, qul.tarteel.ai).',
    kind: 'ulum_al_quran',
  },
  {
    id: 'src_ibn_kathir',
    label: 'تفسير ابن كثير',
    citation:
      'ابن كثير (ت ٧٧٤هـ)، تفسير القرآن العظيم — عرض الحديث في تقسيم الفاتحة ومعاني نصفَيها.',
    kind: 'tafsir',
  },
];

const SOURCES_BY_ID = new Map(TOPIC_EVIDENCE_SOURCES.map((source) => [source.id, source]));

export function getEvidenceSource(id: string): TopicEvidenceSource | null {
  return SOURCES_BY_ID.get(id) ?? null;
}
