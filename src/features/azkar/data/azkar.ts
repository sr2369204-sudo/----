/**
 * Azkar for the morning, the evening and after the prayer. `count` is how many
 * times each one is said. `source` is filled only where the narration is well
 * known; the text should be checked against a trusted azkar book before release.
 */
export type AzkarSetId = 'morning' | 'evening' | 'afterPrayer';

export type AzkarItem = {
  id: string;
  text: string;
  count: number;
  source?: string;
  /** Used instead of `text` in the evening set. */
  eveningText?: string;
};

export type AzkarSet = {
  id: AzkarSetId;
  title: string;
  subtitle: string;
  items: AzkarItem[];
};

const AYAT_KURSI =
  'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ';

const MUAWWIDHAT =
  'قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ.\n\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ.\n\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَٰهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ.';

const TAHLEEL =
  'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ';

export const AZKAR_SETS: AzkarSet[] = [
  {
    id: 'morning',
    title: 'أذكار الصباح',
    subtitle: 'بعد الفجر إلى الضحى',
    items: [
      { id: 'kursi', text: AYAT_KURSI, count: 1, source: 'سورة البقرة، آية ٢٥٥' },
      { id: 'muawwidhat', text: MUAWWIDHAT, count: 3, source: 'الإخلاص والفلق والناس' },
      {
        id: 'asbahna',
        text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، ' + TAHLEEL,
        eveningText: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، ' + TAHLEEL,
        count: 1,
        source: 'رواه مسلم',
      },
      {
        id: 'bika',
        text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
        eveningText:
          'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
        count: 1,
        source: 'رواه الترمذي',
      },
      {
        id: 'sayyid',
        text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        count: 1,
        source: 'سيد الاستغفار، رواه البخاري',
      },
      {
        id: 'bismillah',
        text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        count: 3,
        source: 'رواه أبو داود والترمذي',
      },
      {
        id: 'hasbi',
        text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
        count: 7,
      },
      { id: 'tahleel', text: TAHLEEL, count: 10 },
      { id: 'tasbeeh', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100, source: 'رواه مسلم' },
      { id: 'istighfar', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', count: 100 },
    ],
  },
  {
    id: 'evening',
    title: 'أذكار المساء',
    subtitle: 'بعد العصر إلى المغرب وما بعده',
    items: [],
  },
  {
    id: 'afterPrayer',
    title: 'أذكار بعد الصلاة',
    subtitle: 'بعد السلام من كل فريضة',
    items: [
      { id: 'istighfar', text: 'أَسْتَغْفِرُ اللَّهَ', count: 3, source: 'رواه مسلم' },
      {
        id: 'salam',
        text: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
        count: 1,
        source: 'رواه مسلم',
      },
      { id: 'subhanallah', text: 'سُبْحَانَ اللَّهِ', count: 33, source: 'رواه مسلم' },
      { id: 'alhamdulillah', text: 'الْحَمْدُ لِلَّهِ', count: 33, source: 'رواه مسلم' },
      { id: 'allahuakbar', text: 'اللَّهُ أَكْبَرُ', count: 33, source: 'رواه مسلم' },
      { id: 'tamam', text: TAHLEEL, count: 1, source: 'تمام المئة، رواه مسلم' },
      { id: 'kursi', text: AYAT_KURSI, count: 1, source: 'سورة البقرة، آية ٢٥٥' },
      { id: 'muawwidhat', text: MUAWWIDHAT, count: 1, source: 'الإخلاص والفلق والناس' },
    ],
  },
];

// The evening set repeats the morning items (with the evening wording).
AZKAR_SETS[1].items = AZKAR_SETS[0].items;

export function getAzkarSet(id: AzkarSetId): AzkarSet {
  return AZKAR_SETS.find((set) => set.id === id) ?? AZKAR_SETS[0];
}

export function azkarItemText(setId: AzkarSetId, item: AzkarItem): string {
  return setId === 'evening' && item.eveningText ? item.eveningText : item.text;
}

/** The set that fits the hour: morning until 3 pm, then evening. */
export function suggestedAzkarSet(date: Date): AzkarSetId {
  return date.getHours() < 15 ? 'morning' : 'evening';
}
