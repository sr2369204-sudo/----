export type ReciterPortraitImageKey =
  | 'abdul-basit'
  | 'abu-bakr-shatri'
  | 'bandar-baleela'
  | 'husary'
  | 'hani-rifai'
  | 'ibrahim-al-dosari'
  | 'islam-sobhi'
  | 'khalifa-tunaiji'
  | 'maher-muaiqly'
  | 'minshawi'
  | 'mishary-rashid'
  | 'saud-shuraim'
  | 'sudais'
  | 'yasser-al-dosari'
  | 'ahmad-ajmi'
  | 'saad-ghamdi'
  | 'salah-budair'
  | 'ahmad-naina'
  | 'abdulmohsen-qasim';

export type ReciterPortrait = {
  imageKey: ReciterPortraitImageKey;
  sourceUrl: `https://${string}`;
  credit: string;
  license: string;
};

const portraits: Record<number, ReciterPortrait> = {
  [-(100000 + 5)]: {
    imageKey: 'ahmad-ajmi',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ahmad_bin_Ali_Al-Ajmi.png',
    credit: 'أحمد زين (Wikimedia Commons)',
    license: 'CC BY-SA 3.0, cropped',
  },
  [-(100000 + 30)]: {
    imageKey: 'saad-ghamdi',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saad_al_Ghamdi.jpg',
    credit: 'الشيخ هيثم الدخين (Wikimedia Commons)',
    license: 'CC BY-SA 4.0, cropped',
  },
  [-(100000 + 43)]: {
    imageKey: 'salah-budair',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Salah_Ibn_Mohammed_Al_Budair.jpg',
    credit: 'Salah Al Budair (Wikimedia Commons)',
    license: 'CC BY-SA 4.0, cropped',
  },
  [-(100000 + 9)]: {
    imageKey: 'ahmad-naina',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:DrAhmedNeinaa.jpg',
    credit: 'NeinaaQari (Wikimedia Commons)',
    license: 'CC BY-SA 4.0, cropped',
  },
  [-(100000 + 67)]: {
    imageKey: 'abdulmohsen-qasim',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul_Mohsin_Al-Qasim.jpg',
    credit: 'শেখ শরীফ (Wikimedia Commons)',
    license: 'CC BY 4.0, cropped',
  },
  1: {
    imageKey: 'abdul-basit',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    credit: 'Unknown author',
    license: 'Public domain',
  },
  2: {
    imageKey: 'abdul-basit',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    credit: 'Unknown author',
    license: 'Public domain',
  },
  3: {
    imageKey: 'sudais',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul-Rahman_Al-Sudais_(Cropped,_2011).jpg',
    credit: "Prime Minister's Office",
    license: 'GODL-India',
  },
  4: {
    imageKey: 'abu-bakr-shatri',
    sourceUrl: 'https://www.assabile.com/abu-bakr-al-shatri-34/abu-bakr-al-shatri.htm',
    credit: 'Assabile',
    license: 'Unverified; permission required',
  },
  5: {
    imageKey: 'hani-rifai',
    sourceUrl: 'https://www.assabile.com/hani-ar-rifai-86/hani-ar-rifai.htm',
    credit: 'Assabile',
    license: 'Unverified; permission required',
  },
  7: {
    imageKey: 'mishary-rashid',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg',
    credit: 'quranic.ru',
    license: 'Copyrighted free use',
  },
  6: {
    imageKey: 'husary',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hussary.jpg',
    credit: 'Zubairkhan1',
    license: 'Public domain',
  },
  9: {
    imageKey: 'minshawi',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Elminshwey.jpg',
    credit: 'Unknown author',
    license: 'Public domain',
  },
  10: {
    imageKey: 'saud-shuraim',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saud_Shuraim.png',
    credit: 'Sazwanmisuari',
    license: 'CC0',
  },
  12: {
    imageKey: 'husary',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hussary.jpg',
    credit: 'Zubairkhan1',
    license: 'Public domain',
  },
  161: {
    imageKey: 'khalifa-tunaiji',
    sourceUrl: 'https://alteneiji.net/ar/gallery/',
    credit: 'Khalifa Al Teneiji official website',
    license: 'Unverified; permission required',
  },
  97: {
    imageKey: 'yasser-al-dosari',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yasser_Al-dosari.jpg',
    credit: 'Yasser Al-Dosari',
    license: 'CC0',
  },
  168: {
    imageKey: 'minshawi',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Elminshwey.jpg',
    credit: 'Unknown author',
    license: 'Public domain',
  },
  102: {
    imageKey: 'maher-muaiqly',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mahir_Al-Muaiqly.png',
    credit: 'Sazwanmisuari',
    license: 'CC0',
  },
  217: {
    imageKey: 'bandar-baleela',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bandar_Baleela.jpg',
    credit: 'محبين يحيى الزعبي',
    license: 'CC BY-SA 3.0',
  },
  253: {
    imageKey: 'islam-sobhi',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Islam_Sobhi.jpg',
    credit: 'Moaz600',
    license: 'CC BY-SA 4.0',
  },
  173: {
    imageKey: 'mishary-rashid',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg',
    credit: 'quranic.ru',
    license: 'Copyrighted free use',
  },
  178: {
    imageKey: 'ibrahim-al-dosari',
    sourceUrl: 'https://www.nourelquran.com/international/reader.php?id=151&lang=ar',
    credit: 'Noor Al-Quran',
    license: 'Unverified; permission required',
  },
};

const reciterPortraitAliases: Record<number, number> = {
  [-92]: 97,
  [-102]: 102,
  [-178]: 178,
  [-217]: 217,
  [-253]: 253,
};

export function getReciterPortrait(reciterId: number): ReciterPortrait | undefined {
  return portraits[reciterId] ?? portraits[reciterPortraitAliases[reciterId]];
}
