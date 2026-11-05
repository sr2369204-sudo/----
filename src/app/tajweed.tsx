import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TajweedImage = {
  id: string;
  title: string;
  section: string;
  source: number;
};

const tajweedImages: TajweedImage[] = [
  {
    id: 'istiadha-basmala',
    title: 'الاستعاذة والبسملة',
    section: 'مقدمات التلاوة',
    source: require('../../assets/tajweed/istiadha-basmala.png'),
  },
  {
    id: 'noon-sakinah-tanween',
    title: 'النون الساكنة والتنوين',
    section: 'أحكام النون والتنوين',
    source: require('../../assets/tajweed/noon-sakinah-tanween.png'),
  },
  {
    id: 'izhar',
    title: 'الإظهار',
    section: 'الإظهار',
    source: require('../../assets/tajweed/izhar.png'),
  },
  {
    id: 'idgham',
    title: 'الإدغام',
    section: 'أحكام النون والتنوين',
    source: require('../../assets/tajweed/idgham.jpg'),
  },
  {
    id: 'iqlab',
    title: 'الإقلاب',
    section: 'أحكام النون والتنوين',
    source: require('../../assets/tajweed/iqlab.jpg'),
  },
  {
    id: 'ikhfa',
    title: 'الإخفاء',
    section: 'أحكام النون والتنوين',
    source: require('../../assets/tajweed/ikhfa.jpg'),
  },
  {
    id: 'meem-sakinah',
    title: 'أحكام الميم الساكنة',
    section: 'أحكام الميم الساكنة',
    source: require('../../assets/tajweed/meem-sakinah.jpg'),
  },
];

const sectionFilters = [
  'كل الصور',
  ...new Set(tajweedImages.map((item) => item.section)),
];

