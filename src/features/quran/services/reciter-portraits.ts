export type ReciterPortrait = {
  imageUrl: string;
  sourceUrl: `https://${string}`;
  credit: string;
  license: string;
};

const portraits: Record<number, ReciterPortrait> = {
  1: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg/250px-Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    credit: 'Unknown author',
    license: 'Public domain',
  },
  2: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg/250px-Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    credit: 'Unknown author',
    license: 'Public domain',
  },
  3: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Abdul-Rahman_Al-Sudais_%28Cropped%2C_2011%29.jpg/250px-Abdul-Rahman_Al-Sudais_%28Cropped%2C_2011%29.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul-Rahman_Al-Sudais_(Cropped,_2011).jpg',
    credit: "Prime Minister's Office",
    license: 'GODL-India',
  },
  6: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Hussary.jpg/250px-Hussary.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hussary.jpg',
    credit: 'Zubairkhan1',
    license: 'Public domain',
  },
  9: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Elminshwey.jpg/250px-Elminshwey.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Elminshwey.jpg',
    credit: 'Unknown author',
    license: 'Public domain',
  },
  10: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Saud_Shuraim.png/250px-Saud_Shuraim.png',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saud_Shuraim.png',
    credit: 'Sazwanmisuari',
    license: 'CC0',
  },
  12: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Hussary.jpg/250px-Hussary.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hussary.jpg',
    credit: 'Zubairkhan1',
    license: 'Public domain',
  },
  97: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Yasser_Al-dosari.jpg/250px-Yasser_Al-dosari.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yasser_Al-dosari.jpg',
    credit: 'Yasser Al-Dosari',
    license: 'CC0',
  },
  168: {
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Elminshwey.jpg/250px-Elminshwey.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Elminshwey.jpg',
    credit: 'Unknown author',
    license: 'Public domain',
  },
};

export function getReciterPortrait(reciterId: number): ReciterPortrait | undefined {
  return portraits[reciterId];
}
