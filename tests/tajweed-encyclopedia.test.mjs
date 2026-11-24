import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getTajweedLesson,
  getTajweedSection,
  tajweedEncyclopediaLessons,
  tajweedEncyclopediaSections,
} from '../src/features/tajweed/data/encyclopedia.ts';

test('lists encyclopedia sections whose lessons all resolve, in order', () => {
  assert.ok(tajweedEncyclopediaSections.length >= 6);
  for (const section of tajweedEncyclopediaSections) {
    assert.ok(section.title.length > 0);
    assert.ok(section.lessonIds.length > 0);
    for (const id of section.lessonIds) {
      const lesson = getTajweedLesson(id);
      assert.ok(lesson, `lesson ${id} of section ${section.id} must exist`);
      assert.ok(lesson.title.length > 0);
    }
  }
});

test('assigns every unique lesson to an existing section', () => {
  const lessonIds = tajweedEncyclopediaLessons.map((lesson) => lesson.id);
  assert.equal(new Set(lessonIds).size, lessonIds.length);
  for (const lesson of tajweedEncyclopediaLessons) {
    assert.ok(getTajweedSection(lesson.sectionId));
    assert.ok(lesson.content);
  }
  assert.equal(getTajweedLesson('unknown-rule'), undefined);
});
