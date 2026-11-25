import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One short dhikr or dua per day, shown when the app opens. The pick depends
 * only on the date, so it is the same all day and needs no connection.
 */
export type DailyDhikr = {
  text: string;
  source: string;
  kind: 'dua' | 'dhikr';
};

export const DAILY_DHIKR: DailyDhikr[] = [
  { kind: 'dua', text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', source: 'سورة البقرة، آية ٢٠١' },
  { kind: 'dua', text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', source: 'سورة طه، آية ٢٥ و٢٦' },
  { kind: 'dua', text: 'رَبِّ زِدْنِي عِلْمًا', source: 'سورة طه، آية ١١٤' },
  { kind: 'dua', text: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا', source: 'سورة البقرة، آية ٢٨٦' },
  { kind: 'dua', text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', source: 'سورة الفرقان، آية ٧٤' },
  { kind: 'dua', text: 'لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', source: 'سورة الأنبياء، آية ٨٧' },
  { kind: 'dua', text: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', source: 'سورة إبراهيم، آية ٤١' },
  { kind: 'dua', text: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', source: 'سورة البقرة، آية ١٢٧' },
  { kind: 'dua', text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً', source: 'سورة آل عمران، آية ٨' },
  { kind: 'dhikr', text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', source: 'سورة آل عمران، آية ١٧٣' },
  { kind: 'dhikr', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', source: 'متفق عليه' },
  { kind: 'dhikr', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', source: 'متفق عليه' },
  { kind: 'dua', text: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', source: 'رواه الترمذي' },
  { kind: 'dua', text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', source: 'رواه مسلم' },
  { kind: 'dhikr', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', source: 'الصلاة على النبي ﷺ' },
];

export const DAILY_DHIKR_SEEN_KEY = 'dailyDhikr.lastShown';

function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function pickDailyDhikr(today: string): DailyDhikr {
  return DAILY_DHIKR[((dayNumber(today) % DAILY_DHIKR.length) + DAILY_DHIKR.length) % DAILY_DHIKR.length];
}

export async function wasDailyDhikrShown(database: SQLiteDatabase, today: string): Promise<boolean> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    DAILY_DHIKR_SEEN_KEY,
  );
  return row?.value === today;
}

export async function markDailyDhikrShown(database: SQLiteDatabase, today: string): Promise<void> {
  await database.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    DAILY_DHIKR_SEEN_KEY,
    today,
    new Date().toISOString(),
  );
}
