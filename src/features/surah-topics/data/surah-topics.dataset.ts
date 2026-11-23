/**
 * التفصيل الموضوعي — the thematic section dataset for the whole Mushaf.
 *
 * Generated data — do not hand-edit. It is emitted together with
 * `surah-topics.dataset.json`, which holds the same content as a plain JSON
 * dataset; the two are kept identical by `tests/surah-topics.test.mjs`.
 *
 * Provenance: ayah bounds were read out of the canonical Hafs text (Tanzil) and,
 * for Al-Fatihah, out of the classical sources cited in `evidenceIds`. Surahs
 * with no source-backed division are listed as `pending_review` and carry no
 * sections — never a fabricated title or range.
 */
import type { SurahTopicsDataset } from '../types';

export const SURAH_TOPICS_DATASET: SurahTopicsDataset = {
  "meta": {
    "version": "1.0.0",
    "canonicalText": "Tanzil — Hafs ʿan ʿĀṣim (Uthmani)",
    "totalSurahs": 114,
    "documentedSurahs": [
      1,
      26,
      37,
      54,
      55,
      77
    ],
    "pendingSurahs": 108,
    "pendingReason": "لا يتضمّن المصدر الأصلي (quran-structure) أي مقاطع موضوعية فعلية؛ كل ملفات data/surahs لسور القرآن الـ114 حالتها draft وبلا تقسيم داخلي. ولم يُخترع لأي سورة لم يتوفّر لها مستند عنوانٌ ولا نطاقُ آيات.",
    "disclaimer": "العناوين والنطاقات المثبتة هنا وصفية اجتهادية، مستنبَطة من اللوازم المتكرّرة نصًّا في المصحف أو من نصوص التفسير وعلوم القرآن عند السور التي وُثّقت؛ ولا يُقصد بها الإجماع، وقد يخالفها غيره من المفسّرين.",
    "confidenceLegend": {
      "explicitly_stated_by_classical_mufassir": "منصوص عليه عند مفسّر من القدماء",
      "supported_by_multiple_tafsir_sources": "مؤيَّد بعدّة مصادر تفسيرية",
      "classical_scholarly_observation": "ملاحظة علمية عند أهل علوم القرآن",
      "textually_observable": "ظاهر من النص نفسه (لوازم متكرّرة)",
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
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 3,
      "surahName": "آل عمران",
      "ayahCount": 200,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 4,
      "surahName": "النساء",
      "ayahCount": 176,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 5,
      "surahName": "المائدة",
      "ayahCount": 120,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 6,
      "surahName": "الأنعام",
      "ayahCount": 165,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 7,
      "surahName": "الأعراف",
      "ayahCount": 206,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 8,
      "surahName": "الأنفال",
      "ayahCount": 75,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 9,
      "surahName": "التوبة",
      "ayahCount": 129,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 10,
      "surahName": "يونس",
      "ayahCount": 109,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 11,
      "surahName": "هود",
      "ayahCount": 123,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 12,
      "surahName": "يوسف",
      "ayahCount": 111,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 13,
      "surahName": "الرعد",
      "ayahCount": 43,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 14,
      "surahName": "إبراهيم",
      "ayahCount": 52,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 15,
      "surahName": "الحجر",
      "ayahCount": 99,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 16,
      "surahName": "النحل",
      "ayahCount": 128,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 17,
      "surahName": "الإسراء",
      "ayahCount": 111,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 18,
      "surahName": "الكهف",
      "ayahCount": 110,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 19,
      "surahName": "مريم",
      "ayahCount": 98,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 20,
      "surahName": "طه",
      "ayahCount": 135,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 21,
      "surahName": "الأنبياء",
      "ayahCount": 112,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 22,
      "surahName": "الحج",
      "ayahCount": 78,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 23,
      "surahName": "المؤمنون",
      "ayahCount": 118,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 24,
      "surahName": "النور",
      "ayahCount": 64,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 25,
      "surahName": "الفرقان",
      "ayahCount": 77,
      "status": "pending_review",
      "sections": []
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
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 28,
      "surahName": "القصص",
      "ayahCount": 88,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 29,
      "surahName": "العنكبوت",
      "ayahCount": 69,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 30,
      "surahName": "الروم",
      "ayahCount": 60,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 31,
      "surahName": "لقمان",
      "ayahCount": 34,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 32,
      "surahName": "السجدة",
      "ayahCount": 30,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 33,
      "surahName": "الأحزاب",
      "ayahCount": 73,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 34,
      "surahName": "سبأ",
      "ayahCount": 54,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 35,
      "surahName": "فاطر",
      "ayahCount": 45,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 36,
      "surahName": "يس",
      "ayahCount": 83,
      "status": "pending_review",
      "sections": []
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
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 39,
      "surahName": "الزمر",
      "ayahCount": 75,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 40,
      "surahName": "غافر",
      "ayahCount": 85,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 41,
      "surahName": "فصلت",
      "ayahCount": 54,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 42,
      "surahName": "الشورى",
      "ayahCount": 53,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 43,
      "surahName": "الزخرف",
      "ayahCount": 89,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 44,
      "surahName": "الدخان",
      "ayahCount": 59,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 45,
      "surahName": "الجاثية",
      "ayahCount": 37,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 46,
      "surahName": "الأحقاف",
      "ayahCount": 35,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 47,
      "surahName": "محمد",
      "ayahCount": 38,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 48,
      "surahName": "الفتح",
      "ayahCount": 29,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 49,
      "surahName": "الحجرات",
      "ayahCount": 18,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 50,
      "surahName": "ق",
      "ayahCount": 45,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 51,
      "surahName": "الذاريات",
      "ayahCount": 60,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 52,
      "surahName": "الطور",
      "ayahCount": 49,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 53,
      "surahName": "النجم",
      "ayahCount": 62,
      "status": "pending_review",
      "sections": []
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
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 57,
      "surahName": "الحديد",
      "ayahCount": 29,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 58,
      "surahName": "المجادلة",
      "ayahCount": 22,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 59,
      "surahName": "الحشر",
      "ayahCount": 24,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 60,
      "surahName": "الممتحنة",
      "ayahCount": 13,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 61,
      "surahName": "الصف",
      "ayahCount": 14,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 62,
      "surahName": "الجمعة",
      "ayahCount": 11,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 63,
      "surahName": "المنافقون",
      "ayahCount": 11,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 64,
      "surahName": "التغابن",
      "ayahCount": 18,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 65,
      "surahName": "الطلاق",
      "ayahCount": 12,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 66,
      "surahName": "التحريم",
      "ayahCount": 12,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 67,
      "surahName": "الملك",
      "ayahCount": 30,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 68,
      "surahName": "القلم",
      "ayahCount": 52,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 69,
      "surahName": "الحاقة",
      "ayahCount": 52,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 70,
      "surahName": "المعارج",
      "ayahCount": 44,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 71,
      "surahName": "نوح",
      "ayahCount": 28,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 72,
      "surahName": "الجن",
      "ayahCount": 28,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 73,
      "surahName": "المزمل",
      "ayahCount": 20,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 74,
      "surahName": "المدثر",
      "ayahCount": 56,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 75,
      "surahName": "القيامة",
      "ayahCount": 40,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 76,
      "surahName": "الإنسان",
      "ayahCount": 31,
      "status": "pending_review",
      "sections": []
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
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 79,
      "surahName": "النازعات",
      "ayahCount": 46,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 80,
      "surahName": "عبس",
      "ayahCount": 42,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 81,
      "surahName": "التكوير",
      "ayahCount": 29,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 82,
      "surahName": "الإنفطار",
      "ayahCount": 19,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 83,
      "surahName": "المطففين",
      "ayahCount": 36,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 84,
      "surahName": "الإنشقاق",
      "ayahCount": 25,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 85,
      "surahName": "البروج",
      "ayahCount": 22,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 86,
      "surahName": "الطارق",
      "ayahCount": 17,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 87,
      "surahName": "الأعلى",
      "ayahCount": 19,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 88,
      "surahName": "الغاشية",
      "ayahCount": 26,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 89,
      "surahName": "الفجر",
      "ayahCount": 30,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 90,
      "surahName": "البلد",
      "ayahCount": 20,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 91,
      "surahName": "الشمس",
      "ayahCount": 15,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 92,
      "surahName": "الليل",
      "ayahCount": 21,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 93,
      "surahName": "الضحى",
      "ayahCount": 11,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 94,
      "surahName": "الشرح",
      "ayahCount": 8,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 95,
      "surahName": "التين",
      "ayahCount": 8,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 96,
      "surahName": "العلق",
      "ayahCount": 19,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 97,
      "surahName": "القدر",
      "ayahCount": 5,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 98,
      "surahName": "البينة",
      "ayahCount": 8,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 99,
      "surahName": "الزلزلة",
      "ayahCount": 8,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 100,
      "surahName": "العاديات",
      "ayahCount": 11,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 101,
      "surahName": "القارعة",
      "ayahCount": 11,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 102,
      "surahName": "التكاثر",
      "ayahCount": 8,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 103,
      "surahName": "العصر",
      "ayahCount": 3,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 104,
      "surahName": "الهمزة",
      "ayahCount": 9,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 105,
      "surahName": "الفيل",
      "ayahCount": 5,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 106,
      "surahName": "قريش",
      "ayahCount": 4,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 107,
      "surahName": "الماعون",
      "ayahCount": 7,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 108,
      "surahName": "الكوثر",
      "ayahCount": 3,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 109,
      "surahName": "الكافرون",
      "ayahCount": 6,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 110,
      "surahName": "النصر",
      "ayahCount": 3,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 111,
      "surahName": "المسد",
      "ayahCount": 5,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 112,
      "surahName": "الإخلاص",
      "ayahCount": 4,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 113,
      "surahName": "الفلق",
      "ayahCount": 5,
      "status": "pending_review",
      "sections": []
    },
    {
      "surahNumber": 114,
      "surahName": "الناس",
      "ayahCount": 6,
      "status": "pending_review",
      "sections": []
    }
  ]
};
