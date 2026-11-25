import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  createBackup,
  parseBackup,
  restoreBackup,
  serializeBackup,
} from '@/features/backup/backup';
import { useMemorizationStore } from '@/features/memorization/state/memorization-store';
import { useTheme } from '@/hooks/use-theme';

import { friendlyError } from '@/features/errors/friendly-error';
/**
 * Copies the reader's own data to the clipboard as text and pastes it back.
 * No server and no file sharing involved: the text can be kept anywhere.
 */
export function BackupCard() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function copyBackup(): Promise<void> {
    setBusy(true);
    setMessage(null);
    try {
      const text = serializeBackup(await createBackup(database));
      await Clipboard.setStringAsync(text);
      setMessage('تم نسخ النسخة الاحتياطية. الصقها في واتساب أو في ملاحظاتك واحتفظ بها.');
    } catch (error) {
      setMessage(friendlyError(error, 'تعذر إنشاء النسخة.'));
    } finally {
      setBusy(false);
    }
  }

  async function pasteBackup(): Promise<void> {
    setBusy(true);
    setMessage(null);
    try {
      const backup = parseBackup(await Clipboard.getStringAsync());
      const summary = await restoreBackup(database, backup);
      useMemorizationStore.setState({ loaded: false });
      await useMemorizationStore.getState().load(database);
      const rows = Object.values(summary.rows).reduce((sum, count) => sum + count, 0);
      setMessage(`تم الاسترجاع: ${rows} عنصر و${summary.settings} إعداد.`);
    } catch (error) {
      setMessage(friendlyError(error, 'تعذر الاسترجاع.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: colors.backgroundSelected }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.text }]}>نسخة احتياطية</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            احفظ حفظك وعلاماتك وملاحظاتك وكلماتك المحفوظة وتمييزاتك كنص تنسخه. لو غيّرت الموبايل الصقه هنا
            واسترجع كل شيء. التسجيلات الصوتية لا تدخل في النسخة.
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => void copyBackup()}
        style={[styles.button, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
        <Ionicons name="copy-outline" size={18} color={colors.background} />
        <Text style={[styles.buttonText, { color: colors.background }]}>نسخ نسخة احتياطية</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() =>
          Alert.alert(
            'استرجاع من النص المنسوخ؟',
            'ستُضاف البيانات الموجودة في النسخة إلى بياناتك الحالية، ولن يُحذف شيء.',
            [
              { text: 'إلغاء', style: 'cancel' },
              { text: 'استرجاع', onPress: () => void pasteBackup() },
            ],
          )
        }
        style={[styles.button, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Ionicons name="clipboard-outline" size={18} color={colors.text} />
        <Text style={[styles.buttonText, { color: colors.text }]}>استرجاع من الحافظة</Text>
      </Pressable>
      {message && <Text style={[styles.body, { color: colors.textSecondary }]}>{message}</Text>}
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
