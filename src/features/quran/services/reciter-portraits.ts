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
  | 'abdulmohsen-qasim'
  | 'khalid-qahtani'
  | 'abdullah-basfar'
  | 'abdulbari-thubaity'
  | 'ahmad-masarawi'
  | 'ali-jaber'
  | 'fares-abbad'
  | 'abdullah-khayyat'
  | 'abdullah-matrood'
  | 'abdulmohsen-harthi'
  | 'nasser-qatami'
  | 'idris-abkar'
  | 'abdullah-juhani'
  | 'muhammad-ayyub'
  | 'abdulmohsen-obaikan';

export type ReciterPortrait = {
  imageKey: ReciterPortraitImageKey;
  sourceUrl: `https://${string}`;
  credit: string;
  license: string;
};

const portraits: Record<number, ReciterPortrait> = {
  [-(100000 + 21)]: {
    imageKey: 'khalid-qahtani',
    sourceUrl: 'https://www.assabile.com/khalid-al-qahtani',
    credit: 'Assabile',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 60)]: {
    imageKey: 'abdullah-basfar',
    sourceUrl: 'https://www.assabile.com/abdullah-ibn-ali-basfar',
    credit: 'Assabile',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 49)]: {
    imageKey: 'abdulbari-thubaity',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdulbari_ath-Thubaity_delivering_sermon_at_Prophet%27s_Mosque_Medina.jpg',
    credit: 'Wikimedia Commons (copied from peopleofmadina.com, author unknown)',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 289)]: {
    imageKey: 'ahmad-masarawi',
    sourceUrl: 'https://ar.wikipedia.org/wiki/%D8%A3%D8%AD%D9%85%D8%AF_%D8%B9%D9%8A%D8%B3%D9%89_%D8%A7%D9%84%D9%85%D8%B9%D8%B5%D8%B1%D8%A7%D9%88%D9%8A',
    credit: 'Arabic Wikipedia',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 76)]: {
    imageKey: 'ali-jaber',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ali_Abdullah_Jaber.jpg',
    credit: 'Wikimedia Commons (copied from alijaber.net, author unknown)',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 81)]: {
    imageKey: 'fares-abbad',
    sourceUrl: 'https://www.assabile.com/fares-abbad',
    credit: 'Assabile',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 61)]: {
    imageKey: 'abdullah-khayyat',
    sourceUrl: 'https://www.assabile.com/abdullah-al-khayat-21',
    credit: 'Assabile',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 59)]: {
    imageKey: 'abdullah-matrood',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdullah_Al_Matroud.jpg',
    credit: 'Wikimedia Commons',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 66)]: {
    imageKey: 'abdulmohsen-harthi',
    sourceUrl: 'https://www.assabile.com/abdulmohsen-al-harthy',
    credit: 'Assabile',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 86)]: {
    imageKey: 'nasser-qatami',
    sourceUrl: 'https://ar.wikipedia.org/wiki/%D9%86%D8%A7%D8%B5%D8%B1_%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A',
    credit: 'Arabic Wikipedia / Commons',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 12)]: {
    imageKey: 'idris-abkar',
    sourceUrl: 'https://www.assabile.com/idris-abkar',
    credit: 'Assabile',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 62)]: {
    imageKey: 'abdullah-juhani',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdullah_Al_Juhany_(Cropped).png',
    credit: 'Wikimedia Commons',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 109)]: {
    imageKey: 'muhammad-ayyub',
    sourceUrl: 'https://www.assabile.com/muhammad-ayyub',
    credit: 'Assabile',
    license: 'Unverified; added at the owner\'s decision',
  },
  [-(100000 + 69)]: {
    imageKey: 'abdulmohsen-obaikan',
    sourceUrl: 'https://fr.assabile.com/abdel-mohsen-al-obeikan',
    credit: 'Assabile',
    license: 'Unverified; added at the owner\'s decision',
  },
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
