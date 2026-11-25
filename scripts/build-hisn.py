"""Builds src/features/azkar/data/hisn-azkar.ts from asellam/HisnElMuslim (MIT).
Usage: python3 scripts/build-hisn.py /path/to/hisn.json /path/to/existing-texts.json
Existing texts: JSON list of the azkar already in the app (used to skip duplicates)."""
import json, re, sys

src, existing_path = sys.argv[1], sys.argv[2]
d = json.load(open(src))
existing = json.load(open(existing_path))

TASH = re.compile(r'[\u064B-\u0652\u0670\u0640]')
def norm(s):
    s = TASH.sub('', s)
    s = re.sub(r'[أإآٱ]', 'ا', s).replace('ى', 'ي').replace('ة', 'ه')
    return re.sub(r'[^\u0621-\u064A]', '', s)

# chapters left out: 27/28/29/25 are the morning, evening, sleep and after-prayer sets
# already in the app; 99 is the market dua (disputed chain).
SKIP_CH = {27, 28, 29, 25, 99}
# narrations about virtue or manners, not a text to say
DROP = {(1, 4), (15, 3), (15, 5), (51, 1), (75, 1), (89, 1), (103, 1), (108, 1), (108, 2), (108, 3),
        (108, 4), (108, 5), (109, 1), (109, 2), (109, 3), (111, 1), (112, 1), (114, 1), (117, 1),
        (119, 1), (121, 1), (122, 1), (124, 1), (126, 1), (130, 1), (130, 2), (130, 4), (130, 5),
        (130, 6), (132, 1), (133, 1), (96, 1), (131, 9), (131, 10), (131, 11), (131, 12), (49, 1)} - {(131, 9), (131, 10), (49, 1)}

FIXES = [
    ('أو أُزَلَّ', 'أَوْ أُزَلَّ'), ('أَوْ أَظْلِم ', 'أَوْ أَظْلِمَ '), ('وَأْسْأَلُكَ', 'وَأَسْأَلُكَ'),
    ('وَاَلَيْتَ', 'وَالَيْتَ'), ('الحَّقِّ', 'الحَقِّ'), ('العَلِّي ', 'العَلِيِّ '), ('العَالَمِينْ', 'العَالَمِينَ'),
    ('لَاإِلَهَ', 'لَا إِلَهَ'), ('لَاتَدْخُلُوا', 'لَا تَدْخُلُوا'), ('كَمَا صَلَّيْتَ عَلَى  إِبْرَاهِيمَ', 'كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ'),
    ('وَرَزَقَنِيه ', 'وَرَزَقَنِيهِ '),
]
# hand-written trims for hadith-style entries: (chapter, item) -> list of (text, count or None)
MANUAL = {
    (15, 1): [('يَقُولُ مِثْلَ مَا يَقُولُ المُؤَذِّنُ، وَعِنْدَ حَيَّ عَلَى الصَّلَاةِ وَحَيَّ عَلَى الفَلَاحِ: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', None)],
    (34, 1): [('سُبْحَانَ المَلِكِ القُدُّوسِ، رَبِّ المَلَائِكَةِ وَالرُّوحِ', None)],
    (43, 1): [('أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', None)],
    (48, 1): [('بَارَكَ اللَّهُ لَكَ فِي المَوْهُوبِ لَكَ، وَشَكَرْتَ الوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ\nوَيَرُدُّ عَلَيْهِ المُهَنَّأُ فَيَقُولُ: بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ، وَجَزَاكَ اللَّهُ خَيْرًا، وَرَزَقَكَ اللَّهُ مِثْلَهُ، وَأَجْزَلَ ثَوَابَكَ', None)],
    (52, 2): [('لَا إِلَهَ إِلَّا اللَّهُ إِنَّ لِلْمَوْتِ لَسَكَرَاتٍ', None)],
    (58, 1): [('إِنَّ لِلَّهِ مَا أَخَذَ، وَلَهُ مَا أَعْطَى، وَكُلُّ شَيْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى، فَلْتَصْبِرْ وَلْتَحْتَسِبْ', None)],
    (58, 2): [('أَعْظَمَ اللَّهُ أَجْرَكَ، وَأَحْسَنَ عَزَاءَكَ وَغَفَرَ لِمَيِّتِكَ', None)],
    (110, 1): [('وَعَلَيْكُمْ', None)],
    (120, 1): [('لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', None)],
    (125, 1): [('بِسْمِ اللَّهِ', 3), ('أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ', 7)],
    (130, 3): [('أَسْتَغْفِرُ اللَّهَ العَظِيمَ الذِي لَا إِلَهَ إِلَّا هُوَ الحَيُّ القَيُّومُ وَأَتُوبُ إِلَيْهِ', None)],
    (131, 1): [('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', None)],
    (131, 2): [('لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ، وَلَهُ الحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', None)],
    (131, 3): [('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ', None)],
    (131, 4): [('سُبْحَانَ اللَّهِ، وَالحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ', None)],
    (131, 5): [('سُبْحَانَ اللَّهِ', 100)],
    (131, 6): [('سُبْحَانَ اللَّهِ العَظِيمِ وَبِحَمْدِهِ', None)],
    (131, 7): [('لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', None)],
    (131, 8): [('سُبْحَانَ اللَّهِ، وَالحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ', None)],
    (49, 1): [('أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ', None)],
}
CUE = re.compile(r'قَالَ|كَانَ|رَسُولُ|النَّبِيُّ|يَقُولُ|إِذَا|فَلْيَقُلْ|لِيَقُلْ|مَنْ قَالَ|وَإِنْ قَالَ|يَقْرَأُ')