export default function TajweedEncyclopediaScreen() {
  const colors = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [activeSection, setActiveSection] = useState('كل الصور');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<TajweedImage | null>(null);
  const [zoom, setZoom] = useState(1);

  const filteredImages = useMemo(() => {
    const query = searchQuery.trim();

    return tajweedImages.filter((item) => {
      const matchesSection = activeSection === 'كل الصور' || item.section === activeSection;
      const matchesSearch =
        query.length === 0 || item.title.includes(query) || item.section.includes(query);
      return matchesSection && matchesSearch;
    });
  }, [activeSection, searchQuery]);

  const viewerHeight = Math.max(220, windowHeight - 190);
  const imageSize = Math.min(windowWidth, viewerHeight) * zoom;

  const openImage = (item: TajweedImage) => {
    setZoom(1);
    setSelectedImage(item);
  };

  const closeImage = () => {
    setSelectedImage(null);
    setZoom(1);
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.topRow}>
        <Link href="/" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="العودة للرئيسية"
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </Pressable>
        </Link>
        <View style={styles.titleGroup}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>دليل التلاوة</Text>
          <Text style={[styles.title, { color: colors.text }]}>موسوعة التجويد</Text>
        </View>
      </View>

      <View style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.introIcon, { backgroundColor: colors.backgroundSelected }]}>
          <Ionicons name="images-outline" size={23} color={colors.primary} />
        </View>
        <View style={styles.introCopy}>
          <Text style={[styles.introTitle, { color: colors.text }]}>الأحكام في صور</Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            اختر صورة لعرضها بالحجم الكامل والتكبير.
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.backgroundSelected }]}>
          <Text style={[styles.countValue, { color: colors.primary }]}>{filteredImages.length}</Text>
          <Text style={[styles.countLabel, { color: colors.primary }]}>صور</Text>
        </View>
      </View>

      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        <Ionicons name="search" size={19} color={colors.primary} />
        <TextInput
          accessibilityLabel="ابحث في صور التجويد"
          placeholder="ابحث عن باب..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          style={[styles.searchInput, { color: colors.text }]}
          textAlign="right"
        />
        {searchQuery.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="مسح البحث"
            hitSlop={8}
            onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={19} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {sectionFilters.map((section) => {
          const isActive = activeSection === section;
          return (
            <Pressable
              key={section}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setActiveSection(section)}
              style={({ pressed }) => [
                styles.filter,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? colors.onPrimary : colors.textSecondary },
                ]}>
                {section}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.galleryHeading}>
        <Text style={[styles.galleryTitle, { color: colors.text }]}>تصفّح الأحكام</Text>
        <Text style={[styles.gallerySubtitle, { color: colors.textSecondary }]}>
          اضغط على الصورة لفتحها
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredImages}
        numColumns={2}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`عرض صورة ${item.title}`}
            onPress={() => openImage(item)}
            style={({ pressed }) => [
              styles.imageCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            <View style={[styles.imageFrame, { backgroundColor: '#F6F0DB' }]}>
              <Image
                source={item.source}
                style={styles.previewImage}
                contentFit="contain"
                transition={180}
                accessibilityLabel={`صورة تعليمية عن ${item.title}`}
              />
              <View
                style={[
                  styles.zoomBadge,
                  { backgroundColor: colors.surface },
                ]}>
                <Ionicons name="scan-outline" size={16} color={colors.primary} />
              </View>
            </View>
            <View style={styles.cardCopy}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.cardEyebrow, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.section}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="images-outline" size={30} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              لا توجد صور مطابقة للبحث.
            </Text>
          </View>
        }
      />

      <Modal
        visible={selectedImage !== null}
        animationType="fade"
        onRequestClose={closeImage}
        statusBarTranslucent>
        <View style={styles.viewer}>
          <View style={styles.viewerHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق الصورة"
              onPress={closeImage}
              style={styles.viewerIconButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
            <Text numberOfLines={1} style={styles.viewerTitle}>
              {selectedImage?.title}
            </Text>
            <View style={styles.viewerIconButton} />
          </View>

          <View style={[styles.viewerStage, { height: viewerHeight }]}>
            {selectedImage && (
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  width: Math.max(windowWidth, imageSize),
                  height: viewerHeight,
                  alignItems: 'center',
                }}>
                <ScrollView
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  style={{ width: imageSize, height: viewerHeight }}
                  contentContainerStyle={[
                    styles.zoomContent,
                    { minHeight: Math.max(viewerHeight, imageSize) },
                  ]}>
                  <Image
                    source={selectedImage.source}
                    style={{ width: imageSize, height: imageSize }}
                    contentFit="contain"
                    accessibilityLabel={`صورة ${selectedImage.title}`}
                  />
                </ScrollView>
              </ScrollView>
            )}
          </View>

          <View style={styles.viewerControls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="تصغير الصورة"
              disabled={zoom <= 1}
              onPress={() => setZoom((current) => Math.max(1, current - 0.5))}
              style={[styles.zoomControl, zoom <= 1 && styles.disabledControl]}>
              <Ionicons name="remove" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إعادة ضبط التكبير"
              onPress={() => setZoom(1)}
              style={styles.zoomValue}>
              <Text style={styles.zoomValueText}>{Math.round(zoom * 100)}%</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="تكبير الصورة"
              disabled={zoom >= 3}
              onPress={() => setZoom((current) => Math.min(3, current + 0.5))}
              style={[styles.zoomControl, zoom >= 3 && styles.disabledControl]}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.viewerHint}>استخدم أزرار التكبير، واسحب الصورة للتنقّل</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.five,
  },
  headerContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  eyebrow: {
    fontSize: TypeScale.caption,
    fontWeight: '700',
  },
  title: {
    fontSize: TypeScale.display,
    fontWeight: '900',
  },
  introCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  introIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introCopy: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
  },
  introTitle: {
    fontSize: TypeScale.body,
    fontWeight: '800',
  },
  introText: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  countBadge: {
    minWidth: 48,
    height: 46,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countValue: {
    fontSize: TypeScale.heading,
    fontWeight: '900',
    lineHeight: 20,
  },
  countLabel: {
    fontSize: TypeScale.micro,
    fontWeight: '700',
  },
  searchBar: {
    minHeight: 50,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    fontSize: TypeScale.body,
    textAlign: 'right',
  },
  filters: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  filter: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  filterText: {
    fontSize: TypeScale.caption,
    fontWeight: '700',
  },
  galleryHeading: {
    alignItems: 'flex-end',
    gap: 3,
    marginBottom: Spacing.two,
  },
  galleryTitle: {
    fontSize: TypeScale.title,
    fontWeight: '900',
  },
  gallerySubtitle: {
    fontSize: TypeScale.caption,
  },
  imageCard: {
    flex: 1,
    marginHorizontal: Spacing.two,
    marginBottom: Spacing.two,
    padding: Spacing.one,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  cardCopy: {
    alignItems: 'flex-end',
    gap: 2,
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  cardEyebrow: {
    fontSize: TypeScale.micro,
    fontWeight: '600',
    textAlign: 'right',
  },
  cardTitle: {
    fontSize: TypeScale.body,
    fontWeight: '900',
    textAlign: 'right',
  },
  zoomBadge: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: TypeScale.body,
    textAlign: 'center',
  },
  viewer: {
    flex: 1,
    backgroundColor: '#07110E',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    justifyContent: 'space-between',
  },
  viewerHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  viewerIconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: TypeScale.heading,
    fontWeight: '800',
    textAlign: 'center',
  },
  viewerStage: {
    alignSelf: 'stretch',
  },
  zoomContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  zoomControl: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledControl: {
    opacity: 0.4,
  },
  zoomValue: {
    minWidth: 58,
    alignItems: 'center',
  },
  zoomValueText: {
    color: '#FFFFFF',
    fontSize: TypeScale.body,
    fontWeight: '800',
  },
  viewerHint: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: TypeScale.caption,
    textAlign: 'center',
    paddingHorizontal: Spacing.three,
  },
});
