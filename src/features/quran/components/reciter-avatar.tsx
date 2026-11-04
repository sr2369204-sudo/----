import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { getReciterPortrait } from '@/features/quran/services/reciter-portraits';

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
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = portrait !== undefined && failedImageUrl !== portrait.imageUrl;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}>
      {showImage ? (
        <Image
          accessibilityLabel="صورة القارئ"
          source={{ uri: portrait.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailedImageUrl(portrait.imageUrl)}
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
