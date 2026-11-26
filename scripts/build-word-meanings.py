"""Builds src/features/offline-data/word-meanings-tafsir.json from quran.db.

Source: Tafsir Center for Quranic Studies (https://tafsir.net), CC BY 4.0,
https://huggingface.co/datasets/tafsircenter/tafsir-mcp-data (table word_content_meaning).
Usage: python3 scripts/build-word-meanings.py /path/to/quran.db
One list per ayah (flat order), one meaning per printed word, in word order.
"""
import json, re, sqlite3, sys

LETTER = re.compile(r'[\u0621-\u064A\u0671-\u06D3]')
quran = json.load(open('src/features/offline-data/quran-text.json'))
con = sqlite3.connect(sys.argv[1])
rows = {}
for s, a, n, m in con.execute(
    'select surahNo, ayahNo, wordNo, meaning from word_content_meaning order by surahNo, ayahNo, wordNo'
):
    rows.setdefault((s, a), []).append(re.sub(r'[\u200c\u200f]', '', m or '').strip())

out, i, fixed = [], 0, []
for s, count in enumerate(quran['counts'], 1):
    for a in range(1, count + 1):
        tokens = [t for t in quran['ayahs'][i].split() if LETTER.search(t)]
        i += 1
        meanings = rows[(s, a)]
        if (s, a) == (15, 7):
            # The source treats «لوما» as one word; the printed text has «لَّوْ مَا».
            meanings = [meanings[0], meanings[0]] + meanings[1:]
            fixed.append((s, a))
        if len(tokens) != len(meanings):
            raise SystemExit(f'count mismatch {s}:{a} {len(tokens)} vs {len(meanings)}')
        out.append(meanings)
json.dump(out, open('src/features/offline-data/word-meanings-tafsir.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('ayat', len(out), 'words', sum(map(len, out)), 'overrides', fixed)
