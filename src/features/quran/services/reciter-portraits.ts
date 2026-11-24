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
  | 'yasser-al-dosari';

export type ReciterPortrait = {
  imageKey: ReciterPortraitImageKey;
  sourceUrl: `https://${string}`;
  credit: string;
  license: string;
};

const portraits: Record<number, ReciterPortrait> = {
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
