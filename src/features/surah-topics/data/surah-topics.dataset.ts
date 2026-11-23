/**
 * التفصيل الموضوعي — the thematic section dataset for the whole Mushaf.
 *
 * Generated data — do not hand-edit. It is emitted together with
 * `surah-topics.dataset.json`, which holds the same content as a plain JSON
 * dataset; the two are kept identical by `tests/surah-topics.test.mjs`.
 *
 * Provenance: six surahs were divided by hand from the canonical Hafs text and
 * the classical sources cited in `evidenceIds`. The remaining 108 follow the
 * published "Ayah Themes" classification of the QUL (Tarteel AI), whose English
 * descriptions are rendered into Arabic; each such section is marked
 * `published_editorial_classification` and says so in its observations.
 */
import type { SurahTopicsDataset } from '../types';

export const SURAH_TOPICS_DATASET: SurahTopicsDataset = {
  "meta": {
    "version": "1.1.0",
    "canonicalText": "Tanzil — Hafs ʿan ʿĀṣim (Uthmani)",
    "totalSurahs": 114,
    "documentedSurahs": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      62,
      63,
      64,
      65,
      66,
      67,
      68,
      69,
      70,
      71,
      72,
      73,
      74,
      75,
      76,
      77,
      78,
      79,
      80,
      81,
      82,
      83,
      84,
      85,
      86,
      87,
      88,
      89,
      90,
      91,
      92,
      93,
      94,
      95,
      96,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105,
      106,
      107,
      108,
      109,
      110,
      111,
      112,
      113,
      114
    ],
    "pendingSurahs": 0,
    "pendingReason": "لا توجد سورة قيد المراجعة الآن. صُنّفت السور الـ114 كلها من مصدرين: ستّ سور بمقاطع محرَّرة من النص والتفاسير، وبقيّتها بتصنيف «موضوعات الآيات» المنشور في مكتبة QUL (Tarteel AI).",
    "disclaimer": "أغلب العناوين والنطاقات في هذه المجموعة مأخوذة من تصنيف «موضوعات الآيات» (Ayah Themes) في مكتبة QUL المفتوحة، وهي تعريبٌ لوصفٍ إنجليزي تحريري منشور، لا نقلٌ عن مفسّر ولا دعوى إجماع؛ والستّ السور المنسَّقة يدويًّا مبنيّة على اللوازم المتكرّرة نصًّا وعلى نصوص التفسير. والحدود قابلة للخلاف.",
    "confidenceLegend": {
      "explicitly_stated_by_classical_mufassir": "منصوص عليه عند مفسّر من القدماء",
      "supported_by_multiple_tafsir_sources": "مؤيَّد بعدّة مصادر تفسيرية",
      "classical_scholarly_observation": "ملاحظة علمية عند أهل علوم القرآن",
      "textually_observable": "ظاهر من النص نفسه (لوازم متكرّرة)",
      "published_editorial_classification": "تصنيف موضوعي تحريري من مصدر منشور (QUL)",
      "research_hypothesis": "فرضية بحثية لم تُثبَت"
    }
  },
  "surahs": [
    {
      "surahNumber": 1,
      "surahName": "الفاتحة",
      "ayahCount": 7,
      "status": "documented",
      "sections": [
        {
          "id": "s001-01",
          "surahNumber": 1,
          "startAyah": 1,
          "endAyah": 4,
          "title": "ثناءٌ على الله وتوحيدٌ له",
          "summary": "يُفتتح بالبسملة، ثم يُحمد الله ربّ العالمين، ويوصف بالرحمة، ويُقرّ له بملك يوم الدين.",
          "structuralObservations": "قسّم الحديث القدسي «قسمتُ الصلاة بيني وبين عبدي نصفين» (صحيح مسلم) السورةَ نصفين: ثناءٌ ثم دعاءٌ، فيقع الحدّ قبل {إياك نعبد} أي عند الآية الرابعة على مذهب من يعدّ البسملة آيةً كقراءة حفص. ومن لم يعدّ البسملة آيةً يجعل القسم ١–٣ و٤–٧، فالتقسيم اجتهاديّ لا إجماعيّ.",
          "evidenceIds": [
            "quran_hafs_tanzil",
            "hadith_muslim_395",
            "src_ibn_kathir"
          ],
          "confidence": "supported_by_multiple_tafsir_sources"
        },
        {
          "id": "s001-02",
          "surahNumber": 1,
          "startAyah": 5,
          "endAyah": 7,
          "title": "دعاء العبد وطلب الهداية",
          "summary": "يُعلن المصلي عبادته واستعانته بالله وحده، ثم يسأله الهداية إلى الصراط المستقيم، ويستعيذ من طريق من غضب الله عليه ومن الضالين.",
          "structuralObservations": "وصف الحديث هذه الحلقة بأنها «بيني وبين عبدي» و«لعبدي ما سأل»، فهي خبرٌ بعد خبر ثم مسألةٌ تُختم بها السورة.",
          "evidenceIds": [
            "quran_hafs_tanzil",
            "hadith_muslim_395",
            "src_ibn_kathir"
          ],
          "confidence": "supported_by_multiple_tafsir_sources"
        }
      ]
    },
    {
      "surahNumber": 2,
      "surahName": "البقرة",
      "ayahCount": 286,
      "status": "documented",
      "sections": [
        {
          "id": "s002-01",
          "surahNumber": 2,
          "startAyah": 1,
          "endAyah": 5,
          "title": "لا ريب في القرآن وهدايته للمتقين",
          "summary": "تقرير أن القرآن لا شكّ فيه وأنه هدىً لمن اتقى الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-02",
          "surahNumber": 2,
          "startAyah": 6,
          "endAyah": 7,
          "title": "لا تنفع الإنذار مع من كفر",
          "summary": "بيان أن الإنذار لا ينفع من أصرّ على الكفر وأغلق قلبه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-03",
          "surahNumber": 2,
          "startAyah": 8,
          "endAyah": 16,
          "title": "المنافقون وعاقبة النفاق",
          "summary": "وصف حال المنافقين الذين يخدعون الله والمؤمنين وما ينتظرهم من عذاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-04",
          "surahNumber": 2,
          "startAyah": 17,
          "endAyah": 20,
          "title": "أمثال أعمال المنافقين",
          "summary": "ضرب مثلين لحال المنافقين: النار والنور، والمطر والظلمات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-05",
          "surahNumber": 2,
          "startAyah": 21,
          "endAyah": 22,
          "title": "دعوة الناس إلى عبادة الله",
          "summary": "أمر الناس بعبادة الله وحده الذي خلقهم ورزقهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-06",
          "surahNumber": 2,
          "startAyah": 23,
          "endAyah": 24,
          "title": "التحدي بالإتيان بمثل القرآن",
          "summary": "تحدّي المكذبين أن يأتوا بسورة من مثله إن كانوا صادقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-07",
          "surahNumber": 2,
          "startAyah": 25,
          "endAyah": 25,
          "title": "بشارة المؤمنين بالجنة",
          "summary": "بشارة الذين آمنوا وعملوا الصالحات بجنات تجري من تحتها الأنهار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-08",
          "surahNumber": 2,
          "startAyah": 26,
          "endAyah": 27,
          "title": "مثل البعوضة وموقف الفريقين منه",
          "summary": "بيان أن الأمثال الإلهية يضلّ بها أقوام ويهتدي بها آخرون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-09",
          "surahNumber": 2,
          "startAyah": 28,
          "endAyah": 29,
          "title": "كيف تكفرون بالله؟",
          "summary": "استدلال على وجود الله وقدرته بخلق الأرض والسماء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-10",
          "surahNumber": 2,
          "startAyah": 30,
          "endAyah": 30,
          "title": "خلق آدم وإخبار الملائكة",
          "summary": "إخبار الله الملائكة أنه جاعل في الأرض خليفة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-11",
          "surahNumber": 2,
          "startAyah": 31,
          "endAyah": 33,
          "title": "تفضيل آدم بالعلم",
          "summary": "تعليم آدم الأسماء وعرضها على الملائكة لإظهار فضل العلم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-12",
          "surahNumber": 2,
          "startAyah": 34,
          "endAyah": 35,
          "title": "سجود الملائكة لآدم",
          "summary": "أمر الملائكة بالسجود لآدم واستكبار إبليس عن الأمر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-13",
          "surahNumber": 2,
          "startAyah": 36,
          "endAyah": 36,
          "title": "إخراج الشيطان لآدم من الجنة",
          "summary": "إغواء الشيطان لآدم وحواء حتى أخرجهما من الجنة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-14",
          "surahNumber": 2,
          "startAyah": 37,
          "endAyah": 37,
          "title": "توبة آدم ومغفرة الله له",
          "summary": "تلقّي آدم كلمات من ربه فتاب الله عليه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-15",
          "surahNumber": 2,
          "startAyah": 38,
          "endAyah": 39,
          "title": "الحاجة إلى الهدى الإلهي",
          "summary": "دعوة بني آدم إلى اتباع الهدى وبيان عاقبة الكفر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-16",
          "surahNumber": 2,
          "startAyah": 40,
          "endAyah": 43,
          "title": "ميثاق الله مع بني إسرائيل",
          "summary": "الأمر بوفاء العهد وإقامة الصلاة وإيتاء الزكاة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-17",
          "surahNumber": 2,
          "startAyah": 44,
          "endAyah": 44,
          "title": "النهي عن الأمر بالبر مع نسيان النفس",
          "summary": "توبيخ من يأمر الناس بالخير وينسى نفسه وهو يتلو الكتاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-18",
          "surahNumber": 2,
          "startAyah": 45,
          "endAyah": 46,
          "title": "الاستعانة بالصبر والصلاة",
          "summary": "بيان أن الصبر والصلاة عونٌ على الطاعة لمن يخشى ربه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-19",
          "surahNumber": 2,
          "startAyah": 47,
          "endAyah": 48,
          "title": "لا شفاعة ولا فداء يوم القيامة",
          "summary": "تحذير بني إسرائيل من يوم لا تنفع فيه شفاعة ولا عدل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-20",
          "surahNumber": 2,
          "startAyah": 49,
          "endAyah": 50,
          "title": "إنجاء بني إسرائيل من فرعون",
          "summary": "تذكير بني إسرائيل بنجاتهم من آل فرعون وإغراق عدوهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-21",
          "surahNumber": 2,
          "startAyah": 51,
          "endAyah": 52,
          "title": "عبادة العجل ثم العفو",
          "summary": "اتخاذ بني إسرائيل العجل إلهًا وعفو الله عنهم بعد ذلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-22",
          "surahNumber": 2,
          "startAyah": 53,
          "endAyah": 54,
          "title": "التوبة بقتل الأنفس",
          "summary": "أمر بني إسرائيل بقتل أنفسهم توبةً عن عبادة العجل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-23",
          "surahNumber": 2,
          "startAyah": 55,
          "endAyah": 57,
          "title": "طلب رؤية الله ثم إحياؤهم",
          "summary": "إماتتهم بالصاعقة لطلبهم رؤية الله ثم بعثهم وإنزال المن والسلوى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-24",
          "surahNumber": 2,
          "startAyah": 58,
          "endAyah": 59,
          "title": "تبديل القول ومعصية الأمر",
          "summary": "دخول القرية بغير ما أُمروا وتبديل القول فأنزل عليهم رجزًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-25",
          "surahNumber": 2,
          "startAyah": 60,
          "endAyah": 60,
          "title": "انفجار الماء من الحجر",
          "summary": "استسقاء موسى لقومه فانفجرت من الحجر اثنتا عشرة عينًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-26",
          "surahNumber": 2,
          "startAyah": 61,
          "endAyah": 61,
          "title": "سخط بني إسرائيل على المن والسلوى",
          "summary": "طلبهم غير المن والسلوى وتمردهم فحلّت عليهم الذلة والمسكنة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-27",
          "surahNumber": 2,
          "startAyah": 62,
          "endAyah": 62,
          "title": "أجر المؤمنين من الأمم السابقة",
          "summary": "بيان أن من آمن بالله واليوم الآخر وعمل صالحًا فلا خوف عليه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-28",
          "surahNumber": 2,
          "startAyah": 63,
          "endAyah": 64,
          "title": "رفع الطور وأخذ الميثاق",
          "summary": "تذكير بني إسرائيل برفع الطور فوقهم وأخذ الميثاق عليهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-29",
          "surahNumber": 2,
          "startAyah": 65,
          "endAyah": 66,
          "title": "جزاء اعتداء أصحاب السبت",
          "summary": "مسخ المعتدين في السبت قردةً وجعلهم عبرة لمن بعدهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-30",
          "surahNumber": 2,
          "startAyah": 67,
          "endAyah": 71,
          "title": "قصة البقرة وتشدّدهم في السؤال",
          "summary": "أمر بني إسرائيل بذبح بقرة وتشدّدهم في السؤال عن صفتها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-31",
          "surahNumber": 2,
          "startAyah": 72,
          "endAyah": 74,
          "title": "إحياء القتيل وكشف القاتل",
          "summary": "ضرب المقتول ببعض البقرة فحيي وأخبر بقاتله ثم قست قلوبهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-32",
          "surahNumber": 2,
          "startAyah": 75,
          "endAyah": 77,
          "title": "تحريف اليهود لكلام الله",
          "summary": "بيان أن فريقًا من اليهود يحرفون الكلم ويخفون الحق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-33",
          "surahNumber": 2,
          "startAyah": 78,
          "endAyah": 79,
          "title": "افتراء الأميين على الله",
          "summary": "ذم من يكتبون الكتاب بأيديهم ثم يقولون هو من عند الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-34",
          "surahNumber": 2,
          "startAyah": 80,
          "endAyah": 82,
          "title": "دعوى النجاة من النار",
          "summary": "ردّ زعم بني إسرائيل أن النار لا تمسهم إلا أيامًا معدودة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-35",
          "surahNumber": 2,
          "startAyah": 83,
          "endAyah": 83,
          "title": "نقض ميثاق بني إسرائيل",
          "summary": "تذكيرهم بميثاقهم في عبادة الله وبر الوالدين فنبذوه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-36",
          "surahNumber": 2,
          "startAyah": 84,
          "endAyah": 86,
          "title": "قتل بعضهم بعضًا ونقض العهد",
          "summary": "ذم سفكهم دماءهم وإخراجهم أهلهم من ديارهم مع علمهم بالحرمة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-37",
          "surahNumber": 2,
          "startAyah": 87,
          "endAyah": 88,
          "title": "إرسال عيسى وتكذيب بني إسرائيل",
          "summary": "تأييد عيسى بروح القدس وتكذيبهم للرسل وقتلهم الأنبياء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-38",
          "surahNumber": 2,
          "startAyah": 89,
          "endAyah": 90,
          "title": "رفض اليهود للحق عن علم",
          "summary": "كفرهم بما أُنزل على النبي بعد أن كانوا يستفتحون به.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-39",
          "surahNumber": 2,
          "startAyah": 91,
          "endAyah": 92,
          "title": "حقيقة إيمانهم المزعوم",
          "summary": "دعواهم الإيمان بما أنزل إليهم مع كفرهم بغيره.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-40",
          "surahNumber": 2,
          "startAyah": 93,
          "endAyah": 93,
          "title": "تعلّق قلوبهم بالعجل",
          "summary": "بيان أن العجل خالط قلوبهم فلم يؤمنوا حق الإيمان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-41",
          "surahNumber": 2,
          "startAyah": 94,
          "endAyah": 96,
          "title": "تمنّيهم الموت ودعوى الجنة",
          "summary": "تحدّيهم بتمنّي الموت إن كانوا صادقين في دعوى الآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-42",
          "surahNumber": 2,
          "startAyah": 97,
          "endAyah": 98,
          "title": "عداوتهم لجبريل والملائكة",
          "summary": "ردّ من عادى جبريل وميكال بأن الله عدوّ للكافرين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-43",
          "surahNumber": 2,
          "startAyah": 99,
          "endAyah": 100,
          "title": "نقض فريق منهم للعهد",
          "summary": "بيان أن فريقًا من أهل الكتاب ينبذون عهدهم كلما عاهدوا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-44",
          "surahNumber": 2,
          "startAyah": 101,
          "endAyah": 103,
          "title": "اتهام سليمان وتعلّم السحر",
          "summary": "براءة سليمان من الكفر وبيان ما أُنزل على الملكين ببابل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-45",
          "surahNumber": 2,
          "startAyah": 104,
          "endAyah": 105,
          "title": "أدب خطاب النبي",
          "summary": "النهي عن قول «راعنا» والأمر بقول «انظرنا».",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-46",
          "surahNumber": 2,
          "startAyah": 106,
          "endAyah": 107,
          "title": "النسخ وتبديل الآيات",
          "summary": "بيان أن ما يُنسخ أو يُنسَ يُبدّل بخير منه أو مثله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-47",
          "surahNumber": 2,
          "startAyah": 108,
          "endAyah": 108,
          "title": "النهي عن كثرة مسألة الرسول",
          "summary": "النهي عن مساءلة الرسول كما سأل قوم موسى من قبل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-48",
          "surahNumber": 2,
          "startAyah": 109,
          "endAyah": 109,
          "title": "حسد أهل الكتاب",
          "summary": "بيان حسد بعض أهل الكتاب للمؤمنين وردّهم عن الإيمان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-49",
          "surahNumber": 2,
          "startAyah": 110,
          "endAyah": 110,
          "title": "تقديم الخير ليوم الآخرة",
          "summary": "الحثّ على إقامة الصلاة والزكاة وأن ما تقدّمه النفس من خير تجده عند الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-50",
          "surahNumber": 2,
          "startAyah": 111,
          "endAyah": 112,
          "title": "دعوى الجنة بلا دليل",
          "summary": "ردّ قول اليهود والنصارى لن يدخل الجنة غيرهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-51",
          "surahNumber": 2,
          "startAyah": 113,
          "endAyah": 113,
          "title": "تعصّب أهل الكتاب بعضهم على بعض",
          "summary": "بيان تنازع اليهود والنصارى مع أنهم جميعًا يتلون الكتاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-52",
          "surahNumber": 2,
          "startAyah": 114,
          "endAyah": 114,
          "title": "النهي عن منع المساجد",
          "summary": "بيان أن أظلم الناس من منع ذكر الله في مساجده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-53",
          "surahNumber": 2,
          "startAyah": 115,
          "endAyah": 115,
          "title": "لله المشرق والمغرب",
          "summary": "بيان أن لله المشرق والمغرب فأينما توجّه العبد فهو قريب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-54",
          "surahNumber": 2,
          "startAyah": 116,
          "endAyah": 117,
          "title": "تنزيه الله عن الولد",
          "summary": "ردّ زعم من قال إن لله ولدًا؛ له ما في السماوات والأرض.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-55",
          "surahNumber": 2,
          "startAyah": 118,
          "endAyah": 119,
          "title": "إرسال النبي بالحق بشيرًا ونذيرًا",
          "summary": "بيان أن الله أرسل محمدًا بالحق ولم يُسأل عن أصحاب الجحيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-56",
          "surahNumber": 2,
          "startAyah": 120,
          "endAyah": 121,
          "title": "أهل الكتاب لن يرضوا إلا بالمتابعة",
          "summary": "بيان أنهم لا يرضون حتى تتبع ملتهم فثبّت على الهدى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-57",
          "surahNumber": 2,
          "startAyah": 122,
          "endAyah": 123,
          "title": "تذكير بالحساب يوم القيامة",
          "summary": "تذكير بني إسرائيل بفضل الله وبأن يومًا لا تجزى فيه نفس عن نفس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-58",
          "surahNumber": 2,
          "startAyah": 124,
          "endAyah": 124,
          "title": "إمامة إبراهيم في الناس",
          "summary": "ابتلاء إبراهيم بكلمات فجعله الله إمامًا للناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-59",
          "surahNumber": 2,
          "startAyah": 125,
          "endAyah": 126,
          "title": "دعاء إبراهيم لمكة وتطهير البيت",
          "summary": "تطهير البيت للحجاج ودعاء إبراهيم لمكة بالرزق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-60",
          "surahNumber": 2,
          "startAyah": 127,
          "endAyah": 129,
          "title": "دعاء إبراهيم وإسماعيل ببعثة نبي",
          "summary": "رفع إبراهيم وإسماعيل القواعد ودعاؤهما ببعثة رسول من ذريتهما.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-61",
          "surahNumber": 2,
          "startAyah": 130,
          "endAyah": 132,
          "title": "ملة إبراهيم ووصيته لبنيه",
          "summary": "وصية إبراهيم ويعقوب بنيهما بالثبات على الإسلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-62",
          "surahNumber": 2,
          "startAyah": 133,
          "endAyah": 134,
          "title": "وصية يعقوب لبنيه",
          "summary": "سؤال يعقوب لبنيه عن الإله الذي يعبدون من بعده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر. وُصل هذا المقطع بالآية 134 التي لم يضمّها تصنيف QUL، اتّصالًا للتقسيم بلا فراغ.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-63",
          "surahNumber": 2,
          "startAyah": 135,
          "endAyah": 135,
          "title": "لا دعوى لأهل الكتاب على ملة إبراهيم",
          "summary": "ردّ دعوى اليهود والنصارى أنهم على ملة إبراهيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-64",
          "surahNumber": 2,
          "startAyah": 136,
          "endAyah": 137,
          "title": "الإيمان بجميع الأنبياء بلا تفريق",
          "summary": "الأمر بالإيمان بما أُنزل على إبراهيم وإسماعيل والأنبياء جميعًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-65",
          "surahNumber": 2,
          "startAyah": 138,
          "endAyah": 138,
          "title": "صبغة الله وهي خير الصبغ",
          "summary": "بيان أن صبغة الله هي الإيمان الحق ولا خير منها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-66",
          "surahNumber": 2,
          "startAyah": 139,
          "endAyah": 141,
          "title": "براءة إبراهيم من دعاوى أهل الكتاب",
          "summary": "بيان أن إبراهيم وبنيه كانوا مسلمين لا يهودًا ولا نصارى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-67",
          "surahNumber": 2,
          "startAyah": 142,
          "endAyah": 142,
          "title": "الأمر بتحويل القبلة",
          "summary": "بيان موقف السفهاء من تحويل القبلة إلى الكعبة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-68",
          "surahNumber": 2,
          "startAyah": 143,
          "endAyah": 143,
          "title": "جعل الأمة وسطًا",
          "summary": "جعل الأمة وسطًا لتشهد على الناس وبيان حكمة تحويل القبلة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-69",
          "surahNumber": 2,
          "startAyah": 144,
          "endAyah": 147,
          "title": "توجيه النبي إلى الكعبة",
          "summary": "أمر الله بالتوجه إلى المسجد الحرام وبيان الهدى والإيمان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-70",
          "surahNumber": 2,
          "startAyah": 148,
          "endAyah": 152,
          "title": "المسارعة في الخيرات وأسباب الله",
          "summary": "الحثّ على المسارعة في الخير والأمر بالأخذ بأسباب الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-71",
          "surahNumber": 2,
          "startAyah": 153,
          "endAyah": 153,
          "title": "الله مع الصابرين",
          "summary": "أمر المؤمنين بالاستعانة بالصبر والصلاة وأن الله مع الصابرين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-72",
          "surahNumber": 2,
          "startAyah": 154,
          "endAyah": 154,
          "title": "الشهداء أحياء",
          "summary": "بيان أن القتلى في سبيل الله أحياء لا يموتون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-73",
          "surahNumber": 2,
          "startAyah": 155,
          "endAyah": 157,
          "title": "الابتلاء بالخوف والجوع",
          "summary": "بيان أن المؤمنين يبتلون بالمصائب والبشارة للصابرين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-74",
          "surahNumber": 2,
          "startAyah": 158,
          "endAyah": 158,
          "title": "السعي بين الصفا والمروة",
          "summary": "بيان أن الصفا والمروة من شعائر الله فلا جناح في الطواف بهما.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-75",
          "surahNumber": 2,
          "startAyah": 159,
          "endAyah": 163,
          "title": "لعن كاتمي الحق",
          "summary": "لعن الله والملائكة والناس على من يكتم ما أنزل من البينات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-76",
          "surahNumber": 2,
          "startAyah": 164,
          "endAyah": 164,
          "title": "آيات الله في الكون",
          "summary": "الاستدلال بخلق السماوات والأرض والليل والنهار والرياح على الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-77",
          "surahNumber": 2,
          "startAyah": 165,
          "endAyah": 167,
          "title": "حسرة الأتباع من المتبوعين",
          "summary": "بيان حال المشركين وحسرة الأتباع وتبرّؤ المتبوعين يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-78",
          "surahNumber": 2,
          "startAyah": 168,
          "endAyah": 169,
          "title": "النهي عن اتباع خطوات الشيطان",
          "summary": "أمر الناس بأكل الطيبات والنهي عن اتباع خطوات الشيطان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-79",
          "surahNumber": 2,
          "startAyah": 170,
          "endAyah": 171,
          "title": "ذم التقليد الأعمى",
          "summary": "ذم من يتبع آباءه بغير هدى ولا بصيرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-80",
          "surahNumber": 2,
          "startAyah": 172,
          "endAyah": 173,
          "title": "المحرّمات من الطعام",
          "summary": "بيان ما حرّم الله من الميتة والدم ولحم الخنزير وما أُهل به لغير الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-81",
          "surahNumber": 2,
          "startAyah": 174,
          "endAyah": 176,
          "title": "عاقبة كاتمي الحق",
          "summary": "بيان أن من يكتم الحق طلبًا للدنيا إنما يأكل في بطنه نارًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-82",
          "surahNumber": 2,
          "startAyah": 177,
          "endAyah": 177,
          "title": "حقيقة البر",
          "summary": "بيان أن البر ليس بمجرد الإقبال إلى المشرق والمغرب بل بالإيمان والعمل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-83",
          "surahNumber": 2,
          "startAyah": 178,
          "endAyah": 179,
          "title": "شريعة القصاص",
          "summary": "تشريع القصاص في القتلى وبيان أنه حياة لأولي الألباب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-84",
          "surahNumber": 2,
          "startAyah": 180,
          "endAyah": 182,
          "title": "الوصية عند الموت",
          "summary": "أمر ذوي المال بالوصية للوالدين والأقربين بالمعروف.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-85",
          "surahNumber": 2,
          "startAyah": 183,
          "endAyah": 184,
          "title": "فرض الصيام",
          "summary": "فرض الصيام على المؤمنين كما فُرض على من قبلهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-86",
          "surahNumber": 2,
          "startAyah": 185,
          "endAyah": 185,
          "title": "فضل شهر رمضان",
          "summary": "بيان أن القرآن نزل في رمضان وتيسير الصيام للمسافر والمريض.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-87",
          "surahNumber": 2,
          "startAyah": 186,
          "endAyah": 186,
          "title": "قرب الله من عباده",
          "summary": "بيان استجابة الله لدعاء الداعين وإرشاده للسالكين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-88",
          "surahNumber": 2,
          "startAyah": 187,
          "endAyah": 187,
          "title": "أحكام ليلة الصيام",
          "summary": "بيان حدود الليل والنهار في الصيام ووقت الإمساك والإفطار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-89",
          "surahNumber": 2,
          "startAyah": 188,
          "endAyah": 188,
          "title": "تحريم أكل الأموال بالباطل",
          "summary": "النهي عن أكل أموال الناس بالباطل وبذل الرشوة للحكام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-90",
          "surahNumber": 2,
          "startAyah": 189,
          "endAyah": 189,
          "title": "الأهلّة ومواقيت الناس",
          "summary": "بيان أن الأهلّة مواقيت للناس والحج وذم اقتحام البيوت من ظهورها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-91",
          "surahNumber": 2,
          "startAyah": 190,
          "endAyah": 193,
          "title": "القتال في سبيل الله",
          "summary": "الأمر بالقتال لمن يقاتلكم والنهي عن الاعتداء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-92",
          "surahNumber": 2,
          "startAyah": 194,
          "endAyah": 194,
          "title": "حرمة الشهر الحرام",
          "summary": "بيان جواز المقابلة بالمثل في الأشهر الحرم وحفظ الشعائر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-93",
          "surahNumber": 2,
          "startAyah": 195,
          "endAyah": 195,
          "title": "الإنفاق في سبيل الله",
          "summary": "الأمر بالإنفاق في سبيل الله والنهي عن الإلقاء إلى التهلكة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-94",
          "surahNumber": 2,
          "startAyah": 196,
          "endAyah": 196,
          "title": "وجوب الحج والعمرة",
          "summary": "أمر بإتمام الحج والعمرة لله وبيان أحكام الإحصار والفدية.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-95",
          "surahNumber": 2,
          "startAyah": 197,
          "endAyah": 203,
          "title": "آداب الحج ومناسكه",
          "summary": "بيان محظورات الحج ودعوة مناسكه وحكم التأخر إلى أيام التشريق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-96",
          "surahNumber": 2,
          "startAyah": 204,
          "endAyah": 207,
          "title": "المنافق المرائي والمؤمن المخلص",
          "summary": "المقارنة بين المنافق في قوله وإفساده والمؤمن الباذل نفسه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-97",
          "surahNumber": 2,
          "startAyah": 208,
          "endAyah": 210,
          "title": "الدخول في السلم كافة",
          "summary": "أمر المؤمنين بالدخول في الإسلام كله وعدم اتباع خطوات الشيطان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-98",
          "surahNumber": 2,
          "startAyah": 211,
          "endAyah": 212,
          "title": "تفاضل المؤمنين والكافرين",
          "summary": "بيان زينة الحياة الدنيا للكافرين وسخرية المؤمنين منهم يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-99",
          "surahNumber": 2,
          "startAyah": 213,
          "endAyah": 213,
          "title": "كان الناس أمة واحدة",
          "summary": "بيان أن الناس كانوا أمة واحدة فاختلفوا فبعث الله النبيين مبشرين ومنذرين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-100",
          "surahNumber": 2,
          "startAyah": 214,
          "endAyah": 214,
          "title": "طريق الجنة محفوف بالابتلاء",
          "summary": "بيان أن طريق الجنة محفوف بالابتلاء وقد سنّ الله ذلك للأمم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-101",
          "surahNumber": 2,
          "startAyah": 215,
          "endAyah": 216,
          "title": "أحكام الإنفاق والقتال",
          "summary": "بيان مصرف النفقة وأمر المسلمين بالقتال مع كراهيته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-102",
          "surahNumber": 2,
          "startAyah": 217,
          "endAyah": 218,
          "title": "القتال في الشهر الحرام والردة",
          "summary": "بيان عظم الصدّ عن سبيل الله والارتداد وأنهم يحبط أعمالهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-103",
          "surahNumber": 2,
          "startAyah": 219,
          "endAyah": 220,
          "title": "الخمر والميسر واليتامى",
          "summary": "بيان إثم الخمر والميسر وإصلاح مال اليتيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-104",
          "surahNumber": 2,
          "startAyah": 221,
          "endAyah": 221,
          "title": "تحريم نكاح المشركين",
          "summary": "بيان تحريم نكاح المشركين والمشركات وأولوية الإيمان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-105",
          "surahNumber": 2,
          "startAyah": 222,
          "endAyah": 223,
          "title": "أحكام الحيض",
          "summary": "بيان حكم الحيض واعتزال النساء فيه والإتيان من حيث أمر الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-106",
          "surahNumber": 2,
          "startAyah": 224,
          "endAyah": 225,
          "title": "النهي عن كثرة الحلف بالله",
          "summary": "بيان النهي عن الاستعمال المذموم لاسم الله في الحلف والإصلاح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-107",
          "surahNumber": 2,
          "startAyah": 226,
          "endAyah": 227,
          "title": "الإيلاء والطلاق",
          "summary": "بيان مدة الإيلاء وحدود الطلاق بين الزوجين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-108",
          "surahNumber": 2,
          "startAyah": 228,
          "endAyah": 228,
          "title": "عدة الطلاق",
          "summary": "بيان عدة المرأة وحقوق الزوجين وتربية الأولاد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-109",
          "surahNumber": 2,
          "startAyah": 229,
          "endAyah": 230,
          "title": "أحكام الطلاق والخلع",
          "summary": "بيان حدود الطلاق وحرمة إمساك المرأة ضرارًا وتحريم الرجعة بعد الثلاث.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-110",
          "surahNumber": 2,
          "startAyah": 231,
          "endAyah": 231,
          "title": "معاملة المطلقات بالمعروف",
          "summary": "أمر بإمساك المطلقة بمعروف أو تسريحها بإحسان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-111",
          "surahNumber": 2,
          "startAyah": 232,
          "endAyah": 232,
          "title": "عدم منع المطلقة من الزواج",
          "summary": "النهي عن عضل النساء عن الزواج بعد انقضاء العدة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-112",
          "surahNumber": 2,
          "startAyah": 233,
          "endAyah": 234,
          "title": "الرضاعة وعدة الوفاة",
          "summary": "بيان مدة الرضاعة وأجر المرضعات وعدة المتوفى عنها زوجها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-113",
          "surahNumber": 2,
          "startAyah": 235,
          "endAyah": 235,
          "title": "جواز خطبة المعتدة",
          "summary": "بيان جواز التعريض بخطبة المعتدة دون عقد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-114",
          "surahNumber": 2,
          "startAyah": 236,
          "endAyah": 237,
          "title": "المهر عند الطلاق",
          "summary": "بيان حكم المهر في الطلاق قبل الدخول والتمتع.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-115",
          "surahNumber": 2,
          "startAyah": 238,
          "endAyah": 239,
          "title": "المحافظة على الصلوات",
          "summary": "أمر بالمحافظة على الصلوات والصلاة الوسطى والقيام لله قانتين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-116",
          "surahNumber": 2,
          "startAyah": 240,
          "endAyah": 242,
          "title": "وصية المتوفى لزوجته",
          "summary": "بيان وصية المتوفى لأزواجه ومتاعهن بالمعروف.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-117",
          "surahNumber": 2,
          "startAyah": 243,
          "endAyah": 244,
          "title": "لا مفرّ من الموت",
          "summary": "بيان أن الخروج من الديار فرارًا من الموت لا ينجّي منه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-118",
          "surahNumber": 2,
          "startAyah": 245,
          "endAyah": 246,
          "title": "القرض الحسن ومطالبة بني إسرائيل بملك",
          "summary": "الأمر بالقرض الحسن وطلب بني إسرائيل من نبيهم ملكًا يقاتلون معه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-119",
          "surahNumber": 2,
          "startAyah": 247,
          "endAyah": 248,
          "title": "بعث طالوت ملكًا",
          "summary": "بيان اختيار الله لطالوت ملكًا وآية ملكه بتابوت فيه سكينة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-120",
          "surahNumber": 2,
          "startAyah": 249,
          "endAyah": 249,
          "title": "ابتلاء المؤمنين بالنهر",
          "summary": "بيان اختبار الجيش بالنهر وأن من شرب منه لم يكن من المؤمنين إلا قليل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-121",
          "surahNumber": 2,
          "startAyah": 250,
          "endAyah": 251,
          "title": "النصر بالصبر لا بالعدد",
          "summary": "بيان دعاء المؤمنين عند اللقاء ونصر داود على جالوت.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-122",
          "surahNumber": 2,
          "startAyah": 252,
          "endAyah": 252,
          "title": "آيات الله تُتلى حقًّا",
          "summary": "تثبيت نبوة محمد بأن هذه الأنباء آيات الله تُتلى حقًّا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-123",
          "surahNumber": 2,
          "startAyah": 253,
          "endAyah": 253,
          "title": "تفاضل الرسل",
          "summary": "بيان تفاضل الرسل وكلام الله لموسى وتأييد عيسى بروح القدس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-124",
          "surahNumber": 2,
          "startAyah": 254,
          "endAyah": 254,
          "title": "الإنفاق قبل يوم الحساب",
          "summary": "الحثّ على الإنفاق من الرزق قبل يوم لا بيع فيه ولا شفاعة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-125",
          "surahNumber": 2,
          "startAyah": 255,
          "endAyah": 255,
          "title": "آية الكرسي",
          "summary": "بيان عظمة الله وقيّوميته وسعة كرسيّه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-126",
          "surahNumber": 2,
          "startAyah": 256,
          "endAyah": 257,
          "title": "لا إكراه في الدين",
          "summary": "بيان أن الدين لا يُفرض وأن المؤمن في نور والكافر في ظلمات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-127",
          "surahNumber": 2,
          "startAyah": 258,
          "endAyah": 258,
          "title": "محاجّة إبراهيم للنمرود",
          "summary": "بيان محاجّة إبراهيم لمن كفر وادّعى الإحياء والإماتة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-128",
          "surahNumber": 2,
          "startAyah": 259,
          "endAyah": 259,
          "title": "إحياء القرية الخربة",
          "summary": "ضرب مثل من مرّ على قرية خاوية فأحياها الله بعد مئة عام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-129",
          "surahNumber": 2,
          "startAyah": 260,
          "endAyah": 260,
          "title": "إحياء الطير لإبراهيم",
          "summary": "بيان سؤال إبراهيم عن كيفية إحياء الموتى وإراءة الله له ذلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-130",
          "surahNumber": 2,
          "startAyah": 261,
          "endAyah": 263,
          "title": "مثل الصدقة كحبة أنبتت سبع سنابل",
          "summary": "تمثيل نفقة المنفقين بحبة أنبتت سبع سنابل مضاعفة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-131",
          "surahNumber": 2,
          "startAyah": 264,
          "endAyah": 264,
          "title": "إبطال الصدقة بالمنّ والأذى",
          "summary": "بيان أن المنّ والأذى يبطل الصدقة والرياء يحبطها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-132",
          "surahNumber": 2,
          "startAyah": 265,
          "endAyah": 266,
          "title": "الإنفاق ابتغاء وجه الله",
          "summary": "بيان ثواب من أنفق ابتغاء الله وثبات إيمانه ومثل نفقة المرائي.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-133",
          "surahNumber": 2,
          "startAyah": 267,
          "endAyah": 269,
          "title": "الإنفاق من الطيبات",
          "summary": "أمر بالإنفاق من الطيبات وبيان الجمع بين الفقر والعفة والحكمة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-134",
          "surahNumber": 2,
          "startAyah": 270,
          "endAyah": 273,
          "title": "الإنفاق سرًّا وعلانية ومصرف الصدقة",
          "summary": "بيان حكم النفقة المعلنة والمسرّة ومستحقي الصدقة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-135",
          "surahNumber": 2,
          "startAyah": 274,
          "endAyah": 274,
          "title": "ثواب المنفقين",
          "summary": "بيان أن الله يجزي المنفقين سرًّا وعلانية.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-136",
          "surahNumber": 2,
          "startAyah": 275,
          "endAyah": 276,
          "title": "تحريم الربا",
          "summary": "تحريم الربا وتحليل البيع وبيان أن الله يُربي الصدقات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-137",
          "surahNumber": 2,
          "startAyah": 277,
          "endAyah": 281,
          "title": "عاقبة آكل الربا",
          "summary": "بيان عاقبة آكل الربا وأنه لا يفلح وإنما العمل الصالح ينفع.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-138",
          "surahNumber": 2,
          "startAyah": 282,
          "endAyah": 282,
          "title": "كتابة الديون والإشهاد",
          "summary": "بيان وجوب كتابة الدين والإشهاد عليه وحفظ الحقوق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-139",
          "surahNumber": 2,
          "startAyah": 283,
          "endAyah": 283,
          "title": "الرهن عند تعذّر الكتابة",
          "summary": "بيان جواز الرهن إذا لم يُوجد من يكتب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-140",
          "surahNumber": 2,
          "startAyah": 284,
          "endAyah": 284,
          "title": "محاسبة الله على ما في الأنفس",
          "summary": "بيان محاسبة الله العبد على ما أبدى وما أخفى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s002-141",
          "surahNumber": 2,
          "startAyah": 285,
          "endAyah": 286,
          "title": "خاتمة البقرة: دعاء المؤمنين",
          "summary": "بيان إيمان الرسول والمؤمنين بكتب الله ورسله ودعائهم ألا يحملهم ما لا طاقة لهم به.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 3,
      "surahName": "آل عمران",
      "ayahCount": 200,
      "status": "documented",
      "sections": [
        {
          "id": "s003-01",
          "surahNumber": 3,
          "startAyah": 1,
          "endAyah": 6,
          "title": "تنزيل القرآن والتوراة والإنجيل",
          "summary": "بيان أن الله نزّل الكتب جميعًا وأنه على كل شيء قدير.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-02",
          "surahNumber": 3,
          "startAyah": 7,
          "endAyah": 9,
          "title": "المحكم والمتشابه ودعاء الراسخين",
          "summary": "بيان آيات الكتاب المحكمات والمتشابهات ودعاء الراسخين بالهداية.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-03",
          "surahNumber": 3,
          "startAyah": 10,
          "endAyah": 13,
          "title": "عبرة بدر ووعيد الكفار",
          "summary": "بيان أن أموال الكفار لا تغني عنهم مع عبرة بدر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-04",
          "surahNumber": 3,
          "startAyah": 14,
          "endAyah": 17,
          "title": "زينة الدنيا مقابل نعيم الآخرة",
          "summary": "بيان متاع الدنيا الفاني وخير الآخرة للصالحين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-05",
          "surahNumber": 3,
          "startAyah": 18,
          "endAyah": 20,
          "title": "شهادة الله بدين الإسلام",
          "summary": "بيان أن الدين عند الله الإسلام وأن الله شهد لنفسه بالوحدانية.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-06",
          "surahNumber": 3,
          "startAyah": 21,
          "endAyah": 25,
          "title": "وعيد قاتلي الأنبياء",
          "summary": "بيان وعيد من يكفر بآيات الله ويقتل الأنبياء وكيف يُدعون للحكم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-07",
          "surahNumber": 3,
          "startAyah": 26,
          "endAyah": 27,
          "title": "لله الملك يؤتيه من يشاء",
          "summary": "بيان أن الملك بيد الله يؤتيه من يشاء ويولج الليل في النهار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-08",
          "surahNumber": 3,
          "startAyah": 28,
          "endAyah": 30,
          "title": "النهي عن موالاة الكافرين",
          "summary": "النهي عن اتخاذ الكافرين أولياء وتذكير بحضور الأعمال يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-09",
          "surahNumber": 3,
          "startAyah": 31,
          "endAyah": 32,
          "title": "اتباع النبي ومحبته",
          "summary": "بيان أن محبة الله تُنال باتباع الرسل والأمر بطاعة الله والرسول.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-10",
          "surahNumber": 3,
          "startAyah": 33,
          "endAyah": 34,
          "title": "اصطفاء الأنبياء وذرياتهم",
          "summary": "بيان أن الله اصطفى آدم ونوحًا وآل إبراهيم وآل عمران على العالمين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-11",
          "surahNumber": 3,
          "startAyah": 35,
          "endAyah": 37,
          "title": "نذر امرأة عمران وولادة مريم",
          "summary": "نذر أم مريم ما في بطنها ثم كفالتها ونشأتها في المحراب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-12",
          "surahNumber": 3,
          "startAyah": 38,
          "endAyah": 41,
          "title": "دعاء زكريا وولادة يحيى",
          "summary": "دعاء زكريا بذرية طيبة وإجابة الله له وعلامة الصمت.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-13",
          "surahNumber": 3,
          "startAyah": 42,
          "endAyah": 44,
          "title": "اصطفاء مريم على نساء العالمين",
          "summary": "بيان اصطفاء مريم وتطهيرها واختيارها على نساء العالمين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-14",
          "surahNumber": 3,
          "startAyah": 45,
          "endAyah": 46,
          "title": "البشارة بعيسى",
          "summary": "بشارة الملائكة مريم بكلمة من الله اسمه المسيح عيسى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-15",
          "surahNumber": 3,
          "startAyah": 47,
          "endAyah": 51,
          "title": "خلق عيسى ومعجزاته",
          "summary": "بيان خلق عيسى بكن فيكون ومعجزاته وإرساله لبني إسرائيل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-16",
          "surahNumber": 3,
          "startAyah": 52,
          "endAyah": 53,
          "title": "حواريو عيسى مسلمون",
          "summary": "بيان أن الحواريين نصروا الله وشهدوا بالإسلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-17",
          "surahNumber": 3,
          "startAyah": 54,
          "endAyah": 54,
          "title": "مكر الكافرين بعيسى",
          "summary": "بيان مكر بني إسرائيل بعيسى ومكر الله بهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-18",
          "surahNumber": 3,
          "startAyah": 55,
          "endAyah": 57,
          "title": "وعد الله لعيسى",
          "summary": "بيان رفع الله عيسى وتطهيره ومجازاة الكافرين والمؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-19",
          "surahNumber": 3,
          "startAyah": 58,
          "endAyah": 63,
          "title": "نسب عيسى كآدم ودعوة المباهلة",
          "summary": "تشبيه خلق عيسى بخلق آدم وتحدّي من شكّ بالمباهلة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-20",
          "surahNumber": 3,
          "startAyah": 64,
          "endAyah": 71,
          "title": "الدعوة إلى كلمة سواء",
          "summary": "دعوة أهل الكتاب إلى كلمة سواء وبيان ملة إبراهيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-21",
          "surahNumber": 3,
          "startAyah": 72,
          "endAyah": 74,
          "title": "نفاق فريق من أهل الكتاب",
          "summary": "بيان تآمر فريق منهم على الإيمان وإضلال أتباعهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-22",
          "surahNumber": 3,
          "startAyah": 75,
          "endAyah": 78,
          "title": "تفاوت أهل الكتاب وأمانتهم",
          "summary": "بيان تفاوت أهل الكتاب وذم من يحرف الكلم عن مواضعه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-23",
          "surahNumber": 3,
          "startAyah": 79,
          "endAyah": 80,
          "title": "براءة عيسى من دعوى الألوهية",
          "summary": "بيان أن الأنبياء لا يأمرون بعبادة أنفسهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-24",
          "surahNumber": 3,
          "startAyah": 81,
          "endAyah": 82,
          "title": "ميثاق النبيين بالنبي الخاتم",
          "summary": "أخذ ميثاق الأنبياء بالإيمان بالنبي محمد ونصرته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-25",
          "surahNumber": 3,
          "startAyah": 83,
          "endAyah": 85,
          "title": "لا يُقبل دين غير الإسلام",
          "summary": "بيان أن من يبتغ غير الإسلام دينًا فلن يُقبل منه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-26",
          "surahNumber": 3,
          "startAyah": 86,
          "endAyah": 91,
          "title": "لعنة الله على الكافرين",
          "summary": "بيان أن لعنة الله والملائكة على من مات كافرًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-27",
          "surahNumber": 3,
          "startAyah": 92,
          "endAyah": 92,
          "title": "لن تنالوا البر حتى تنفقوا",
          "summary": "بيان أن البر لا يُنال حتى يُنفق مما يُحبّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-28",
          "surahNumber": 3,
          "startAyah": 93,
          "endAyah": 95,
          "title": "طعام بني إسرائيل قبل التوراة",
          "summary": "بيان أن إسرائيل حرّم على نفسه بعض الطعام لا من الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-29",
          "surahNumber": 3,
          "startAyah": 96,
          "endAyah": 97,
          "title": "بيت الله الأول وأمنه",
          "summary": "بيان أن أول بيت وُضع للناس مكة المباركة وأمن الحرم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-30",
          "surahNumber": 3,
          "startAyah": 98,
          "endAyah": 101,
          "title": "كفر أهل الكتاب وصدّهم عن السبيل",
          "summary": "ذم من يكفر بآيات الله ويردّ المؤمنين عن دينهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-31",
          "surahNumber": 3,
          "startAyah": 102,
          "endAyah": 103,
          "title": "الاعتصام بحبل الله",
          "summary": "الأمر بالتقوى والاعتصام بحبل الله وعدم التفرق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-32",
          "surahNumber": 3,
          "startAyah": 104,
          "endAyah": 109,
          "title": "الأمر بالمعروف والنهي عن المنكر",
          "summary": "بيان فضل الأمة الآمرة بالمعروف ووعيد من يفرّقوا دينهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-33",
          "surahNumber": 3,
          "startAyah": 110,
          "endAyah": 115,
          "title": "خير أمة أُخرجت للناس",
          "summary": "بيان فضل أمة الإسلام وما ينفع من إيمان أهل الكتاب الصالح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-34",
          "surahNumber": 3,
          "startAyah": 116,
          "endAyah": 120,
          "title": "صدقة الكافر وولاء المؤمنين",
          "summary": "بيان أن أموال الكافرين لا تجزيهم وذم مصافحتهم للمؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-35",
          "surahNumber": 3,
          "startAyah": 121,
          "endAyah": 129,
          "title": "عبر أُحد ومعونة الله",
          "summary": "بيان دروس غزوة أحد وأن الأمر كله لله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-36",
          "surahNumber": 3,
          "startAyah": 130,
          "endAyah": 136,
          "title": "تحريم الربا والحثّ على الصدقة",
          "summary": "النهي عن الربا المضعّف والأمر بالإنفاق والتقوى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-37",
          "surahNumber": 3,
          "startAyah": 137,
          "endAyah": 141,
          "title": "سنن الله والغلبة للمؤمنين",
          "summary": "بيان سنن الله في إهلاك المكذبين وأن العاقبة للمؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-38",
          "surahNumber": 3,
          "startAyah": 142,
          "endAyah": 143,
          "title": "لا جنة بغير ابتلاء",
          "summary": "بيان أن الجنة لا تُنال إلا بالجهاد والصبر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-39",
          "surahNumber": 3,
          "startAyah": 144,
          "endAyah": 145,
          "title": "محمد رسول قد خلت الرسل",
          "summary": "بيان أن الرسول بشر ورسول وأن الموت حقّ على الجميع.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-40",
          "surahNumber": 3,
          "startAyah": 146,
          "endAyah": 148,
          "title": "ثبات الأنبياء ودعاؤهم",
          "summary": "بيان صبر الأنبياء مع أتباعهم ودعائهم بالنصر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-41",
          "surahNumber": 3,
          "startAyah": 149,
          "endAyah": 151,
          "title": "النهي عن طاعة الكافرين",
          "summary": "النهي عن طاعة الكافرين وبيان أنهم يرجعون على أعقابهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-42",
          "surahNumber": 3,
          "startAyah": 152,
          "endAyah": 153,
          "title": "أثر مخالفة أمر الرسول في أُحد",
          "summary": "بيان ما جرى يوم أُحد بسبب مخالفة أمر الرسول.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-43",
          "surahNumber": 3,
          "startAyah": 154,
          "endAyah": 155,
          "title": "تنازع القلوب ولا مفرّ من الموت",
          "summary": "بيان أن ما جرى بعد أُحد بموازين الإيمان وأن الأجل محدّد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-44",
          "surahNumber": 3,
          "startAyah": 156,
          "endAyah": 158,
          "title": "الحياة والموت بيد الله",
          "summary": "بيان أن الموت والحياة بأجل مكتوب لا يقدّم ولا يؤخّر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-45",
          "surahNumber": 3,
          "startAyah": 159,
          "endAyah": 159,
          "title": "الشورى والعزم والتوكل",
          "summary": "أمر الرسول بالعفو والشورى والعزم والتوكل على الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-46",
          "surahNumber": 3,
          "startAyah": 160,
          "endAyah": 161,
          "title": "التوكل على الله",
          "summary": "بيان أن النصر من عند الله وأن الغالّ يأتي بما غلّ يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-47",
          "surahNumber": 3,
          "startAyah": 162,
          "endAyah": 164,
          "title": "منزلة الرسول وفضله",
          "summary": "بيان أن الرسول على صراط مستقيم وأن الله أنعم به على المؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-48",
          "surahNumber": 3,
          "startAyah": 165,
          "endAyah": 171,
          "title": "الشهداء أحياء ونعمتهم",
          "summary": "بيان عبر أُحد وأن الشهداء أحياء عند ربهم يُرزقون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-49",
          "surahNumber": 3,
          "startAyah": 172,
          "endAyah": 175,
          "title": "صفات المؤمنين بعد أُحد",
          "summary": "بيان ثبات المؤمنين وإخلاصهم وإحباط كيد أولياء الشيطان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-50",
          "surahNumber": 3,
          "startAyah": 176,
          "endAyah": 178,
          "title": "الاستبدال بالكفر",
          "summary": "بيان أن من يستبدل الكفر بالإيمان يضرّ نفسه وأنه لا يضرّ الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-51",
          "surahNumber": 3,
          "startAyah": 179,
          "endAyah": 179,
          "title": "الابتلاء تمحيص للمؤمنين",
          "summary": "بيان أن الشدائد تمحيص يميّز الخبيث من الطيب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-52",
          "surahNumber": 3,
          "startAyah": 180,
          "endAyah": 180,
          "title": "وعيد البخلاء",
          "summary": "بيان عاقبة من يبخل بالمال الذي آتاه الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-53",
          "surahNumber": 3,
          "startAyah": 181,
          "endAyah": 184,
          "title": "ردّ افتراء اليهود على الله",
          "summary": "بيان افتراء اليهود على الله وتكذيبهم للرسل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-54",
          "surahNumber": 3,
          "startAyah": 185,
          "endAyah": 185,
          "title": "كل نفس ذائقة الموت",
          "summary": "بيان موت كل نفس وأن الحياة الدنيا متاع غرور.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-55",
          "surahNumber": 3,
          "startAyah": 186,
          "endAyah": 186,
          "title": "الابتلاء بالأموال والأنفس",
          "summary": "بيان أن المؤمنين يبتلون في أموالهم وأنفسهم وصبرهم محمود.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-56",
          "surahNumber": 3,
          "startAyah": 187,
          "endAyah": 189,
          "title": "ذم كتمان الشهادة",
          "summary": "بيان ميثاق أهل الكتاب ببيان الحق فكتموه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-57",
          "surahNumber": 3,
          "startAyah": 190,
          "endAyah": 194,
          "title": "آيات الخلق ودعاء المؤمنين",
          "summary": "بيان آيات خلق السماوات والأرض ودعاء أولي الألباب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-58",
          "surahNumber": 3,
          "startAyah": 195,
          "endAyah": 195,
          "title": "استجابة الله لدعاء المؤمنين",
          "summary": "بيان ثواب المهاجرين وجزاء الصالحين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s003-59",
          "surahNumber": 3,
          "startAyah": 196,
          "endAyah": 200,
          "title": "لا تغرّنك تقلّب الكافرين",
          "summary": "بيان أن تقلّب الكافرين متاع قليل والأمر بالصبر والمجاهدة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 4,
      "surahName": "النساء",
      "ayahCount": 176,
      "status": "documented",
      "sections": [
        {
          "id": "s004-01",
          "surahNumber": 4,
          "startAyah": 1,
          "endAyah": 1,
          "title": "الخلق من نفس واحدة وتقوى الله",
          "summary": "دعوة الناس لتقوى الله وبيان خلقهم من نفس واحدة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-02",
          "surahNumber": 4,
          "startAyah": 2,
          "endAyah": 2,
          "title": "أموال اليتامى",
          "summary": "أمر بإيتاء اليتامى أموالهم وعدم إبدال الطيب بالخبيث.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-03",
          "surahNumber": 4,
          "startAyah": 3,
          "endAyah": 3,
          "title": "تحديد عدد الزوجات",
          "summary": "بيان جواز الجمع بشرط العدل وإلا فواحدة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-04",
          "surahNumber": 4,
          "startAyah": 4,
          "endAyah": 4,
          "title": "إيتاء المهور",
          "summary": "أمر بإيتاء النساء مهورهن طيبةً به النفس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-05",
          "surahNumber": 4,
          "startAyah": 5,
          "endAyah": 5,
          "title": "الاحتياط على أموال السفهاء",
          "summary": "بيان عدم تسليم الأموال لمن لا يحسن التصرّف.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-06",
          "surahNumber": 4,
          "startAyah": 6,
          "endAyah": 6,
          "title": "اختبار اليتامى وتدريبهم",
          "summary": "أمر باختبار اليتامى حتى يبلغوا النكاح فحينئذٍ تُدفع أموالهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-07",
          "surahNumber": 4,
          "startAyah": 7,
          "endAyah": 10,
          "title": "حقوق الأولاد والأقربين في الميراث",
          "summary": "بيان نصيب الرجال والنساء من ترك الوالدين والأقربين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-08",
          "surahNumber": 4,
          "startAyah": 11,
          "endAyah": 11,
          "title": "فروض المواريث",
          "summary": "بيان أنصبة الأولاد والوالدين في الميراث.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-09",
          "surahNumber": 4,
          "startAyah": 12,
          "endAyah": 12,
          "title": "ميراث الزوجين",
          "summary": "بيان نصيب الزوج من زوجته والزوجة من زوجها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-10",
          "surahNumber": 4,
          "startAyah": 13,
          "endAyah": 14,
          "title": "حدود الله والوعيد على مخالفتها",
          "summary": "بيان وجوب طاعة الله ورسوله والوعيد على تعدّي حدوده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-11",
          "surahNumber": 4,
          "startAyah": 15,
          "endAyah": 16,
          "title": "جزاء الفاحشة",
          "summary": "بيان عقوبة النساء والرجال في الفاحشة على وجهه الأول.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-12",
          "surahNumber": 4,
          "startAyah": 17,
          "endAyah": 18,
          "title": "التوبة المقبولة وغير المقبولة",
          "summary": "بيان شرط قبول التوبة وأن من مات كافرًا لا تُقبل توبته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-13",
          "surahNumber": 4,
          "startAyah": 19,
          "endAyah": 19,
          "title": "معاشرة النساء بالمعروف",
          "summary": "النهي عن معاملة النساء كالميراث والأمر بالمعاشرة بالمعروف.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-14",
          "surahNumber": 4,
          "startAyah": 20,
          "endAyah": 21,
          "title": "النهي عن استرداد المهور",
          "summary": "بيان حرمة استرداد المهر وتعاظم الأمر في ذلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-15",
          "surahNumber": 4,
          "startAyah": 22,
          "endAyah": 22,
          "title": "حرمة نكاح حلائل الآباء",
          "summary": "بيان حرمة نكاح ما نكح الآباء من النساء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-16",
          "surahNumber": 4,
          "startAyah": 23,
          "endAyah": 23,
          "title": "المحرمات من النساء",
          "summary": "بيان المحرّمات من النساء بالنسب والرضاع والمصاهرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-17",
          "surahNumber": 4,
          "startAyah": 24,
          "endAyah": 24,
          "title": "بقية المحرمات وأحلّ ما وراء ذلك",
          "summary": "بيان بقية المحرّمات وحلّ ما وراء ذلك بشرط العفة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-18",
          "surahNumber": 4,
          "startAyah": 25,
          "endAyah": 25,
          "title": "نكاح الإماء",
          "summary": "بيان حكم نكاح المؤمنات من الإماء وشروط ذلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-19",
          "surahNumber": 4,
          "startAyah": 26,
          "endAyah": 28,
          "title": "إرادة الله للتوبة والعفو",
          "summary": "بيان أن الله يريد التوبة ويخفّف عن الناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-20",
          "surahNumber": 4,
          "startAyah": 29,
          "endAyah": 30,
          "title": "حرمة أكل الأموال بالباطل",
          "summary": "النهي عن أكل أموال الناس بالباطل وعن قتل النفس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-21",
          "surahNumber": 4,
          "startAyah": 31,
          "endAyah": 32,
          "title": "اجتناب الكبائر وعدم التمني",
          "summary": "بيان أن اجتناب الكبائر يكفّر السيئات والنهي عن التمني.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-22",
          "surahNumber": 4,
          "startAyah": 33,
          "endAyah": 33,
          "title": "موالي الميراث",
          "summary": "بيان حكم موالي الميراث وإيتائهم نصيبهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-23",
          "surahNumber": 4,
          "startAyah": 34,
          "endAyah": 35,
          "title": "قيّامية الرجال وحكم الشقاق",
          "summary": "بيان قيّامية الرجال على النساء وإجراء التحكيم عند الشقاق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-24",
          "surahNumber": 4,
          "startAyah": 36,
          "endAyah": 38,
          "title": "حقوق الوالدين والأقارب",
          "summary": "أمر بعبادة الله وبرّ الوالدين والإحسان إلى الناس والنهي عن البخل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-25",
          "surahNumber": 4,
          "startAyah": 39,
          "endAyah": 42,
          "title": "شهادة الرسل على الأمم",
          "summary": "بيان إحضار شاهد من كل أمة يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-26",
          "surahNumber": 4,
          "startAyah": 43,
          "endAyah": 43,
          "title": "النهي عن الصلاة سكرًا والتيمم",
          "summary": "النهي عن الصلاة في حال السكر وأحكام التيمم عند فقد الماء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-27",
          "surahNumber": 4,
          "startAyah": 44,
          "endAyah": 46,
          "title": "سلوك أهل الكتاب ومكرهم",
          "summary": "بيان انحراف أهل الكتاب وقولهم سمعنا وعصينا وتحريفهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-28",
          "surahNumber": 4,
          "startAyah": 47,
          "endAyah": 50,
          "title": "دعوة أهل الكتاب للإيمان",
          "summary": "دعوة أهل الكتاب للإيمان وبيان أن الشرك لا يُغفر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-29",
          "surahNumber": 4,
          "startAyah": 51,
          "endAyah": 55,
          "title": "موالاة أهل الكتاب للطاغوت",
          "summary": "بيان إيمانهم بالجبت والطاغوت وتمنّيهم إضلال المؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-30",
          "surahNumber": 4,
          "startAyah": 56,
          "endAyah": 59,
          "title": "جزاء المؤمنين والكافرين والطاعة",
          "summary": "بيان جزاء الفريقين ووجوب طاعة الله والرسول وأولي الأمر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-31",
          "surahNumber": 4,
          "startAyah": 60,
          "endAyah": 63,
          "title": "تحكيم الطاغوت ونفاق المنافقين",
          "summary": "بيان رغبة المنافقين في التحاكم إلى الطاغوت وموقفهم من حكم الرسول.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-32",
          "surahNumber": 4,
          "startAyah": 64,
          "endAyah": 68,
          "title": "الإيمان بتحكيم الرسول",
          "summary": "بيان أنه لا إيمان لمن لا يتحاكم إلى الرسول ويرضى بحكمه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-33",
          "surahNumber": 4,
          "startAyah": 69,
          "endAyah": 70,
          "title": "رفقة المؤمنين في الآخرة",
          "summary": "بشارة من أطاع الله بمرافقة النبيين والصدّيقين والشهداء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-34",
          "surahNumber": 4,
          "startAyah": 71,
          "endAyah": 74,
          "title": "الاستعداد للجهاد",
          "summary": "أمر المؤمنين بالاستعداد للقتال والحذر من العدوّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-35",
          "surahNumber": 4,
          "startAyah": 75,
          "endAyah": 76,
          "title": "الجهاد لنصرة المستضعفين",
          "summary": "بيان وجوب القتال لفكّ المستضعفين وبيان أولياء الشيطان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-36",
          "surahNumber": 4,
          "startAyah": 77,
          "endAyah": 79,
          "title": "الخوف من الله لا من الناس",
          "summary": "بيان أن الحذر لا يمنع الموت وأن كل نعمة من الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-37",
          "surahNumber": 4,
          "startAyah": 80,
          "endAyah": 81,
          "title": "طاعة الرسول طاعة لله",
          "summary": "بيان أن من أطاع الرسول فقد أطاع الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-38",
          "surahNumber": 4,
          "startAyah": 82,
          "endAyah": 84,
          "title": "إبطال التناقض وإخبار الأمناء",
          "summary": "بيان أن القرآن لو كان من غير الله لاختلف فيه كثيرًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-39",
          "surahNumber": 4,
          "startAyah": 85,
          "endAyah": 87,
          "title": "الردّ بالتحية الحسنة",
          "summary": "بيان أن من يجزي بالحسنة يُجز بمثلها وأن الله يجمع الناس ليوم الحساب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-40",
          "surahNumber": 4,
          "startAyah": 88,
          "endAyah": 91,
          "title": "النهي عن موالاة المنافقين",
          "summary": "بيان حكم المنافقين ومن يعتد ثم يرجع وعدم اتخاذهم أولياء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-41",
          "surahNumber": 4,
          "startAyah": 92,
          "endAyah": 93,
          "title": "قتل المؤمن خطأً والدية",
          "summary": "بيان أحكام القتل الخطأ والدية والكفارة وجزاء القاتل عمدًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-42",
          "surahNumber": 4,
          "startAyah": 94,
          "endAyah": 94,
          "title": "التحقّق قبل الحكم",
          "summary": "بيان النهي عن قول من ألقى السلام «لست مؤمنًا» طلبًا للدنيا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-43",
          "surahNumber": 4,
          "startAyah": 95,
          "endAyah": 96,
          "title": "تفضيل المجاهدين على القاعدين",
          "summary": "بيان درجات المجاهدين على غير المجاهدين عند الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-44",
          "surahNumber": 4,
          "startAyah": 97,
          "endAyah": 100,
          "title": "الهجرة وثوابها",
          "summary": "بيان وجوب الهجرة للمستضعفين وثواب المهاجرين في سبيل الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-45",
          "surahNumber": 4,
          "startAyah": 101,
          "endAyah": 104,
          "title": "قصر الصلاة وصلاة الخوف",
          "summary": "بيان قصر الصلاة في السفر وصلاة الخوف والمحافظة على الصلاة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-46",
          "surahNumber": 4,
          "startAyah": 105,
          "endAyah": 112,
          "title": "الحكم بالحق والنهي عن الافتراء",
          "summary": "أمر الرسول بالحكم بالعدل وبيان حرمة الخيانة والافتراء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-47",
          "surahNumber": 4,
          "startAyah": 113,
          "endAyah": 115,
          "title": "فضل الله على الرسول والنجوى",
          "summary": "بيان فضل الله على الرسول واستثناء النجوى في المعروف.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-48",
          "surahNumber": 4,
          "startAyah": 116,
          "endAyah": 121,
          "title": "الشرك لا يُغفر ووعود الشيطان",
          "summary": "بيان أن الشرك لا يُغفر وأن الشيطان يضلّ أصحابه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-49",
          "surahNumber": 4,
          "startAyah": 122,
          "endAyah": 124,
          "title": "وعد الله الحقّ",
          "summary": "بيان أن الله وعد المؤمنين الصالحين الجنة ومن أصدق من الله قيلًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-50",
          "surahNumber": 4,
          "startAyah": 125,
          "endAyah": 126,
          "title": "أحسن الملل ملة إبراهيم",
          "summary": "بيان أن أحسن الناس دينًا من أسلم وجهه لله وهو محسن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-51",
          "surahNumber": 4,
          "startAyah": 127,
          "endAyah": 130,
          "title": "العدل مع النساء واليتامى",
          "summary": "بيان أحكام النساء واليتامى والأمر بالعدل والإصلاح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-52",
          "surahNumber": 4,
          "startAyah": 131,
          "endAyah": 134,
          "title": "تقوى الله والرغبة في ثوابه",
          "summary": "بيان الأمر بالتقوى وأن لله ميراث السماوات والأرض.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-53",
          "surahNumber": 4,
          "startAyah": 135,
          "endAyah": 135,
          "title": "القيام بالقسط شهداء لله",
          "summary": "أمر المؤمنين بالعدل على النفس والوالدين والأقربين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-54",
          "surahNumber": 4,
          "startAyah": 136,
          "endAyah": 141,
          "title": "الإيمان الصادق ومجالس الكفر",
          "summary": "أمر بالإيمان الحق والنهي عن الجلوس في مجالس الكفر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-55",
          "surahNumber": 4,
          "startAyah": 142,
          "endAyah": 147,
          "title": "صفات المنافقين ومآلهم",
          "summary": "بيان حال المنافقين المخادعين وأنهم في الدرك الأسفل من النار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-56",
          "surahNumber": 4,
          "startAyah": 148,
          "endAyah": 152,
          "title": "النهي عن الجهر بالسوء والتفريق بين الرسل",
          "summary": "بيان جواز الجهر بالسوء لمن ظُلم والنهي عن التفريق بين الرسل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-57",
          "surahNumber": 4,
          "startAyah": 153,
          "endAyah": 159,
          "title": "مطالب بني إسرائيل ورفع عيسى",
          "summary": "بيان تعنّت بني إسرائيل وأن عيسى لم يُقتل بل رُفع.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-58",
          "surahNumber": 4,
          "startAyah": 160,
          "endAyah": 162,
          "title": "جزاء ظلم أهل الكتاب",
          "summary": "بيان ما حرّم على اليهود بسبب ظلمهم وأن الراسخين منهم يؤمنون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-59",
          "surahNumber": 4,
          "startAyah": 163,
          "endAyah": 166,
          "title": "وحدة الوحي وصدق القرآن",
          "summary": "بيان أن الوحي واحد وأن الله شهد بصدق ما أُنزل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-60",
          "surahNumber": 4,
          "startAyah": 167,
          "endAyah": 171,
          "title": "دعوة أهل الكتاب وردّ التثليث",
          "summary": "دعوة الناس للإيمان وبيان أن الله إله واحد بلا ولد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-61",
          "surahNumber": 4,
          "startAyah": 172,
          "endAyah": 173,
          "title": "عيسى عبد الله ورسوله",
          "summary": "بيان أن عيسى وملائكة الله عبادٌ له وأنهم يجازون بأعمالهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-62",
          "surahNumber": 4,
          "startAyah": 174,
          "endAyah": 175,
          "title": "قد جاءكم نور من الله",
          "summary": "بيان مجيء البرهان والنور من الله وثواب المؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s004-63",
          "surahNumber": 4,
          "startAyah": 176,
          "endAyah": 176,
          "title": "ميراث الكلالة",
          "summary": "بيان حكم ميراث من لا ولد له ولا والد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 5,
      "surahName": "المائدة",
      "ayahCount": 120,
      "status": "documented",
      "sections": [
        {
          "id": "s005-01",
          "surahNumber": 5,
          "startAyah": 1,
          "endAyah": 2,
          "title": "الوفاء بالعقود والتعاون على البرّ",
          "summary": "أمر بالوفاء بالعقود والتعاون على البرّ والتقوى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-02",
          "surahNumber": 5,
          "startAyah": 3,
          "endAyah": 3,
          "title": "المحرّمات وكمال الدين",
          "summary": "بيان المحرّمات من الميتة والدم وما أُهل لغير الله وإتمام الدين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-03",
          "surahNumber": 5,
          "startAyah": 4,
          "endAyah": 5,
          "title": "الطيبات وطعام أهل الكتاب",
          "summary": "تحليل الطيبات وطعام أهل الكتاب ونكاح المحصنات منهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-04",
          "surahNumber": 5,
          "startAyah": 6,
          "endAyah": 6,
          "title": "الوضوء والتيمم",
          "summary": "بيان أحكام الوضوء عند القيام للصلاة والتيمم عند فقد الماء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-05",
          "surahNumber": 5,
          "startAyah": 7,
          "endAyah": 11,
          "title": "القيام بالقسط ومكر بني إسرائيل",
          "summary": "أمر بالقيام بالقسط والشهادة والوفاء بالعهد وبيان مكر أعدائهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-06",
          "surahNumber": 5,
          "startAyah": 12,
          "endAyah": 13,
          "title": "ميثاق بني إسرائيل ونقضه",
          "summary": "بيان ميثاق الله مع بني إسرائيل ونقضهم له فحرّم عليهم الطيبات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-07",
          "surahNumber": 5,
          "startAyah": 14,
          "endAyah": 16,
          "title": "نسيان النصارى لحظّهم",
          "summary": "بيان نقض النصارى ميثاقهم ودعوة أهل الكتاب للإيمان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-08",
          "surahNumber": 5,
          "startAyah": 17,
          "endAyah": 17,
          "title": "ردّ ألوهية المسيح وبنوّته",
          "summary": "بيان كفر من قال إن الله هو المسيح أو إنه ابنه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-09",
          "surahNumber": 5,
          "startAyah": 18,
          "endAyah": 19,
          "title": "دعوى بنوّة أهل الكتاب لله",
          "summary": "ردّ زعم أهل الكتاب أنهم أبناء الله ودعوتهم إلى الإسلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-10",
          "surahNumber": 5,
          "startAyah": 20,
          "endAyah": 26,
          "title": "تعنّت بني إسرائيل وتيههم",
          "summary": "بيان تعنّت بني إسرائيل مع موسى وتيههم أربعين سنة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-11",
          "surahNumber": 5,
          "startAyah": 27,
          "endAyah": 31,
          "title": "ابنا آدم وقصة القربان",
          "summary": "بيان قصة ابني آدم وطبيعة ظلم النفس وحسرته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-12",
          "surahNumber": 5,
          "startAyah": 32,
          "endAyah": 32,
          "title": "عظم قتل النفس",
          "summary": "بيان أن قتل نفس بغير حق كقتل الناس جميعًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-13",
          "surahNumber": 5,
          "startAyah": 33,
          "endAyah": 34,
          "title": "جزاء المحاربين",
          "summary": "بيان حدّ من يحارب الله ورسوله ويسعى في الأرض فسادًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-14",
          "surahNumber": 5,
          "startAyah": 35,
          "endAyah": 37,
          "title": "التوسل إلى الله والكافر لا يُفدى",
          "summary": "بيان وجوب التقرّب إلى الله وأن الكافر لا يُقبل منه الفداء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-15",
          "surahNumber": 5,
          "startAyah": 38,
          "endAyah": 40,
          "title": "حدّ السرقة",
          "summary": "بيان قطع يد السارق والتوبة بعد ذلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-16",
          "surahNumber": 5,
          "startAyah": 41,
          "endAyah": 43,
          "title": "ذم المتهافتين على الكفر",
          "summary": "بيان ذم المنافقين ومحاولتهم تحكيم غير الرسول.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-17",
          "surahNumber": 5,
          "startAyah": 44,
          "endAyah": 45,
          "title": "حكم التوراة ومن لم يحكم بها",
          "summary": "بيان أن من لم يحكم بما أنزل الله فأولئك هم الكافرون والظالمون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-18",
          "surahNumber": 5,
          "startAyah": 46,
          "endAyah": 47,
          "title": "الحكم بالإنجيل والتجاوز",
          "summary": "بيان أن من لم يحكم بما أنزل الله فأولئك هم الفاسقون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-19",
          "surahNumber": 5,
          "startAyah": 48,
          "endAyah": 50,
          "title": "تنوّع الأمم والحكم بالحق",
          "summary": "بيان أن اختلاف الأمم سنّة الله والحكم بما أنزل الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-20",
          "surahNumber": 5,
          "startAyah": 51,
          "endAyah": 53,
          "title": "النهي عن موالاة أعداء الدين",
          "summary": "بيان حرمة اتخاذ اليهود والنصارى أولياء وخوف قلوب المنافقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-21",
          "surahNumber": 5,
          "startAyah": 54,
          "endAyah": 56,
          "title": "أولياء المؤمنين",
          "summary": "بيان أن وليّ المؤمنين الله ورسوله والمؤمنون الصالحون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-22",
          "surahNumber": 5,
          "startAyah": 57,
          "endAyah": 60,
          "title": "النهي عن موالاة المستهزئين",
          "summary": "بيان النهي عن ولاية من يتخذ الدين هزوًا ولعبًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-23",
          "surahNumber": 5,
          "startAyah": 61,
          "endAyah": 66,
          "title": "خداع اليهود وأمنيتهم",
          "summary": "بيان إفسادهم ونقضهم الميثاق وأن أهل الكتاب لو آمنوا لأُثيبوا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-24",
          "surahNumber": 5,
          "startAyah": 67,
          "endAyah": 69,
          "title": "بلاغ الرسالة ودعوة أهل الكتاب",
          "summary": "بيان أمر الرسول بالبلاغ وعصمته ودعوة أهل الكتاب لإقامة كتابهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-25",
          "surahNumber": 5,
          "startAyah": 70,
          "endAyah": 71,
          "title": "موقف بني إسرائيل من الرسل",
          "summary": "بيان نقض مواثيقهم وقتلهم الأنبياء واحتسابهم ذلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-26",
          "surahNumber": 5,
          "startAyah": 72,
          "endAyah": 74,
          "title": "كفر من ادّعى ألوهية المسيح",
          "summary": "ردّ دعوى ألوهية المسيح ودعوته لعبادة الله وحده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-27",
          "surahNumber": 5,
          "startAyah": 75,
          "endAyah": 77,
          "title": "حقيقة عيسى ابن مريم",
          "summary": "بيان أن عيسى رسول بشر وأن أمّه صدّيقة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-28",
          "surahNumber": 5,
          "startAyah": 78,
          "endAyah": 82,
          "title": "لعن بني إسرائيل وقرب النصارى",
          "summary": "بيان لعن الكافرين من بني إسرائيل وميل النصارى للمؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-29",
          "surahNumber": 5,
          "startAyah": 83,
          "endAyah": 86,
          "title": "إيمان منصف أهل الإنجيل",
          "summary": "بيان إيمان طائفة من النصارى وإثابتهم على ذلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-30",
          "surahNumber": 5,
          "startAyah": 87,
          "endAyah": 89,
          "title": "تحريم الحلال وكفارة اليمين",
          "summary": "النهي عن تحريم الطيبات وبيان كفارة اليمين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-31",
          "surahNumber": 5,
          "startAyah": 90,
          "endAyah": 93,
          "title": "تحريم الخمر والميسر والأزلام",
          "summary": "بيان حرمة الخمر والميسر والأنصاب والأزلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-32",
          "surahNumber": 5,
          "startAyah": 94,
          "endAyah": 96,
          "title": "صيد البرّ في الإحرام",
          "summary": "بيان تحريم الصيد في حال الإحرام وجزاء قتله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-33",
          "surahNumber": 5,
          "startAyah": 97,
          "endAyah": 100,
          "title": "حرمة الكعبة والشهر الحرام",
          "summary": "بيان أن الكعبة والشهر الحرام والهدي والقلائد قيام للناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-34",
          "surahNumber": 5,
          "startAyah": 101,
          "endAyah": 104,
          "title": "النهي عن كثرة المساءلة والخرافات",
          "summary": "النهي عن السؤال عن أشياء إن تُبدَ تسؤهم وبيان بطلان التحريم بالرأي.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-35",
          "surahNumber": 5,
          "startAyah": 105,
          "endAyah": 108,
          "title": "الشهادة عند الوصية",
          "summary": "بيان أحكام الوصية والشهادة وتغليظ اليمين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-36",
          "surahNumber": 5,
          "startAyah": 109,
          "endAyah": 115,
          "title": "نعم الله على عيسى ومائدة السماء",
          "summary": "بيان تذكير الله عيسى بنعمه وإنزال المائدة آية.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s005-37",
          "surahNumber": 5,
          "startAyah": 116,
          "endAyah": 120,
          "title": "شهادة عيسى يوم القيامة",
          "summary": "بيان تبرّؤ عيسى من دعوى الألوهية وسؤال الله له.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 6,
      "surahName": "الأنعام",
      "ayahCount": 165,
      "status": "documented",
      "sections": [
        {
          "id": "s006-01",
          "surahNumber": 6,
          "startAyah": 1,
          "endAyah": 6,
          "title": "الله واحد في السماء والأرض",
          "summary": "بيان وحدانية الله وقدرته على خلق السماوات والأرض والظلمات والنور.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-02",
          "surahNumber": 6,
          "startAyah": 7,
          "endAyah": 10,
          "title": "لو نُزّل كتاب مكتوب ما آمنوا",
          "summary": "بيان أن المكذبين لا يؤمنون ولو أُنزل عليهم كتاب أو جاءهم ملك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-03",
          "surahNumber": 6,
          "startAyah": 11,
          "endAyah": 18,
          "title": "كتب الله الرحمة على نفسه",
          "summary": "بيان أن الله كتب على نفسه الرحمة وأن العذاب يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-04",
          "surahNumber": 6,
          "startAyah": 19,
          "endAyah": 20,
          "title": "القرآن نذير وإلهكم إله واحد",
          "summary": "بيان أن القرآن أُنزل للإنذار وأنه لا إله إلا الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-05",
          "surahNumber": 6,
          "startAyah": 21,
          "endAyah": 26,
          "title": "افتراء الكذب على الله والإعراض",
          "summary": "بيان افتراء المشركين على الله وإعراضهم عن القرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-06",
          "surahNumber": 6,
          "startAyah": 27,
          "endAyah": 30,
          "title": "لو ترى إذ وُقفوا على النار",
          "summary": "بيان حال المجرمين لو رُدّوا إلى الدنيا وأن البعث حقّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-07",
          "surahNumber": 6,
          "startAyah": 31,
          "endAyah": 35,
          "title": "خسارة المكذبين بلقاء الله",
          "summary": "بيان خسران المكذبين بلقاء الله وثبات النبي على الحق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-08",
          "surahNumber": 6,
          "startAyah": 36,
          "endAyah": 41,
          "title": "الاستماع للقرآن والاستدلال بآيات الكون",
          "summary": "بيان استجابة المستجيبين ودعاء المضطرّين لله وحده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-09",
          "surahNumber": 6,
          "startAyah": 42,
          "endAyah": 45,
          "title": "الرخاء في الدنيا استدراج لا ثواب",
          "summary": "بيان أن ما يُمنح من نعمة في الدنيا إمهال وأن الأمم الظالمة تُقطع دابرها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-10",
          "surahNumber": 6,
          "startAyah": 46,
          "endAyah": 50,
          "title": "أرأيت إن أخذ الله سمعكم وأبصاركم",
          "summary": "بيان قدرة الله وأن الرسل بشر لا يعلمون الغيب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-11",
          "surahNumber": 6,
          "startAyah": 51,
          "endAyah": 55,
          "title": "الإنذار بالقرآن وتفضّل الله بالإيمان",
          "summary": "بيان أن الإيمان فضل الله لا يتوقف على الجاه والمال.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-12",
          "surahNumber": 6,
          "startAyah": 56,
          "endAyah": 60,
          "title": "الحكم لله وعنده مفاتح الغيب",
          "summary": "بيان أن الحكم لله وأن عالم الغيب لا يفوته شيء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-13",
          "surahNumber": 6,
          "startAyah": 61,
          "endAyah": 62,
          "title": "الحفظة على العباد",
          "summary": "بيان أن الله يرسل حفظة على عباده وأن التوفية يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-14",
          "surahNumber": 6,
          "startAyah": 63,
          "endAyah": 67,
          "title": "الله ينجّي من الظلمات والبحر",
          "summary": "بيان أن الله وحده ينجّي من الشدائد وأن المشركين يشهدون بذلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-15",
          "surahNumber": 6,
          "startAyah": 68,
          "endAyah": 69,
          "title": "النهي عن مجالسة العابثين بالآيات",
          "summary": "بيان النهي عن الجلوس مع من يخوض في آيات الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-16",
          "surahNumber": 6,
          "startAyah": 70,
          "endAyah": 70,
          "title": "لا تجالس من اتخذ دينه هزوًا",
          "summary": "بيان الاعتزال عن أهل اللهو في الدين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-17",
          "surahNumber": 6,
          "startAyah": 71,
          "endAyah": 73,
          "title": "إقامة الصلاة وتقوى الله",
          "summary": "بيان الأمر بإقامة الصلاة وتقواه وأنه سبحانه بيده الملك يوم يُنفخ في الصور.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-18",
          "surahNumber": 6,
          "startAyah": 74,
          "endAyah": 79,
          "title": "استدلال إبراهيم بالملكوت",
          "summary": "بيان رحلة إبراهيم في الاستدلال على وحدانية الله بالمظاهر الكونية.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-19",
          "surahNumber": 6,
          "startAyah": 80,
          "endAyah": 82,
          "title": "محاجّة إبراهيم لقومه",
          "summary": "بيان محاجّة إبراهيم لقومه وأن الخوف إنما يكون من الشرك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-20",
          "surahNumber": 6,
          "startAyah": 83,
          "endAyah": 90,
          "title": "براءة الأنبياء من الشرك",
          "summary": "بيان أن الأنبياء من ذرية إبراهيم ما كانوا مشركين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-21",
          "surahNumber": 6,
          "startAyah": 91,
          "endAyah": 91,
          "title": "لم قدّرتم الله حقّ قدره؟",
          "summary": "بيان عظمة ما أنزله الله من التوراة والقرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-22",
          "surahNumber": 6,
          "startAyah": 92,
          "endAyah": 94,
          "title": "خسارة المفترين على الله",
          "summary": "بيان جزاء من كذّب بلقاء الله وجاء فردًا كما خُلق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-23",
          "surahNumber": 6,
          "startAyah": 95,
          "endAyah": 100,
          "title": "فالق الحبّ والنوى وبديع السماوات",
          "summary": "بيان آيات الخلق وأن الله منزّه عن الولد والشريك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-24",
          "surahNumber": 6,
          "startAyah": 101,
          "endAyah": 107,
          "title": "أنّى يكون له ولد ولم تكن له صاحبة",
          "summary": "بيان تنزّه الله عن الولد والشريك وإعراض المشركين عن الآيات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-25",
          "surahNumber": 6,
          "startAyah": 108,
          "endAyah": 110,
          "title": "النهي عن سبّ آلهة المشركين",
          "summary": "بيان النهي عن سبّ آلهتهم لئلا يعتدوا وحجاب الهدى عن المعرضين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-26",
          "surahNumber": 6,
          "startAyah": 111,
          "endAyah": 115,
          "title": "معارضة الشياطين للرسل",
          "summary": "بيان أن لكل نبي عدوًّا من الشياطين وأن الحق يهدي به الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-27",
          "surahNumber": 6,
          "startAyah": 116,
          "endAyah": 121,
          "title": "إباحة ذبيحة اسم الله وحرمة غيرها",
          "summary": "بيان أن أكثر الناس لا يتبعون الحق وأنه لا يُؤكل إلا ما ذُكر عليه اسم الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-28",
          "surahNumber": 6,
          "startAyah": 122,
          "endAyah": 124,
          "title": "أصحاب النور والظلمات وطغيان المجرمين",
          "summary": "بيان أن من كان ميتًا فأحياه الله ليس كمن في الظلمات وأن المجرمين يعلمون بما يفعلون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-29",
          "surahNumber": 6,
          "startAyah": 125,
          "endAyah": 127,
          "title": "شرح الصدر للإسلام",
          "summary": "بيان أن الله يشرح صدر من أراد هدايته ويجعله حرجًا لمن أراد ضلاله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-30",
          "surahNumber": 6,
          "startAyah": 128,
          "endAyah": 129,
          "title": "حشر الجنّ والإنس إلى النار",
          "summary": "بيان مصير من ضلّ من الجنّ والإنس إلى جهنم خالدين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-31",
          "surahNumber": 6,
          "startAyah": 130,
          "endAyah": 135,
          "title": "سؤال الرسل وإقرار الضالين",
          "summary": "بيان أن الرسل أقيمت بهم الحجة وإقرار الكافرين وخسارتهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-32",
          "surahNumber": 6,
          "startAyah": 136,
          "endAyah": 140,
          "title": "ضلالات المشركين في الحرث والأنعام",
          "summary": "بيان افتراء المشركين على الله في الأنعام والحرث والبنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-33",
          "surahNumber": 6,
          "startAyah": 141,
          "endAyah": 142,
          "title": "إيتاء حقّ الزرع يوم الحصاد",
          "summary": "بيان الأمر بإيتاء حقّ الزرع يوم حصاده وعدم الإسراف.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-34",
          "surahNumber": 6,
          "startAyah": 143,
          "endAyah": 144,
          "title": "ردّ تحريم المشركين للأنعام",
          "summary": "بيان بطلان تحريم المشركين للأنعام بأهوائهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-35",
          "surahNumber": 6,
          "startAyah": 145,
          "endAyah": 147,
          "title": "المحرّمات الحقيقية من الأنعام",
          "summary": "بيان المحرّمات الصحيحة وما حُرّم على اليهود بظلمهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-36",
          "surahNumber": 6,
          "startAyah": 148,
          "endAyah": 150,
          "title": "بطلان حجة المشركين بالتقدير",
          "summary": "بيان بطلان قول المشركين لو شاء الله ما أشركنا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-37",
          "surahNumber": 6,
          "startAyah": 151,
          "endAyah": 154,
          "title": "الوصايا الجامعة وأصول التحريم",
          "summary": "بيان قواعد التحريم وأصوله في الإسلام والوصايا الجامعة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-38",
          "surahNumber": 6,
          "startAyah": 155,
          "endAyah": 158,
          "title": "القرآن المبارك وانتظار العذاب",
          "summary": "بيان أن القرآن مبارك مصدّق لما قبله وأن العذاب غيب منتظر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-39",
          "surahNumber": 6,
          "startAyah": 159,
          "endAyah": 160,
          "title": "براءة النبي من الذين فرّقوا دينهم",
          "summary": "بيان ذم الذين فرّقوا دينهم وكانوا شيعًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s006-40",
          "surahNumber": 6,
          "startAyah": 161,
          "endAyah": 165,
          "title": "قل إن صلاتي ونسكي لله",
          "summary": "بيان وجوب إخلاص العبادة لله وأن لكل نفس درجتها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 7,
      "surahName": "الأعراف",
      "ayahCount": 206,
      "status": "documented",
      "sections": [
        {
          "id": "s007-01",
          "surahNumber": 7,
          "startAyah": 1,
          "endAyah": 10,
          "title": "وزن الأعمال وسؤال الرسل",
          "summary": "بيان أن الناس يُسألون عن الرسالة وأن الأعمال تُوزن بميزان العدل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-02",
          "surahNumber": 7,
          "startAyah": 11,
          "endAyah": 18,
          "title": "خلق آدم واستكبار إبليس",
          "summary": "بيان خلق آدم وأمر السجود وإنظار إبليس وأقسامه على الإغواء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-03",
          "surahNumber": 7,
          "startAyah": 19,
          "endAyah": 25,
          "title": "وسوسة الشيطان لآدم وحواء",
          "summary": "بيان إغواء الشيطان لآدم وحواء وتوبتهما والإهباط إلى الأرض.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-04",
          "surahNumber": 7,
          "startAyah": 26,
          "endAyah": 31,
          "title": "لباس التقوى وعدم اتباع الشيطان",
          "summary": "بيان نعمة اللباس وتحذير بني آدم من كيد الشيطان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-05",
          "surahNumber": 7,
          "startAyah": 32,
          "endAyah": 34,
          "title": "الزينة والطيبات والنهي عن الإسراف",
          "summary": "بيان إباحة الزينة والطيبات والنهي عن الإسراف وأن لكل أمة أجل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-06",
          "surahNumber": 7,
          "startAyah": 35,
          "endAyah": 39,
          "title": "اتّباع الرسل والنجاة من النار",
          "summary": "بيان أن من اتّبع الرسل واتقى لا خوف عليه ومن كذّب يدخل النار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-07",
          "surahNumber": 7,
          "startAyah": 40,
          "endAyah": 41,
          "title": "لا تُفتح أبواب السماء للكافرين",
          "summary": "بيان أن أبواب السماء لا تُفتح لمن كذّب واستكبر وأن مأواهم جهنم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-08",
          "surahNumber": 7,
          "startAyah": 42,
          "endAyah": 43,
          "title": "دخول المؤمنين الجنة",
          "summary": "بيان ثواب الذين آمنوا وعملوا الصالحات ودخولهم الجنة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-09",
          "surahNumber": 7,
          "startAyah": 44,
          "endAyah": 47,
          "title": "الخطاب بين أهل الجنة وأهل النار",
          "summary": "بيان تخاطب الفريقين وظهور الحجاب بينهما.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-10",
          "surahNumber": 7,
          "startAyah": 48,
          "endAyah": 53,
          "title": "أصحاب الأعراف وطلب أهل النار الماء",
          "summary": "بيان خطاب أصحاب الأعراف لأهل النار وطلب أهل النار للماء والطعام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-11",
          "surahNumber": 7,
          "startAyah": 54,
          "endAyah": 58,
          "title": "خلق الله وإرسال الرياح",
          "summary": "بيان خلق الله للكون والأمر بالدعاء خوفًا وطمعًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-12",
          "surahNumber": 7,
          "startAyah": 59,
          "endAyah": 64,
          "title": "قصة نوح ودعوته قومه",
          "summary": "بيان دعوة نوح لقومه وإصرارهم على الكفر وإغراقهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-13",
          "surahNumber": 7,
          "startAyah": 65,
          "endAyah": 72,
          "title": "قصة هود ودعوته عادًا",
          "summary": "بيان دعوة هود لقومه عاد وتكذيبهم وإهلاكهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-14",
          "surahNumber": 7,
          "startAyah": 73,
          "endAyah": 79,
          "title": "قصة صالح وثمود",
          "summary": "بيان دعوة صالح لقومه ثمود وعقرهم الناقة وإهلاكهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-15",
          "surahNumber": 7,
          "startAyah": 80,
          "endAyah": 84,
          "title": "قصة لوط وقومه",
          "summary": "بيان فاحشة قوم لوط وتكذيبهم وإنجاء لوط وأهله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-16",
          "surahNumber": 7,
          "startAyah": 85,
          "endAyah": 87,
          "title": "قصة شعيب ومدين",
          "summary": "بيان دعوة شعيب لقومه بالوفاء بالميزان والنهي عن الفساد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-17",
          "surahNumber": 7,
          "startAyah": 88,
          "endAyah": 93,
          "title": "إخراج شعيب ووعيد قومه",
          "summary": "بيان تهديد قوم شعيب له بالطرد وإصرارهم فأخذهم العذاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-18",
          "surahNumber": 7,
          "startAyah": 94,
          "endAyah": 99,
          "title": "البأساء والضراء والدعة",
          "summary": "بيان أن النقم والنعم تذكير وأن مكر الله لا يأمنه الأخسرون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-19",
          "surahNumber": 7,
          "startAyah": 100,
          "endAyah": 102,
          "title": "عبر القرون والأمم الخالية",
          "summary": "بيان سنة الله في الأمم التي خلفت من بعدهم وطبع قلوبهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-20",
          "surahNumber": 7,
          "startAyah": 103,
          "endAyah": 108,
          "title": "إرسال موسى إلى فرعون",
          "summary": "بيان إرسال موسى بآياته إلى فرعون وملئه وموقفهم منها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-21",
          "surahNumber": 7,
          "startAyah": 109,
          "endAyah": 126,
          "title": "موسى والسحرة وصراع الحق",
          "summary": "بيان لقاء موسى بالسحرة وإيمانهم بربّ العالمين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-22",
          "surahNumber": 7,
          "startAyah": 127,
          "endAyah": 129,
          "title": "فرعون يمنّي قتل موسى",
          "summary": "بيان مكر فرعون وبني إسرائيل واستخدامهم في المشقة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-23",
          "surahNumber": 7,
          "startAyah": 130,
          "endAyah": 137,
          "title": "آيات فرعون وإغراقه",
          "summary": "بيان إرسال الطوفان والجراد والقمل والضفادع ومنّ الله على بني إسرائيل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-24",
          "surahNumber": 7,
          "startAyah": 138,
          "endAyah": 141,
          "title": "مجاوزة البحر وطلب إله غير الله",
          "summary": "بيان نجاة بني إسرائيل وطلبهم إلهًا غير الله ونعم الله عليهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-25",
          "surahNumber": 7,
          "startAyah": 142,
          "endAyah": 144,
          "title": "مواعدة موسى واصطفاؤه",
          "summary": "بيان مواعدة الله موسى أربعين ليلة واصطفائه برسالته وتكليمه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-26",
          "surahNumber": 7,
          "startAyah": 145,
          "endAyah": 147,
          "title": "الألواح وصرف الآيات عن المستكبرين",
          "summary": "بيان كتابة الله لموسى في الألواح وصرف المستكبرين عن الآيات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-27",
          "surahNumber": 7,
          "startAyah": 148,
          "endAyah": 151,
          "title": "عبادة العجل وغضب موسى",
          "summary": "بيان اتخاذ بني إسرائيل العجل ثم موقف موسى وتوبتهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-28",
          "surahNumber": 7,
          "startAyah": 152,
          "endAyah": 156,
          "title": "غضب الله على عبدة العجل",
          "summary": "بيان غضب الله على عبدة العجل وأن رحمته وسعت كل شيء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-29",
          "surahNumber": 7,
          "startAyah": 157,
          "endAyah": 157,
          "title": "صفة النبي في التوراة والإنجيل",
          "summary": "بيان أن بشارة النبي مكتوبة في التوراة والإنجيل ووصفه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-30",
          "surahNumber": 7,
          "startAyah": 158,
          "endAyah": 158,
          "title": "رسالة النبي للناس كافة",
          "summary": "بيان عموم رسالة النبي إلى الناس جميعًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-31",
          "surahNumber": 7,
          "startAyah": 159,
          "endAyah": 162,
          "title": "إنزال المن والسلوى وتقسيم الأسباط",
          "summary": "بيان تفضيل الله بني إسرائيل وإنزال المن والسلوى عليهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-32",
          "surahNumber": 7,
          "startAyah": 163,
          "endAyah": 168,
          "title": "أصحاب السبت وتحريم الطيبات",
          "summary": "بيان قصة أهل القرية في السبت ومسخ المعتدين وتفريقهم في الأرض.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-33",
          "surahNumber": 7,
          "startAyah": 169,
          "endAyah": 171,
          "title": "خلف السوء وأخذ الكتاب",
          "summary": "بيان ذم أخذ الدنيا وقولهم سيُغفر لنا ورفع الطور عليهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-34",
          "surahNumber": 7,
          "startAyah": 172,
          "endAyah": 174,
          "title": "أخذ الميثاق في الأظهور",
          "summary": "بيان أخذ الله الميثاق في ذرية آدم وأنه لا يُقال كنا غافلين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-35",
          "surahNumber": 7,
          "startAyah": 175,
          "endAyah": 178,
          "title": "مثل من انسلخ من الآيات",
          "summary": "بيان مثال من آتاه الله آياته فانسلخ منها واتّبع هواه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-36",
          "surahNumber": 7,
          "startAyah": 179,
          "endAyah": 181,
          "title": "ذم الغافلين عن آيات الله",
          "summary": "بيان أن الغافلين عن الآيات كالأنعام بل هم أضلّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-37",
          "surahNumber": 7,
          "startAyah": 182,
          "endAyah": 188,
          "title": "استدراج المكذبين والرسول لا يملك شيئًا",
          "summary": "بيان استدراج الكافرين وأن النبي لا يملك لنفسه نفعًا ولا ضرًّا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-38",
          "surahNumber": 7,
          "startAyah": 189,
          "endAyah": 198,
          "title": "خلق النفس الواحدة وبطلان الأصنام",
          "summary": "بيان خلق الإنسان من نفس واحدة وبطلان ما يُعبد من دون الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s007-39",
          "surahNumber": 7,
          "startAyah": 199,
          "endAyah": 206,
          "title": "العفو والأمر بالعرف والإعراض عن الجاهلين",
          "summary": "بيان آداب الدعوة والأمر بسجود المقرّبين لله وعبادته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 8,
      "surahName": "الأنفال",
      "ayahCount": 75,
      "status": "documented",
      "sections": [
        {
          "id": "s008-01",
          "surahNumber": 8,
          "startAyah": 1,
          "endAyah": 10,
          "title": "الأنفال وغزوة بدر",
          "summary": "بيان حكم الأنفال وأنها لله والرسول ونصر الله في بدر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-02",
          "surahNumber": 8,
          "startAyah": 11,
          "endAyah": 19,
          "title": "نصر الله في بدر وإنزال النعاس",
          "summary": "بيان تثبيت الله المؤمنين بالنعاس والمطر وأن الأمر لله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-03",
          "surahNumber": 8,
          "startAyah": 20,
          "endAyah": 28,
          "title": "النهي عن الخيانة واتقاء الفتنة",
          "summary": "بيان النهي عن معصية الله والرسول وأن الأموال والأولاد فتنة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-04",
          "surahNumber": 8,
          "startAyah": 29,
          "endAyah": 37,
          "title": "الفرقان للمتقين وصيانة الكعبة",
          "summary": "بيان أن التقوى سبب الفرقان وأن ولاية المسجد الحرام للمتقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-05",
          "surahNumber": 8,
          "startAyah": 38,
          "endAyah": 40,
          "title": "الدعوة إلى الإسلام ودفع الفتنة",
          "summary": "بيان أن من انتهى عن الكفر غُفر له وأن القتال لدفع الفتنة حتى يكون الدين لله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-06",
          "surahNumber": 8,
          "startAyah": 41,
          "endAyah": 44,
          "title": "تقسيم الخمس ومنّ الله باللقاء",
          "summary": "بيان مصرف الغنيمة وأن اللقاء كان بأمر الله ولحكمة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-07",
          "surahNumber": 8,
          "startAyah": 45,
          "endAyah": 48,
          "title": "الثبات في القتال وذكر الله",
          "summary": "بيان الأمر بالثبات عند الملاقاة وذكر الله والصبر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-08",
          "surahNumber": 8,
          "startAyah": 49,
          "endAyah": 52,
          "title": "خذلان المنافقين وعذاب الكافرين",
          "summary": "بيان أن النصر بمعية الله وأن الكافرين يُعذّبون بشدة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-09",
          "surahNumber": 8,
          "startAyah": 53,
          "endAyah": 54,
          "title": "سنة الله في تغيير النعم",
          "summary": "بيان أن نعمة الله لا تُسلَب إلا بتغيير الأمم أحوالهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-10",
          "surahNumber": 8,
          "startAyah": 55,
          "endAyah": 58,
          "title": "الوفاء بالعهد ونبذه عند الخيانة",
          "summary": "بيان وجوب الوفاء بالعهد ونبذه عند خيانة المعاهد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-11",
          "surahNumber": 8,
          "startAyah": 59,
          "endAyah": 64,
          "title": "الإعداد للعدوّ والصبر",
          "summary": "بيان الأمر بإعداد القوة والصبر وأن الله وليّ المؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-12",
          "surahNumber": 8,
          "startAyah": 65,
          "endAyah": 69,
          "title": "النصر على الأضعاف وحكم الغنائم",
          "summary": "بيان وعد الله بنصر الفئة المؤمنة وبيان حكم الغنائم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-13",
          "surahNumber": 8,
          "startAyah": 70,
          "endAyah": 71,
          "title": "الأسارى وموقفهم من الإيمان",
          "summary": "بيان معاملة الرسول للأسرى وإرادة الله بهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s008-14",
          "surahNumber": 8,
          "startAyah": 72,
          "endAyah": 75,
          "title": "الولاء والهجرة والنصرة",
          "summary": "بيان أحكام الولاء والهجرة ونصرة المستضعفين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 9,
      "surahName": "التوبة",
      "ayahCount": 129,
      "status": "documented",
      "sections": [
        {
          "id": "s009-01",
          "surahNumber": 9,
          "startAyah": 1,
          "endAyah": 6,
          "title": "براءة من عهود المشركين",
          "summary": "بيان إعلان البراءة من المشركين وأحكام العهود والإجارة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-02",
          "surahNumber": 9,
          "startAyah": 7,
          "endAyah": 11,
          "title": "الوفاء بالعهد المشترك",
          "summary": "بيان وجوب الوفاء بالعهد مع من وفى وشرط الاستقامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-03",
          "surahNumber": 9,
          "startAyah": 12,
          "endAyah": 16,
          "title": "قتال من ينكث العهد",
          "summary": "بيان وجوب قتال أئمة الكفر وناقضي العهود وتخلّف المنافقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-04",
          "surahNumber": 9,
          "startAyah": 17,
          "endAyah": 18,
          "title": "عمارة المساجد بالإيمان",
          "summary": "بيان أن مساجد الله يعمّرها من آمن بالله واليوم الآخر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-05",
          "surahNumber": 9,
          "startAyah": 19,
          "endAyah": 22,
          "title": "لا يستوي السقاية والإيمان والتقوى",
          "summary": "بيان تفاضل الإيمان والتقوى والهجرة والجهاد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-06",
          "surahNumber": 9,
          "startAyah": 23,
          "endAyah": 24,
          "title": "النهي عن موالاة الكفار من الأقارب",
          "summary": "بيان النهي عن ولاية من فضّل الكفر على الإيمان من الأقارب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-07",
          "surahNumber": 9,
          "startAyah": 25,
          "endAyah": 27,
          "title": "نصر الله في حنين والتوبة على من يشاء",
          "summary": "بيان نصر الله في مواطن كثيرة ويوم حنين وأنه يتوب على من يشاء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-08",
          "surahNumber": 9,
          "startAyah": 28,
          "endAyah": 29,
          "title": "منع المشركين من المسجد الحرام",
          "summary": "بيان منع المشركين من المسجد الحرام ووجوب قتال أهل الكتاب المخالفين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-09",
          "surahNumber": 9,
          "startAyah": 30,
          "endAyah": 33,
          "title": "قول أهل الكتاب في العزير والمسيح",
          "summary": "بيان دعوى أهل الكتاب البنوّة وردّها وإظهار دين الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-10",
          "surahNumber": 9,
          "startAyah": 34,
          "endAyah": 35,
          "title": "ذم الأحبار والرهبان وأكل الأموال",
          "summary": "بيان أكل الأحبار والرهبان أموال الناس بالباطل وكنز الذهب والفضة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-11",
          "surahNumber": 9,
          "startAyah": 36,
          "endAyah": 37,
          "title": "الأشهر الحرم والنسيء",
          "summary": "بيان عدد الشهور وأن أربعة منها حرم وذم النسيء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-12",
          "surahNumber": 9,
          "startAyah": 38,
          "endAyah": 42,
          "title": "الأمر بالنفير ولوم المتخلفين",
          "summary": "بيان لوم المتخلفين عن النفير وبيان نصرة الله لدينه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-13",
          "surahNumber": 9,
          "startAyah": 43,
          "endAyah": 48,
          "title": "المتخلفون عن الجهاد من المنافقين",
          "summary": "بيان كشف حال المتخلفين وأنهم من المنافقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-14",
          "surahNumber": 9,
          "startAyah": 49,
          "endAyah": 59,
          "title": "أعذار المنافقين وتقاعسهم",
          "summary": "بيان أعذار المنافقين وطمعهم في الإنفاق وموقفهم من الصدقات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-15",
          "surahNumber": 9,
          "startAyah": 60,
          "endAyah": 60,
          "title": "مصارف الزكاة",
          "summary": "بيان مصارف الزكاة الثمانية المقرّرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-16",
          "surahNumber": 9,
          "startAyah": 61,
          "endAyah": 63,
          "title": "النهي عن أذى النبي",
          "summary": "بيان إيذاء المنافقين للرسول وإنذار من يستهزئ بالله ورسوله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-17",
          "surahNumber": 9,
          "startAyah": 64,
          "endAyah": 66,
          "title": "جزاء من يتخذ الدين هزوًا",
          "summary": "بيان وعيد من يستخفّ بأمر الله ورسوله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-18",
          "surahNumber": 9,
          "startAyah": 67,
          "endAyah": 70,
          "title": "صفات المنافقين والمنافقات",
          "summary": "بيان صفات المنافقين ونسيانهم الله فنسيهم وأن مالهم لا يغني.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-19",
          "surahNumber": 9,
          "startAyah": 71,
          "endAyah": 72,
          "title": "صفات المؤمنين والمؤمنات",
          "summary": "بيان ولاية المؤمنين بعضهم لبعض ووعدهم بجنات النعيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-20",
          "surahNumber": 9,
          "startAyah": 73,
          "endAyah": 74,
          "title": "جهاد الكفار والمنافقين",
          "summary": "بيان الأمر بجهاد الكفار والمنافقين وإحباط كيدهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-21",
          "surahNumber": 9,
          "startAyah": 75,
          "endAyah": 80,
          "title": "عهود المنافقين ونكثهم",
          "summary": "بيان عهدهم مع الله ثم نقضهم وفضيحة أحوالهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-22",
          "surahNumber": 9,
          "startAyah": 81,
          "endAyah": 89,
          "title": "تخلّف المنافقين والنهي عن الصلاة عليهم",
          "summary": "بيان فرح المتخلفين وهمّهم بالصدّ عن الجهاد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-23",
          "surahNumber": 9,
          "startAyah": 90,
          "endAyah": 93,
          "title": "أصحاب الأعذار المبيحة للتخلف",
          "summary": "بيان المعذورين شرعًا وذم من تخلّف عن الرسول بغير عذر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-24",
          "surahNumber": 9,
          "startAyah": 94,
          "endAyah": 99,
          "title": "اعتذار المنافقين وحال الأعراب",
          "summary": "بيان اعتذارهم عند الرجوع وتفاوت الأعراب بين النفاق والإيمان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-25",
          "surahNumber": 9,
          "startAyah": 100,
          "endAyah": 110,
          "title": "السابقون ومسجد الضرار",
          "summary": "بيان فضل السابقين وذم المنافقين وبناء مسجد الضرار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-26",
          "surahNumber": 9,
          "startAyah": 111,
          "endAyah": 112,
          "title": "شراء الله أنفس المؤمنين بالجنة",
          "summary": "بيان أن الله اشترى من المؤمنين أنفسهم وأموالهم بالجنة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-27",
          "surahNumber": 9,
          "startAyah": 113,
          "endAyah": 116,
          "title": "النهي عن الاستغفار للمشركين",
          "summary": "بيان النهي عن الاستغفار للمشركين وبيان أن الله عليم حكيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-28",
          "surahNumber": 9,
          "startAyah": 117,
          "endAyah": 118,
          "title": "توبة الله على الثلاثة الذين خُلّفوا",
          "summary": "بيان عفو الله عن النبي والمهاجرين وقبول توبة الثلاثة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-29",
          "surahNumber": 9,
          "startAyah": 119,
          "endAyah": 122,
          "title": "التفقّه في الدين والنفير",
          "summary": "بيان الأمر بالتقوى وأن التفقه في الدين واجب على الطائفة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-30",
          "surahNumber": 9,
          "startAyah": 123,
          "endAyah": 127,
          "title": "زيادة الإيمان بآيات الله",
          "summary": "بيان أن الآيات تزيد المؤمنين إيمانًا وتردّ المنافقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s009-31",
          "surahNumber": 9,
          "startAyah": 128,
          "endAyah": 129,
          "title": "رأفة النبي بالمؤمنين ودعاؤه",
          "summary": "بيان رحمة النبي بالمؤمنين وأمره بالتوكل على الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 10,
      "surahName": "يونس",
      "ayahCount": 109,
      "status": "documented",
      "sections": [
        {
          "id": "s010-01",
          "surahNumber": 10,
          "startAyah": 1,
          "endAyah": 2,
          "title": "القرآن الحكيم وتعجّب المكذبين",
          "summary": "بيان أن القرآن حكمة وأن تعجّبهم من مجيء نذير منهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-02",
          "surahNumber": 10,
          "startAyah": 3,
          "endAyah": 5,
          "title": "خلق السماوات وتدبير الأمر",
          "summary": "بيان خلق السماوات والأرض في ستة أيام وبدء الخلق وإعادته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-03",
          "surahNumber": 10,
          "startAyah": 6,
          "endAyah": 10,
          "title": "آيات اختلاف الليل والنهار",
          "summary": "بيان آيات اختلاف الليل والنهار وما في ذلك لأولي الألباب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-04",
          "surahNumber": 10,
          "startAyah": 11,
          "endAyah": 17,
          "title": "استعجال الشرّ وافتراء المكذبين",
          "summary": "بيان أن الله لو يعجّل للناس الشرّ لهلكوا وافتراء المكذبين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-05",
          "surahNumber": 10,
          "startAyah": 18,
          "endAyah": 20,
          "title": "بطلان الآلهة المزعومة وكثرة الاختلاف",
          "summary": "بيان أن ما يُعبد من دون الله لا يضرّ ولا ينفع وأن الناس كانوا أمة واحدة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-06",
          "surahNumber": 10,
          "startAyah": 21,
          "endAyah": 23,
          "title": "دعاء المضطرّين ونقض العهد",
          "summary": "بيان أن الناس يدعون الله عند الضرّ ثم يعتدون بعد النجاة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-07",
          "surahNumber": 10,
          "startAyah": 24,
          "endAyah": 24,
          "title": "مثل الحياة الدنيا",
          "summary": "بيان مثال الحياة الدنيا كالماء الذي أُنزل من السماء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-08",
          "surahNumber": 10,
          "startAyah": 25,
          "endAyah": 30,
          "title": "دار السلام وعاقبة الفرقاء",
          "summary": "بيان دعوة الله إلى دار السلام وموقف المشركين يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-09",
          "surahNumber": 10,
          "startAyah": 31,
          "endAyah": 36,
          "title": "من يرزقكم ومن يُخرج الحيّ من الميت",
          "summary": "بيان أدلة التوحيد وبطلان ما يشركون به.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-10",
          "surahNumber": 10,
          "startAyah": 37,
          "endAyah": 40,
          "title": "صدق القرآن وأنه من عند الله",
          "summary": "بيان أن القرآن من عند الله ولا يبدّل كلامه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-11",
          "surahNumber": 10,
          "startAyah": 41,
          "endAyah": 46,
          "title": "خسارة من كذّب بالقرآن",
          "summary": "بيان أن من كذّب بالقرآن خسر وأن لله حكمه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-12",
          "surahNumber": 10,
          "startAyah": 47,
          "endAyah": 53,
          "title": "لكل أمة رسول ويوم الجمع",
          "summary": "بيان أن لكل أمة رسولًا وأن موعدهم يوم يجمع الله فيه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-13",
          "surahNumber": 10,
          "startAyah": 54,
          "endAyah": 56,
          "title": "لو أن للمجرمين ما في الأرض لافتدوا به",
          "summary": "بيان أن المجرمين يفتدون بكل شيء ولا يُقبل منهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-14",
          "surahNumber": 10,
          "startAyah": 57,
          "endAyah": 60,
          "title": "موعظة وشفاء ورحمة",
          "summary": "بيان أن القرآن موعظة وشفاء لما في الصدور ورحمة للمؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-15",
          "surahNumber": 10,
          "startAyah": 61,
          "endAyah": 65,
          "title": "علم الله بما في السماوات والأرض",
          "summary": "بيان إحاطة علم الله بكل شيء وأن أولياء الله لا خوف عليهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-16",
          "surahNumber": 10,
          "startAyah": 66,
          "endAyah": 70,
          "title": "بطلان ظنّ المشركين وكذبهم",
          "summary": "بيان أن المشركين يتبعون الظن وأن الله غني عنهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-17",
          "surahNumber": 10,
          "startAyah": 71,
          "endAyah": 73,
          "title": "دعوة نوح وإنجاؤه",
          "summary": "بيان دعوة نوح قومه وتكذيبهم ونجاته ومن معه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-18",
          "surahNumber": 10,
          "startAyah": 74,
          "endAyah": 82,
          "title": "إرسال موسى وهارون إلى فرعون",
          "summary": "بيان بعثة الرسل من بعد نوح وأن موسى أُرسل إلى فرعون بآياته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-19",
          "surahNumber": 10,
          "startAyah": 83,
          "endAyah": 92,
          "title": "نجاة بني إسرائيل وإغراق فرعون",
          "summary": "بيان إيمان القليل مع موسى وإنجاء بني إسرائيل وإغراق فرعون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-20",
          "surahNumber": 10,
          "startAyah": 93,
          "endAyah": 95,
          "title": "تبوّؤ بني إسرائيل واختلافهم",
          "summary": "بيان إسكان الله بني إسرائيل صالح الأرض واختلافهم بعد العلم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-21",
          "surahNumber": 10,
          "startAyah": 96,
          "endAyah": 98,
          "title": "لا ينفع الإيمان عند رؤية العذاب",
          "summary": "بيان أن الإيمان بعد رؤية البأس لا ينفع إلا قوم يونس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-22",
          "surahNumber": 10,
          "startAyah": 99,
          "endAyah": 103,
          "title": "لا تُكره الناس على الإيمان",
          "summary": "بيان أن مشيئة الله لو اقتضت لآمن الناس جميعًا وأن الإكراه لا يصنع إيمانًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-23",
          "surahNumber": 10,
          "startAyah": 104,
          "endAyah": 107,
          "title": "لا يضرّ ولا ينفع إلا الله",
          "summary": "بيان الأمر بعبادة الله وحده وردّ الضرّ والنفع إليه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s010-24",
          "surahNumber": 10,
          "startAyah": 108,
          "endAyah": 109,
          "title": "قد جاءكم الحق فمن اهتدى فلنفسه",
          "summary": "بيان أن الحق قد جاء وأن التبعة على العباد ووجوب اتّباع الوحي.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 11,
      "surahName": "هود",
      "ayahCount": 123,
      "status": "documented",
      "sections": [
        {
          "id": "s011-01",
          "surahNumber": 11,
          "startAyah": 1,
          "endAyah": 5,
          "title": "إحكام آيات الكتاب ومشيئة الله",
          "summary": "بيان إحكام آيات القرآن وتفصيلها وأن الخير بيد الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-02",
          "surahNumber": 11,
          "startAyah": 6,
          "endAyah": 8,
          "title": "رزق الله لكل دابة ومآل الكتاب",
          "summary": "بيان أن على الله رزق كل دابة وأنه فطر السماوات والأرض وابتلى عباده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-03",
          "surahNumber": 11,
          "startAyah": 9,
          "endAyah": 14,
          "title": "جحود الإنسان للنعم والقرآن ليس مفترًى",
          "summary": "بيان أن الإنسان كفور بالنعم إلا المؤمنين وأن القرآن ليس مفترًى من النبي ﷺ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-04",
          "surahNumber": 11,
          "startAyah": 15,
          "endAyah": 24,
          "title": "أهل الكتاب بين من يرى الحقّ ومن يعرض",
          "summary": "بيان أن أهل الكتاب صنفان من يرى الحقّ وصنف من يختار الإعراض عنه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-05",
          "surahNumber": 11,
          "startAyah": 25,
          "endAyah": 35,
          "title": "دعوة نوح وتحدّي قومه له",
          "summary": "بيان خطاب نوح لقومه وتحدّيهم له وطلبهم عذاب الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-06",
          "surahNumber": 11,
          "startAyah": 36,
          "endAyah": 39,
          "title": "أمر الله نوحًا ببناء السفينة",
          "summary": "بيان أمر الله لنوح بأن يبني السفينة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-07",
          "surahNumber": 11,
          "startAyah": 40,
          "endAyah": 41,
          "title": "أمر الله نوحًا بإركاب المؤمنين",
          "summary": "بيان أمر الله لنوح بإركاب المؤمنين ومن كل زوجين اثنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-08",
          "surahNumber": 11,
          "startAyah": 42,
          "endAyah": 49,
          "title": "حوار نوح وابنه وموقف الله",
          "summary": "بيان حوار نوح مع ابنه ونداء الله ومصير الكافرين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-09",
          "surahNumber": 11,
          "startAyah": 50,
          "endAyah": 60,
          "title": "دعوة هود قومه وتكذيبهم وعاقبتهم",
          "summary": "بيان خطاب هود لقومه وتكذيبهم له وما آل إليه أمرهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-10",
          "surahNumber": 11,
          "startAyah": 61,
          "endAyah": 68,
          "title": "دعوة صالح قومه وتكذيبهم وعاقبتهم",
          "summary": "بيان خطاب صالح لقومه ثمود وتكذيبهم وعاقبتهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-11",
          "surahNumber": 11,
          "startAyah": 69,
          "endAyah": 76,
          "title": "بشرى إبراهيم بإسحاق ومن ورائه يعقوب",
          "summary": "بيان بشارة الملائكة لإبراهيم بإسحاق ومن وراء إسحاق يعقوب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-12",
          "surahNumber": 11,
          "startAyah": 77,
          "endAyah": 83,
          "title": "دعوة لوط قومه وتكذيبهم وعاقبتهم",
          "summary": "بيان خطاب لوط لقومه وتكذيبهم وما نزل بهم من العذاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-13",
          "surahNumber": 11,
          "startAyah": 84,
          "endAyah": 95,
          "title": "دعوة شعيب قومه المطفّفين وعاقبتهم",
          "summary": "بيان خطاب شعيب لقومه الناقصين في التجارة وتكذيبهم وعاقبتهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-14",
          "surahNumber": 11,
          "startAyah": 96,
          "endAyah": 109,
          "title": "مصير فرعون وملئه بعد الإنذار",
          "summary": "بيان عاقبة فرعون وملئه الذين أُنذروا فأعرضوا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-15",
          "surahNumber": 11,
          "startAyah": 110,
          "endAyah": 113,
          "title": "اختلاف بني إسرائيل في التوراة",
          "summary": "بيان أن الاختلاف في التوراة نشأ بسبب عدم إيمان أتباع موسى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-16",
          "surahNumber": 11,
          "startAyah": 114,
          "endAyah": 117,
          "title": "الحسنات يُذهبن السيئات",
          "summary": "بيان أن الحسنات تُذهب السيئات وأن الله لا يضيع أجر المصلحين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s011-17",
          "surahNumber": 11,
          "startAyah": 118,
          "endAyah": 123,
          "title": "حرية الاختيار بمشيئة الله",
          "summary": "بيان أن اختلاف الناس بمشيئة الله وأن الأمر كله لله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 12,
      "surahName": "يوسف",
      "ayahCount": 111,
      "status": "documented",
      "sections": [
        {
          "id": "s012-01",
          "surahNumber": 12,
          "startAyah": 1,
          "endAyah": 3,
          "title": "إنزال القرآن باللسان العربي",
          "summary": "بيان أن القرآن أُنزل بلسان عربي مبين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-02",
          "surahNumber": 12,
          "startAyah": 4,
          "endAyah": 6,
          "title": "قصة يوسف عليه السلام",
          "summary": "بيان بداية قصة يوسف ورؤياه واصطفاء الله له.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-03",
          "surahNumber": 12,
          "startAyah": 7,
          "endAyah": 10,
          "title": "عبرة في قصة يوسف للسائلين",
          "summary": "بيان أن في قصة يوسف لعبرة للسائلين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-04",
          "surahNumber": 12,
          "startAyah": 11,
          "endAyah": 15,
          "title": "إخوة يوسف وألقُه في الجبّ",
          "summary": "بيان طلب إخوة يوسف أخاهم والاستيثاق به وإلقائه في الجبّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-05",
          "surahNumber": 12,
          "startAyah": 16,
          "endAyah": 18,
          "title": "ادّعاء الإخوة أن الذئب أكل يوسف",
          "summary": "بيان مجيء الإخوة عشاءً بدم كذب وادّعائهم أن الذئب أكله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-06",
          "surahNumber": 12,
          "startAyah": 19,
          "endAyah": 20,
          "title": "بيع يوسف بثمن بخس في مصر",
          "summary": "بيان التقاط السيارة ليوسف وبيعه بثمن بخس في مصر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-07",
          "surahNumber": 12,
          "startAyah": 21,
          "endAyah": 22,
          "title": "إكرام مشتري يوسف له بمصر",
          "summary": "بيان إكرام مشتري يوسف له وتنشئته في داره.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-08",
          "surahNumber": 12,
          "startAyah": 23,
          "endAyah": 29,
          "title": "مراودة امرأة العزيز وحفظ الله ليوسف",
          "summary": "بيان مراودة امرأة العزيز يوسف وحفظ الله له وتبرئته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-09",
          "surahNumber": 12,
          "startAyah": 30,
          "endAyah": 35,
          "title": "مكر نسوة المدينة وطلب يوسف السجن",
          "summary": "بيان مكر نسوة المدينة ودعوتهنّ يوسف ثم عزمه على السجن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-10",
          "surahNumber": 12,
          "startAyah": 36,
          "endAyah": 42,
          "title": "تأويل يوسف لرؤيا رفيقيه في السجن",
          "summary": "بيان رؤيا الفتيين في السجن وتأويل يوسف ودعوته لهما.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-11",
          "surahNumber": 12,
          "startAyah": 43,
          "endAyah": 49,
          "title": "رؤيا الملك وتأويل يوسف لها",
          "summary": "بيان رؤيا الملك ودعوته لتأويلها وتأويل يوسف عليه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-12",
          "surahNumber": 12,
          "startAyah": 50,
          "endAyah": 52,
          "title": "استقصاء الملك قضية يوسف وتبرئته",
          "summary": "بيان سؤال الملك عن شأن يوسف وتبيّن براءته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-13",
          "surahNumber": 12,
          "startAyah": 53,
          "endAyah": 57,
          "title": "تمكين يوسف في الأرض",
          "summary": "بيان تمكين يوسف في الأرض وجعله على خزائنها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-14",
          "surahNumber": 12,
          "startAyah": 58,
          "endAyah": 62,
          "title": "مجيء إخوة يوسف للميرة وطلب بنيامين",
          "summary": "بيان قدوم إخوة يوسف للميرة وطلب يوسف أن يأتوه بأخيهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-15",
          "surahNumber": 12,
          "startAyah": 63,
          "endAyah": 68,
          "title": "طلب الإخوة بنيامين ووصية يعقوب",
          "summary": "بيان طلبهم من أبيهم إرسال بنيامين ووصية يعقوب لهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-16",
          "surahNumber": 12,
          "startAyah": 69,
          "endAyah": 79,
          "title": "كشف يوسف لأخيه واتهام بنيامين",
          "summary": "بيان إخبار يوسف أخاه بنفسه واتهام بنيامين بالسرقة للاحتباس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-17",
          "surahNumber": 12,
          "startAyah": 80,
          "endAyah": 87,
          "title": "رجوع الإخوة إلى أبيهم وإرسالهم ثانية",
          "summary": "بيان رجوع الإخوة إلى أبيهم وإخباره بأمر بنيامين وإرسالهم ثانيًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-18",
          "surahNumber": 12,
          "startAyah": 88,
          "endAyah": 93,
          "title": "كشف يوسف عن نفسه وعفوه عن إخوته",
          "summary": "بيان مجيئهم ليوسف وكشفه لهم عن نفسه وعفوه عن إخوته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-19",
          "surahNumber": 12,
          "startAyah": 94,
          "endAyah": 98,
          "title": "بشارة يعقوب بابنه يوسف",
          "summary": "بيان بشارة يعقوب بنجاة ابنه يوسف وارتداد بصره.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-20",
          "surahNumber": 12,
          "startAyah": 99,
          "endAyah": 104,
          "title": "انتقال أهل يعقوب إلى مصر ودعاء يوسف",
          "summary": "بيان انتقال أهل يعقوب إلى مصر ودعاء يوسف بأن يُميته مسلمًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-21",
          "surahNumber": 12,
          "startAyah": 105,
          "endAyah": 108,
          "title": "شرك أكثر الناس مع ادّعاء الإيمان",
          "summary": "بيان أن أكثر الناس لا يؤمنون وأن معظمهم مشركون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s012-22",
          "surahNumber": 12,
          "startAyah": 109,
          "endAyah": 111,
          "title": "رسل الله بشر وقصة يوسف عبرة",
          "summary": "بيان أن الرسل بشر وأن في قصة يوسف عبرة لأولي الألباب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 13,
      "surahName": "الرعد",
      "ayahCount": 43,
      "status": "documented",
      "sections": [
        {
          "id": "s013-01",
          "surahNumber": 13,
          "startAyah": 1,
          "endAyah": 3,
          "title": "إنزال القرآن من خالق السماوات والأرض",
          "summary": "بيان أن القرآن من عند الله خالق السماوات والأرض.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s013-02",
          "surahNumber": 13,
          "startAyah": 4,
          "endAyah": 7,
          "title": "آيات الثمار وهداية كل قوم",
          "summary": "بيان اختلاف الثمار وأن لكل قوم هاديًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s013-03",
          "surahNumber": 13,
          "startAyah": 8,
          "endAyah": 15,
          "title": "تغيير الأحوال بإرادة الناس والدعاء",
          "summary": "بيان أن الله لا يغيّر حال قوم حتى يغيّروا ما بأنفسهم وإخلاص الدعاء له.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s013-04",
          "surahNumber": 13,
          "startAyah": 16,
          "endAyah": 18,
          "title": "عجز الآلهة ومصير من لم يستجب",
          "summary": "بيان عجز ما يُعبد من دون الله ومصير من لا يستجيب لربه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s013-05",
          "surahNumber": 13,
          "startAyah": 19,
          "endAyah": 26,
          "title": "جزاء الوفاء بالعهد ونقضه",
          "summary": "بيان جزاء من أوفى بعهد الله ومن نقضه في الدارين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s013-06",
          "surahNumber": 13,
          "startAyah": 27,
          "endAyah": 29,
          "title": "بذكر الله تطمئنّ القلوب",
          "summary": "بيان أن القلوب تطمئنّ بذكر الله وأن الهدى لمن أناب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s013-07",
          "surahNumber": 13,
          "startAyah": 30,
          "endAyah": 31,
          "title": "لا إله إلا هو وخضوع كل شيء لأمره",
          "summary": "بيان وحدانية الله وأن الأمور كلها بيده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s013-08",
          "surahNumber": 13,
          "startAyah": 32,
          "endAyah": 34,
          "title": "رقابة الله على كل نفس",
          "summary": "بيان إحاطة الله بكل نفس وما كسبت.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s013-09",
          "surahNumber": 13,
          "startAyah": 35,
          "endAyah": 37,
          "title": "إنزال القرآن عربيًا للفهم",
          "summary": "بيان أن القرآن أُنزل بلسان عربي ليتدبّره الناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s013-10",
          "surahNumber": 13,
          "startAyah": 38,
          "endAyah": 43,
          "title": "الرسل بشر والآيات بإذن الله",
          "summary": "بيان أن الرسل بشر لا يأتون بآية إلا بإذن الله وأن الأمر لله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 14,
      "surahName": "إبراهيم",
      "ayahCount": 52,
      "status": "documented",
      "sections": [
        {
          "id": "s014-01",
          "surahNumber": 14,
          "startAyah": 1,
          "endAyah": 3,
          "title": "إنزال الكتاب لإخراج الناس من الظلمات",
          "summary": "بيان أن الكتاب أُنزل ليُخرج الناس من الظلمات إلى النور.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-02",
          "surahNumber": 14,
          "startAyah": 4,
          "endAyah": 4,
          "title": "رسل الله بلسان أقوامهم",
          "summary": "بيان أن كل رسول أُرسل بلسان قومه ليبين لهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-03",
          "surahNumber": 14,
          "startAyah": 5,
          "endAyah": 6,
          "title": "إرسال موسى لإخراج قومه من الظلمات",
          "summary": "بيان إرسال موسى إلى قومه ليُخرجهم من الظلمات إلى النور.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-04",
          "surahNumber": 14,
          "startAyah": 7,
          "endAyah": 12,
          "title": "غنى الله عن الخلق وتوكّل المؤمنين",
          "summary": "بيان أن كفر أهل الأرض لا يضرّ الله وعلى المؤمنين التوكل عليه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-05",
          "surahNumber": 14,
          "startAyah": 13,
          "endAyah": 17,
          "title": "عاقبة الظالمين وجزاء المتقين",
          "summary": "بيان إهلاك الظالمين ونعيم من خاف مقام الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-06",
          "surahNumber": 14,
          "startAyah": 18,
          "endAyah": 21,
          "title": "خلق السماوات والأرض بالحقّ",
          "summary": "بيان أن الله خلق السماوات والأرض بالحقّ وأن وعد الله حقّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-07",
          "surahNumber": 14,
          "startAyah": 22,
          "endAyah": 22,
          "title": "دعوة الشيطان واتّباع الناس له",
          "summary": "بيان أن الشيطان يدعو بغير سلطان وأن الناس يتّبعون دعوته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-08",
          "surahNumber": 14,
          "startAyah": 23,
          "endAyah": 23,
          "title": "تحية أهل الجنة فيها السلام",
          "summary": "بيان أن تحية أهل الجنة فيها السلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-09",
          "surahNumber": 14,
          "startAyah": 24,
          "endAyah": 27,
          "title": "مثل الكلمة الطيبة والخبيثة",
          "summary": "بيان مثل الكلمة الطيبة والخبيثة وأن الله يضرب الأمثال للناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-10",
          "surahNumber": 14,
          "startAyah": 28,
          "endAyah": 34,
          "title": "جحود نعم الله وعاقبة الكافرين",
          "summary": "بيان جزاء من يكفر بنعم الله وذكر آلائه التي لا تُعدّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-11",
          "surahNumber": 14,
          "startAyah": 35,
          "endAyah": 41,
          "title": "دعاء إبراهيم لمكة وأهلها",
          "summary": "بيان دعاء إبراهيم لمكة وأهلها وتمام الأمر على الإسلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-12",
          "surahNumber": 14,
          "startAyah": 42,
          "endAyah": 51,
          "title": "علم الله بالظالمين ووفاؤه وعده",
          "summary": "بيان أن الله لا يغفل عن عمل الظالمين وأنه لا يخلف وعده لرسله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s014-13",
          "surahNumber": 14,
          "startAyah": 52,
          "endAyah": 52,
          "title": "الله الإله الواحد",
          "summary": "بيان أن الله هو الإله الواحد وأن القرآن بلاغ للناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 15,
      "surahName": "الحجر",
      "ayahCount": 99,
      "status": "documented",
      "sections": [
        {
          "id": "s015-01",
          "surahNumber": 15,
          "startAyah": 1,
          "endAyah": 1,
          "title": "القرآن كتاب الله المبين",
          "summary": "بيان أن القرآن كتاب الله المبين الذي أُنزل على نبيه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s015-02",
          "surahNumber": 15,
          "startAyah": 2,
          "endAyah": 15,
          "title": "تمنّي الكافرين وحفظ القرآن",
          "summary": "بيان تمنّي الكافرين لو كانوا مسلمين وتكفّل الله بحفظ القرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s015-03",
          "surahNumber": 15,
          "startAyah": 16,
          "endAyah": 25,
          "title": "زينة السماء وتيسير الأرض للعيش",
          "summary": "بيان خلق النجوم في السماء وما في الأرض من أرزاق البشر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s015-04",
          "surahNumber": 15,
          "startAyah": 26,
          "endAyah": 44,
          "title": "خلق آدم وسجود الملائكة وإباء إبليس",
          "summary": "بيان خلق آدم وسجود الملائكة له وإباء إبليس ومصير أتباعه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s015-05",
          "surahNumber": 15,
          "startAyah": 45,
          "endAyah": 50,
          "title": "جزاء المتقين في الجنة",
          "summary": "بيان أن المتقين في جنات وعيون ونعيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s015-06",
          "surahNumber": 15,
          "startAyah": 51,
          "endAyah": 60,
          "title": "بشارة إبراهيم بالغلام العليم",
          "summary": "بيان مجيء الملائكة لإبراهيم وبشارتهم له بالغلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s015-07",
          "surahNumber": 15,
          "startAyah": 61,
          "endAyah": 79,
          "title": "مجيء الملائكة إلى لوط وإهلاك قومه",
          "summary": "بيان مجيء الملائكة إلى لوط وأمره بإسراء أهله وإهلاك قومه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s015-08",
          "surahNumber": 15,
          "startAyah": 80,
          "endAyah": 86,
          "title": "عذاب أصحاب الحجر بتكذيبهم",
          "summary": "بيان إهلاك أصحاب الحجر بسبب تكذيبهم الرسل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s015-09",
          "surahNumber": 15,
          "startAyah": 87,
          "endAyah": 99,
          "title": "السبع المثاني والجهر بالدعوة",
          "summary": "بيان أن الفاتحة سبع آيات مثانٍ وأمر الرسول بالجهر والإعراض عن المشركين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 16,
      "surahName": "النحل",
      "ayahCount": 128,
      "status": "documented",
      "sections": [
        {
          "id": "s016-01",
          "surahNumber": 16,
          "startAyah": 1,
          "endAyah": 9,
          "title": "إنذار الله وخلق الأنعام لمنافع الناس",
          "summary": "بيان أن الله أنزل الوحي للإنذار وخلق الأنعام لمنافع البشر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-02",
          "surahNumber": 16,
          "startAyah": 10,
          "endAyah": 21,
          "title": "الماء والجبال ونعم الله التي لا تُحصى",
          "summary": "بيان إنزال الماء وتثبيت الجبال وأن نعم الله لا تُحصى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-03",
          "surahNumber": 16,
          "startAyah": 22,
          "endAyah": 25,
          "title": "استكبار الكافرين ومحاسبتهم",
          "summary": "بيان استكبار الكافرين وحملهم أوزارهم يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-04",
          "surahNumber": 16,
          "startAyah": 26,
          "endAyah": 34,
          "title": "جزاء المستكبرين والظالمين والمتقين",
          "summary": "بيان إهانة الله للمستكبرين وإدخال المتقين الجنة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-05",
          "surahNumber": 16,
          "startAyah": 35,
          "endAyah": 40,
          "title": "إرسال الرسل وردّ حجة المشركين",
          "summary": "بيان إرسال الرسل وإبطال قول المشركين لو شاء الله ما أشركنا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-06",
          "surahNumber": 16,
          "startAyah": 41,
          "endAyah": 44,
          "title": "وعد الله للمهاجرين في سبيله",
          "summary": "بيان وعد الله الحسنى لمن هاجر في سبيله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-07",
          "surahNumber": 16,
          "startAyah": 45,
          "endAyah": 50,
          "title": "أمن الكافرين من مكر الله",
          "summary": "بيان تحذير الكافرين من وقوع بأس الله إياهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-08",
          "surahNumber": 16,
          "startAyah": 51,
          "endAyah": 60,
          "title": "دعاء المشركين لله عند الضرّ",
          "summary": "بيان دعاء المشركين الله وحده عند الشدة ثم إشراكهم بعد النجاة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-09",
          "surahNumber": 16,
          "startAyah": 61,
          "endAyah": 65,
          "title": "إمهال الله للظالمين وإحياء الأرض بالماء",
          "summary": "بيان أن الله يمهل الظالمين ويُحيي الأرض الميتة بالماء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-10",
          "surahNumber": 16,
          "startAyah": 66,
          "endAyah": 70,
          "title": "العبرة في الأنعام والنحل",
          "summary": "بيان العبرة في الأنعام والنحل ونعم الله على عباده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-11",
          "surahNumber": 16,
          "startAyah": 71,
          "endAyah": 76,
          "title": "العبرة في خلق الإنسان وبطلان الآلهة",
          "summary": "بيان أن في خلق الإنسان آية وأن ما يُعبد من دون الله لا يقدر على شيء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-12",
          "surahNumber": 16,
          "startAyah": 77,
          "endAyah": 83,
          "title": "آيات الله في الطير والأنعام",
          "summary": "بيان قدرة الله وآياته في الطير والأنعام ونعمه على العباد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-13",
          "surahNumber": 16,
          "startAyah": 84,
          "endAyah": 89,
          "title": "شهادة الأنبياء وبراءة المعبودات",
          "summary": "بيان إقامة شهيد من كل أمة وبراءة الشركاء يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-14",
          "surahNumber": 16,
          "startAyah": 90,
          "endAyah": 94,
          "title": "الأمر بالعدل والإحسان والنهي عن الفحشاء",
          "summary": "بيان أمر الله بالعدل والإحسان ونهيه عن الفحشاء والمنكر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-15",
          "surahNumber": 16,
          "startAyah": 95,
          "endAyah": 100,
          "title": "ثواب الله الباقي والاستعاذة عند القراءة",
          "summary": "بيان أن ما عند الله خير وأبقى وأن يُستعاذ بالله عند قراءة القرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-16",
          "surahNumber": 16,
          "startAyah": 101,
          "endAyah": 110,
          "title": "افتراء المشركين على النبي وعربية القرآن",
          "summary": "بيان افتراء المشركين بأن النبي يُعلّمه بشر وأن القرآن بلسان عربي.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-17",
          "surahNumber": 16,
          "startAyah": 111,
          "endAyah": 119,
          "title": "النهي عن الكذب في الحلال والحرام",
          "summary": "بيان تحذير الله من تحريم ما أحلّه أو تحليل ما حرّمه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-18",
          "surahNumber": 16,
          "startAyah": 120,
          "endAyah": 124,
          "title": "إبراهيم أمة قانت لله",
          "summary": "بيان أن إبراهيم كان أمة قانتًا لله حنيفًا ولم يكُ من المشركين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s016-19",
          "surahNumber": 16,
          "startAyah": 125,
          "endAyah": 128,
          "title": "الدعوة إلى الله بالحكمة والموعظة",
          "summary": "بيان أمر الله بالدعوة إليه بالحكمة والموعظة الحسنة والصبر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 17,
      "surahName": "الإسراء",
      "ayahCount": 111,
      "status": "documented",
      "sections": [
        {
          "id": "s017-01",
          "surahNumber": 17,
          "startAyah": 1,
          "endAyah": 1,
          "title": "الإسراء بالنبي ﷺ",
          "summary": "بيان إسراء الله بنبيه ﷺ ليلًا من المسجد الحرام إلى المسجد الأقصى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-02",
          "surahNumber": 17,
          "startAyah": 2,
          "endAyah": 10,
          "title": "إفساد بني إسرائيل ووعد الله",
          "summary": "بيان إخبار الله بفساد بني إسرائيل مرتين وإنزال القرآن هاديًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-03",
          "surahNumber": 17,
          "startAyah": 11,
          "endAyah": 14,
          "title": "إعطاء كتاب الأعمال يوم القيامة",
          "summary": "بيان أن كل إنسان يُعطى كتابه يوم القيامة ويُحاسب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-04",
          "surahNumber": 17,
          "startAyah": 15,
          "endAyah": 17,
          "title": "من اهتدى فلنفسه ومن ضلّ فعليها",
          "summary": "بيان أن الهدى والضلال يعودان على العبد وأن الله لا يهلك قومًا قبل الإنذار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-05",
          "surahNumber": 17,
          "startAyah": 18,
          "endAyah": 22,
          "title": "رغبة الدنيا وعاقبة الكافرين",
          "summary": "بيان أن من أراد العاجلة يُعطى فيها ومصيره جهنم في الآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-06",
          "surahNumber": 17,
          "startAyah": 23,
          "endAyah": 30,
          "title": "وصايا الله وبرّ الوالدين",
          "summary": "بيان وصايا الله للمؤمنين وبرّ الوالدين والإحسان إلى الأقرباء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-07",
          "surahNumber": 17,
          "startAyah": 31,
          "endAyah": 40,
          "title": "تتمة وصايا الله في الأموال والأنفس",
          "summary": "بيان تتمة وصايا الله في الأموال والأنفس والمعاملات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-08",
          "surahNumber": 17,
          "startAyah": 41,
          "endAyah": 44,
          "title": "لو كان معه آلهة لابتغوا إليه سبيلًا",
          "summary": "بيان بطلان تعدد الآلهة وتنزيه الله عما يقولون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-09",
          "surahNumber": 17,
          "startAyah": 45,
          "endAyah": 52,
          "title": "الحجاب عن فهم القرآن والإيمان بالبعث",
          "summary": "بيان أن الإيمان بالآخرة شرط لفهم القرآن وأن البعث حقّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-10",
          "surahNumber": 17,
          "startAyah": 53,
          "endAyah": 55,
          "title": "أمر المؤمنين بقول الأحسن",
          "summary": "بيان أمر الله المؤمنين بأن يقولوا أحسن القول.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-11",
          "surahNumber": 17,
          "startAyah": 56,
          "endAyah": 57,
          "title": "عجز المعبودات عن كشف الضرّ",
          "summary": "بيان أن ما يدعون من دون الله لا يكشف ضرًّا ولا ينفع.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-12",
          "surahNumber": 17,
          "startAyah": 58,
          "endAyah": 60,
          "title": "سبب عدم إنزال الآيات للنبي",
          "summary": "بيان حكمة الله في عدم إنزال الآيات التي طلبها المشركون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-13",
          "surahNumber": 17,
          "startAyah": 61,
          "endAyah": 65,
          "title": "عداء الشيطان للإنسان وتوعّده بإغوائه",
          "summary": "بيان إباء إبليس السجود لآدم وقسمه على إغواء بني آدم إلا المخلصين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-14",
          "surahNumber": 17,
          "startAyah": 66,
          "endAyah": 70,
          "title": "تيسير الركوب في البرّ والبحر",
          "summary": "بيان نعمة الله بتيسير السير في البرّ والبحر وتفضيل بني آدم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-15",
          "surahNumber": 17,
          "startAyah": 71,
          "endAyah": 72,
          "title": "دعوة كل أناس بإمامهم",
          "summary": "بيان أن يوم القيامة يُدعى كل أناس بإمامهم ويُحاسبون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-16",
          "surahNumber": 17,
          "startAyah": 73,
          "endAyah": 77,
          "title": "تثبيت الله لنبيه ورفض المساومة",
          "summary": "بيان تثبيت الله لنبيه ﷺ ورفض مصانعة المشركين في الدين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-17",
          "surahNumber": 17,
          "startAyah": 78,
          "endAyah": 84,
          "title": "الصلاة والتهجّد وشفاء القرآن",
          "summary": "بيان أوقات الصلاة والتهجّد وأن القرآن شفاء ورحمة للمؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-18",
          "surahNumber": 17,
          "startAyah": 85,
          "endAyah": 88,
          "title": "الروح بأمر الله وإعجاز القرآن",
          "summary": "بيان أن الروح بأمر الله وأن أحدًا لا يأتي بمثل القرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-19",
          "surahNumber": 17,
          "startAyah": 89,
          "endAyah": 93,
          "title": "تنوّع أساليب القرآن في التذكير",
          "summary": "بيان أن الله صرّف في القرآن من كل مثل ليفهم الناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-20",
          "surahNumber": 17,
          "startAyah": 94,
          "endAyah": 100,
          "title": "بشرية الرسل وإنكار البعث",
          "summary": "بيان أن الرسل بشر وأن الكافرين هم الذين يشكّون في البعث.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-21",
          "surahNumber": 17,
          "startAyah": 101,
          "endAyah": 104,
          "title": "آيات موسى التسع وعاقبة فرعون",
          "summary": "بيان أن موسى أُعطي تسع آيات بينات وأن فرعون كذّب فأُغرق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s017-22",
          "surahNumber": 17,
          "startAyah": 105,
          "endAyah": 111,
          "title": "إنزال القرآن بالحقّ وأدب القراءة",
          "summary": "بيان أن القرآن أُنزل بالحقّ منجّمًا وأن القراءة بين الجهر والإسرار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 18,
      "surahName": "الكهف",
      "ayahCount": 110,
      "status": "documented",
      "sections": [
        {
          "id": "s018-01",
          "surahNumber": 18,
          "startAyah": 1,
          "endAyah": 6,
          "title": "بشاعة قولهم اتخذ الله ولدًا",
          "summary": "بيان أن قول المشركين باتخاذ الله ولدًا إفك عظيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-02",
          "surahNumber": 18,
          "startAyah": 7,
          "endAyah": 12,
          "title": "قصة أصحاب الكهف",
          "summary": "بيان خبر أصحاب الكهف ولبثهم في كهفهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-03",
          "surahNumber": 18,
          "startAyah": 13,
          "endAyah": 17,
          "title": "فتية آمنوا بربهم ولجأوا إلى الكهف",
          "summary": "بيان أن الفتية صدّقوا بوحدانية الله فلجأوا إلى الكهف فرارًا بدينهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-04",
          "surahNumber": 18,
          "startAyah": 18,
          "endAyah": 20,
          "title": "نومهم في الكهف وبعثهم بعد سنين",
          "summary": "بيان أنهم ناموا في الكهف ثم أيقظهم الله بعد مئات السنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-05",
          "surahNumber": 18,
          "startAyah": 21,
          "endAyah": 22,
          "title": "كشف أمرهم لإثبات البعث واختلافهم في العدد",
          "summary": "بيان أن الله أظهر أمرهم لإثبات البعث، ثم وقع الخلاف في عددهم بدلًا من الاعتبار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-06",
          "surahNumber": 18,
          "startAyah": 23,
          "endAyah": 26,
          "title": "الأمر بقول إن شاء الله عند الوعد",
          "summary": "بيان الأمر بذكر مشيئة الله عند الوعد بعمل في المستقبل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-07",
          "surahNumber": 18,
          "startAyah": 27,
          "endAyah": 31,
          "title": "لا مبدّل لكلمات الله وتقرير حرية الاختيار",
          "summary": "بيان أنه لا أحد يبدّل كلمات الله، وأن الحق جاء منه فليؤمن أو ليكفر من يشاء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-08",
          "surahNumber": 18,
          "startAyah": 32,
          "endAyah": 44,
          "title": "مثل المؤمن والكافر",
          "summary": "بيان مثل رجل مؤمن ورجل كافر في الدنيا وعاقبة كلٍّ منهما.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-09",
          "surahNumber": 18,
          "startAyah": 45,
          "endAyah": 49,
          "title": "مثل الحياة الدنيا وصلتها بالآخرة",
          "summary": "بيان مثال الحياة الدنيا وسرعة زوالها مقارنة بالآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-10",
          "surahNumber": 18,
          "startAyah": 50,
          "endAyah": 53,
          "title": "عاقبة من اتبع الشيطان وأشرك",
          "summary": "بيان مصير من تبع الشيطان وأشرك بالله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-11",
          "surahNumber": 18,
          "startAyah": 54,
          "endAyah": 59,
          "title": "تنويع الأمثال في القرآن لتفهيم الناس",
          "summary": "بيان أن الله ضرب للناس كل مثل في القرآن ليفهموا رسالته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-12",
          "surahNumber": 18,
          "startAyah": 60,
          "endAyah": 70,
          "title": "رحلة موسى إلى الخضر وطلب العلم",
          "summary": "بيان رحلة موسى في طلب العلم مع الخضر وتحذيره من عدم الصبر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-13",
          "surahNumber": 18,
          "startAyah": 71,
          "endAyah": 74,
          "title": "عدم صبر موسى مع الخضر",
          "summary": "بيان عدم صبر موسى عند خرق السفينة وقتل الغلام بغير سبب ظاهر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-14",
          "surahNumber": 18,
          "startAyah": 75,
          "endAyah": 82,
          "title": "قصة موسى والخضر وتأويل أفعاله",
          "summary": "بيان قصة موسى مع الخضر وتأويل ما فعله من خرق وقتل وبناء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-15",
          "surahNumber": 18,
          "startAyah": 83,
          "endAyah": 101,
          "title": "قصة ذي القرنين وبنائه السدّ",
          "summary": "بيان قصة الملك ذي القرنين وتمكينه وبنائه السدّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-16",
          "surahNumber": 18,
          "startAyah": 102,
          "endAyah": 108,
          "title": "مصير المشركين والمؤمنين يوم القيامة",
          "summary": "بيان عاقبة المشركين والمؤمنين يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-17",
          "surahNumber": 18,
          "startAyah": 109,
          "endAyah": 109,
          "title": "كلمات الله لا تنفد ولا تُحصى",
          "summary": "بيان أن كلمات الله لا تنفد ولو كان البحر مدادًا لها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s018-18",
          "surahNumber": 18,
          "startAyah": 110,
          "endAyah": 110,
          "title": "محمد بشر يُوحى إليه",
          "summary": "بيان أن النبي محمدًا ﷺ بشر يُوحى إليه فينبغي اتباع وحيه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 19,
      "surahName": "مريم",
      "ayahCount": 98,
      "status": "documented",
      "sections": [
        {
          "id": "s019-01",
          "surahNumber": 19,
          "startAyah": 1,
          "endAyah": 15,
          "title": "قصة زكريا وميلاد يحيى ونشأته",
          "summary": "بيان قصة زكريا وميلاد يحيى وشبابه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s019-02",
          "surahNumber": 19,
          "startAyah": 16,
          "endAyah": 26,
          "title": "قصة مريم وميلاد عيسى المعجزة",
          "summary": "بيان قصة مريم والمعجزة في ميلاد عيسى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s019-03",
          "surahNumber": 19,
          "startAyah": 27,
          "endAyah": 34,
          "title": "كلام عيسى في المهد ودفاعه عن أمه",
          "summary": "بيان حديث عيسى في المهد دفاعًا عن أمه وإعلان تكليفه بالنبوّة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s019-04",
          "surahNumber": 19,
          "startAyah": 35,
          "endAyah": 40,
          "title": "نفي بنوّة عيسى وتنزيه الله عن الولد",
          "summary": "بيان أن عيسى ليس ابن الله، وأن الله يتعالى عن اتخاذ الولد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s019-05",
          "surahNumber": 19,
          "startAyah": 41,
          "endAyah": 50,
          "title": "قصة إبراهيم مع أبيه المشرك",
          "summary": "بيان قصة إبراهيم ودعوته أباه إلى التوحيد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s019-06",
          "surahNumber": 19,
          "startAyah": 51,
          "endAyah": 57,
          "title": "نبوّة موسى وإسماعيل وإدريس",
          "summary": "بيان اصطفاء الله موسى وإسماعيل وإدريس بالنبوّة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s019-07",
          "surahNumber": 19,
          "startAyah": 58,
          "endAyah": 65,
          "title": "اصطفاء الله لأنبيائه وهدايتهم",
          "summary": "بيان أن الأنبياء جميعًا هداهم الله واصطفاهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s019-08",
          "surahNumber": 19,
          "startAyah": 66,
          "endAyah": 82,
          "title": "حياة المؤمنين والكافرين في الدنيا والآخرة",
          "summary": "بيان حال المؤمنين والكافرين في الدنيا ومصيرهم في الآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s019-09",
          "surahNumber": 19,
          "startAyah": 83,
          "endAyah": 98,
          "title": "نفي دعوى الولد وتيسير القرآن للناس",
          "summary": "بيان أن لا ناصر يوم القيامة إلا الله، وأن دعوى اتخاذ الولد افتراء عظيم، وأن القرآن مُيسّر للناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 20,
      "surahName": "طه",
      "ayahCount": 135,
      "status": "documented",
      "sections": [
        {
          "id": "s020-01",
          "surahNumber": 20,
          "startAyah": 1,
          "endAyah": 8,
          "title": "القرآن تذكير لمن يخشى الله",
          "summary": "بيان أن القرآن تذكير لمن يخشى الله خالق السماوات والأرض.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-02",
          "surahNumber": 20,
          "startAyah": 9,
          "endAyah": 16,
          "title": "موسى في الوادي المقدس طوى",
          "summary": "بيان نداء الله لموسى في الوادي المقدس عند الطور.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-03",
          "surahNumber": 20,
          "startAyah": 17,
          "endAyah": 24,
          "title": "اصطفاء موسى وإرساله إلى فرعون",
          "summary": "بيان اختيار الله موسى رسولًا وإرساله إلى فرعون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-04",
          "surahNumber": 20,
          "startAyah": 25,
          "endAyah": 48,
          "title": "دعاء موسى بشرح الصدر وتيسير الأمر",
          "summary": "بيان دعاء موسى بشرح صدره وتيسير أمره وحلّ عقدة لسانه، وإجابة الله له وتذكيره بنعمه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-05",
          "surahNumber": 20,
          "startAyah": 49,
          "endAyah": 54,
          "title": "محاورة موسى وفرعون عن الربّ",
          "summary": "بيان محاورة موسى وفرعون في ربّهما.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-06",
          "surahNumber": 20,
          "startAyah": 55,
          "endAyah": 55,
          "title": "أطوار خلق الإنسان وإعادته",
          "summary": "بيان مراحل خلق الإنسان من التراب وإعادته إليه وبعثه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-07",
          "surahNumber": 20,
          "startAyah": 56,
          "endAyah": 64,
          "title": "تكذيب فرعون لموسى وتحدّيه بالسحرة",
          "summary": "بيان تكذيب فرعون لموسى وادّعائه أن معجزاته سحر وتحدّيه إياه بالسحرة وقبول موسى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-08",
          "surahNumber": 20,
          "startAyah": 65,
          "endAyah": 76,
          "title": "مبارزة موسى بالسحرة وإسلامهم",
          "summary": "بيان غلبة موسى للسحرة فأسلموا، ومحاورتهم لفرعون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-09",
          "surahNumber": 20,
          "startAyah": 77,
          "endAyah": 82,
          "title": "إنجاء بني إسرائيل من عبودية فرعون",
          "summary": "بيان إنجاء الله بني إسرائيل من استعباد فرعون وإغراقه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-10",
          "surahNumber": 20,
          "startAyah": 83,
          "endAyah": 89,
          "title": "عبادة بني إسرائيل للعجل في غياب موسى",
          "summary": "بيان أن بني إسرائيل عبدوا العجل حين ذهب موسى لمناجاة ربه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-11",
          "surahNumber": 20,
          "startAyah": 90,
          "endAyah": 98,
          "title": "موقف موسى من العجل والسامري",
          "summary": "بيان سؤال موسى عن عبادة العجل وحكمه في السامري وخطابه لقومه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-12",
          "surahNumber": 20,
          "startAyah": 99,
          "endAyah": 104,
          "title": "القرآن تذكير وقصر الدنيا في الآخرة",
          "summary": "بيان أن القرآن تذكير، وأن عمر الدنيا يبدو كيوم واحد في الآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-13",
          "surahNumber": 20,
          "startAyah": 105,
          "endAyah": 112,
          "title": "مشهد من أهوال يوم القيامة",
          "summary": "بيان مشهد من أهوال يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-14",
          "surahNumber": 20,
          "startAyah": 113,
          "endAyah": 115,
          "title": "نزول القرآن بالعربية والأمر بطلب العلم",
          "summary": "بيان أن القرآن أُنزل بالعربية للتعليم والتذكير، والأمر بقراءته وسؤال الزيادة في العلم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-15",
          "surahNumber": 20,
          "startAyah": 116,
          "endAyah": 128,
          "title": "قصة خلق آدم وإغواء الشيطان",
          "summary": "بيان خلق آدم وإغواء الشيطان له وتوبة الله عليه وهدايته، وأن من أعرض عن القرآن يُحشر أعمى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-16",
          "surahNumber": 20,
          "startAyah": 129,
          "endAyah": 132,
          "title": "النهي عن الطمع في متاع الدنيا",
          "summary": "بيان النهي عن التطلّع إلى زينة الدنيا والأمر بابتغاء ثواب الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s020-17",
          "surahNumber": 20,
          "startAyah": 133,
          "endAyah": 135,
          "title": "القرآن حجة الله على الكافرين",
          "summary": "بيان أن القرآن آية من الله فلا عذر للكافرين يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 21,
      "surahName": "الأنبياء",
      "ayahCount": 112,
      "status": "documented",
      "sections": [
        {
          "id": "s021-01",
          "surahNumber": 21,
          "startAyah": 1,
          "endAyah": 10,
          "title": "قرب الحساب وغفلة الكافرين",
          "summary": "بيان قرب يوم الحساب وغفلة الكافرين وخصومتهم في بشرية الرسول.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-02",
          "surahNumber": 21,
          "startAyah": 11,
          "endAyah": 15,
          "title": "إهلاك الأمم السابقة بظلمها",
          "summary": "بيان إهلاك الأمم السابقة بسبب معاصيها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-03",
          "surahNumber": 21,
          "startAyah": 16,
          "endAyah": 18,
          "title": "خلق السماوات والأرض ليس لهوًا",
          "summary": "بيان أن خلق السماوات والأرض لم يكن عبثًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-04",
          "surahNumber": 21,
          "startAyah": 19,
          "endAyah": 24,
          "title": "بطلان تعدد الآلهة بفساد الكون",
          "summary": "بيان أنه لو كان في السماوات والأرض آلهة غير الله لفسدتا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-05",
          "surahNumber": 21,
          "startAyah": 25,
          "endAyah": 29,
          "title": "وحدة رسالة الرسل جميعًا",
          "summary": "بيان أن جميع الرسل بُعثوا برسالة واحدة: لا إله إلا الله فاعبدوه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-06",
          "surahNumber": 21,
          "startAyah": 30,
          "endAyah": 33,
          "title": "فتق السماوات والأرض وخلق الأحياء من الماء",
          "summary": "بيان أن السماوات والأرض كانتا رتقًا ففتقهما الله، وأنه خلق كل شيء حيّ من الماء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-07",
          "surahNumber": 21,
          "startAyah": 34,
          "endAyah": 41,
          "title": "لا خلود لبشر وموت الرسل",
          "summary": "بيان أن الله لم يجعل الخلد لأحد، وأن الرسل يموتون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-08",
          "surahNumber": 21,
          "startAyah": 42,
          "endAyah": 47,
          "title": "عجز الآلهة عن الدفاع ووضع الميزان",
          "summary": "بيان أن الآلهة المزعومة لا تنصر نفسها ولا غيرها، ووضع القسط يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-09",
          "surahNumber": 21,
          "startAyah": 48,
          "endAyah": 50,
          "title": "إيتاء موسى الفرقان ومثل القرآن",
          "summary": "بيان أن الله آتى موسى الفرقان، وأن هذا القرآن كذلك مبين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-10",
          "surahNumber": 21,
          "startAyah": 51,
          "endAyah": 71,
          "title": "تحطيم إبراهيم للأصنام ونجاته من النار",
          "summary": "بيان ردّ إبراهيم على قومه في عبادة الأصنام وتكسيره لها ونجاته من النار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-11",
          "surahNumber": 21,
          "startAyah": 72,
          "endAyah": 75,
          "title": "بشارة إبراهيم بإسحاق ويعقوب",
          "summary": "بيان هبة الله لإبراهيم إسحاق ومن ورائه يعقوب وجعلهم أنبياء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-12",
          "surahNumber": 21,
          "startAyah": 76,
          "endAyah": 77,
          "title": "إجابة دعاء نوح على الكافرين",
          "summary": "بيان إجابة الله دعاء نوح على قومه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-13",
          "surahNumber": 21,
          "startAyah": 78,
          "endAyah": 82,
          "title": "منح داود وسليمان الحكم والعلم والملك",
          "summary": "بيان ما أنعم الله به على داود وسليمان من الحكمة والعلم والملك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-14",
          "surahNumber": 21,
          "startAyah": 83,
          "endAyah": 84,
          "title": "إجابة دعاء أيوب وكشف ضرّه",
          "summary": "بيان استجابة الله دعاء أيوب وكشف ما به من ضرّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-15",
          "surahNumber": 21,
          "startAyah": 85,
          "endAyah": 91,
          "title": "منن الله على أنبيائه ومريم",
          "summary": "بيان إجابة الله دعاء أنبيائه إسماعيل وذي الكفل ويونس وزكريا وإنعامه على مريم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-16",
          "surahNumber": 21,
          "startAyah": 92,
          "endAyah": 93,
          "title": "الناس أمة واحدة متآخية",
          "summary": "بيان أن الناس أمة واحدة تجمعهم الأخوّة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-17",
          "surahNumber": 21,
          "startAyah": 94,
          "endAyah": 97,
          "title": "قبول عمل المؤمن الصالح",
          "summary": "بيان أن عمل المؤمن الصالح لا يُكفَر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-18",
          "surahNumber": 21,
          "startAyah": 98,
          "endAyah": 106,
          "title": "يوم الحساب ومصير الفريقين",
          "summary": "بيان يوم القيامة ومصير الكافرين والمؤمنين فيه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s021-19",
          "surahNumber": 21,
          "startAyah": 107,
          "endAyah": 112,
          "title": "إرسال محمد ﷺ رحمة للعالمين",
          "summary": "بيان أن الله أرسل محمدًا ﷺ رحمة للعالمين أجمعين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 22,
      "surahName": "الحج",
      "ayahCount": 78,
      "status": "documented",
      "sections": [
        {
          "id": "s022-01",
          "surahNumber": 22,
          "startAyah": 1,
          "endAyah": 4,
          "title": "مشهد من أهوال قيام الساعة",
          "summary": "بيان مشهد من أهوال قيام الساعة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-02",
          "surahNumber": 22,
          "startAyah": 5,
          "endAyah": 7,
          "title": "أطوار الحياة الدنيا والآخرة",
          "summary": "بيان مراحل خلق الإنسان وحياته في الدنيا والآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-03",
          "surahNumber": 22,
          "startAyah": 8,
          "endAyah": 10,
          "title": "دعاء غير الله بلا علم ولا هدى",
          "summary": "بيان جدال من يدعو من دون الله بلا علم ولا هداية.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-04",
          "surahNumber": 22,
          "startAyah": 11,
          "endAyah": 14,
          "title": "حال من يعبد الله على حرف",
          "summary": "بيان حال من يقف على حدّ الإيمان فيتقلّب بين الطاعة والكفر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-05",
          "surahNumber": 22,
          "startAyah": 15,
          "endAyah": 18,
          "title": "نصر الله لرسله وسجود من في السماوات والأرض",
          "summary": "بيان أن الله ينصر رسله، وأن من في السماوات والأرض يسجدون له.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-06",
          "surahNumber": 22,
          "startAyah": 19,
          "endAyah": 22,
          "title": "عذاب الكافرين من نار وحميم وحديد",
          "summary": "بيان ما أُعدّ للكافرين من ثياب النار والحميم ومقامع الحديد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-07",
          "surahNumber": 22,
          "startAyah": 23,
          "endAyah": 25,
          "title": "تسوية الله بين المؤمنين في المسجد الحرام",
          "summary": "بيان أن المؤمنين في المسجد الحرام سواء المقيم والباد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-08",
          "surahNumber": 22,
          "startAyah": 26,
          "endAyah": 30,
          "title": "بناء إبراهيم للكعبة والدعوة إلى الحج",
          "summary": "بيان تعيين موضع البيت لإبراهيم وأمره ببناء الكعبة والدعوة إلى الحج.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-09",
          "surahNumber": 22,
          "startAyah": 31,
          "endAyah": 33,
          "title": "تمثيل الشرك بالسقوط من السماء",
          "summary": "بيان أن المشرك كمن سقط من السماء فتخطّفته الطير.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-10",
          "surahNumber": 22,
          "startAyah": 34,
          "endAyah": 38,
          "title": "وصول التقوى لا لحوم الأضاحي",
          "summary": "بيان أن الله يناله التقوى لا اللحوم ولا الدماء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-11",
          "surahNumber": 22,
          "startAyah": 39,
          "endAyah": 41,
          "title": "إذن الله للمؤمنين بالقتال دفاعًا",
          "summary": "بيان إذن الله للمؤمنين بالقتال عن أنفسهم وفي سبيله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-12",
          "surahNumber": 22,
          "startAyah": 42,
          "endAyah": 45,
          "title": "تسلية النبي بتكذيب الأمم السابقة",
          "summary": "بيان أن تكذيب الأمم لأنبيائها سنة قديمة تسليةً للرسول ﷺ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-13",
          "surahNumber": 22,
          "startAyah": 46,
          "endAyah": 48,
          "title": "يوم عند الله كألف سنة",
          "summary": "بيان أن يومًا عند الله كألف سنة مما تعدّون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-14",
          "surahNumber": 22,
          "startAyah": 49,
          "endAyah": 51,
          "title": "مغفرة من قبل الحق وعذاب المكذبين",
          "summary": "بيان أن من قبل الحق يُغفر له ومن أصرّ يُعذّب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-15",
          "surahNumber": 22,
          "startAyah": 52,
          "endAyah": 57,
          "title": "نسخ ما يُلقي الشيطان وحكم الله",
          "summary": "بيان أن الشيطان يُلقي في أمنية الرسل فينسخ الله ما يُلقي، وأنه يحكم بينهم يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-16",
          "surahNumber": 22,
          "startAyah": 58,
          "endAyah": 64,
          "title": "أجر المهاجرين في سبيل الله",
          "summary": "بيان جزاء المهاجرين في سبيل الله، وأن الله هو الحق وما يُدعى من دونه باطل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-17",
          "surahNumber": 22,
          "startAyah": 65,
          "endAyah": 67,
          "title": "الله يُحيي ويميت ويبعث للحكم",
          "summary": "بيان أن الله هو الذي يُحيي ويميت ويبعث للفصل بين العباد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-18",
          "surahNumber": 22,
          "startAyah": 68,
          "endAyah": 72,
          "title": "حكم الله بين المختصمين",
          "summary": "بيان أن الله يفصل يوم القيامة بين المختلفين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-19",
          "surahNumber": 22,
          "startAyah": 73,
          "endAyah": 74,
          "title": "عجز الآلهة عن خلق ذبابة",
          "summary": "بيان أن ما يُعبد من دون الله عاجز عن خلق ذبابة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s022-20",
          "surahNumber": 22,
          "startAyah": 75,
          "endAyah": 78,
          "title": "تسمية المؤمنين مسلمين في الكتب",
          "summary": "بيان أن الله سمّى المؤمنين مسلمين في الكتب السابقة وفي القرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 23,
      "surahName": "المؤمنون",
      "ayahCount": 118,
      "status": "documented",
      "sections": [
        {
          "id": "s023-01",
          "surahNumber": 23,
          "startAyah": 1,
          "endAyah": 11,
          "title": "صفات المؤمنين المفلحين",
          "summary": "بيان صفات المؤمنين المفلحين في الدنيا والآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-02",
          "surahNumber": 23,
          "startAyah": 12,
          "endAyah": 16,
          "title": "أطوار خلق الإنسان في القرآن",
          "summary": "بيان أطوار خلق الإنسان من نطفة إلى الخلق التام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-03",
          "surahNumber": 23,
          "startAyah": 17,
          "endAyah": 22,
          "title": "تسخير السماوات والنبات والأنعام للإنسان",
          "summary": "بيان إنعام الله على الإنسان بما سخر له من السماوات والنبات والأنعام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-04",
          "surahNumber": 23,
          "startAyah": 23,
          "endAyah": 30,
          "title": "إرسال نوح وإغراق المكذبين",
          "summary": "بيان إرسال نوح إلى قومه وتكذيبهم فأغرقهم الله بالطوفان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-05",
          "surahNumber": 23,
          "startAyah": 31,
          "endAyah": 32,
          "title": "إرسال هود إلى قومه بعد نوح",
          "summary": "بيان إرسال الله هودًا إلى قومه بعد نوح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-06",
          "surahNumber": 23,
          "startAyah": 33,
          "endAyah": 44,
          "title": "تكذيب قوم هود وهلاك الأمم",
          "summary": "بيان تكذيب قوم هود لنبيهم وإهلاكهم بالصيحة، وإرسال رسل إلى أقوام كذّبوا فهلَكوا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-07",
          "surahNumber": 23,
          "startAyah": 45,
          "endAyah": 50,
          "title": "إرسال موسى إلى فرعون وملئه",
          "summary": "بيان إرسال موسى إلى فرعون وملئه وتكذيبهم فأُهلكوا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-08",
          "surahNumber": 23,
          "startAyah": 51,
          "endAyah": 61,
          "title": "وحدة الدين والأمر بتقوى الله",
          "summary": "بيان أن الدين واحد وأن الله ربّ الناس فأمر بتقواه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-09",
          "surahNumber": 23,
          "startAyah": 62,
          "endAyah": 77,
          "title": "تكليف النفس بقدر طاقتها",
          "summary": "بيان أن الله لا يكلّف نفسًا فوق طاقتها، وأن من لا يؤمن بالآخرة يضلّ عن السبيل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-10",
          "surahNumber": 23,
          "startAyah": 78,
          "endAyah": 83,
          "title": "إنعام الله بالسمع والأبصار والأفئدة",
          "summary": "بيان أن الله أنعم على الإنسان بالسمع والأبصار والأفئدة وقلة شكره.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-11",
          "surahNumber": 23,
          "startAyah": 84,
          "endAyah": 90,
          "title": "إقرار الكافرين بربوبية الله",
          "summary": "بيان أن المشركين يُقرّون بأن الله خالق السماوات والأرض.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-12",
          "surahNumber": 23,
          "startAyah": 91,
          "endAyah": 92,
          "title": "تنزّه الله عن الولد والشريك",
          "summary": "بيان تنزّه الله عن اتخاذ الولد وأنه لا إله غيره.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-13",
          "surahNumber": 23,
          "startAyah": 93,
          "endAyah": 98,
          "title": "دفع السيئة بالحسنة والاستعاذة من الشيطان",
          "summary": "بيان الأمر بدفع السيئة بالحسنة والاستعاذة من وساوس الشيطان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-14",
          "surahNumber": 23,
          "startAyah": 99,
          "endAyah": 111,
          "title": "تمنّي المجرمين الرجوع إلى الدنيا",
          "summary": "بيان تمنّي المجرمين الرجوع إلى الدنيا ليتّبعوا الحق وقد فات الوقت.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-15",
          "surahNumber": 23,
          "startAyah": 112,
          "endAyah": 115,
          "title": "قصر مدة الدنيا يوم القيامة",
          "summary": "بيان أن مدة الدنيا تبدو يوم القيامة أقل من يوم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s023-16",
          "surahNumber": 23,
          "startAyah": 116,
          "endAyah": 118,
          "title": "حرمان الكافرين من الفلاح",
          "summary": "بيان أن الكافرين لا ينالون الفلاح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 24,
      "surahName": "النور",
      "ayahCount": 64,
      "status": "documented",
      "sections": [
        {
          "id": "s024-01",
          "surahNumber": 24,
          "startAyah": 1,
          "endAyah": 2,
          "title": "بيان حدّ الزانية والزاني",
          "summary": "بيان حدّ الزانية والزاني.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-02",
          "surahNumber": 24,
          "startAyah": 3,
          "endAyah": 5,
          "title": "حدّ القاذفين وتوبة من تاب",
          "summary": "بيان حدّ القاذفين وتوبة من تاب منهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-03",
          "surahNumber": 24,
          "startAyah": 6,
          "endAyah": 10,
          "title": "أحكام اللعان بين الزوجين",
          "summary": "بيان أحكام اللعان عند التقاذف بين الزوجين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-04",
          "surahNumber": 24,
          "startAyah": 11,
          "endAyah": 20,
          "title": "حديث الإفك وبراءة أم المؤمنين",
          "summary": "بيان افتراء المنافقين على زوج النبي ﷺ وتبرئتها من الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-05",
          "surahNumber": 24,
          "startAyah": 21,
          "endAyah": 26,
          "title": "النهي عن اتباع الشيطان والإفك",
          "summary": "بيان نهي المؤمنين عن اتباع خطوات الشيطان وخوضهم في الإفك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-06",
          "surahNumber": 24,
          "startAyah": 27,
          "endAyah": 29,
          "title": "آداب الاستئذان عند دخول البيوت",
          "summary": "بيان آداب الاستئذان والسلام عند دخول بيوت غير بيوتكم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-07",
          "surahNumber": 24,
          "startAyah": 30,
          "endAyah": 31,
          "title": "آداب غضّ البصر وحفظ الفروج",
          "summary": "بيان آداب المخالطة بين الرجال والنساء من غضّ البصر والحفظ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-08",
          "surahNumber": 24,
          "startAyah": 32,
          "endAyah": 34,
          "title": "الأمر بالتزويج وكتابة العتق",
          "summary": "بيان أمر الله بتزويج غير المتزوجين وكتابة الحرية لمن طلبها من المماليك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-09",
          "surahNumber": 24,
          "startAyah": 35,
          "endAyah": 35,
          "title": "الله نور السماوات والأرض",
          "summary": "بيان أن الله نور السماوات والأرض ومَثَل نوره.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-10",
          "surahNumber": 24,
          "startAyah": 36,
          "endAyah": 38,
          "title": "بيوت يُذكر فيها اسم الله",
          "summary": "بيان أن نور الله في بيوت أذن أن تُرفع ويُذكر فيها اسمه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-11",
          "surahNumber": 24,
          "startAyah": 39,
          "endAyah": 40,
          "title": "تشبيه أعمال الكافرين بالسراب",
          "summary": "بيان أن أعمال الكافرين كسراب بقيعة يحسبه الظمآن ماءً.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-12",
          "surahNumber": 24,
          "startAyah": 41,
          "endAyah": 45,
          "title": "تسبيح الكائنات وخلق الدواب من الماء",
          "summary": "بيان أن ما في السماوات والأرض يسبّح الله وأنه خلق كل دابة من ماء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-13",
          "surahNumber": 24,
          "startAyah": 46,
          "endAyah": 50,
          "title": "دعوى الإيمان بلا عمل",
          "summary": "بيان أن من ادّعى الإيمان ولم يصدّقه بعمله ليس بمؤمن حقًّا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-14",
          "surahNumber": 24,
          "startAyah": 51,
          "endAyah": 57,
          "title": "قول المؤمنين سمعنا وأطعنا",
          "summary": "بيان أن المؤمنين الصادقين إذا دُعوا إلى الله ورسوله قالوا سمعنا وأطعنا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-15",
          "surahNumber": 24,
          "startAyah": 58,
          "endAyah": 59,
          "title": "آداب الاستئذان على الأزواج",
          "summary": "بيان أوقات الاستئذان على الأزواج وذكر المماليك والصغار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-16",
          "surahNumber": 24,
          "startAyah": 60,
          "endAyah": 61,
          "title": "آداب الأكل في بيوت الغير",
          "summary": "بيان آداب الطعام في بيوت غير بيوتكم وعدم الحرج في الأكل منها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s024-17",
          "surahNumber": 24,
          "startAyah": 62,
          "endAyah": 64,
          "title": "حضور المجالس التي تقتضي عملًا جماعيًا",
          "summary": "بيان الأمر بحضور المجالس التي تحتاج إلى اجتماع جماعي وعدم الانصراف إلا بإذن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 25,
      "surahName": "الفرقان",
      "ayahCount": 77,
      "status": "documented",
      "sections": [
        {
          "id": "s025-01",
          "surahNumber": 25,
          "startAyah": 1,
          "endAyah": 9,
          "title": "تبارك الذي نزّل الفرقان وتكذيب الرسول لبشريته",
          "summary": "بيان أن الله نزّل القرآن الفرقان للتمييز بين الحق والباطل وأن المجرمين كذّبوا الرسول لأنه بشر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s025-02",
          "surahNumber": 25,
          "startAyah": 10,
          "endAyah": 16,
          "title": "مكذبو الساعة صائرون إلى السعير",
          "summary": "بيان أن من كذّب بالساعة والحياة بعد الموت مآله إلى النار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s025-03",
          "surahNumber": 25,
          "startAyah": 17,
          "endAyah": 20,
          "title": "تبرّؤ المعبودين من المشركين يوم القيامة",
          "summary": "بيان أن المعبودين يوم القيامة ينكرون دعوى الألوهية ويحمّلون المشركين شركهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s025-04",
          "surahNumber": 25,
          "startAyah": 21,
          "endAyah": 24,
          "title": "الكافرون يستعجلون الملائكة ثم يتمنّون الحجاب",
          "summary": "بيان أن الكافرين يطلبون الملائكة اليوم ثم يتمنّون حجابًا من حجر بينهم وبين ملائكة العذاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s025-05",
          "surahNumber": 25,
          "startAyah": 25,
          "endAyah": 31,
          "title": "ندم الكافرين لتركهم سبيل الحق",
          "summary": "بيان ندم الكافرين يوم القيامة على عدم سلوكهم الصراط المستقيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s025-06",
          "surahNumber": 25,
          "startAyah": 32,
          "endAyah": 34,
          "title": "حكمة إنزال القرآن مفرّقًا لا جملة",
          "summary": "بيان حكمة تنجيم القرآن وتفريقه دون إنزاله جملة واحدة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s025-07",
          "surahNumber": 25,
          "startAyah": 35,
          "endAyah": 44,
          "title": "إهلاك الأمم المكذبة ومن اتخذ هواه إلهه",
          "summary": "بيان أن الأمم التي كذّبت آيات الله ورسله أُهلكت وأن من اتخذ هواه إلهًا كالأنعام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s025-08",
          "surahNumber": 25,
          "startAyah": 45,
          "endAyah": 50,
          "title": "الليل لباس والنوم راحة والنهار معاش",
          "summary": "بيان أن الله جعل الليل لباسًا والنوم راحة والنهار للعمل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s025-09",
          "surahNumber": 25,
          "startAyah": 51,
          "endAyah": 60,
          "title": "جهاد الكافرين بالقرآن والتوكّل على الحيّ",
          "summary": "بيان النهي عن طاعة الكافرين والأمر بجهادهم بالقرآن والتوكّل على الله الحيّ الذي لا يموت.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s025-10",
          "surahNumber": 25,
          "startAyah": 61,
          "endAyah": 77,
          "title": "صفات عباد الرحمن المؤمنين",
          "summary": "بيان صفات عباد الرحمن الصادقين من المؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 26,
      "surahName": "الشعراء",
      "ayahCount": 227,
      "status": "documented",
      "sections": [
        {
          "id": "s026-01",
          "surahNumber": 26,
          "startAyah": 1,
          "endAyah": 9,
          "title": "افتتاح السورة وتكذيب المشركين",
          "summary": "تُفتتح بالحروف المقطّعة، وتُثبت أن آيات القرآن كتاب مبين، ثم تذكر إعراض المكذبين واتّباعهم أهواءهم.",
          "structuralObservations": "تُختم كل قصة في السورة بلازمة واحدة: {وإن ربك لهو العزيز الرحيم} (٩، ٦٨، ١٠٤، ١٢٢، ١٤٠، ١٥٩، ١٧٥، ١٩١)، وهي التي تعيّن حدود هذه المقاطع.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s026-02",
          "surahNumber": 26,
          "startAyah": 10,
          "endAyah": 68,
          "title": "قصة موسى مع فرعون",
          "summary": "من نداء الله لموسى إلى إرساله إلى فرعون، ومحاورته إياه بالآيات، ثم نجاة بني إسرائيل وإغراق فرعون وجنوده.",
          "structuralObservations": "ينتهي المقطع بلازمة السورة عند الآية ٦٨.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s026-03",
          "surahNumber": 26,
          "startAyah": 69,
          "endAyah": 104,
          "title": "قصة إبراهيم مع قومه",
          "summary": "من مجادلته قومه في أصنامهم، إلى إلقائه في النار فجعلها بردًا وسلامًا، ثم دعوته وأخباره مع أبيه وقومه.",
          "structuralObservations": "ينتهي المقطع بلازمة السورة عند الآية ١٠٤.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s026-04",
          "surahNumber": 26,
          "startAyah": 105,
          "endAyah": 122,
          "title": "قصة نوح",
          "summary": "تكذيب قوم نوح لرسولهم، ودعوة نوح ربه بعد طول لبثهم، ثم نجاته ومن معه في الفلك وإغراق المكذبين.",
          "structuralObservations": "ينتهي المقطع بلازمة السورة عند الآية ١٢٢.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s026-05",
          "surahNumber": 26,
          "startAyah": 123,
          "endAyah": 140,
          "title": "قصة عاد (قوم هود)",
          "summary": "تكذيب عاد لأخيهم هود، ودعوته إياهم إلى تقوى الله وإلى ألا يسألهم على الدعوة أجرًا، ثم إهلاكهم.",
          "structuralObservations": "ينتهي المقطع بلازمة السورة عند الآية ١٤٠.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s026-06",
          "surahNumber": 26,
          "startAyah": 141,
          "endAyah": 159,
          "title": "قصة ثمود (قوم صالح)",
          "summary": "تكذيب ثمود لأخيهم صالح، وطلبهم الآية في الناقة، ثم عقرها وإهلاك قومها بالصيحة.",
          "structuralObservations": "ينتهي المقطع بلازمة السورة عند الآية ١٥٩.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s026-07",
          "surahNumber": 26,
          "startAyah": 160,
          "endAyah": 175,
          "title": "قصة قوم لوط",
          "summary": "تكذيب قوم لوط لأخيهم، ومحاورتهم إياه في ضيفه، ثم نجاة لوط وأهله وإهلاك المجرمين بحاصب.",
          "structuralObservations": "ينتهي المقطع بلازمة السورة عند الآية ١٧٥.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s026-08",
          "surahNumber": 26,
          "startAyah": 176,
          "endAyah": 191,
          "title": "قصة أصحاب الأيكة (شعيب)",
          "summary": "تكذيب أصحاب الأيكة لأخيهم، ودعوته إياهم إلى الوفاء في الكيل والميزان، ثم إهلاكهم بعذاب يوم الظلة.",
          "structuralObservations": "ينتهي المقطع بلازمة السورة عند الآية ١٩١.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s026-09",
          "surahNumber": 26,
          "startAyah": 192,
          "endAyah": 227,
          "title": "خاتمة السورة: تنزيل القرآن وحال المؤمنين",
          "summary": "تُثبت أن القرآن تنزيل رب العالمين نزل به الروح الأمين على قلب النبي بلسان عربي مبين، وتُذكر أخبار الأنبياء قبله إعذارًا، وتُختم بما يكون للمؤمنين وأن الله ينصرهم بعد ظلمهم.",
          "structuralObservations": "مقطع خاتمة لا تجري فيه لازمة القصص السابقة.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        }
      ]
    },
    {
      "surahNumber": 27,
      "surahName": "النمل",
      "ayahCount": 93,
      "status": "documented",
      "sections": [
        {
          "id": "s027-01",
          "surahNumber": 27,
          "startAyah": 1,
          "endAyah": 6,
          "title": "القرآن هدى وبشرى للمؤمنين",
          "summary": "بيان أن القرآن هدًى وبشرى للمؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-02",
          "surahNumber": 27,
          "startAyah": 7,
          "endAyah": 14,
          "title": "اختيار موسى رسولًا وإنكار فرعون الآيات",
          "summary": "بيان اختيار موسى للنبوّة وعرض الآيات على فرعون فأصرّ على الكفر واستحقّ عذاب الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-03",
          "surahNumber": 27,
          "startAyah": 15,
          "endAyah": 19,
          "title": "تسخير الجنّ والإنس والطير والريح لسليمان",
          "summary": "بيان قصة سليمان وما آتاه الله من ملك على الجنّ والإنس والطير والريح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-04",
          "surahNumber": 27,
          "startAyah": 20,
          "endAyah": 31,
          "title": "الهدهد ينبئ سليمان بملكة سبأ ورسالته إليها",
          "summary": "بيان خبر الهدهد عن ملكة سبأ وكتاب سليمان إليها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-05",
          "surahNumber": 27,
          "startAyah": 32,
          "endAyah": 37,
          "title": "مراسلات ملكة سبأ وسليمان",
          "summary": "بيان المراسلات بين ملكة سبأ وسليمان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-06",
          "surahNumber": 27,
          "startAyah": 38,
          "endAyah": 44,
          "title": "إحضار عرش سبأ وإسلامها وقومها",
          "summary": "بيان إحضار العرش بعلم من الكتاب في لمح البصر وإسلام ملكة سبأ وقومها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-07",
          "surahNumber": 27,
          "startAyah": 45,
          "endAyah": 53,
          "title": "قصة صالح ومؤامرة قومه وإنجاء الله له",
          "summary": "بيان قصة صالح وخطابه قومه ومكرهم به ونجاة الله له وإهلاكه الكافرين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-08",
          "surahNumber": 27,
          "startAyah": 54,
          "endAyah": 58,
          "title": "إنذار لوط قومه ونزول العذاب بهم",
          "summary": "بيان وعظ لوط قومه وإعراضهم عنه فنزل بهم عذاب الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-09",
          "surahNumber": 27,
          "startAyah": 59,
          "endAyah": 59,
          "title": "الحمد لله والسلام على رسله",
          "summary": "بيان الحمد لله والسلام على رسله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-10",
          "surahNumber": 27,
          "startAyah": 60,
          "endAyah": 66,
          "title": "هل من إله غير الله يخلق ويجيب المضطرّ",
          "summary": "بيان انفراد الله بالخلق وإجابة المضطرّ والهداية إلى السبيل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-11",
          "surahNumber": 27,
          "startAyah": 67,
          "endAyah": 82,
          "title": "شكّ الكافرين بقدرة الله وبيان القرآن لمختلفهم",
          "summary": "بيان شكّ الكافرين في قدرة الله على الخلق وتوضيح القرآن لما اختلف فيه بنو إسرائيل وآية من آيات الساعة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-12",
          "surahNumber": 27,
          "startAyah": 83,
          "endAyah": 86,
          "title": "النهي عن تكذيب آيات الله قبل العلم بها",
          "summary": "بيان النهي عن التكذيب بآيات الله دون الإحاطة بعلمها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s027-13",
          "surahNumber": 27,
          "startAyah": 87,
          "endAyah": 93,
          "title": "مشهد من مشاهد القيامة ومصير المهتدي والضالّ",
          "summary": "بيان مشهد من مشاهد القيامة وأن الهدى والضلال عائد إلى العبد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 28,
      "surahName": "القصص",
      "ayahCount": 88,
      "status": "documented",
      "sections": [
        {
          "id": "s028-01",
          "surahNumber": 28,
          "startAyah": 1,
          "endAyah": 3,
          "title": "قصة موسى",
          "summary": "بيان مطلع قصة موسى عليه السلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-02",
          "surahNumber": 28,
          "startAyah": 4,
          "endAyah": 13,
          "title": "مكر فرعون ببني إسرائيل وتربية موسى في بيته",
          "summary": "بيان مكر فرعون بقتل أبناء بني إسرائيل وتدبير الله لتربية موسى في بيته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-03",
          "surahNumber": 28,
          "startAyah": 14,
          "endAyah": 21,
          "title": "شباب موسى وقتله القبطي وخروجه خائفًا",
          "summary": "بيان شباب موسى وقتله رجلًا من قوم فرعون ثم خروجه فرارًا من عقوبته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-04",
          "surahNumber": 28,
          "startAyah": 22,
          "endAyah": 28,
          "title": "وصول موسى مدين وأجره وتزوّجه",
          "summary": "بيان وصول موسى إلى مدين وعمله أجيرًا عشر سنين وزواجه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-05",
          "surahNumber": 28,
          "startAyah": 29,
          "endAyah": 35,
          "title": "مناجاة موسى عند الطور ورسالته إلى فرعون",
          "summary": "بيان مجيء موسى الطور ورؤيته النار ومناجاته ربه واختياره رسولًا إلى فرعون وملئه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-06",
          "surahNumber": 28,
          "startAyah": 36,
          "endAyah": 42,
          "title": "تكذيب فرعون وملئه وإهلاكهم وإنجاء بني إسرائيل",
          "summary": "بيان كفر فرعون وملئه فأهلكهم الله وأنجى بني إسرائيل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-07",
          "surahNumber": 28,
          "startAyah": 43,
          "endAyah": 50,
          "title": "إهلاك القرون السابقة لتكون عبرة",
          "summary": "بيان أخبار إهلاك القرون السابقة لأخذ العبرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-08",
          "surahNumber": 28,
          "startAyah": 51,
          "endAyah": 55,
          "title": "معرفة أهل الكتاب بحقّ القرآن قبل سماعه",
          "summary": "بيان أن صالحي اليهود والنصارى يعرفون حقّ القرآن ويشهدون أنهم كانوا مسلمين قبله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-09",
          "surahNumber": 28,
          "startAyah": 56,
          "endAyah": 60,
          "title": "الهداية بيد الله لا بيد الرسول",
          "summary": "بيان أن الأنبياء لا يملكون الهداية وأن الهداية لله وحده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-10",
          "surahNumber": 28,
          "startAyah": 61,
          "endAyah": 67,
          "title": "تمنّي الكافرين الهدى يوم القيامة",
          "summary": "بيان تمنّي الكافرين يوم القيامة لو كانوا مهتدين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-11",
          "surahNumber": 28,
          "startAyah": 68,
          "endAyah": 75,
          "title": "الخلق والاختيار لله لا للمشركين",
          "summary": "بيان أن الخلق والاختيار لله وحده وليس للمشركين أن يمنحوه لمن يشاؤون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-12",
          "surahNumber": 28,
          "startAyah": 76,
          "endAyah": 82,
          "title": "قصة قارون وبغيه على هدى الله",
          "summary": "بيان قصة قارون الغنيّ من قوم موسى وبغيه على هدى الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s028-13",
          "surahNumber": 28,
          "startAyah": 83,
          "endAyah": 88,
          "title": "إنزال القرآن رحمة فلا تصدّنّك عنه",
          "summary": "بيان أن إنزال القرآن رحمة من الله والنهي عن الانصراف عنه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 29,
      "surahName": "العنكبوت",
      "ayahCount": 69,
      "status": "documented",
      "sections": [
        {
          "id": "s029-01",
          "surahNumber": 29,
          "startAyah": 1,
          "endAyah": 7,
          "title": "الفتنة لتمييز الصادق من الكاذب",
          "summary": "بيان أن الله يبتلي المؤمنين ليعلم الصادق من الكاذب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-02",
          "surahNumber": 29,
          "startAyah": 8,
          "endAyah": 13,
          "title": "برّ الوالدين دون طاعتهما في الشرك",
          "summary": "بيان الأمر ببرّ الوالدين وعدم طاعتهما في الشرك وأن من يقول اتبعونا نحمل أوزاركم كاذب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-03",
          "surahNumber": 29,
          "startAyah": 14,
          "endAyah": 22,
          "title": "دعوة نوح وإبراهيم إلى ترك الشرك",
          "summary": "بيان دعوة نوح قومه إلى ترك الشرك تسعمائة وخمسين سنة ودعوة إبراهيم قومه كذلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-04",
          "surahNumber": 29,
          "startAyah": 23,
          "endAyah": 27,
          "title": "نجاة إبراهيم من النار وإيمان لوط به",
          "summary": "بيان محاولة قوم إبراهيم إحراقه وإنجاء الله له وأن لوطًا وحده آمن به.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-05",
          "surahNumber": 29,
          "startAyah": 28,
          "endAyah": 30,
          "title": "إرسال لوط إلى قوم يأتون الفاحشة",
          "summary": "بيان إرسال لوط رسولًا إلى قوم يأتون الفاحشة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-06",
          "surahNumber": 29,
          "startAyah": 31,
          "endAyah": 35,
          "title": "تكذيب القوم فحلّ بهم الإهلاك",
          "summary": "بيان أن القوم كذّبوا هدى الله فأهلكهم أجمعين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-07",
          "surahNumber": 29,
          "startAyah": 36,
          "endAyah": 40,
          "title": "تكذيب عاد وثمود ومدين وفرعون رسل الله",
          "summary": "بيان تكذيب الأمم من عاد وثمود ومدين وفرعون رسل الله وما آل إليه من الإهلاك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-08",
          "surahNumber": 29,
          "startAyah": 41,
          "endAyah": 44,
          "title": "مثل الذين اتخذوا من دون الله أولياء",
          "summary": "بيان مثل من اتخذ من دون الله أولياء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-09",
          "surahNumber": 29,
          "startAyah": 45,
          "endAyah": 51,
          "title": "الصلاة تنهى عن الفحشاء ومجادلة أهل الكتاب بالحسنى",
          "summary": "بيان أن الصلاة تنهى عن الفحشاء والمنكر ومجادلة أهل الكتاب بالتي هي أحسن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-10",
          "surahNumber": 29,
          "startAyah": 52,
          "endAyah": 63,
          "title": "خسارة من آمن بالباطل وكفالة الله للأرزاق",
          "summary": "بيان خسارة من كفر بالله وآمن بالباطل وأن الله يرزق الدوابّ كما يرزق العباد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s029-11",
          "surahNumber": 29,
          "startAyah": 64,
          "endAyah": 69,
          "title": "زينة الدنيا لهو والآخرة هي الحياة",
          "summary": "بيان أن الدنيا لهو ولعب وأن الحياة الحقّ هي الآخرة وأن الله يهدي المجاهدين فيه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 30,
      "surahName": "الروم",
      "ayahCount": 60,
      "status": "documented",
      "sections": [
        {
          "id": "s030-01",
          "surahNumber": 30,
          "startAyah": 1,
          "endAyah": 10,
          "title": "هزيمة الروم ووعد الله بالنصر",
          "summary": "بيان أن هزيمة الروم على يد الفرس جُعلت علامة ووعد الله بنصر الروم والمسلمين في بضع سنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s030-02",
          "surahNumber": 30,
          "startAyah": 11,
          "endAyah": 19,
          "title": "الله يبدأ الخلق ثم يعيده وإليه المصير",
          "summary": "بيان أن الله يبدأ الخلق ثم يعيده وأن إليه مرجع الجميع للجزاء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s030-03",
          "surahNumber": 30,
          "startAyah": 20,
          "endAyah": 27,
          "title": "آيات الله في الخلق والألسنة والألوان والرزق",
          "summary": "بيان أن خلق الإنسان وقرينه والسماوات والأرض واختلاف الألسنة والألوان والنوم والسعي في الرزق والبرق والمطر ونبات الزرع من آيات الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s030-04",
          "surahNumber": 30,
          "startAyah": 28,
          "endAyah": 32,
          "title": "اتّباع الظالمين أهواءهم وحقيقة الإيمان",
          "summary": "بيان أن الظالمين يتّبعون أهواءهم بغير علم وحقيقة الإيمان وأصل الفرقة في الدين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s030-05",
          "surahNumber": 30,
          "startAyah": 33,
          "endAyah": 37,
          "title": "دعاء المشركين عند الضرّ وعودتهم إلى الشرك",
          "summary": "بيان أن الناس يدعون الله عند الضرّ فإذا كشف عنهم عادوا إلى الشرك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s030-06",
          "surahNumber": 30,
          "startAyah": 38,
          "endAyah": 40,
          "title": "إيتاء ذي القربى والمسكين وابن السبيل",
          "summary": "بيان الأمر بإيتاء ذي القربى حقّه والمسكين وابن السبيل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s030-07",
          "surahNumber": 30,
          "startAyah": 41,
          "endAyah": 45,
          "title": "ظهور الفساد بكسب الناس وإذاقة العاقبة",
          "summary": "بيان أن الفساد في البرّ والبحر بما كسبت أيدي الناس ليذيقهم بعض أعمالهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s030-08",
          "surahNumber": 30,
          "startAyah": 46,
          "endAyah": 53,
          "title": "إرسال الرسل بالبشرى والنذير ونصر المؤمنين",
          "summary": "بيان أن الله أرسل رسله للهداية فآمن بعضهم وكذّب آخرون وأنه ينصر المؤمنين وأن النبي لا يُسمع الموتى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s030-09",
          "surahNumber": 30,
          "startAyah": 54,
          "endAyah": 60,
          "title": "خلق الله للإنسان وحسابه يوم القيامة",
          "summary": "بيان أن الله خلق الإنسان وسيحاسبه يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 31,
      "surahName": "لقمان",
      "ayahCount": 34,
      "status": "documented",
      "sections": [
        {
          "id": "s031-01",
          "surahNumber": 31,
          "startAyah": 1,
          "endAyah": 11,
          "title": "القرآن كتاب الحكمة وهدى ورحمة للمحسنين",
          "summary": "بيان أن القرآن كتاب الحكمة وهدى وبشرى للمحسنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s031-02",
          "surahNumber": 31,
          "startAyah": 12,
          "endAyah": 13,
          "title": "وصية لقمان لابنه بترك الشرك",
          "summary": "بيان وصية لقمان لابنه بترك الشرك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s031-03",
          "surahNumber": 31,
          "startAyah": 14,
          "endAyah": 15,
          "title": "حقّ الوالدين وعدم طاعتهما في الشرك",
          "summary": "بيان عظم حقّ الأم والوالدين والأمر بطاعتهما إلا في الشرك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s031-04",
          "surahNumber": 31,
          "startAyah": 16,
          "endAyah": 19,
          "title": "وصايا لقمان في الأخلاق والمعاملة",
          "summary": "بيان وصايا لقمان لابنه في الأخلاق والتعامل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s031-05",
          "surahNumber": 31,
          "startAyah": 20,
          "endAyah": 24,
          "title": "التقليد الأعمى للآباء سبب الضلال",
          "summary": "بيان أن أصل الضلال اتّباع الآباء بغير حجة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s031-06",
          "surahNumber": 31,
          "startAyah": 25,
          "endAyah": 30,
          "title": "كلمات الله لا تنفد وإفراد الله بالحق",
          "summary": "بيان أن كلمات الله لا تنفد ولو كانت الأشجار أقلامًا والبحر مدادًا وأن الله هو الحقّ وما سواه باطل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s031-07",
          "surahNumber": 31,
          "startAyah": 31,
          "endAyah": 34,
          "title": "التحذير من يوم لا يجزي فيه والد عن ولده",
          "summary": "بيان التحذير من يوم القيامة حين لا يغني والد عن ولده ولا ولد عن والده وعدم الاغترار بالشيطان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 32,
      "surahName": "السجدة",
      "ayahCount": 30,
      "status": "documented",
      "sections": [
        {
          "id": "s032-01",
          "surahNumber": 32,
          "startAyah": 1,
          "endAyah": 11,
          "title": "القرآن لا ريب فيه نذير لقوم لم يأتهم نذير",
          "summary": "بيان أن القرآن لا شكّ فيه أُنزل إلى محمد ﷺ لينذر قومًا ما أتاهم نذير من قبله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s032-02",
          "surahNumber": 32,
          "startAyah": 12,
          "endAyah": 14,
          "title": "إيمان الكافرين يوم القيامة لا ينفعهم",
          "summary": "بيان أن الكافرين يؤمنون يوم القيامة إيمانًا لا ينفعهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s032-03",
          "surahNumber": 32,
          "startAyah": 15,
          "endAyah": 22,
          "title": "جزاء من يتجافى عن المضاجع وينفق",
          "summary": "بيان فضل من يتجافى عن المضاجع يدعو ربه خوفًا وطمعًا وينفق في سبيله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s032-04",
          "surahNumber": 32,
          "startAyah": 23,
          "endAyah": 30,
          "title": "القرآن كتاب مصدّق لما أُنزل على موسى",
          "summary": "بيان أن القرآن كالكتاب الذي أُنزل على موسى عليه السلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 33,
      "surahName": "الأحزاب",
      "ayahCount": 73,
      "status": "documented",
      "sections": [
        {
          "id": "s033-01",
          "surahNumber": 33,
          "startAyah": 1,
          "endAyah": 3,
          "title": "تقوى الله وعدم طاعة الكافرين والمنافقين",
          "summary": "بيان الأمر بتقوى الله وعدم طاعة الكافرين والمنافقين والتوكّل عليه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-02",
          "surahNumber": 33,
          "startAyah": 4,
          "endAyah": 5,
          "title": "بطلان الظهار ونسب الأدعياء",
          "summary": "بيان أن القول بالفم لا يجعل الزوجات أمهات ولا الأدعياء أبناءً حقيقيين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-03",
          "surahNumber": 33,
          "startAyah": 6,
          "endAyah": 8,
          "title": "أمهات المؤمنين وأولوية الأرحام في كتاب الله",
          "summary": "بيان أن أزواج النبي أمهات المؤمنين وأن أولي الأرحام أولى ببعض في كتاب الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-04",
          "surahNumber": 33,
          "startAyah": 9,
          "endAyah": 11,
          "title": "نعم الله على المؤمنين في غزوة الخندق",
          "summary": "بيان نعم الله على المؤمنين في غزوة الأحزاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-05",
          "surahNumber": 33,
          "startAyah": 12,
          "endAyah": 15,
          "title": "موقف المنافقين في غزوة الخندق",
          "summary": "بيان موقف المنافقين واضطرابهم في غزوة الأحزاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-06",
          "surahNumber": 33,
          "startAyah": 16,
          "endAyah": 20,
          "title": "مثبّطو القتال لا إيمان لهم وحبوط أعمالهم",
          "summary": "بيان أن من يثبّط عن قتال الكافرين ولا يشارك فيه لا إيمان له وأن أعماله حابطة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-07",
          "surahNumber": 33,
          "startAyah": 21,
          "endAyah": 24,
          "title": "سيرة رسول الله ﷺ القدوة الحسنة",
          "summary": "بيان أن في حياة رسول الله ﷺ أسوة حسنة للمؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-08",
          "surahNumber": 33,
          "startAyah": 25,
          "endAyah": 27,
          "title": "نصر الله المؤمنين على الكافرين واليهود",
          "summary": "بيان نصر الله للمؤمنين على الكافرين وقبائل اليهود في المدينة وخيبر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-09",
          "surahNumber": 33,
          "startAyah": 28,
          "endAyah": 30,
          "title": "توجيه إلى أزواج النبي ﷺ",
          "summary": "بيان توجيه إلى أزواج النبي ﷺ ومخاطبتهنّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-10",
          "surahNumber": 33,
          "startAyah": 31,
          "endAyah": 34,
          "title": "وصية الله لأزواج النبي ﷺ وبيوتهنّ",
          "summary": "بيان أمر الله لأزواج النبي ﷺ ووصاياه لهنّ وبيوتهنّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-11",
          "surahNumber": 33,
          "startAyah": 35,
          "endAyah": 36,
          "title": "لا اختيار للمؤمنين فيما قضى الله ورسوله",
          "summary": "بيان أنه ليس للمؤمن ولا المؤمنة الخيرة إذا قضى الله ورسوله أمرًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-12",
          "surahNumber": 33,
          "startAyah": 37,
          "endAyah": 40,
          "title": "زواج النبي ﷺ بزوج زيد وخاتم النبيين",
          "summary": "بيان أمر الله لنبيه ﷺ بزواج مطلّقة زيد وأنه ﷺ ليس أبا لأحد من الرجال بل رسول وخاتم النبيين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-13",
          "surahNumber": 33,
          "startAyah": 41,
          "endAyah": 48,
          "title": "إرسال النبي ﷺ بشيرًا ونذيرًا وسراجًا منيرًا",
          "summary": "بيان أن النبي ﷺ أُرسل بشيرًا ونذيرًا وداعيًا إلى الله وسراجًا منيرًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-14",
          "surahNumber": 33,
          "startAyah": 49,
          "endAyah": 52,
          "title": "حكم الطلاق قبل الدخول وخصوصية النبي ﷺ في النكاح",
          "summary": "بيان حكم الطلاق قبل المسّ والعدد الذي فرضه الله لنبيه ﷺ ونسائه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-15",
          "surahNumber": 33,
          "startAyah": 53,
          "endAyah": 55,
          "title": "آداب بيت النبوّة ومنع نكاح أزواجه بعده",
          "summary": "بيان النهي عن دخول بيوت النبي ﷺ بغير إذن وعدم الإطالة في الحديث وتحريم نكاح أزواجه من بعده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-16",
          "surahNumber": 33,
          "startAyah": 56,
          "endAyah": 58,
          "title": "صلاة الله وملائكته على النبي ﷺ",
          "summary": "بيان أن الله وملائكته يصلّون على النبي ﷺ والأمر بالصلاة عليه وتسليمًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-17",
          "surahNumber": 33,
          "startAyah": 59,
          "endAyah": 59,
          "title": "الأمر بالحجاب وضرب الخمار",
          "summary": "بيان الأمر بالحجاب وأدب خروج النساء المؤمنات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-18",
          "surahNumber": 33,
          "startAyah": 60,
          "endAyah": 62,
          "title": "جزاء المنافقين والمرجفين",
          "summary": "بيان جزاء المنافقين والذين يرجفون في المدينة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-19",
          "surahNumber": 33,
          "startAyah": 63,
          "endAyah": 68,
          "title": "طلب الكافرين مضاعفة عذاب قادتهم في جهنم",
          "summary": "بيان أن الكافرين في جهنم يسألون مضاعفة العذاب لرؤسائهم الذين أضلّوهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s033-20",
          "surahNumber": 33,
          "startAyah": 69,
          "endAyah": 73,
          "title": "تقوى الله وقبول الإنسان أمانة التكليف",
          "summary": "بيان الأمر بتقوى الله وقول الصدق وأن السماوات والأرض والجبال أشفقن من الأمانة وحملها الإنسان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 34,
      "surahName": "سبأ",
      "ayahCount": 54,
      "status": "documented",
      "sections": [
        {
          "id": "s034-01",
          "surahNumber": 34,
          "startAyah": 1,
          "endAyah": 5,
          "title": "مجيء الساعة وجزاء المؤمنين ومكذّبي الآيات",
          "summary": "بيان أن الساعة آتية وأن يوم القيامة قائم لجزاء المؤمنين وعذاب مكذّبي آيات الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s034-02",
          "surahNumber": 34,
          "startAyah": 6,
          "endAyah": 9,
          "title": "خسارة من لا يؤمن بالآخرة",
          "summary": "بيان خسارة الذين لا يؤمنون بالآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s034-03",
          "surahNumber": 34,
          "startAyah": 10,
          "endAyah": 14,
          "title": "تسبيح الجبال والطير مع داود وتسخير الريح والجنّ لسليمان",
          "summary": "بيان تسبيح الجبال والطير مع داود وتسخير الريح والجنّ لسليمان وأن الجنّ لا يعلمون الغيب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s034-04",
          "surahNumber": 34,
          "startAyah": 15,
          "endAyah": 21,
          "title": "كفران أهل سبأ النعم فصاروا حديثًا",
          "summary": "بيان كفران أهل سبأ نعم الله وتكذيبهم بالآخرة فجعلهم الله أحاديث.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s034-05",
          "surahNumber": 34,
          "startAyah": 22,
          "endAyah": 30,
          "title": "الشفاعة بإذن الله وإرسال النبي ﷺ للناس كافة",
          "summary": "بيان أن الشفاعة لا تنفع إلا بإذن الله وأن محمدًا ﷺ أُرسل إلى الناس جميعًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s034-06",
          "surahNumber": 34,
          "startAyah": 31,
          "endAyah": 36,
          "title": "أغلال المكذبين بالكتب وأن المال والولد ليسا دليل الرضا",
          "summary": "بيان أن المكذبين بالقرآن والكتب السابقة تُجعل الأغلال في أعناقهم قبل طرحهم في جهنم وأن المال والولد ليسا دليل رضا الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s034-07",
          "surahNumber": 34,
          "startAyah": 37,
          "endAyah": 45,
          "title": "الإيمان يقرّب إلى الله لا المال والولد",
          "summary": "بيان أن الإيمان وحسن العمل يقرّبان إلى الله لا المال والولد وأن الله يجزي ما يُنفق وأن للكافرين أقاويل في النبي والقرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s034-08",
          "surahNumber": 34,
          "startAyah": 46,
          "endAyah": 50,
          "title": "الدعوة إلى التفكّر وجاء الحقّ وما يُبدئ الباطل",
          "summary": "بيان الدعوة إلى التفكّر فيما يقولون وأن الحقّ قد جاء وأن الباطل لا يُبدئ ولا يُعيد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s034-09",
          "surahNumber": 34,
          "startAyah": 51,
          "endAyah": 54,
          "title": "تمنّي الكافرين الإيمان يوم القيامة وما ينفعهم",
          "summary": "بيان أن الكافرين يتمنّون الإيمان يوم القيامة فلا ينفعهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 35,
      "surahName": "فاطر",
      "ayahCount": 45,
      "status": "documented",
      "sections": [
        {
          "id": "s035-01",
          "surahNumber": 35,
          "startAyah": 1,
          "endAyah": 7,
          "title": "لا مانع ولا فاتح للرحمة إلا الله والشيطان عدوّ",
          "summary": "بيان أن الله وحده يفتح الرحمة ويمسكها وأن الشيطان عدوّ فاتّخذوه عدوًّا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s035-02",
          "surahNumber": 35,
          "startAyah": 8,
          "endAyah": 9,
          "title": "من زُيّن له سوء عمله فلا سبيل لهدايته",
          "summary": "بيان أن من زُيّن له سوء عمله لا يوفّق إلى الصراط المستقيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s035-03",
          "surahNumber": 35,
          "startAyah": 10,
          "endAyah": 11,
          "title": "العزّة كلها لله بطاعته لا لغيره",
          "summary": "بيان أن من يطلب العزّة فليطلبها من الله بطاعته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s035-04",
          "surahNumber": 35,
          "startAyah": 12,
          "endAyah": 14,
          "title": "نعم البحر والليل والنهار وعجز المعبودات",
          "summary": "بيان أن الله سخّر البحر والليل والنهار والشمس والقمر للعباد وأن من يدعون من دونه لا يسمعون ولا يستجيبون ولا يملكون شيئًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s035-05",
          "surahNumber": 35,
          "startAyah": 15,
          "endAyah": 18,
          "title": "افتقار العباد إلى الله واستغناؤه عنهم",
          "summary": "بيان أن العباد فقراء إلى الله والله غنيّ حميد لا يحتاج إليهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s035-06",
          "surahNumber": 35,
          "startAyah": 19,
          "endAyah": 26,
          "title": "لا يستوي الأحياء والأموات ولا يسمع من في القبور",
          "summary": "بيان أن الأحياء والأموات لا يستوون وأن النبي ﷺ لا يسمع من في القبور.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s035-07",
          "surahNumber": 35,
          "startAyah": 27,
          "endAyah": 37,
          "title": "أجر التالين والمقيمين والمنفقين وعذاب الكافرين",
          "summary": "بيان أن الذين يتلون كتاب الله ويقيمون الصلاة وينفقون يرجون تجارة لن تبور وأن الكافرين لهم عذاب أليم في النار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s035-08",
          "surahNumber": 35,
          "startAyah": 38,
          "endAyah": 41,
          "title": "ما أنزل الله كتابًا فيه شرك",
          "summary": "بيان أن الله لم يرسل كتابًا يأمر بعبادة غيره.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s035-09",
          "surahNumber": 35,
          "startAyah": 42,
          "endAyah": 45,
          "title": "وبال المكر يعود على صاحبه ولولا إمهال الله",
          "summary": "بيان أن وبال المكر لا يعود إلا على أهله وأنه لو يؤاخذ الله الناس بما كسبوا ما ترك على ظهرها من دابة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 36,
      "surahName": "يس",
      "ayahCount": 83,
      "status": "documented",
      "sections": [
        {
          "id": "s036-01",
          "surahNumber": 36,
          "startAyah": 1,
          "endAyah": 12,
          "title": "إنزال القرآن للإنذار ومن ينتفع به",
          "summary": "بيان أن القرآن أُنزل للإنذار وأن النبي ﷺ إنما ينذر من يخشى الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-02",
          "surahNumber": 36,
          "startAyah": 13,
          "endAyah": 21,
          "title": "مثل أصحاب القرية وتكذيبهم الرسل وإيمان الرجل",
          "summary": "بيان قصة الرسل الثلاثة إلى القرية وتكذيب أهلها وإيمان رجل جاء من أقصاها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-03",
          "surahNumber": 36,
          "startAyah": 22,
          "endAyah": 32,
          "title": "إكرام المؤمن بالجنة وإهلاك المكذبين",
          "summary": "بيان أن الله أدخل الرجل المؤمن الجنة وأهلك المكذبين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-04",
          "surahNumber": 36,
          "startAyah": 33,
          "endAyah": 36,
          "title": "خلق الأشياء أزواجًا من آيات الله",
          "summary": "بيان أن من آيات الله خلق الأرض الميتة وإحياؤها وخلق الأزواج كلها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-05",
          "surahNumber": 36,
          "startAyah": 37,
          "endAyah": 40,
          "title": "تسخير الليل والنهار والشمس والقمر",
          "summary": "بيان أن تعاقب الليل والنهار وسير الشمس والقمر بتقدير الله العزيز العليم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-06",
          "surahNumber": 36,
          "startAyah": 41,
          "endAyah": 50,
          "title": "موقف الكافر من الإنفاق في سبيل الله",
          "summary": "بيان موقف الكافرين تجاه الإنفاق في سبيل الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-07",
          "surahNumber": 36,
          "startAyah": 51,
          "endAyah": 54,
          "title": "مشهد من مشاهد يوم القيامة",
          "summary": "بيان حال الناس يوم القيامة وما يلقونه من الجزاء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-08",
          "surahNumber": 36,
          "startAyah": 55,
          "endAyah": 58,
          "title": "تحية الله لأهل الجنة",
          "summary": "بيان سلام الله على أهل الجنة وما أعدّ لهم من نعيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-09",
          "surahNumber": 36,
          "startAyah": 59,
          "endAyah": 67,
          "title": "خطاب الله للمجرمين وشهادة الأيدي والأرجل",
          "summary": "بيان خطاب الله للمجرمين يوم القيامة وشهادة أيديهم وأرجلهم عليهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-10",
          "surahNumber": 36,
          "startAyah": 68,
          "endAyah": 76,
          "title": "إنذار القرآن للأحياء وإقامة الحجة على الكافرين",
          "summary": "بيان أن القرآن نذير للأحياء وإقامة الحجة على المكذبين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s036-11",
          "surahNumber": 36,
          "startAyah": 77,
          "endAyah": 83,
          "title": "بعث الإنسان للحساب يوم القيامة",
          "summary": "بيان قدرة الله على إحياء الإنسان بعد موته للحساب يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 37,
      "surahName": "الصافات",
      "ayahCount": 182,
      "status": "documented",
      "sections": [
        {
          "id": "s037-01",
          "surahNumber": 37,
          "startAyah": 1,
          "endAyah": 39,
          "title": "القسم بالملائكة وإثبات البعث ومشهد المجرمين",
          "summary": "يُقسم بالصافّات والزاجرات والتاليات، ويُبطَل ما ادّعاه المشركون من نسبة البنات والشريك، ثم يُثبت البعث ويُصوّر مشهد المجرمين عند الحساب.",
          "structuralObservations": "تفصل لوازم ثابتة بين قصص السورة: {إلا عباد الله المخلصين} (٤٠، ٧٤، ١٢٨، ١٦٠) و{وتركنا عليه في الآخرين} (٧٨، ١٠٨، ١٢٩) و{إنا كذلك نجزي المحسنين} (٨٠، ١٢١، ١٣١) و{إنه من عبادنا المؤمنين} (٨١، ١١١، ١٣٢)؛ فتُعلن حدود المقاطع.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s037-02",
          "surahNumber": 37,
          "startAyah": 40,
          "endAyah": 74,
          "title": "نعيم المخلَصين وعاقبة الضالّين",
          "summary": "يُصف ما أُعدّ لعباد الله المخلَصين من جنات النعيم ومجالس يتذاكرون فيها، ثم يُذكر مقابله من زقّوم المجرمين وضلال من كان قبلهم.",
          "structuralObservations": "يُفتتح بلازمة {إلا عباد الله المخلصين} (٤٠) ويُختم بها (٧٤).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s037-03",
          "surahNumber": 37,
          "startAyah": 75,
          "endAyah": 82,
          "title": "قصة نوح",
          "summary": "نداء نوح ربه بعد أن كذّبوه، فنجّاه ومن معه من الكرب العظيم، ثم أغرق الآخرين.",
          "structuralObservations": "تُختم القصة بلوازم {وتركنا عليه في الآخرين} (٧٨) و{إنا كذلك نجزي المحسنين} (٨٠) و{إنه من عبادنا المؤمنين} (٨١).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s037-04",
          "surahNumber": 37,
          "startAyah": 83,
          "endAyah": 113,
          "title": "قصة إبراهيم وذبح إسماعيل",
          "summary": "من نظر إبراهيم في أفول الكواكب والقمر والشمس وتبَحُّره في ملكوت الله، إلى محاورته أباه وقومه في الأصنام وإبطال ما افتروه، ثم بشارته بالغلام الحليم وأمر الذبح وفدائه.",
          "structuralObservations": "تُختم بلوازم {وتركنا عليه في الآخرين} (١٠٨) و{إنا كذلك نجزي المحسنين} (١٢١) و{إنه من عبادنا المؤمنين} (١١١).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s037-05",
          "surahNumber": 37,
          "startAyah": 114,
          "endAyah": 122,
          "title": "قصة موسى وهارون",
          "summary": "ذكر المنّة على موسى وهارون، ونجاتهما وقومهما من الغمّ العظيم، ثم نصرهما وتصديقهما.",
          "structuralObservations": "تُختم بلوازم {إنا كذلك نجزي المحسنين} (١٢١) و{إنهما من عبادنا المؤمنين} (١٢٢).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s037-06",
          "surahNumber": 37,
          "startAyah": 123,
          "endAyah": 132,
          "title": "قصة إلياس",
          "summary": "إرسال إلياس إلى قومه، ودعوتهم إلى تقوى الله وترك عبادة بعل، ثم تكذيبهم وتخليص المخلَصين.",
          "structuralObservations": "تُختم بلوازم {وتركنا عليه في الآخرين} (١٢٩) و{إنه من عبادنا المؤمنين} (١٣٢).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s037-07",
          "surahNumber": 37,
          "startAyah": 133,
          "endAyah": 138,
          "title": "قصة لوط",
          "summary": "نجاة لوط وأهله أجمعين إلا عجوزًا في الغابرين، ثم دَمَّر الآخرين.",
          "structuralObservations": "من أقصر مقاطع السورة، ولا لازمة مستقلّة تُختم بها.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s037-08",
          "surahNumber": 37,
          "startAyah": 139,
          "endAyah": 148,
          "title": "قصة يونس",
          "summary": "إباق يونس إلى الفلك، ومشاركته في القرعة وابتلاع الحوت له، ثم نجاته بعد تسبيحه، وإيمان قومه فمتّعهم الله إلى حين.",
          "structuralObservations": "لا تُختم القصة بلازمة «وتركنا عليه» كغيرها من قصص السورة.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s037-09",
          "surahNumber": 37,
          "startAyah": 149,
          "endAyah": 182,
          "title": "خاتمة السورة: تسفيه المشركين وتنزيه الله",
          "summary": "تُسفَّه دعاوى المشركين في نسبة البنات لله والبنين لهم، وتُنزَّه ألوهيته عن إفكهم، ثم تُختم بتسبيح رب العزة وسلام على المرسلين وحمد لله رب العالمين.",
          "structuralObservations": "مقطع خاتمة تُجمع فيه معاني التنزيه والتصديق بالرسل.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        }
      ]
    },
    {
      "surahNumber": 38,
      "surahName": "ص",
      "ayahCount": 88,
      "status": "documented",
      "sections": [
        {
          "id": "s038-01",
          "surahNumber": 38,
          "startAyah": 1,
          "endAyah": 14,
          "title": "القرآن ذو الذكر وتكبّر الكفار على النبي",
          "summary": "بيان أن القرآن مليء بالعظة وأن الكافرين في تكبّر باتخاذهم النبي كاذبًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s038-02",
          "surahNumber": 38,
          "startAyah": 15,
          "endAyah": 26,
          "title": "قصة داود مع الجبال والطير والخصمان",
          "summary": "بيان تسبيح الجبال والطير مع داود وقصته مع الخصمين المتحاكمين إليه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s038-03",
          "surahNumber": 38,
          "startAyah": 27,
          "endAyah": 29,
          "title": "لم يخلق الله السماوات والأرض باطلًا",
          "summary": "بيان أن خلق السماوات والأرض لم يكن عبثًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s038-04",
          "surahNumber": 38,
          "startAyah": 30,
          "endAyah": 40,
          "title": "عرض الخيل على سليمان وطلبه ملكًا لا ينبغي لأحد",
          "summary": "بيان قصة سليمان مع الخيل ودعائه أن يؤتيه ملكًا لا ينبغي لأحد بعده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s038-05",
          "surahNumber": 38,
          "startAyah": 41,
          "endAyah": 48,
          "title": "قصة أيوب ومرضه وكشف الضر عنه",
          "summary": "بيان قصة أيوب عليه السلام في بلائه وفرجه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s038-06",
          "surahNumber": 38,
          "startAyah": 49,
          "endAyah": 64,
          "title": "القرآن ذكر لجزاء الجنة وعقاب النار",
          "summary": "بيان أن القرآن تذكير بجزاء الجنة وعذاب جهنم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s038-07",
          "surahNumber": 38,
          "startAyah": 65,
          "endAyah": 70,
          "title": "مهمة الرسل الإنذار وإعلان التوحيد",
          "summary": "بيان أن مهمة الرسل الإنذار وأنه لا إله إلا الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s038-08",
          "surahNumber": 38,
          "startAyah": 71,
          "endAyah": 88,
          "title": "خلق آدم وعصيان إبليس",
          "summary": "بيان قصة خلق آدم وامتناع إبليس عن السجود له.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 39,
      "surahName": "الزمر",
      "ayahCount": 75,
      "status": "documented",
      "sections": [
        {
          "id": "s039-01",
          "surahNumber": 39,
          "startAyah": 1,
          "endAyah": 9,
          "title": "تبرير المشركين وتحمل كل نفس وزرها",
          "summary": "بيان تبرير المشركين عبادتهم للأولياء وأن كل نفس لا تحمل وزر غيرها يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s039-02",
          "surahNumber": 39,
          "startAyah": 10,
          "endAyah": 18,
          "title": "الهجرة بالمؤمنين وخسارة من أضاع نفسه وأهله",
          "summary": "بيان الأمر بالهجرة عند تعذّر إقامة الدين وخسارة من أضاع نفسه وأهله يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s039-03",
          "surahNumber": 39,
          "startAyah": 19,
          "endAyah": 21,
          "title": "لا منقذ لمن حقت عليه كلمة العذاب",
          "summary": "بيان أن من وجبت عليه كلمة العذاب لا يقدر أحد على إنقاذه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s039-04",
          "surahNumber": 39,
          "startAyah": 22,
          "endAyah": 31,
          "title": "تماثل القرآن وتنوّع أمثاله لعبرة الناس",
          "summary": "بيان أن القرآن متشابه في آياته يكرّر تعاليمه بأساليب مختلفة وقد ضرب فيه كل مثل ليعتبر الناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s039-05",
          "surahNumber": 39,
          "startAyah": 32,
          "endAyah": 41,
          "title": "افتراء الكذب على الله ولا دافع لمشيئته",
          "summary": "بيان شناعة من افترى على الله الكذب وأنه لا دافع لمشيئة الله من ضرّ أو نفع.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s039-06",
          "surahNumber": 39,
          "startAyah": 42,
          "endAyah": 46,
          "title": "الله يتوفى الأنفس عند الموت والمنام",
          "summary": "بيان أن الله يقبض الأنفس عند موتها ويمسك التي قضى عليها الموت.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s039-07",
          "surahNumber": 39,
          "startAyah": 47,
          "endAyah": 52,
          "title": "افتداء الظالمين بكنوز الأرض يوم القيامة",
          "summary": "بيان رغبة الظالمين في الافتداء بكل ما في الأرض ومثله معه يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s039-08",
          "surahNumber": 39,
          "startAyah": 53,
          "endAyah": 63,
          "title": "لا تيأسوا من رحمة الله وتوبوا إليه",
          "summary": "بيان النهي عن القنوط من رحمة الله والأمر بالتوبة قبل فوات الأوان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s039-09",
          "surahNumber": 39,
          "startAyah": 64,
          "endAyah": 70,
          "title": "عبادة الله والشكر له وفتح كتاب الأعمال",
          "summary": "بيان الأمر بعبادة الله والشكر له وأن كتاب الأعمال يُنشر يوم القيامة ويُقضى بين الناس بالحق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s039-10",
          "surahNumber": 39,
          "startAyah": 71,
          "endAyah": 75,
          "title": "سوق الكافرين إلى جهنم والمتقين إلى الجنة",
          "summary": "بيان مصير الكافرين إلى جهنم والمتقين إلى الجنة بعد القضاء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 40,
      "surahName": "غافر",
      "ayahCount": 85,
      "status": "documented",
      "sections": [
        {
          "id": "s040-01",
          "surahNumber": 40,
          "startAyah": 1,
          "endAyah": 9,
          "title": "جدال الكافرين في آيات الله ودعاء حَمَلة العرش",
          "summary": "بيان أن الكافرين يجادلون في آيات الله وأن حملة العرش يستغفرون للمؤمنين التائبين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s040-02",
          "surahNumber": 40,
          "startAyah": 10,
          "endAyah": 20,
          "title": "مشهد يوم القيامة وخائنة الأعين والصدور",
          "summary": "بيان حال الناس يوم القيامة وعلم الله بخائنة الأعين وما تخفي الصدور.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s040-03",
          "surahNumber": 40,
          "startAyah": 21,
          "endAyah": 22,
          "title": "إهلاك من كذّب الرسل وآيات الله",
          "summary": "بيان أن الذين كذّبوا الرسل وآيات الله أُهلكوا جميعًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s040-04",
          "surahNumber": 40,
          "startAyah": 23,
          "endAyah": 27,
          "title": "إرسال موسى إلى فرعون وهامان وقارون",
          "summary": "بيان إرسال موسى إلى فرعون وهامان وقارون ونيّة فرعون قتله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s040-05",
          "surahNumber": 40,
          "startAyah": 28,
          "endAyah": 37,
          "title": "قول الرجل المؤمن من آل فرعون دفاعًا عن موسى",
          "summary": "بيان دفاع رجل مؤمن من آل فرعون عن موسى عليه السلام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s040-06",
          "surahNumber": 40,
          "startAyah": 38,
          "endAyah": 50,
          "title": "نجاة المؤمن وإهلاك آل فرعون وعرضهم على النار",
          "summary": "بيان نجاة المؤمن من مكر فرعون وإهلاك قومه وعرضهم على النار غدوًّا وعشيًّا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s040-07",
          "surahNumber": 40,
          "startAyah": 51,
          "endAyah": 61,
          "title": "نصر الله للرسل والمؤمنين وإجابة الدعاء",
          "summary": "بيان نصر الله لرسله والمؤمنين في الدنيا والآخرة وأمره بالدعاء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر. وُصل هذا المقطع بالآية 61 التي لم يضمّها تصنيف QUL، اتّصالًا للتقسيم بلا فراغ.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s040-08",
          "surahNumber": 40,
          "startAyah": 62,
          "endAyah": 68,
          "title": "لا إله إلا الله خالق كل شيء ورب العالمين",
          "summary": "بيان تفرّد الله بالألوهية والخلق والربوبية.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s040-09",
          "surahNumber": 40,
          "startAyah": 69,
          "endAyah": 78,
          "title": "جدال المكذبين في آيات الله والرسل من قبله",
          "summary": "بيان أن المجادلين في آيات الله سيعلمون الحق وأن الله أرسل رسلًا قبل محمد بعضهم ذُكر وبعضهم لم يُذكر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s040-10",
          "surahNumber": 40,
          "startAyah": 79,
          "endAyah": 85,
          "title": "الأنعام آيات لأولي الألباب ولا ينفع إيمان عند العذاب",
          "summary": "بيان أن الأنعام آيات لقوم يعقلون وأن إيمان الكافرين عند رؤية البأس لا ينفعهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 41,
      "surahName": "فصلت",
      "ayahCount": 54,
      "status": "documented",
      "sections": [
        {
          "id": "s041-01",
          "surahNumber": 41,
          "startAyah": 1,
          "endAyah": 8,
          "title": "القرآن بشير ونذير وويل لمن كذّب بالآخرة",
          "summary": "بيان أن القرآن بشير ونذير وأن الويل لمن كذّب بالآخرة ولم يؤدِّ الزكاة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s041-02",
          "surahNumber": 41,
          "startAyah": 9,
          "endAyah": 12,
          "title": "خلق الأرض والجبال والأقوات والسماوات",
          "summary": "بيان خلق الأرض والجبال وتقدير الأقوات وخلق السماوات السبع.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s041-03",
          "surahNumber": 41,
          "startAyah": 13,
          "endAyah": 18,
          "title": "إنذار الكافرين وعذاب عاد وثمود",
          "summary": "بيان إنذار الكافرين وذكر عذاب الله على عاد وثمود.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s041-04",
          "surahNumber": 41,
          "startAyah": 19,
          "endAyah": 25,
          "title": "شهادة الأسماع والأبصار والجلود يوم القيامة",
          "summary": "بيان شهادة أسماعهم وأبصارهم وجلودهم عليهم يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s041-05",
          "surahNumber": 41,
          "startAyah": 26,
          "endAyah": 32,
          "title": "عقاب المعرضين عن القرآن وبشارة المستقيمين",
          "summary": "بيان أن المعرضين عن سماع القرآن لهم عذاب شديد وأن المستمسكين بالتوحيد تنزل عليهم الملائكة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s041-06",
          "surahNumber": 41,
          "startAyah": 33,
          "endAyah": 44,
          "title": "خير القول والدعوة إلى الله والقرآن هدى وشفاء",
          "summary": "بيان أفضلية الدعوة إلى الله والعمل الصالح وأن القرآن هدى وشفاء للمؤمنين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s041-07",
          "surahNumber": 41,
          "startAyah": 45,
          "endAyah": 46,
          "title": "كتاب موسى مثل القرآن في الهدى",
          "summary": "بيان أن الكتاب الذي أُوتيه موسى مثل القرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s041-08",
          "surahNumber": 41,
          "startAyah": 47,
          "endAyah": 51,
          "title": "زوال الآلهة المزعومة يوم القيامة",
          "summary": "بيان أن ما يعبدون من دون الله يضلّ عنهم يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s041-09",
          "surahNumber": 41,
          "startAyah": 52,
          "endAyah": 54,
          "title": "أرأيتم إن كان القرآن من عند الله وكفرتم به",
          "summary": "بيان حال من يكفر بالقرآن لو كان من عند الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 42,
      "surahName": "الشورى",
      "ayahCount": 53,
      "status": "documented",
      "sections": [
        {
          "id": "s042-01",
          "surahNumber": 42,
          "startAyah": 1,
          "endAyah": 9,
          "title": "كادت السماوات تتفتّر ودعاء الملائكة لأهل الأرض",
          "summary": "بيان أن السماوات تكاد تنفطر ممن يجعل مع الله شركاء لولا استغفار الملائكة لأهل الأرض.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s042-02",
          "surahNumber": 42,
          "startAyah": 10,
          "endAyah": 19,
          "title": "دين واحد شرعه الله للأنبياء وإقامته بلا تفرّق",
          "summary": "بيان أن الإسلام دين شرعه الله لنوح وإبراهيم وموسى وعيسى وأمرهم بإقامته وعدم التفرّق فيه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s042-03",
          "surahNumber": 42,
          "startAyah": 20,
          "endAyah": 29,
          "title": "جزاء من أراد الآخرة أو أراد الدنيا",
          "summary": "بيان مضاعفة جزاء من أراد حرث الآخرة ونصيب من أراد الدنيا دون نصيب في الآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s042-04",
          "surahNumber": 42,
          "startAyah": 30,
          "endAyah": 43,
          "title": "المصائب نتيجة الأعمال وصفات المؤمنين",
          "summary": "بيان أن ما يصيب الناس من مصيبة فبما كسبت أيديهم وأن المؤمنين يقيمون الصلاة ويتصدقون وينتصرون عند الظلم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s042-05",
          "surahNumber": 42,
          "startAyah": 44,
          "endAyah": 48,
          "title": "الخسران المبين يوم القيامة",
          "summary": "بيان أن الخاسرين حقًّا هم من يخسرون يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s042-06",
          "surahNumber": 42,
          "startAyah": 49,
          "endAyah": 50,
          "title": "الله يهب الذكور والإناث ما يشاء",
          "summary": "بيان أن الله يهب لمن يشاء إناثًا ويهب لمن يشاء الذكور.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s042-07",
          "surahNumber": 42,
          "startAyah": 51,
          "endAyah": 53,
          "title": "لا يكلم الله البشر إلا وحيًا",
          "summary": "بيان أن الله لا يكلم البشر إلا بالوحي أو من وراء حجاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 43,
      "surahName": "الزخرف",
      "ayahCount": 89,
      "status": "documented",
      "sections": [
        {
          "id": "s043-01",
          "surahNumber": 43,
          "startAyah": 1,
          "endAyah": 8,
          "title": "القرآن نسخة من أم الكتاب عند الله",
          "summary": "بيان أن القرآن مأخوذ من أم الكتاب الذي عند الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s043-02",
          "surahNumber": 43,
          "startAyah": 9,
          "endAyah": 15,
          "title": "إقرار المشركين بخلق الله ودعاء الركوب",
          "summary": "بيان إقرار المشركين بأن الله خلق السماوات والأرض وأن الدعاء عند الركوب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s043-03",
          "surahNumber": 43,
          "startAyah": 16,
          "endAyah": 25,
          "title": "زعم المشركين أن الملائكة بنات الله",
          "summary": "بيان زعم بعض المشركين أن الملائكة إناث وهنّ بنات الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s043-04",
          "surahNumber": 43,
          "startAyah": 26,
          "endAyah": 35,
          "title": "تبرّي إبراهيم من الشرك وبيوت الفضة للكافرين",
          "summary": "بيان إعلان إبراهيم توحيد الله وبراءته من الشرك وأنه لولا كفر الناس جميعًا لأُعطي الكافرون بيوتًا من فضة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s043-05",
          "surahNumber": 43,
          "startAyah": 36,
          "endAyah": 45,
          "title": "قرين الشيطان لمن أعرض والاعتصام بالقرآن",
          "summary": "بيان أن من أعرض عن ذكر الرحمن قيض الله له شيطانًا قرينًا والأمر بالاستمساك بالقرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s043-06",
          "surahNumber": 43,
          "startAyah": 46,
          "endAyah": 56,
          "title": "إرسال موسى إلى فرعون واستهزاؤهم وإغراقهم",
          "summary": "بيان إرسال موسى إلى فرعون وملئه واستهزائهم بآيات الله حتى أُغرقوا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s043-07",
          "surahNumber": 43,
          "startAyah": 57,
          "endAyah": 67,
          "title": "عيسى عبد أنعم الله عليه وجعله مثلًا لبني إسرائيل",
          "summary": "بيان أن عيسى عبد أنعم الله عليه وجعله آية لبني إسرائيل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s043-08",
          "surahNumber": 43,
          "startAyah": 68,
          "endAyah": 89,
          "title": "أمن المؤمنين في الآخرة وإبطال دعوى الولد",
          "summary": "بيان أمن المؤمنين ودخولهم الجنة مبتهجين وإبطال دعوى أن لله ولدًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 44,
      "surahName": "الدخان",
      "ayahCount": 59,
      "status": "documented",
      "sections": [
        {
          "id": "s044-01",
          "surahNumber": 44,
          "startAyah": 1,
          "endAyah": 16,
          "title": "إنزال القرآن في ليلة مباركة يُفصَّل فيها الأمر",
          "summary": "بيان إنزال القرآن في ليلة مباركة يُفصَّل فيها كل أمر حكيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s044-02",
          "surahNumber": 44,
          "startAyah": 17,
          "endAyah": 29,
          "title": "عبر من قصة موسى وقوم فرعون",
          "summary": "بيان العبر المستفادة من قصة موسى وفرعون وقومه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s044-03",
          "surahNumber": 44,
          "startAyah": 30,
          "endAyah": 42,
          "title": "نجاة بني إسرائيل وتفضيلهم ويوم الفصل",
          "summary": "بيان تنجية الله بني إسرائيل وتفضيلهم على العالمين وأن يوم الفصل ميقاتهم أجمعين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s044-04",
          "surahNumber": 44,
          "startAyah": 43,
          "endAyah": 50,
          "title": "طعام المجرمين وشرابهم في جهنم",
          "summary": "بيان طعام أهل النار وشرابهم من الحميم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s044-05",
          "surahNumber": 44,
          "startAyah": 51,
          "endAyah": 59,
          "title": "نعيم المتقين في الجنة",
          "summary": "بيان ما أُعدّ للمتقين في الجنة من فواكه وأمن ونعيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 45,
      "surahName": "الجاثية",
      "ayahCount": 37,
      "status": "documented",
      "sections": [
        {
          "id": "s045-01",
          "surahNumber": 45,
          "startAyah": 1,
          "endAyah": 11,
          "title": "تدبّر آيات الله ومصير من لا يؤمن بالحديث",
          "summary": "بيان آيات الله لمن يتفكّر والسؤال بماذا يؤمنون إن كفروا بالله وآياته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s045-02",
          "surahNumber": 45,
          "startAyah": 12,
          "endAyah": 17,
          "title": "تسخير الكون للناس وتفرّق بني إسرائيل بعد العلم",
          "summary": "بيان تسخير الله البحار وما بين السماوات والأرض للناس وتفرّق بني إسرائيل في دينهم بعد مجيء العلم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s045-03",
          "surahNumber": 45,
          "startAyah": 18,
          "endAyah": 21,
          "title": "موالاة الظالمين وولاية الله للمتقين",
          "summary": "بيان أن الظالمين أولياء بعضهم وأن الله وليّ المتقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s045-04",
          "surahNumber": 45,
          "startAyah": 22,
          "endAyah": 26,
          "title": "من اتخذ هواه إلهه فأضلّه الله وختم على قلبه",
          "summary": "بيان من اتخذ هواه إلهه وأن الله أضلّه وختم على سمعه وقلبه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s045-05",
          "surahNumber": 45,
          "startAyah": 27,
          "endAyah": 37,
          "title": "خطاب الله للكافرين يوم القيامة",
          "summary": "بيان خطاب الله للمكذبين يوم القيامة وما يلاقونه من العذاب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 46,
      "surahName": "الأحقاف",
      "ayahCount": 35,
      "status": "documented",
      "sections": [
        {
          "id": "s046-01",
          "surahNumber": 46,
          "startAyah": 1,
          "endAyah": 6,
          "title": "خلق السماوات والأرض بالحق وغفلة المعبود من دونه",
          "summary": "بيان أن الله خلق السماوات والأرض بالحق وأن ما يدعوه المشركون من دونه غافل عن دعائهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s046-02",
          "surahNumber": 46,
          "startAyah": 7,
          "endAyah": 10,
          "title": "القرآن كلام الله والنبي نذير مبين",
          "summary": "بيان أن القرآن كلام الله لا قول النبي وأن النبي نذير مبين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s046-03",
          "surahNumber": 46,
          "startAyah": 11,
          "endAyah": 14,
          "title": "القرآن مصدّق لما قبله من التوراة",
          "summary": "بيان أن القرآن مصدّق لما قبله من كتاب موسى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s046-04",
          "surahNumber": 46,
          "startAyah": 15,
          "endAyah": 20,
          "title": "جزاء الإحسان إلى الوالدين وعقوقهما",
          "summary": "بيان جزاء من أحسن إلى والديه وعقاب العاقّ بهما.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s046-05",
          "surahNumber": 46,
          "startAyah": 21,
          "endAyah": 26,
          "title": "تكذيب عاد برسولها وإهلاكها",
          "summary": "بيان تكذيب قوم عاد رسولهم فدُمّروا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s046-06",
          "surahNumber": 46,
          "startAyah": 27,
          "endAyah": 28,
          "title": "لا ينجّي من عذاب الله أحد",
          "summary": "بيان أن الآلهة المزعومة لا تنجّي من عذاب الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s046-07",
          "surahNumber": 46,
          "startAyah": 29,
          "endAyah": 34,
          "title": "إسلام نفر من الجن ودعوتهم قومهم",
          "summary": "بيان إيمان طائفة من الجن بعد سماع القرآن ودعوتهم قومهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s046-08",
          "surahNumber": 46,
          "startAyah": 35,
          "endAyah": 35,
          "title": "الصبر على تبليغ رسالة الله",
          "summary": "بيان الأمر بالاستمرار في التبليغ والصبر على أذى الكافرين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 47,
      "surahName": "محمد",
      "ayahCount": 38,
      "status": "documented",
      "sections": [
        {
          "id": "s047-01",
          "surahNumber": 47,
          "startAyah": 1,
          "endAyah": 3,
          "title": "إبطال أعمال الذين كفروا",
          "summary": "بيان أن الله أضلّ أعمال الذين كفروا وصدّهم عن سبيل الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s047-02",
          "surahNumber": 47,
          "startAyah": 4,
          "endAyah": 6,
          "title": "ضرب الرقاب وشدّ الوثاق في القتال",
          "summary": "بيان الأمر بضرب الرقاب في القتال وإمساك الأسرى حتى تضع الحرب أوزارها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s047-03",
          "surahNumber": 47,
          "startAyah": 7,
          "endAyah": 11,
          "title": "من ينصر الله ينصره الله",
          "summary": "بيان أن الله ينصر المؤمنين ويثبّت أقدامهم إذا نصروه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s047-04",
          "surahNumber": 47,
          "startAyah": 12,
          "endAyah": 14,
          "title": "المؤمنون لا يتبعون أهواءهم",
          "summary": "بيان أن المؤمنين لا يتبعون أهواءهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s047-05",
          "surahNumber": 47,
          "startAyah": 15,
          "endAyah": 15,
          "title": "مثل الجنة والنار",
          "summary": "بيان صفة الجنة ونعيمها ومثل النار وعذابها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s047-06",
          "surahNumber": 47,
          "startAyah": 16,
          "endAyah": 19,
          "title": "المنافقون الذين طبع الله على قلوبهم",
          "summary": "بيان أن المنافقين الذين طبع الله على قلوبهم لا يفقهون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s047-07",
          "surahNumber": 47,
          "startAyah": 20,
          "endAyah": 28,
          "title": "قول بلا عمل ولعن الله لفاعله",
          "summary": "بيان ذم الوعد بالطاعة والقول الحسن الذي لا يتبعه عمل ولعن فاعله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s047-08",
          "surahNumber": 47,
          "startAyah": 29,
          "endAyah": 34,
          "title": "ابتلاء الله للمؤمنين ليعلم المجاهدين والصابرين",
          "summary": "بيان ابتلاء الله المؤمنين وتمحيصهم ليعلم المجاهدين والصابرين منهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s047-09",
          "surahNumber": 47,
          "startAyah": 35,
          "endAyah": 36,
          "title": "الله مع المؤمنين في الحرب",
          "summary": "بيان أن الله مع المؤمنين وأنهم الأعلى فلا يدعون إلى السلم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s047-10",
          "surahNumber": 47,
          "startAyah": 37,
          "endAyah": 38,
          "title": "النهي عن البخل في الإنفاق في سبيل الله",
          "summary": "بيان النهي عن الشحّ إذا دُعي المؤمنون للإنفاق في سبيل الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 48,
      "surahName": "الفتح",
      "ayahCount": 29,
      "status": "documented",
      "sections": [
        {
          "id": "s048-01",
          "surahNumber": 48,
          "startAyah": 1,
          "endAyah": 10,
          "title": "الفتح المبين ومبايعة الرسول مبايعة لله",
          "summary": "بيان فتح الله المبين للمسلمين في صلح الحديبية ومبايعة النبي التي هي مبايعة لله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s048-02",
          "surahNumber": 48,
          "startAyah": 11,
          "endAyah": 17,
          "title": "ذم تخلف الأعراب ورُخص أهل الأعذار",
          "summary": "بيان ذم الأعراب الذين تخلفوا عن النبي وأن العمى والعرج والمرض أعذار من القتال.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s048-03",
          "surahNumber": 48,
          "startAyah": 18,
          "endAyah": 26,
          "title": "رضا الله عن المبايعين ولطفه بالمؤمنين في مكة",
          "summary": "بيان رضا الله عن الذين بايعوا النبي تحت الشجرة وأنه لولا المؤمنون بمكة لسُلّط المسلمون على قريش.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s048-04",
          "surahNumber": 48,
          "startAyah": 27,
          "endAyah": 29,
          "title": "رؤيا فتح مكة وصفات النبي وأصحابه",
          "summary": "بيان صدق رؤيا النبي بفتح مكة وصفات محمد ﷺ وأصحابه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 49,
      "surahName": "الحجرات",
      "ayahCount": 18,
      "status": "documented",
      "sections": [
        {
          "id": "s049-01",
          "surahNumber": 49,
          "startAyah": 1,
          "endAyah": 10,
          "title": "خفض الصوت عند النبي والإصلاح بين المؤمنين",
          "summary": "بيان الأمر بخفض الصوت في حضرة النبي ﷺ والأمر بالإصلاح بين المؤمنين إن اقتتلوا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s049-02",
          "surahNumber": 49,
          "startAyah": 11,
          "endAyah": 13,
          "title": "آداب الإسلام ووحدة أصل الناس وتقواهم",
          "summary": "بيان الآداب الأخلاقية في الإسلام وأن الناس خُلقوا من ذكر وأنثى وأن أكرمهم أتقاهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s049-03",
          "surahNumber": 49,
          "startAyah": 14,
          "endAyah": 18,
          "title": "الفرق بين المؤمن الصادق والمسلم",
          "summary": "بيان الفرق بين المؤمن الحق والمسلم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 50,
      "surahName": "ق",
      "ayahCount": 45,
      "status": "documented",
      "sections": [
        {
          "id": "s050-01",
          "surahNumber": 50,
          "startAyah": 1,
          "endAyah": 15,
          "title": "حقيقة البعث ولا غرابة فيه",
          "summary": "بيان أن البعث حق لا غرابة فيه وإنكار المكذبين له.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s050-02",
          "surahNumber": 50,
          "startAyah": 16,
          "endAyah": 29,
          "title": "حفظ الملكين لكل قول وإلقاء المعاند في النار",
          "summary": "بيان أن الله وكل على الإنسان ملكين يكتبان كل ما يقول وأن المعاند يُلقى في جهنم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s050-03",
          "surahNumber": 50,
          "startAyah": 30,
          "endAyah": 35,
          "title": "مقالة جهنم هل امتلأت ولمن يحضر",
          "summary": "بيان قول الله لجهنم هل امتلأت وردّها هل من مزيد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s050-04",
          "surahNumber": 50,
          "startAyah": 36,
          "endAyah": 45,
          "title": "الإنذار والصبر والذكرى بالقرآن",
          "summary": "بيان الأمر بإنذار الكافرين والصبر عليهم والتذكير بالقرآن.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 51,
      "surahName": "الذاريات",
      "ayahCount": 60,
      "status": "documented",
      "sections": [
        {
          "id": "s051-01",
          "surahNumber": 51,
          "startAyah": 1,
          "endAyah": 23,
          "title": "تحقق يوم القيامة وإعراض المنحرفين عنه",
          "summary": "بيان أن يوم القيامة واقع لا محالة وأنه لا يعرض عنه إلا المنحرفون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s051-02",
          "surahNumber": 51,
          "startAyah": 24,
          "endAyah": 30,
          "title": "بشارة إبراهيم بغلام عليم",
          "summary": "بيان قصة ضيوف إبراهيم وتبشيرهم له بغلام عليم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s051-03",
          "surahNumber": 51,
          "startAyah": 31,
          "endAyah": 37,
          "title": "إهلاك قوم لوط على يد الملائكة",
          "summary": "بيان إهلاك قوم لوط الفاعلين للفاحشة على يد الملائكة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s051-04",
          "surahNumber": 51,
          "startAyah": 38,
          "endAyah": 46,
          "title": "عبر في قصص فرعون وعاد وثمود وقوم نوح",
          "summary": "بيان العبر في إهلاك فرعون وعاد وثمود وقوم نوح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s051-05",
          "surahNumber": 51,
          "startAyah": 47,
          "endAyah": 60,
          "title": "خلق السماوات والأرض وإنذار محمد للعالمين",
          "summary": "بيان أن الله بنى السماوات وفرش الأرض وأنه جعل محمدًا ﷺ نذيرًا للعالمين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 52,
      "surahName": "الطور",
      "ayahCount": 49,
      "status": "documented",
      "sections": [
        {
          "id": "s052-01",
          "surahNumber": 52,
          "startAyah": 1,
          "endAyah": 28,
          "title": "مصير المكذبين وجزاء المتقين في الجنة",
          "summary": "بيان إلقاء المكذبين في النار ونعيم المتقين في الجنة وشكرهم لله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s052-02",
          "surahNumber": 52,
          "startAyah": 29,
          "endAyah": 49,
          "title": "مهمة النبي والردّ على مطاعن الكافرين",
          "summary": "بيان مهمة النبي ﷺ والرد على مطاعن المكذبين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 53,
      "surahName": "النجم",
      "ayahCount": 62,
      "status": "documented",
      "sections": [
        {
          "id": "s053-01",
          "surahNumber": 53,
          "startAyah": 1,
          "endAyah": 18,
          "title": "مشهد الوحي الأول ونزول جبريل بالنبي",
          "summary": "بيان مشهد الوحي الأول وأن النبي ﷺ رأى من آيات ربه الكبرى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s053-02",
          "surahNumber": 53,
          "startAyah": 19,
          "endAyah": 25,
          "title": "اللات والعزّى ومناة أسماء مفتَراة",
          "summary": "بيان أن اللات والعزّى ومناة مجرد أسماء سمّاها المشركون ما أنزل الله بها من سلطان.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s053-03",
          "surahNumber": 53,
          "startAyah": 26,
          "endAyah": 32,
          "title": "شفاعة الملائكة بإذن الله والنهي عن تزكية النفس",
          "summary": "بيان أن الملائكة لا تشفع إلا بإذن الله والنهي عن تزكية النفس وأن الله أعلم بمن اتقى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s053-04",
          "surahNumber": 53,
          "startAyah": 33,
          "endAyah": 62,
          "title": "لا تحمل نفس وزر غيرها وليس للإنسان إلا سعيه",
          "summary": "بيان أن كل نفس لا تحمل وزر غيرها وأن الإنسان ليس له إلا ما سعى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 54,
      "surahName": "القمر",
      "ayahCount": 55,
      "status": "documented",
      "sections": [
        {
          "id": "s054-01",
          "surahNumber": 54,
          "startAyah": 1,
          "endAyah": 8,
          "title": "اقتراب الساعة وحال المكذبين",
          "summary": "انشقاق القمر وآية الساعة، وإعراض المكذبين وقولهم «سحر مستمر»، ثم وصف خروجهم من الأجداث مسرعين إلى الداعي.",
          "structuralObservations": "تنتظم السورة بلازمتين: {فكيف كان عذابي ونذر} (١٦، ٢١، ٣٠) و{ولقد يسرنا القرآن للذكر فهل من مدكر} (١٧، ٢٢، ٣٢، ٤٠)، ويُفتتح كل مشهد بمثل {كذبت قبلهم قوم نوح} (٩، ١٨، ٢٣، ٣٣، ٤١).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s054-02",
          "surahNumber": 54,
          "startAyah": 9,
          "endAyah": 17,
          "title": "قصة قوم نوح",
          "summary": "تكذيب قوم نوح لعبد الله، ودعوة نوح ربه أنه مغلوب فانتصر، ثم فتح أبواب السماء بماء منهمر وإغراقهم، ونجاة من حمل في الفلك.",
          "structuralObservations": "تُختم المقطع بلازمة العذاب عند ١٦ ولازمة تيسير القرآن عند ١٧.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s054-03",
          "surahNumber": 54,
          "startAyah": 18,
          "endAyah": 22,
          "title": "قصة عاد",
          "summary": "تكذيب عاد، وإرسال الريح الصرصر عليهم في يوم نحس مستمر تنزع الناس كأعجاز نخل منقعر.",
          "structuralObservations": "تُختم بلازمة العذاب عند ٢١ ولازمة تيسير القرآن عند ٢٢.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s054-04",
          "surahNumber": 54,
          "startAyah": 23,
          "endAyah": 32,
          "title": "قصة ثمود",
          "summary": "تكذيب ثمود للنذر وقولهم «أبشرًا منّا واحدًا نتبعه»، ثم إرسال الناقة فتنة، وعقرها، وإهلاكهم بصيحة واحدة.",
          "structuralObservations": "تُختم بلازمة العذاب عند ٣٠ ولازمة تيسير القرآن عند ٣٢.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s054-05",
          "surahNumber": 54,
          "startAyah": 33,
          "endAyah": 40,
          "title": "قصة قوم لوط",
          "summary": "تكذيب قوم لوط بالنذر، وإرسال الحاصب عليهم إلا آل لوط، ومحاولتهم إيواء ضيفه فطُمس أعينهم، ثم صباح العذاب المستقر.",
          "structuralObservations": "تُختم بلازمة العذاب عند ٣٩ ولازمة تيسير القرآن عند ٤٠.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s054-06",
          "surahNumber": 54,
          "startAyah": 41,
          "endAyah": 42,
          "title": "آل فرعون",
          "summary": "مجيء النذر إلى آل فرعون، وتكذيبهم بآيات الله كلها، فأخذهم الله أخذ عزيز مقتدر.",
          "structuralObservations": "من أقصر المقاطع، ولا لازمة تُختم بها.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s054-07",
          "surahNumber": 54,
          "startAyah": 43,
          "endAyah": 46,
          "title": "خطاب المشركين المعاصرين وإنذارهم",
          "summary": "استفهام يُلزم المشركين بالحجة: أكفاركم خير من أولئك أم لكم براءة في الزبر؟ ثم إخبار بأن الجمع سَيُهزم وأن الساعة موعدهم.",
          "structuralObservations": "انتقال من قصص الأولين إلى مواجهة المخاطبين.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s054-08",
          "surahNumber": 54,
          "startAyah": 47,
          "endAyah": 55,
          "title": "خاتمة السورة: جزاء المجرمين والمتقين",
          "summary": "المجرمون في ضلال وسعر يُسحبون في النار على وجوههم، وكل شيء خُلق بقدر، ثم المتقون في جنات ونهر في مقعد صدق عند مليك مقتدر.",
          "structuralObservations": "تُختم السورة بمقابلة الجزاءين، وقد افتُتحت السورة بذكر مصيرهم فانتظم الطرفان.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        }
      ]
    },
    {
      "surahNumber": 55,
      "surahName": "الرحمن",
      "ayahCount": 78,
      "status": "documented",
      "sections": [
        {
          "id": "s055-01",
          "surahNumber": 55,
          "startAyah": 1,
          "endAyah": 13,
          "title": "الرحمن وآثار رحمته في التعليم والخلق والميزان",
          "summary": "يُفتتح باسم الرحمن وتعليمه القرآن وخلق الإنسان وتعليمه البيان، ثم تسخير الشمس والقمر والنجم والشجر، ورفع السماء ووضع الميزان، وإخراج الثمرة والنخل والحب.",
          "structuralObservations": "تتكرر في السورة لازمة واحدة {فبأي آلاء ربكما تكذبان} إحدى وثلاثين مرة (١٣، ١٦ … ٧٧)، وهي تُطوّق كل مشهد وترسم تخوم المقاطع؛ وتقع آخر لازمة قبل قوله {ومن دونهما جنتان} (٦٢).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s055-02",
          "surahNumber": 55,
          "startAyah": 14,
          "endAyah": 25,
          "title": "خلق الإنس والجان ومظاهر القدرة في الكون",
          "summary": "خلق الإنسان من صلصال كالفخار والجان من مارج من نار، ثم ربوبيته للمشرقين والمغربين، ومرج البحرين والبرزخ بينهما، واستخراج اللؤلؤ والمرجان، وسفن كالأعلام.",
          "structuralObservations": "تتخلّل المقطع لازمة {فبأي آلاء ربكما تكذبان} بعد كل آية أو آيتين (١٦، ١٨، ٢١، ٢٣، ٢٥).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s055-03",
          "surahNumber": 55,
          "startAyah": 26,
          "endAyah": 30,
          "title": "فناء الخلق وبقاء وجه الله",
          "summary": "كل من على الأرض فانٍ ويبقى وجه الرب ذو الجلال والإكرام، ويسأله من في السماوات والأرض كل يوم هو في شأن.",
          "structuralObservations": "تُختم بلازمة عند ٢٨.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s055-04",
          "surahNumber": 55,
          "startAyah": 31,
          "endAyah": 36,
          "title": "خطاب الثقلين والتهديد",
          "summary": "«سنفرغ لكم أيها الثقلان»، ودعوتهم إلى النفوذ من أقطار السماوات والأرض إن استطاعوا، ثم إرسال شواظ من نار ونحاس فلا ينتصران.",
          "structuralObservations": "خِطابٌ صريح للجن والإنس، وتتخلّله اللازمة (٣٢، ٣٤، ٣٦).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s055-05",
          "surahNumber": 55,
          "startAyah": 37,
          "endAyah": 45,
          "title": "مشهد القيامة وجزاء المجرمين",
          "summary": "انشقاق السماء فكانت وردة كالدهان، وترك السؤال عن ذنوبهم، ومعرفة المجرمين بسيماهم وأخذهم بالنواصي والأقدام، ثم جهنم التي يكذب بها المجرمون وطوافهم بينها وبين حميم آن.",
          "structuralObservations": "تُختم بلازمة عند ٤٥ بعد وصف جهنم.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s055-06",
          "surahNumber": 55,
          "startAyah": 46,
          "endAyah": 61,
          "title": "الجنتان لمن خاف مقام ربه",
          "summary": "جنتان ذواتا أفنان، فيهما عينان تجريان، ومن كل فاكهة زوجان، وفرش بطائنها من استبرق، وقاصرات الطرف لم يطمثهن إنس ولا جان، و«هل جزاء الإحسان إلا الإحسان».",
          "structuralObservations": "أولى الجنتين، وتتخلّلها اللازمة بعد كل مشهد.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s055-07",
          "surahNumber": 55,
          "startAyah": 62,
          "endAyah": 77,
          "title": "الجنتان الأدنيان",
          "summary": "«ومن دونهما جنتان» مدهامّتان، فيهما عينان نضّاختان وفاكهة ونخل ورمان، وخيرات حسان وحور مقصورات في الخيام.",
          "structuralObservations": "ثانية الجنتين، ويُفتتح المقطع بـ{ومن دونهما جنتان} تمييزًا له عن الأول.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s055-08",
          "surahNumber": 55,
          "startAyah": 78,
          "endAyah": 78,
          "title": "خاتمة السورة",
          "summary": "«تبارك اسم ربك ذي الجلال والإكرام» خاتمة تُوافق ما افتُتحت به السورة من اسم الرحمن وما تكرر فيها من الجلال والإكرام.",
          "structuralObservations": "آية واحدة تُختم بها السورة، وهي نظير قوله في أثناء السورة {ويبقى وجه ربك ذو الجلال والإكرام} (٢٧).",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        }
      ]
    },
    {
      "surahNumber": 56,
      "surahName": "الواقعة",
      "ayahCount": 96,
      "status": "documented",
      "sections": [
        {
          "id": "s056-01",
          "surahNumber": 56,
          "startAyah": 1,
          "endAyah": 26,
          "title": "مشهد يوم القيامة وتقسيم الناس وجزاء السابقين",
          "summary": "بيان مشهد القيامة وتفريق الناس ثلاث فرق وجزاء السابقين المقربين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s056-02",
          "surahNumber": 56,
          "startAyah": 27,
          "endAyah": 38,
          "title": "جزاء أصحاب الميمنة",
          "summary": "بيان نعيم أصحاب الميمنة وما أعدّ لهم من جنات ونعيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s056-03",
          "surahNumber": 56,
          "startAyah": 39,
          "endAyah": 56,
          "title": "عقاب أصحاب المشأمة",
          "summary": "بيان عذاب أصحاب المشأمة وما يلقونه من حميم وظلّ من يحموم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s056-04",
          "surahNumber": 56,
          "startAyah": 57,
          "endAyah": 74,
          "title": "تذكير المكذبين بآيات الخلق",
          "summary": "بيان تذكير المكذبين بخلقهم وخلق ما ينبتون وأن ذلك يدل على قدرة الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s056-05",
          "surahNumber": 56,
          "startAyah": 75,
          "endAyah": 96,
          "title": "شهادة الله على القرآن",
          "summary": "بيان شهادة الله على صدق القرآن الكريم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 57,
      "surahName": "الحديد",
      "ayahCount": 29,
      "status": "documented",
      "sections": [
        {
          "id": "s057-01",
          "surahNumber": 57,
          "startAyah": 1,
          "endAyah": 10,
          "title": "تسبيح الكون وعلم الله وثواب المنفقين",
          "summary": "بيان أن المخلوقات تسبّح الله وأنه خلق الكون في ستة أيام وأن المنفقين لهم أجر عظيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s057-02",
          "surahNumber": 57,
          "startAyah": 11,
          "endAyah": 19,
          "title": "نور المؤمنين ومصير المنافقين وأجر المنفقين",
          "summary": "بيان سعي المؤمنين ونورهم ومصير المنافقين ومضاعفة أجر المنفقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s057-03",
          "surahNumber": 57,
          "startAyah": 20,
          "endAyah": 25,
          "title": "حقيقة الحياة الدنيا والنهي عن الحزن والفرح",
          "summary": "بيان أن الدنيا لهو ولعب وأن المؤمن لا يحزن على فائت ولا يفرح بما أوتي.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s057-04",
          "surahNumber": 57,
          "startAyah": 26,
          "endAyah": 29,
          "title": "بعثة نوح وإبراهيم وعيسى والرهبانية",
          "summary": "بيان إرسال نوح وإبراهيم وعيسى للهداية وأن الرهبانية ابتدعها الناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 58,
      "surahName": "المجادلة",
      "ayahCount": 22,
      "status": "documented",
      "sections": [
        {
          "id": "s058-01",
          "surahNumber": 58,
          "startAyah": 1,
          "endAyah": 6,
          "title": "تحريم الظهار وكفارته وعقوبته",
          "summary": "بيان تحريم الظهار وبيان كفارته وعقوبة من يخالف حكم الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s058-02",
          "surahNumber": 58,
          "startAyah": 7,
          "endAyah": 13,
          "title": "آداب المجالس والصدقة قبل مناجاة الرسول",
          "summary": "بيان آداب المجالس وأمر المؤمنين بالصدقة قبل مناجاة الرسول.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s058-03",
          "surahNumber": 58,
          "startAyah": 14,
          "endAyah": 22,
          "title": "النهي عن موالاة أهل الغضب",
          "summary": "بيان تحذير من يوالي من غضب الله عليه وأن المؤمنين لا يوادّون من عادى الله ورسوله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 59,
      "surahName": "الحشر",
      "ayahCount": 24,
      "status": "documented",
      "sections": [
        {
          "id": "s059-01",
          "surahNumber": 59,
          "startAyah": 1,
          "endAyah": 5,
          "title": "جلاء بني النضير لنقضهم العهد",
          "summary": "بيان أمر الله بجلاء بني النضير من اليهود لنقضهم العهد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s059-02",
          "surahNumber": 59,
          "startAyah": 6,
          "endAyah": 10,
          "title": "تقسيم أموال بني النضير وصفات المهاجرين والأنصار",
          "summary": "بيان قسمة أموال بني النضير وذكر صفات المهاجرين والأنصار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s059-03",
          "surahNumber": 59,
          "startAyah": 11,
          "endAyah": 17,
          "title": "تآمر المنافقين مع أهل الكتاب والمثل",
          "summary": "بيان تآمر المنافقين مع أهل الكتاب وضرب المثل بين الشيطان والكافر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s059-04",
          "surahNumber": 59,
          "startAyah": 18,
          "endAyah": 20,
          "title": "نظر النفس فيما قدّمت للآخرة",
          "summary": "بيان الأمر بأن تنظر كل نفس ما قدّمت لغد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s059-05",
          "surahNumber": 59,
          "startAyah": 21,
          "endAyah": 21,
          "title": "خضوع الجبل لخشية الله",
          "summary": "بيان أن القرآن لو أُنزل على جبل لتصدّع خشية الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s059-06",
          "surahNumber": 59,
          "startAyah": 22,
          "endAyah": 24,
          "title": "أسماء الله وصفاته العليا",
          "summary": "بيان أسماء الله الحسنى وصفاته العليا وتنزيهه عن النقائص.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 60,
      "surahName": "الممتحنة",
      "ayahCount": 13,
      "status": "documented",
      "sections": [
        {
          "id": "s060-01",
          "surahNumber": 60,
          "startAyah": 1,
          "endAyah": 3,
          "title": "النهي عن موالاة أعداء الله",
          "summary": "بيان النهي عن موالاة أعداء الله والمسلمين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s060-02",
          "surahNumber": 60,
          "startAyah": 4,
          "endAyah": 6,
          "title": "إبراهيم وأصحابه قدوة للمؤمنين",
          "summary": "بيان أن إبراهيم وأصحابه قدوة حسنة للمؤمنين في التبرّي من الشرك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s060-03",
          "surahNumber": 60,
          "startAyah": 7,
          "endAyah": 9,
          "title": "استثناء من لم يقاتلوا المسلمين",
          "summary": "بيان جواز البرّ والإقساط لمن لم يقاتل المؤمنين ولم يخرجهم من ديارهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s060-04",
          "surahNumber": 60,
          "startAyah": 10,
          "endAyah": 11,
          "title": "اختبار إيمان المهاجرات وعدم ردّهن",
          "summary": "بيان اختبار إيمان المهاجرات وعدم ردّهن إلى أزواجهن الكفار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s060-05",
          "surahNumber": 60,
          "startAyah": 12,
          "endAyah": 12,
          "title": "بيعة النساء للنبي ﷺ",
          "summary": "بيان ما تُبايِع عليه النساء النبي ﷺ من الطاعات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s060-06",
          "surahNumber": 60,
          "startAyah": 13,
          "endAyah": 13,
          "title": "النهي عن موالاة من غضب الله عليه",
          "summary": "بيان النهي عن موالاة القوم الذين غضب الله عليهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 61,
      "surahName": "الصف",
      "ayahCount": 14,
      "status": "documented",
      "sections": [
        {
          "id": "s061-01",
          "surahNumber": 61,
          "startAyah": 1,
          "endAyah": 9,
          "title": "ذم قول ما لا يُفعل وبشارة عيسى",
          "summary": "بيان النهي عن قول ما لا يُعمل به وبشارة عيسى بنبي يأتي من بعده اسمه أحمد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s061-02",
          "surahNumber": 61,
          "startAyah": 10,
          "endAyah": 14,
          "title": "تجارة منجية ونصرة المؤمنين لله",
          "summary": "بيان التجارة المنجية من النار وأمر المؤمنين بأن يكونوا أنصار الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 62,
      "surahName": "الجمعة",
      "ayahCount": 11,
      "status": "documented",
      "sections": [
        {
          "id": "s062-01",
          "surahNumber": 62,
          "startAyah": 1,
          "endAyah": 4,
          "title": "بعثة محمد ﷺ في الأميين",
          "summary": "بيان بعثة النبي محمد ﷺ في الأميين وغيرهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s062-02",
          "surahNumber": 62,
          "startAyah": 5,
          "endAyah": 8,
          "title": "ردّ دعوى اليهود المحاباة",
          "summary": "بيان ردّ دعوى اليهود بأنهم أحبّاء الله دون الناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s062-03",
          "surahNumber": 62,
          "startAyah": 9,
          "endAyah": 11,
          "title": "وجوب السعي لصلاة الجمعة",
          "summary": "بيان الأمر بالسعي إلى ذكر الله يوم الجمعة وترك البيع.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 63,
      "surahName": "المنافقون",
      "ayahCount": 11,
      "status": "documented",
      "sections": [
        {
          "id": "s063-01",
          "surahNumber": 63,
          "startAyah": 1,
          "endAyah": 8,
          "title": "عداء المنافقين للإسلام ورسوله",
          "summary": "بيان شدة عداء المنافقين وأن استغفار الرسول لا يغني عنهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s063-02",
          "surahNumber": 63,
          "startAyah": 9,
          "endAyah": 11,
          "title": "النهي عن الانشغال بالأموال والأولاد",
          "summary": "بيان النهي عن أن تُلهي الأموال والأولاد عن ذكر الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 64,
      "surahName": "التغابن",
      "ayahCount": 18,
      "status": "documented",
      "sections": [
        {
          "id": "s064-01",
          "surahNumber": 64,
          "startAyah": 1,
          "endAyah": 10,
          "title": "ملك الله وعلمه والبعث والجزاء",
          "summary": "بيان أن الملك لله وأنه يعلم السرّ والعلن وأن البعث والجزاء حقّ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s064-02",
          "surahNumber": 64,
          "startAyah": 11,
          "endAyah": 18,
          "title": "البلاء بإذن الله والحذر من الأعداء",
          "summary": "بيان أن المصيبة بإذن الله وأن من الأزواج والأولاد عدوًّا فليُحذر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 65,
      "surahName": "الطلاق",
      "ayahCount": 12,
      "status": "documented",
      "sections": [
        {
          "id": "s065-01",
          "surahNumber": 65,
          "startAyah": 1,
          "endAyah": 7,
          "title": "أحكام الطلاق ومدة العدّة",
          "summary": "بيان أحكام الطلاق ومدة العدّة وطلاق الحامل مقرونًا بوضعها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s065-02",
          "surahNumber": 65,
          "startAyah": 8,
          "endAyah": 12,
          "title": "عاقبة عصيان أمر الله",
          "summary": "بيان عاقبة القرى التي عصت أمر ربها وأن التقوى سبب الفلاح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 66,
      "surahName": "التحريم",
      "ayahCount": 12,
      "status": "documented",
      "sections": [
        {
          "id": "s066-01",
          "surahNumber": 66,
          "startAyah": 1,
          "endAyah": 7,
          "title": "النهي عن تحريم الحلال وتوجيه الأزواج",
          "summary": "بيان النهي عن تحريم ما أحلّ الله وتوجيه أزواج النبي ﷺ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s066-02",
          "surahNumber": 66,
          "startAyah": 8,
          "endAyah": 12,
          "title": "التوبة النصوح ومثل نساء الأنبياء",
          "summary": "بيان الأمر بالتوبة النصوح وضرب المثل بنساء نوح ولوط وامرأة فرعون ومريم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 67,
      "surahName": "الملك",
      "ayahCount": 30,
      "status": "documented",
      "sections": [
        {
          "id": "s067-01",
          "surahNumber": 67,
          "startAyah": 1,
          "endAyah": 14,
          "title": "ملك الله وزينة السماء وحوار أهل النار",
          "summary": "بيان أن الملك بيد الله وأن السماء الدنيا زُيّنت بالمصابيح وحوار أهل جهنم مع خزنتها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s067-02",
          "surahNumber": 67,
          "startAyah": 15,
          "endAyah": 30,
          "title": "لا ناصر ولا رازق ولا مُنجي إلا الله",
          "summary": "بيان أنه لا ناصر ولا رازق ولا مُنجٍ من عذاب الله سواه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 68,
      "surahName": "القلم",
      "ayahCount": 52,
      "status": "documented",
      "sections": [
        {
          "id": "s068-01",
          "surahNumber": 68,
          "startAyah": 1,
          "endAyah": 16,
          "title": "علوّ خلق النبي وذم الحلّاف المهين",
          "summary": "بيان شهادة الله بعلوّ خلق النبي ﷺ والنهي عن طاعة الحلّاف المهين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s068-02",
          "surahNumber": 68,
          "startAyah": 17,
          "endAyah": 33,
          "title": "عاقبة أصحاب الجنة الباخلين",
          "summary": "بيان عاقبة أصحاب الجنة الذين بخلوا بحقّ الفقراء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s068-03",
          "surahNumber": 68,
          "startAyah": 34,
          "endAyah": 43,
          "title": "لا يستوي المؤمنون والمجرمون",
          "summary": "بيان أن الله لا يجعل المسلمين كالمجرمين وأن الآيات دلالات واضحة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s068-04",
          "surahNumber": 68,
          "startAyah": 44,
          "endAyah": 52,
          "title": "استدراج المكذبين بآيات الله",
          "summary": "بيان أن من كذّب بآيات الله يُستدرج ثم يُهلك.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 69,
      "surahName": "الحاقة",
      "ayahCount": 52,
      "status": "documented",
      "sections": [
        {
          "id": "s069-01",
          "surahNumber": 69,
          "startAyah": 1,
          "endAyah": 18,
          "title": "وصف يوم القيامة وأهواله",
          "summary": "بيان وصف يوم القيامة وأهواله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s069-02",
          "surahNumber": 69,
          "startAyah": 19,
          "endAyah": 37,
          "title": "جزاء السعداء وجزاء الأشقياء",
          "summary": "بيان ثواب السعداء وعذاب الأشقياء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s069-03",
          "surahNumber": 69,
          "startAyah": 38,
          "endAyah": 52,
          "title": "القرآن كلام الله وتذكرة للمتقين",
          "summary": "بيان أن القرآن كلام الله ووحيه وتذكرة للمتقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 70,
      "surahName": "المعارج",
      "ayahCount": 44,
      "status": "documented",
      "sections": [
        {
          "id": "s070-01",
          "surahNumber": 70,
          "startAyah": 1,
          "endAyah": 35,
          "title": "طول يوم القيامة وتمنّي الفداء",
          "summary": "بيان أن يوم القيامة مقدار خمسين ألف سنة وأن الكافر يفتدي بكل شيء فلا يُقبل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s070-02",
          "surahNumber": 70,
          "startAyah": 36,
          "endAyah": 44,
          "title": "حرمان الكافرين من الجنة",
          "summary": "بيان أن الجنة لا تكون للكافرين وأنهم يُبعثون خاشعين أذلّة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 71,
      "surahName": "نوح",
      "ayahCount": 28,
      "status": "documented",
      "sections": [
        {
          "id": "s071-01",
          "surahNumber": 71,
          "startAyah": 1,
          "endAyah": 20,
          "title": "دعوة نوح قومه واستغفاره",
          "summary": "بيان دعوة نوح قومه ليلًا ونهارًا ودعوتهم للتوبة والاستغفار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s071-02",
          "surahNumber": 71,
          "startAyah": 21,
          "endAyah": 28,
          "title": "دعاء نوح على الكافرين وإجابته",
          "summary": "بيان دعاء نوح أن لا يذر من الكافرين ديّارًا وإجابة الله له.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 72,
      "surahName": "الجن",
      "ayahCount": 28,
      "status": "documented",
      "sections": [
        {
          "id": "s072-01",
          "surahNumber": 72,
          "startAyah": 1,
          "endAyah": 15,
          "title": "إسلام نفر من الجن واختلاف مذاهبهم",
          "summary": "بيان إيمان نفر من الجن بالقرآن وأن فيهم المسلمين ومن حاد عن الحق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s072-02",
          "surahNumber": 72,
          "startAyah": 16,
          "endAyah": 19,
          "title": "المساجد لله فلا يُدعى فيها غيره",
          "summary": "بيان أن المساجد لعبادة الله وحده فلا يُدعى فيها معه أحد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s072-03",
          "surahNumber": 72,
          "startAyah": 20,
          "endAyah": 28,
          "title": "بلاغ الرسول وعلم الغيب لله",
          "summary": "بيان أن الرسول لا يملك ضرًّا ولا نفعًا وأنه يبلّغ وأن الغيب لله وحده.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 73,
      "surahName": "المزمل",
      "ayahCount": 20,
      "status": "documented",
      "sections": [
        {
          "id": "s073-01",
          "surahNumber": 73,
          "startAyah": 1,
          "endAyah": 19,
          "title": "قيام الليل وتذكير القرآن",
          "summary": "بيان الأمر بقيام الليل وأن المعرضين لهم القيود والنار وأن القرآن تذكرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s073-02",
          "surahNumber": 73,
          "startAyah": 20,
          "endAyah": 20,
          "title": "تخفيف قيام الليل وأجر النفقة",
          "summary": "بيان التخفيف في القراءة والقيام وأن ما يُنفق في سبيل الله يُوجد في الآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 74,
      "surahName": "المدثر",
      "ayahCount": 56,
      "status": "documented",
      "sections": [
        {
          "id": "s074-01",
          "surahNumber": 74,
          "startAyah": 1,
          "endAyah": 7,
          "title": "توجيه النبي بالطهارة والصبر",
          "summary": "بيان أمر النبي ﷺ بالقيام والطهارة والصبر على الدعوة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s074-02",
          "surahNumber": 74,
          "startAyah": 8,
          "endAyah": 31,
          "title": "شدة يوم القيامة على المكذبين",
          "summary": "بيان شدة يوم القيامة على من كذّب بآيات الله وعاند.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s074-03",
          "surahNumber": 74,
          "startAyah": 32,
          "endAyah": 56,
          "title": "بيان أعمال تورد صاحبها النار",
          "summary": "بيان أعمال تورد جهنم من ترك الصلاة ومنع الطعام والخوض في الباطل وتكذيب الجزاء.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 75,
      "surahName": "القيامة",
      "ayahCount": 40,
      "status": "documented",
      "sections": [
        {
          "id": "s075-01",
          "surahNumber": 75,
          "startAyah": 1,
          "endAyah": 15,
          "title": "لا مهرب من يوم القيامة",
          "summary": "بيان أن يوم البعث والحساب حقّ لا مهرب منه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s075-02",
          "surahNumber": 75,
          "startAyah": 16,
          "endAyah": 30,
          "title": "تكفّل الله بحفظ القرآن ومشهد الاحتضار",
          "summary": "بيان أن الله تكفّل بجمع القرآن وحفظه وذكر لحظة موت الكافر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s075-03",
          "surahNumber": 75,
          "startAyah": 31,
          "endAyah": 40,
          "title": "إعراض الكافرين عن الإسلام",
          "summary": "بيان أن الكافرين لم يأخذوا الإسلام بجدّ فكذبوا به.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 76,
      "surahName": "الإنسان",
      "ayahCount": 31,
      "status": "documented",
      "sections": [
        {
          "id": "s076-01",
          "surahNumber": 76,
          "startAyah": 1,
          "endAyah": 12,
          "title": "خلق الإنسان وهدايته وحرية اختياره",
          "summary": "بيان خلق الإنسان وهدايته وتمكينه من الاختيار بين الإيمان والكفر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s076-02",
          "surahNumber": 76,
          "startAyah": 13,
          "endAyah": 22,
          "title": "نعيم الجنة للمؤمنين",
          "summary": "بيان حال المؤمنين في الجنة من النعيم المقيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s076-03",
          "surahNumber": 76,
          "startAyah": 23,
          "endAyah": 31,
          "title": "تنزيل القرآن تدريجيًّا وموعظته",
          "summary": "بيان إنزال القرآن مفرّقًا موافقًا لأحوال الناس وأنه موعظة لمن شاء سلوك سبيل ربه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 77,
      "surahName": "المرسلات",
      "ayahCount": 50,
      "status": "documented",
      "sections": [
        {
          "id": "s077-01",
          "surahNumber": 77,
          "startAyah": 1,
          "endAyah": 15,
          "title": "القسم بالمرسلات ومشهد يوم الفصل",
          "summary": "القسم بالمرسلات والعاصفات والناشرات والفارقات والملقيات ذكرًا، ثم تحقيق ما تُوعَدون، وطي النجوم وفرج السماء ونسف الجبال وتأقيت الرسل، وانتهاءً ليوم الفصل.",
          "structuralObservations": "تتكرر لازمة {ويل يومئذ للمكذبين} عشر مرات (١٥، ١٩، ٢٤، ٢٨، ٣٤، ٣٧، ٤٠، ٤٥، ٤٧، ٤٩)، وهي التي تفصل وحدات السورة القصيرة.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s077-02",
          "surahNumber": 77,
          "startAyah": 16,
          "endAyah": 19,
          "title": "إهلاك الأولين",
          "summary": "إهلاك الأمم الأولى وإتباع الآخرين بهم، وسُنّة الله في المجرمين.",
          "structuralObservations": "تُختم بلازمة عند ١٩.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s077-03",
          "surahNumber": 77,
          "startAyah": 20,
          "endAyah": 24,
          "title": "خلق الإنسان من ماء مهين",
          "summary": "الاستدلال على القدرة بخلق الإنسان من ماء مهين وجعله في قرار مكين إلى قدر معلوم.",
          "structuralObservations": "تُختم بلازمة عند ٢٤.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s077-04",
          "surahNumber": 77,
          "startAyah": 25,
          "endAyah": 28,
          "title": "الأرض كفاتًا ورواسيها",
          "summary": "جعل الأرض كفاتًا أحياءً وأمواتًا، وإرساء الرواسي الشامخات، وإسقاء الماء الفرات.",
          "structuralObservations": "تُختم بلازمة عند ٢٨.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s077-05",
          "surahNumber": 77,
          "startAyah": 29,
          "endAyah": 34,
          "title": "انطلاق المجرمين إلى ما كانوا به يكذبون",
          "summary": "«انطلقوا إلى ما كنتم به تكذبون»، وإلى ظل ذي ثلاث شعب لا ظليل ولا يغني من اللهب، وشرر كالقصر كأنه جمالات صفر.",
          "structuralObservations": "تُختم بلازمة عند ٣٤.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s077-06",
          "surahNumber": 77,
          "startAyah": 35,
          "endAyah": 37,
          "title": "يوم لا ينطقون ولا يؤذن لهم",
          "summary": "«هذا يوم لا ينطقون ولا يؤذن لهم فيعتذرون».",
          "structuralObservations": "تُختم بلازمة عند ٣٧.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s077-07",
          "surahNumber": 77,
          "startAyah": 38,
          "endAyah": 40,
          "title": "يوم الفصل ودعوة المكذبين إلى الكيد",
          "summary": "«هذا يوم الفصل جمعناكم والأولين»، ثم «فإن كان لكم كيد فكيدون».",
          "structuralObservations": "تُختم بلازمة عند ٤٠.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s077-08",
          "surahNumber": 77,
          "startAyah": 41,
          "endAyah": 44,
          "title": "المتقون في ظلال وعيون",
          "summary": "المتقون في ظلال وعيون وفواكه مما يشتهون، «كلوا واشربوا هنيئًا بما كنتم تعملون»، إنا كذلك نجزي المحسنين.",
          "structuralObservations": "تُختم بلازمة عند ٤٥.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s077-09",
          "surahNumber": 77,
          "startAyah": 45,
          "endAyah": 47,
          "title": "متاع المكذبين القليل",
          "summary": "«كلوا وتمتعوا قليلًا إنكم مجرمون»، ثم تهديد المكذبين.",
          "structuralObservations": "تُختم بلازمة عند ٤٧.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        },
        {
          "id": "s077-10",
          "surahNumber": 77,
          "startAyah": 48,
          "endAyah": 50,
          "title": "خاتمة السورة: ترك الركوع والسؤال عن الإيمان بغيره",
          "summary": "«وإذا قيل لهم اركعوا لا يركعون»، ثم الاستفهام: «فبأي حديث بعده يؤمنون».",
          "structuralObservations": "تُختم بلازمة عند ٤٩، ثم تُختم السورة باستفهام لا بلازمة.",
          "evidenceIds": [
            "quran_hafs_tanzil"
          ],
          "confidence": "textually_observable"
        }
      ]
    },
    {
      "surahNumber": 78,
      "surahName": "النبأ",
      "ayahCount": 40,
      "status": "documented",
      "sections": [
        {
          "id": "s078-01",
          "surahNumber": 78,
          "startAyah": 1,
          "endAyah": 30,
          "title": "دلائل الخلق على البعث والحساب",
          "summary": "بيان أن خلق السماوات والأرض والجبال والنبات أدلة على البعث وحساب العباد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s078-02",
          "surahNumber": 78,
          "startAyah": 31,
          "endAyah": 40,
          "title": "فوز المتقين وحسرة الكافرين",
          "summary": "بيان ثواب المتقين وأن الكافر يتمنّى عند الحساب أن يكون ترابًا.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 79,
      "surahName": "النازعات",
      "ayahCount": 46,
      "status": "documented",
      "sections": [
        {
          "id": "s079-01",
          "surahNumber": 79,
          "startAyah": 1,
          "endAyah": 14,
          "title": "أعمال الملائكة ويوم البعث",
          "summary": "بيان وظائف الملائكة وذكر يوم القيامة والبعث.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s079-02",
          "surahNumber": 79,
          "startAyah": 15,
          "endAyah": 26,
          "title": "قصة موسى مع فرعون وأخذه بالعذاب",
          "summary": "بيان دعوة موسى فرعون إلى ربه وتكذيبه فأخذه الله بعقابه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s079-03",
          "surahNumber": 79,
          "startAyah": 27,
          "endAyah": 33,
          "title": "خلق السماء والأرض أدلّ على القدرة",
          "summary": "بيان أن خلق السماوات والأرض وما فيهما أعظم من خلق الإنسان دليلًا على البعث.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s079-04",
          "surahNumber": 79,
          "startAyah": 34,
          "endAyah": 46,
          "title": "الجزاء بالعذاب والثواب يوم القيامة",
          "summary": "بيان جزاء العصاة وثواب المتقين يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 80,
      "surahName": "عبس",
      "ayahCount": 42,
      "status": "documented",
      "sections": [
        {
          "id": "s080-01",
          "surahNumber": 80,
          "startAyah": 1,
          "endAyah": 16,
          "title": "إيثار طالبي الهداية بالبلاغ",
          "summary": "بيان تقديم طالبي الهداية في تبليغ رسالة الله.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s080-02",
          "surahNumber": 80,
          "startAyah": 17,
          "endAyah": 32,
          "title": "التعرّف على الخالق وأداء الواجبات",
          "summary": "بيان الأمر بمعرفة الخالق والقيام بحقوقه وشكره.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s080-03",
          "surahNumber": 80,
          "startAyah": 33,
          "endAyah": 42,
          "title": "فرار المرء من أقاربه يوم القيامة",
          "summary": "بيان أن المرء يوم القيامة يفرّ من أمه وأبيه وأخيه وبنيه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 81,
      "surahName": "التكوير",
      "ayahCount": 29,
      "status": "documented",
      "sections": [
        {
          "id": "s081-01",
          "surahNumber": 81,
          "startAyah": 1,
          "endAyah": 14,
          "title": "مشهد من مشاهد القيامة",
          "summary": "بيان مشهد من أهوال يوم القيامة وما يسبقه من تغيّر الكون.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s081-02",
          "surahNumber": 81,
          "startAyah": 15,
          "endAyah": 29,
          "title": "نزول القرآن بجبرائيل وعموم رسالته",
          "summary": "بيان تنزيل القرآن على النبي بواسطة جبريل وأنه ذكر للعالمين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 82,
      "surahName": "الإنفطار",
      "ayahCount": 19,
      "status": "documented",
      "sections": [
        {
          "id": "s082-01",
          "surahNumber": 82,
          "startAyah": 1,
          "endAyah": 19,
          "title": "وصف يوم الدين وحفظ الملائكة الأعمال",
          "summary": "بيان ما يكون يوم القيامة وأن الملائكة تكتب الأعمال وأن الله هو الحاكم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 83,
      "surahName": "المطففين",
      "ayahCount": 36,
      "status": "documented",
      "sections": [
        {
          "id": "s083-01",
          "surahNumber": 83,
          "startAyah": 1,
          "endAyah": 28,
          "title": "جزاء المطفّفين وثواب الأبرار",
          "summary": "بيان حساب المطفّفين وعذابهم وثواب الأبرار في الجنات.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s083-02",
          "surahNumber": 83,
          "startAyah": 29,
          "endAyah": 36,
          "title": "سخرية الكافرين بالمؤمنين وعاقبتها",
          "summary": "بيان استهزاء المجرمين بالمؤمنين في الدنيا وأنهم سيُسخر منهم يوم القيامة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 84,
      "surahName": "الإنشقاق",
      "ayahCount": 25,
      "status": "documented",
      "sections": [
        {
          "id": "s084-01",
          "surahNumber": 84,
          "startAyah": 1,
          "endAyah": 19,
          "title": "انشقاق السماء ومدّ الأرض ونشر الصحائف",
          "summary": "بيان ما يحدث يوم القيامة من انشقاق السماء ومدّ الأرض وتوزيع الصحائف ومصير الفريقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s084-02",
          "surahNumber": 84,
          "startAyah": 20,
          "endAyah": 25,
          "title": "الدعوة إلى الإيمان قبل فوات الوقت",
          "summary": "بيان دعوة الناس إلى الإيمان قبل أن يحال بينهم وبينه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 85,
      "surahName": "البروج",
      "ayahCount": 22,
      "status": "documented",
      "sections": [
        {
          "id": "s085-01",
          "surahNumber": 85,
          "startAyah": 1,
          "endAyah": 22,
          "title": "جزاء من فتن المؤمنين وإعادة الخلق",
          "summary": "بيان عذاب من فتن المؤمنين بالنار وأن الله يُعيد الخلق للحساب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 86,
      "surahName": "الطارق",
      "ayahCount": 17,
      "status": "documented",
      "sections": [
        {
          "id": "s086-01",
          "surahNumber": 86,
          "startAyah": 1,
          "endAyah": 17,
          "title": "الحفظة على الأنفس والقرآن الفصل",
          "summary": "بيان أن على كل نفس حافظًا وأن القرآن قول فصل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 87,
      "surahName": "الأعلى",
      "ayahCount": 19,
      "status": "documented",
      "sections": [
        {
          "id": "s087-01",
          "surahNumber": 87,
          "startAyah": 1,
          "endAyah": 19,
          "title": "التسبيح وتذكير القرآن للآخرة",
          "summary": "بيان الأمر بتسبيح الله وأن من تذكّر بالقرآن فاز في الآخرة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 88,
      "surahName": "الغاشية",
      "ayahCount": 26,
      "status": "documented",
      "sections": [
        {
          "id": "s088-01",
          "surahNumber": 88,
          "startAyah": 1,
          "endAyah": 16,
          "title": "حال الكافرين والمؤمنين يوم القيامة",
          "summary": "بيان حال الكافرين في النار وحال المؤمنين في الجنة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s088-02",
          "surahNumber": 88,
          "startAyah": 17,
          "endAyah": 26,
          "title": "عجائب الخلق والموعظة والحساب",
          "summary": "بيان الاستدلال بعجائب الخلق وإنذار الناس بالبعث والحساب.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 89,
      "surahName": "الفجر",
      "ayahCount": 30,
      "status": "documented",
      "sections": [
        {
          "id": "s089-01",
          "surahNumber": 89,
          "startAyah": 1,
          "endAyah": 14,
          "title": "عبر الأمم السابقة في الإنفاق",
          "summary": "بيان تذكير بعاقبة الأمم الطاغية ودعوة الناس إلى الإنفاق والخير.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s089-02",
          "surahNumber": 89,
          "startAyah": 15,
          "endAyah": 20,
          "title": "ذمّ حبّ المال وعدم إكرام اليتيم",
          "summary": "بيان أن الغنى والفقر ابتلاء وأن الذمّ لمن أهان اليتيم ولم يحضّ على الطعام.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s089-03",
          "surahNumber": 89,
          "startAyah": 21,
          "endAyah": 30,
          "title": "يوم الحساب ونداء النفس المطمئنة",
          "summary": "بيان أن التوبة يوم القيامة لا تنفع وخطاب الله للنفس المطمئنة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 90,
      "surahName": "البلد",
      "ayahCount": 20,
      "status": "documented",
      "sections": [
        {
          "id": "s090-01",
          "surahNumber": 90,
          "startAyah": 1,
          "endAyah": 20,
          "title": "موعظة أهل مكة وصفات الأبرار",
          "summary": "بيان إنذار أهل مكة ونعم الله عليهم وصفات أهل الصلاح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 91,
      "surahName": "الشمس",
      "ayahCount": 15,
      "status": "documented",
      "sections": [
        {
          "id": "s091-01",
          "surahNumber": 91,
          "startAyah": 1,
          "endAyah": 10,
          "title": "فلاح من زكّى نفسه وخسران من دسّاها",
          "summary": "بيان أن الفلاح في تزكية النفس والخسران في تدسيتها.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        },
        {
          "id": "s091-02",
          "surahNumber": 91,
          "startAyah": 11,
          "endAyah": 15,
          "title": "إهلاك ثمود لتكذيبهم رسلهم",
          "summary": "بيان إهلاك ثمود لتكذيبهم رسلهم وعقرهم الناقة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 92,
      "surahName": "الليل",
      "ayahCount": 21,
      "status": "documented",
      "sections": [
        {
          "id": "s092-01",
          "surahNumber": 92,
          "startAyah": 1,
          "endAyah": 21,
          "title": "تيسير الله للمتقي وتعسير المكذب",
          "summary": "بيان أن من أعطى واتقى يُيسّر له وأن البخل والاستغناء يهدي إلى العسرى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 93,
      "surahName": "الضحى",
      "ayahCount": 11,
      "status": "documented",
      "sections": [
        {
          "id": "s093-01",
          "surahNumber": 93,
          "startAyah": 1,
          "endAyah": 11,
          "title": "بشارة النبي بأن الآخرة خير له",
          "summary": "بيان بشارة الله لنبيه ﷺ بأن ما بعده خير له مما مضى.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 94,
      "surahName": "الشرح",
      "ayahCount": 8,
      "status": "documented",
      "sections": [
        {
          "id": "s094-01",
          "surahNumber": 94,
          "startAyah": 1,
          "endAyah": 8,
          "title": "شرح صدر النبي ورفع ذكره",
          "summary": "بيان أن الله شرح صدر نبيه ووضع عنه وزره ورفع ذكره.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 95,
      "surahName": "التين",
      "ayahCount": 8,
      "status": "documented",
      "sections": [
        {
          "id": "s095-01",
          "surahNumber": 95,
          "startAyah": 1,
          "endAyah": 8,
          "title": "أحسن تقويم وسفالة الكافرين",
          "summary": "بيان أن الله خلق الإنسان في أحسن تقويم وأن الكافرين أسفل سافلين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 96,
      "surahName": "العلق",
      "ayahCount": 19,
      "status": "documented",
      "sections": [
        {
          "id": "s096-01",
          "surahNumber": 96,
          "startAyah": 1,
          "endAyah": 19,
          "title": "الأمر بالقراءة ووعيد الطاغي",
          "summary": "بيان الأمر بالقراءة باسم الله وأن من نهى عن الصلاة سيُسحب بناصيته إلى النار.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 97,
      "surahName": "القدر",
      "ayahCount": 5,
      "status": "documented",
      "sections": [
        {
          "id": "s097-01",
          "surahNumber": 97,
          "startAyah": 1,
          "endAyah": 5,
          "title": "ليلة القدر خير من ألف شهر",
          "summary": "بيان أن القرآن أُنزل في ليلة القدر وأنها خير من ألف شهر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 98,
      "surahName": "البينة",
      "ayahCount": 8,
      "status": "documented",
      "sections": [
        {
          "id": "s098-01",
          "surahNumber": 98,
          "startAyah": 1,
          "endAyah": 8,
          "title": "افتراق أهل الكتاب بعد البيّنة",
          "summary": "بيان أن أهل الكتاب ما تفرّقوا إلا بعد مجيء البيّنة وأنهم أُمروا بإخلاص العبادة وإقام الصلاة وإيتاء الزكاة.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 99,
      "surahName": "الزلزلة",
      "ayahCount": 8,
      "status": "documented",
      "sections": [
        {
          "id": "s099-01",
          "surahNumber": 99,
          "startAyah": 1,
          "endAyah": 8,
          "title": "إخبار الأرض وعرض الأعمال",
          "summary": "بيان أن الأرض تحدّث أخبارها وأن الناس يُرون أعمالهم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 100,
      "surahName": "العاديات",
      "ayahCount": 11,
      "status": "documented",
      "sections": [
        {
          "id": "s100-01",
          "surahNumber": 100,
          "startAyah": 1,
          "endAyah": 11,
          "title": "كنود الإنسان تجاه ربه",
          "summary": "بيان جحود الإنسان لربّه مع علمه بحاله ونعم ربه عليه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 101,
      "surahName": "القارعة",
      "ayahCount": 11,
      "status": "documented",
      "sections": [
        {
          "id": "s101-01",
          "surahNumber": 101,
          "startAyah": 1,
          "endAyah": 11,
          "title": "مشهد القارعة وموازين الأعمال",
          "summary": "بيان مشهد القارعة ووزن الأعمال ومصير الفريقين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 102,
      "surahName": "التكاثر",
      "ayahCount": 8,
      "status": "documented",
      "sections": [
        {
          "id": "s102-01",
          "surahNumber": 102,
          "startAyah": 1,
          "endAyah": 8,
          "title": "التكاثر بالأموال والانشغال عن الآخرة",
          "summary": "بيان أن التكاثر بالأموال والأولاد يشغل عن الآخرة حتى يُسأل عن النعيم.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 103,
      "surahName": "العصر",
      "ayahCount": 3,
      "status": "documented",
      "sections": [
        {
          "id": "s103-01",
          "surahNumber": 103,
          "startAyah": 1,
          "endAyah": 3,
          "title": "سبيل النجاة من الخسران",
          "summary": "بيان أسباب النجاة من الخسارة بالإيمان والعمل الصالح والتواصي بالحق والصبر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 104,
      "surahName": "الهمزة",
      "ayahCount": 9,
      "status": "documented",
      "sections": [
        {
          "id": "s104-01",
          "surahNumber": 104,
          "startAyah": 1,
          "endAyah": 9,
          "title": "عذاب الهمّازة اللمّازة جامع المال",
          "summary": "بيان عذاب الطعّان اللمّاز الذي جمع المال ومنع الحق.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 105,
      "surahName": "الفيل",
      "ayahCount": 5,
      "status": "documented",
      "sections": [
        {
          "id": "s105-01",
          "surahNumber": 105,
          "startAyah": 1,
          "endAyah": 5,
          "title": "إهلاك أصحاب الفيل بالطير",
          "summary": "بيان أن الله أهلك أصحاب الفيل بطير أبابيل.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 106,
      "surahName": "قريش",
      "ayahCount": 4,
      "status": "documented",
      "sections": [
        {
          "id": "s106-01",
          "surahNumber": 106,
          "startAyah": 1,
          "endAyah": 4,
          "title": "نعمة الأمن والرزق فليُعبد الله",
          "summary": "بيان نعمة الله على قريش بالأمن والرزق ودعوتهم إلى عبادته.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 107,
      "surahName": "الماعون",
      "ayahCount": 7,
      "status": "documented",
      "sections": [
        {
          "id": "s107-01",
          "surahNumber": 107,
          "startAyah": 1,
          "endAyah": 7,
          "title": "ذم من كذّب بالدين ومنع المعروف",
          "summary": "بيان أن التكذيب بالدين يدفع إلى إيذاء اليتيم وترك إطعام المسكين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 108,
      "surahName": "الكوثر",
      "ayahCount": 3,
      "status": "documented",
      "sections": [
        {
          "id": "s108-01",
          "surahNumber": 108,
          "startAyah": 1,
          "endAyah": 3,
          "title": "رفع ذكر النبي وإهانة شانئه",
          "summary": "بيان أن الله جعل ذكر نبيه باقيًا وأن شانئه هو الأبتر.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 109,
      "surahName": "الكافرون",
      "ayahCount": 6,
      "status": "documented",
      "sections": [
        {
          "id": "s109-01",
          "surahNumber": 109,
          "startAyah": 1,
          "endAyah": 6,
          "title": "النهي عن المداهنة في الدين",
          "summary": "بيان نهي النبي ﷺ عن مصانعة المشركين في دينه.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 110,
      "surahName": "النصر",
      "ayahCount": 3,
      "status": "documented",
      "sections": [
        {
          "id": "s110-01",
          "surahNumber": 110,
          "startAyah": 1,
          "endAyah": 3,
          "title": "النصر بفضل الله والتسبيح",
          "summary": "بيان أن النصر من الله والأمر بتسبيحه واستغفاره عند الفتح.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 111,
      "surahName": "المسد",
      "ayahCount": 5,
      "status": "documented",
      "sections": [
        {
          "id": "s111-01",
          "surahNumber": 111,
          "startAyah": 1,
          "endAyah": 5,
          "title": "خسران أبي لهب وامرأته",
          "summary": "بيان شقاء أبي لهب وامرأته لمعاداتهما النبي ﷺ.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 112,
      "surahName": "الإخلاص",
      "ayahCount": 4,
      "status": "documented",
      "sections": [
        {
          "id": "s112-01",
          "surahNumber": 112,
          "startAyah": 1,
          "endAyah": 4,
          "title": "توحيد الله وصفاته الفريدة",
          "summary": "بيان وحدانية الله وصدقيته وأنه لم يلد ولم يولد.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 113,
      "surahName": "الفلق",
      "ayahCount": 5,
      "status": "documented",
      "sections": [
        {
          "id": "s113-01",
          "surahNumber": 113,
          "startAyah": 1,
          "endAyah": 5,
          "title": "الاستعاذة بالله من الشرور",
          "summary": "بيان الأمر بالاستعاذة بالله من شرّ المخلوقات والحاسدين.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    },
    {
      "surahNumber": 114,
      "surahName": "الناس",
      "ayahCount": 6,
      "status": "documented",
      "sections": [
        {
          "id": "s114-01",
          "surahNumber": 114,
          "startAyah": 1,
          "endAyah": 6,
          "title": "الاستعاذة من شرّ الوسواس",
          "summary": "بيان الأمر بالاستعاذة بالله من شرّ الوسواس من الجنّ والناس.",
          "structuralObservations": "نطاق الآيات والعنوان من تصنيف «موضوعات الآيات» في مكتبة QUL (Tarteel AI)، وهو تعريبٌ لوصفٍ إنجليزي لا نقلٌ عن مفسّر.",
          "evidenceIds": [
            "qul_tarteel_ayah_themes",
            "quran_hafs_tanzil"
          ],
          "confidence": "published_editorial_classification"
        }
      ]
    }
  ]
};
