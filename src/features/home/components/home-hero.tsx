import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HomeHeroProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

const HERO_IMAGE = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Luxurious%20Quran%20on%20wooden%20stand%2C%20Islamic%20architecture%20background%2C%20warm%20sunlight%20casting%20shadows%2C%20lantern%20and%20prayer%20beads%2C%20peaceful%20sanctuary%20vibe%2C%20cinematic%20lighting%2C%20high%20resolution&image_size=landscape_16_9';

export function HomeHero({ searchValue, onSearchChange }: HomeHeroProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: HERO_IMAGE }}
        style={styles.backgroundImage}
        contentFit="cover"
        transition={1000}
      />
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

      <View style={[styles.content, { paddingTop: insets.top + Spacing.two }]}>
        <View style={styles.topRow}>
          <View style={styles.welcomeGroup}>
            <Text style={styles.welcomeTitle}>مرحباً بك في مصحف</Text>
            <Text style={styles.welcomeSubtitle}>ابحث في كتاب الله عز وجل</Text>
          </View>
          
          <Link href="/settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="الإعدادات"
              style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#FFF" />
            </Pressable>
          </Link>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            placeholder="ابحث عن سورة، آية، أو كلمة..."
            placeholderTextColor={colors.textSecondary}
            value={searchValue}
            onChangeText={onSearchChange}
            style={[styles.searchInput, { color: colors.text }]}
            textAlign="right"
            returnKeyType="search"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
    paddingBottom: Spacing.four,
  },
  topRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeGroup: {
    gap: 4,
  },
  welcomeTitle: {
    fontSize: TypeScale.hero,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'right',
  },
  welcomeSubtitle: {
    fontSize: TypeScale.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    height: 56,
    borderRadius: Radius.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginLeft: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: TypeScale.body,
    fontWeight: '600',
  },
});