def clean(t):
    t = re.sub(r'\s+', ' ', t.replace('\n', ' '))
    t = re.sub(r'[{}\[\]﴿﴾]', '', t)
    t = re.sub(r'\(\s*([^\s()]+)\s*\)', r'\1', t)
    for a, b in FIXES:
        t = t.replace(a, b)
    return t.strip()

def trim(t):
    first = t.find('(')
    groups = [g.strip() for g in re.findall(r'\(([^()]{8,})\)', t)]
    if groups and first > 12 and CUE.search(t[:first]):
        return '\n'.join(groups)
    if first == 0 and groups and t.rstrip().endswith(').'):
        return groups[0]
    if CUE.search(t[:90]) and ':' in t[:200] and len(t) > 60:
        return t.split(':', 1)[1].strip()
    m = re.match(r'^\((.+)\)$', t)
    return m.group(1) if m else t

CATS = [
    ('hisnSleep', 'الاستيقاظ والنوم والرؤيا', 'عند الاستيقاظ وفي الليل والرؤيا', [1, 30, 31]),
    ('hisnHome', 'اللباس والمنزل والطهارة', 'اللبس والخلاء والوضوء والدخول والخروج', list(range(2, 12))),
    ('hisnMosque', 'المسجد والأذان', 'الذهاب إلى المسجد ودخوله والأذان', [12, 13, 14, 15]),
    ('hisnPrayer', 'أذكار الصلاة', 'من الاستفتاح إلى التشهد والقنوت والاستخارة', list(range(16, 25)) + [26, 33, 34]),
    ('hisnWorry', 'الهم والكرب والخوف', 'الهم والدين والوسوسة والشدائد', list(range(35, 48))),
    ('hisnSick', 'المرض والمصيبة والميت', 'عيادة المريض والعزاء والجنازة', [49, 50, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]),
    ('hisnFood', 'الطعام والصيام', 'قبل الأكل وبعده والإفطار', list(range(69, 78))),
    ('hisnSocial', 'الآداب والمناسبات', 'العطاس والزواج والمجلس والشكر والمدح', [48, 62, 63, 64, 65, 66, 67, 68] + list(range(78, 96)) + [107, 110, 113, 115, 123, 125, 127, 128]),
    ('hisnTravel', 'السفر والحج', 'الركوب والسفر والنزول والعودة وأدعية الحج', list(range(96, 99)) + list(range(100, 107)) + [116, 117, 118, 119, 120, 121, 122]),
    ('hisnTawba', 'الاستغفار والتسبيح', 'الاستغفار والتوبة وفضل الذكر', [129, 130, 131]),
]
chapters = list(d.items())
seen = [norm(x) for x in existing]
def dup(n):
    if len(n) < 8:
        return n in seen
    return any(n == s or (len(s) >= 20 and (n in s or s in n) and min(len(n), len(s)) / max(len(n), len(s)) > 0.6) for s in seen)

sets, report, skipped = [], [], []
for sid, title, sub, chs in CATS:
    items = []
    for c in chs:
        if c in SKIP_CH or c > len(chapters):
            continue
        for i, a in enumerate(chapters[c - 1][1]['Adhkar'], 1):
            if (c, i) in DROP:
                skipped.append((c, i, 'virtue/narration')); continue
            variants = MANUAL.get((c, i)) or [(trim(clean(a['Text'])), None)]
            for k, (text, cnt) in enumerate(variants):
                text = clean(text) if (c, i) in MANUAL else text
                n = norm(text)
                if not n:
                    continue
                if dup(n):
                    skipped.append((c, i, 'duplicate')); continue
                seen.append(n)
                items.append({'id': f'h{c}-{i}' + (f'-{k + 1}' if len(variants) > 1 else ''),
                              'text': text, 'count': cnt or max(1, min(a['Count'], 100))})
    sets.append((sid, title, sub, items))

def q(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"
L = ["/**",
     " * Azkar from Hisn al-Muslim, taken from asellam/HisnElMuslim (MIT, Abdellah Sellam, 2021).",
     " * See NOTICE-HISN.md. Generated by scripts/build-hisn.py: long narrations are trimmed to the",
     " * dua text, Quran markers are removed, and nothing is shown as a source under the dhikr.",
     " */", "export type HisnItem = { id: string; text: string; count: number };", "",
     "export type HisnSetId = " + ' | '.join(q(s[0]) for s in sets) + ";", "",
     "export type HisnSet = { id: HisnSetId; title: string; subtitle: string; items: HisnItem[] };", "",
     "export const HISN_SETS: HisnSet[] = ["]
for sid, title, sub, items in sets:
    L += ["  {", f"    id: {q(sid)},", f"    title: {q(title)},", f"    subtitle: {q(sub)},", "    items: ["]
    for it in items:
        L.append(f"      {{ id: {q(it['id'])}, text: {q(it['text'])}, count: {it['count']} }},")
    L += ["    ],", "  },"]
L.append("];")
open('src/features/azkar/data/hisn-azkar.ts', 'w').write('\n'.join(L) + '\n')
tot = 0
for sid, title, sub, items in sets:
    print(sid, title, len(items)); tot += len(items)
print('total', tot, 'skipped', len(skipped))
import collections
print(collections.Counter(s[2] for s in skipped))
