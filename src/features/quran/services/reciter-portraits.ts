export type ReciterPortraitImageKey =
  | 'abdul-basit'
  | 'husary'
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
};

export function getReciterPortrait(reciterId: number): ReciterPortrait | undefined {
  return portraits[reciterId];
}
