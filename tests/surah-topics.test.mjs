import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { TOPIC_EVIDENCE_SOURCES } from '../src/features/surah-topics/data/sources.ts';
import { SURAH_TOPICS_DATASET } from '../src/features/surah-topics/data/surah-topics.dataset.ts';
import { validateSurahTopicsData } from '../src/features/surah-topics/services/topics-validation.ts';

const jsonDataset = JSON.parse(
  readFileSync(
    new URL('../src/features/surah-topics/data/surah-topics.dataset.json', import.meta.url),
    'utf8',
  ),
);

const EVIDENCE_IDS = TOPIC_EVIDENCE_SOURCES.map((source) => source.id);
const DOCUMENTED_SURAHS = [1, 26, 37, 54, 55, 77];

function sectionContaining(surahNumber, ayahNumber) {
  const record = SURAH_TOPICS_DATASET.surahs.find((item) => item.surahNumber === surahNumber);
  return (
    record?.sections.find(
      (section) => ayahNumber >= section.startAyah && ayahNumber <= section.endAyah,
    ) ?? null
  );
}

test('keeps the JSON and TypeScript datasets identical', () => {
  assert.deepEqual(jsonDataset, JSON.parse(JSON.stringify(SURAH_TOPICS_DATASET)));
});

test('covers all 114 surahs in Mushaf order with the canonical ayah counts', () => {
  assert.equal(SURAH_TOPICS_DATASET.surahs.length, 114);
  SURAH_TOPICS_DATASET.surahs.forEach((record, index) => {
    assert.equal(record.surahNumber, index + 1, `surah ${index + 1} out of order`);
    assert.ok(record.ayahCount >= 1, `surah ${record.surahNumber} has no ayahs`);
  });
  assert.equal(SURAH_TOPICS_DATASET.surahs[0].ayahCount, 7);
  assert.equal(SURAH_TOPICS_DATASET.surahs[1].ayahCount, 286);
  assert.equal(SURAH_TOPICS_DATASET.surahs[113].ayahCount, 6);
});

test('passes its own validation with full coverage and no gaps or overlaps', () => {
  const result = validateSurahTopicsData(SURAH_TOPICS_DATASET, EVIDENCE_IDS);
  assert.deepEqual(result.issues, []);
  assert.equal(result.ok, true);
  assert.equal(result.coverage.totalSurahs, 114);
  assert.equal(result.coverage.pendingSurahs + result.coverage.documentedSurahs, 114);
  assert.equal(result.coverage.totalAyahs, 6236);
  // Every documented surah contributes its whole ayah count to the covered sum.
  const documentedAyahs = SURAH_TOPICS_DATASET.surahs
    .filter((record) => record.status === 'documented')
    .reduce((total, record) => total + record.ayahCount, 0);
  assert.equal(result.coverage.coveredAyahs, documentedAyahs);
});

test('marks only source-backed surahs as documented and tiles each one end to end', () => {
  const documented = SURAH_TOPICS_DATASET.surahs
    .filter((record) => record.status === 'documented')
    .map((record) => record.surahNumber);
  assert.deepEqual(documented, DOCUMENTED_SURAHS);

  for (const record of SURAH_TOPICS_DATASET.surahs) {
    if (record.status === 'pending_review') {
      assert.deepEqual(record.sections, [], `pending surah ${record.surahNumber} must be empty`);
      continue;
    }
    assert.ok(record.sections.length > 0, `documented surah ${record.surahNumber} has no sections`);
    let nextExpectedAyah = 1;
    for (const section of record.sections) {
      assert.equal(section.startAyah, nextExpectedAyah, `gap/overlap at ${section.id}`);
      assert.ok(section.endAyah >= section.startAyah, `inverted range at ${section.id}`);
      assert.ok(section.endAyah <= record.ayahCount, `range past end at ${section.id}`);
      assert.ok(section.title.trim().length > 0, `empty title at ${section.id}`);
      assert.ok(section.evidenceIds.length > 0, `no evidence at ${section.id}`);
      assert.ok(
        section.evidenceIds.every((id) => EVIDENCE_IDS.includes(id)),
        `unregistered evidence at ${section.id}`,
      );
      nextExpectedAyah = section.endAyah + 1;
    }
    assert.equal(
      nextExpectedAyah - 1,
      record.ayahCount,
      `surah ${record.surahNumber} not fully tiled`,
    );
  }
});

test('never fabricates a division for pending surahs', () => {
  const pending = SURAH_TOPICS_DATASET.surahs.filter(
    (record) => record.status === 'pending_review',
  );
  assert.equal(pending.length, 108);
  assert.ok(SURAH_TOPICS_DATASET.meta.pendingReason.length > 0);
  assert.ok(SURAH_TOPICS_DATASET.meta.disclaimer.length > 0);
});

test('resolves the section that contains a given ayah', () => {
  assert.equal(sectionContaining(2, 10), null);

  assert.equal(sectionContaining(1, 3)?.id, 's001-01');
  assert.equal(sectionContaining(1, 7)?.id, 's001-02');

  const rahman = SURAH_TOPICS_DATASET.surahs.find((record) => record.surahNumber === 55);
  const lastSection = rahman.sections[rahman.sections.length - 1];
  assert.equal(sectionContaining(55, 78)?.id, lastSection.id);
});
