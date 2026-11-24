import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { confirmDelete } from '@/components/confirm-delete';
import { OfflineLibrary } from '@/features/reader/services/offline-library';
import { useOfflineDownloadStore } from '@/features/reader/state/offline-download-store';
import { useTheme } from '@/hooks/use-theme';
import { formatMegabytes, toArabicNumbers } from '@/features/settings/utils/format';

/**
 * Manages the stored Mushaf pages: how many are on the phone, how much room
 * they take, a button to download the rest (or stop), and one to free the space.
 */
export function OfflineMushafCard() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const running = useOfflineDownloadStore((state) => state.running);
  const done = useOfflineDownloadStore((state) => state.done);
  const total = useOfflineDownloadStore((state) => state.total);
  const revision = useOfflineDownloadStore((state) => state.revision);
  const error = useOfflineDownloadStore((state) => state.error);
  const start = useOfflineDownloadStore((state) => state.start);
  const cancel = useOfflineDownloadStore((state) => state.cancel);
  const progressBucket = running ? Math.floor(done / 50) : -1;
  const [stored, setStored] = useState<{ pages: number; bytes: number } | null>(null);

  useEffect(() => {
    let active = true;
    const library = new OfflineLibrary(database);
    void Promise.all([library.getCachedPageCount(), library.getStoredBytes()])
      .then(([pages, bytes]) => {
        if (active) {
          setStored({ pages, bytes });
        }
      })
      .catch((readError: unknown) => {
        console.error('تعذر قراءة حالة المصحف المحمّل.', readError);
      });
    return () => {
      active = false;
    };
  }, [database, revision, progressBucket]);

  const pages = stored?.pages ?? 0;
  const complete = pages >= 604;

  async function remember(choice: 'yes'): Promise<void> {
    try {
      await database.runAsync(
        `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        'offline.autoDownload',
        choice,
        new Date().toISOString(),
      );
    } catch (writeError) {
      console.error('تعذر حفظ اختيار التحميل.', writeError);
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: colors.backgroundSelected }]}>
          <Ionicons name="book-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.text }]}>المصحف بدون إنترنت</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {stored === null
              ? 'جارٍ القراءة…'
              : complete
                ? `المصحف كله محفوظ على جهازك (${formatMegabytes(stored.bytes)} ميجابايت).`
                : `${toArabicNumbers(pages)} من ٦٠٤ صفحة محفوظة على جهازك. الباقي يُحمَّل عند الحاجة إذا كان معك إنترنت.`}
          </Text>
        </View>
      </View>

      {running && (
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          {total > 0
            ? `جارٍ التحميل: ${toArabicNumbers(done)} من ${toArabicNumbers(total)}`
            : 'جارٍ البدء…'}
        </Text>
      )}
      {error && !running && (
        <Text style={[styles.body, { color: colors.primary }]}>
          توقف التحميل. اضغط «تحميل» لاستكماله من حيث وقف.
        </Text>
      )}

      {running ? (
        <Pressable
          accessibilityRole="button"
          onPress={cancel}
          style={[styles.button, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="close-circle-outline" size={18} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>إيقاف التحميل</Text>
        </Pressable>
      ) : (
        !complete && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void remember('yes');
              void start(database, 'all');
            }}
            style={[styles.button, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Ionicons name="download-outline" size={18} color={colors.background} />
            <Text style={[styles.buttonText, { color: colors.background }]}>تحميل المصحف كله</Text>
          </Pressable>
        )
      )}

      {!running && pages > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            confirmDelete(
              'حذف المصحف المحمّل؟',
              'ستُحذف الصفحات المحفوظة لتوفير المساحة. بياناتك (الحفظ والعلامات والملاحظات) لا تتأثر، ويمكنك تحميله مرة أخرى.',
              () => {
                void new OfflineLibrary(database).deleteAll().then(() => {
                  useOfflineDownloadStore.setState((state) => ({
                    done: 0,
                    total: 0,
                    complete: false,
                    revision: state.revision + 1,
                  }));
                  void database.runAsync(
                    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
                     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
                    'offline.autoDownload',
                    'never',
                    new Date().toISOString(),
                  );
                });
              },
            )
          }
          style={[styles.button, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="trash-outline" size={18} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>حذف المصحف المحمّل</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  header: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, gap: 3 },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'right' },
  body: { fontSize: 14, lineHeight: 23, textAlign: 'right' },
  button: {
    minHeight: 46,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 16,
  },
  buttonText: { fontSize: 14, fontWeight: '700' },
});
