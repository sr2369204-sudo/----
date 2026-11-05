import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import {
  getReciterPortrait,
  type ReciterPortraitImageKey,
} from '@/features/quran/services/reciter-portraits';

const portraitImages: Record<ReciterPortraitImageKey, ImageSourcePropType> = {
  'abdul-basit': require('../../../../assets/images/reciters/abdul-basit.jpg'),
  husary: require('../../../../assets/images/reciters/husary.jpg'),
  minshawi: require('../../../../assets/images/reciters/minshawi.jpg'),
  'mishary-rashid': require('../../../../assets/images/reciters/mishary-rashid.jpg'),
  'saud-shuraim': require('../../../../assets/images/reciters/shuraim.png'),
  sudais: require('../../../../assets/images/reciters/sudais.jpg'),
  'yasser-al-dosari': require('../../../../assets/images/reciters/yasser-al-dosari.jpg'),
};

type Props = {
  reciterId: number;
  size: number;
  backgroundColor: string;
  iconColor: string;
};

export function ReciterAvatar({
  reciterId,
  size,
  backgroundColor,
  iconColor,
}: Props) {
  const portrait = getReciterPortrait(reciterId);
  const [failedImageKey, setFailedImageKey] = useState<ReciterPortraitImageKey | null>(null);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}>
      {portrait && failedImageKey !== portrait.imageKey ? (
        <Image
          accessibilityLabel="صورة القارئ"
          source={portraitImages[portrait.imageKey]}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailedImageKey(portrait.imageKey)}
        />
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
});
