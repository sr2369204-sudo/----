import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import {
  getReciterPortrait,
  type ReciterPortraitImageKey,
} from '@/features/quran/services/reciter-portraits';

const portraitImages: Record<ReciterPortraitImageKey, ImageSourcePropType> = {
  'abdul-basit': require('../../../../assets/images/reciters/abdul-basit.jpg'),
  'abu-bakr-shatri': require('../../../../assets/images/reciters/abu-bakr-shatri.webp'),
  'bandar-baleela': require('../../../../assets/images/reciters/bandar-baleela.jpg'),
  'hani-rifai': require('../../../../assets/images/reciters/hani-rifai.webp'),
  husary: require('../../../../assets/images/reciters/husary.jpg'),
  'ibrahim-al-dosari': require('../../../../assets/images/reciters/ibrahim-al-dosari.webp'),
  'islam-sobhi': require('../../../../assets/images/reciters/islam-sobhi.jpg'),
  'khalifa-tunaiji': require('../../../../assets/images/reciters/khalifa-tunaiji.jpg'),
  'maher-muaiqly': require('../../../../assets/images/reciters/maher-muaiqly.png'),
  minshawi: require('../../../../assets/images/reciters/minshawi.jpg'),
  'mishary-rashid': require('../../../../assets/images/reciters/mishary-rashid.jpg'),
  'saud-shuraim': require('../../../../assets/images/reciters/shuraim.png'),
  sudais: require('../../../../assets/images/reciters/sudais.jpg'),
  'yasser-al-dosari': require('../../../../assets/images/reciters/yasser-al-dosari.jpg'),
  'ahmad-ajmi': require('../../../../assets/images/reciters/ahmad-ajmi.jpg'),
  'saad-ghamdi': require('../../../../assets/images/reciters/saad-ghamdi.jpg'),
  'salah-budair': require('../../../../assets/images/reciters/salah-budair.jpg'),
  'ahmad-naina': require('../../../../assets/images/reciters/ahmad-naina.jpg'),
  'abdulmohsen-qasim': require('../../../../assets/images/reciters/abdulmohsen-qasim.jpg'),
  'khalid-qahtani': require('../../../../assets/images/reciters/khalid-qahtani.jpg'),
  'abdullah-basfar': require('../../../../assets/images/reciters/abdullah-basfar.jpg'),
  'abdulbari-thubaity': require('../../../../assets/images/reciters/abdulbari-thubaity.jpg'),
  'ahmad-masarawi': require('../../../../assets/images/reciters/ahmad-masarawi.jpg'),
  'ali-jaber': require('../../../../assets/images/reciters/ali-jaber.jpg'),
  'fares-abbad': require('../../../../assets/images/reciters/fares-abbad.jpg'),
  'abdullah-khayyat': require('../../../../assets/images/reciters/abdullah-khayyat.jpg'),
  'abdullah-matrood': require('../../../../assets/images/reciters/abdullah-matrood.jpg'),
  'abdulmohsen-harthi': require('../../../../assets/images/reciters/abdulmohsen-harthi.jpg'),
  'nasser-qatami': require('../../../../assets/images/reciters/nasser-qatami.jpg'),
  'idris-abkar': require('../../../../assets/images/reciters/idris-abkar.jpg'),
  'abdullah-juhani': require('../../../../assets/images/reciters/abdullah-juhani.jpg'),
  'muhammad-ayyub': require('../../../../assets/images/reciters/muhammad-ayyub.jpg'),
  'abdulmohsen-obaikan': require('../../../../assets/images/reciters/abdulmohsen-obaikan.jpg'),
};

type Props = {
  reciterId: number;
  name: string;
  size: number;
  backgroundColor: string;
  iconColor: string;
};

export function ReciterAvatar({
  reciterId,
  name,
  size,
  backgroundColor,
  iconColor,
}: Props) {
  const portrait = getReciterPortrait(reciterId);
  const [failedImageKey, setFailedImageKey] = useState<ReciterPortraitImageKey | null>(null);
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join('');

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}>
      {portrait && failedImageKey !== portrait.imageKey ? (
        <Image
          accessibilityLabel={`صورة ${name}`}
          source={portraitImages[portrait.imageKey]}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailedImageKey(portrait.imageKey)}
        />
      ) : initials ? (
        <Text style={[styles.initials, { color: iconColor, fontSize: Math.max(11, size * 0.34) }]}>
          {initials}
        </Text>
      ) : (
        <Ionicons name="person" size={Math.round(size * 0.48)} color={iconColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: '900',
    textAlign: 'center',
  },
});
