import { Alert, Platform } from 'react-native';

/**
 * Asks "are you sure?" before something is deleted. Uses the native dialog on
 * phones and the browser's own confirm on the web, where Alert has no buttons.
 */
export function confirmDelete(title: string, message: string, onConfirm: () => void): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'حذف', style: 'destructive', onPress: onConfirm },
  ]);
}
