import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getTajweedLesson,
  getTajweedSection,
  tajweedEncyclopediaLessons,
  tajweedEncyclopediaSections,
} from '../src/features/tajweed/data/encyclopedia.ts';

test('contains the six encyclopedia sections and their requested lessons in order', () => {
  assert.deepEqual(
    tajweedEncyclopediaSections.map((section) => [
      section.title,
      section.lessonIds.map((id) => getTajweedLesson(id)?.title),
    ]),
    [
      ['إدغام الحروف', [
        'تعريف الإدغام',
        'أقسام الإدغام',
        'إدغام المتماثلين',
        'إدغام المتجانسين',
        'إدغام المتقاربين',
      ]],
      ['أحكام النون الساكنة والتنوين', [
        'النون الساكنة والتنوين',
        'الإظهار',
        'الإدغام',
        'الإقلاب',
        'الإخفاء',
        'الغنة',
      ]],
      ['أحكام الميم الساكنة', [
        'الميم الساكنة',
        'الإدغام الشفوي',
        'الإظهار الشفوي',
        'الإخفاء الشفوي',
      ]],
      ['أحكام المد في التجويد', [
        'أقسام المد',
        'المد الطبيعي',
        'مد البدل',
        'المد الواجب المتصل',
        'المد الجائز المنفصل',
        'المد اللازم',
        'المد العارض للسكون',
        'مد الصلة',
      ]],
      ['أحكام الراءات', [
        'أحكام الراء',
        'تفخيم الراء',
        'ترقيق الراء',
        'جواز الوجهين',
      ]],
      ['أحكام الوقف والابتداء', [
        'أحكام الوقف',
        'أنواع الوقف',
        'السكت',
        'الروم والإشمام',
        'علامات الوقف',
        'همزتا القطع والوصل',
      ]],
    ],
  );
});

test('assigns every unique lesson to an existing section and leaves its content empty', () => {
  const lessonIds = tajweedEncyclopediaLessons.map((lesson) => lesson.id);
  assert.equal(new Set(lessonIds).size, lessonIds.length);
  for (const lesson of tajweedEncyclopediaLessons) {
    assert.ok(getTajweedSection(lesson.sectionId));
    assert.deepEqual(lesson.content, {
      definition: null,
      explanation: null,
      letters: null,
      examples: null,
      notes: null,
    });
  }
  assert.equal(getTajweedLesson('unknown-rule'), undefined);
});
