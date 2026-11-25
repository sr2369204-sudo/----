import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
};

const RED = '#C0392B';

/** A styled confirmation card for destructive choices, in place of the plain system alert. */
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'تراجع',
  icon = 'trash-outline',
  onConfirm,
  onCancel,
}: Props) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, progress]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable accessibilityLabel="إغلاق" style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] },
          ]}
        >
          <View style={styles.iconRing}>
            <View style={styles.iconCore}>
              <Ionicons name={icon} size={28} color="#FFF" />
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.pressed]}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,20,15,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F3D31',
    borderWidth: 1,
    borderColor: 'rgba(216,181,109,0.45)',
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(192,57,43,0.22)',
    marginBottom: 4,
  },
  iconCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RED,
  },
  title: { fontSize: 20, fontWeight: '900', color: '#FFF9EA', textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 22, color: 'rgba(239,248,243,0.8)', textAlign: 'center' },
  actions: { flexDirection: 'row-reverse', gap: 10, marginTop: 10, alignSelf: 'stretch' },
  button: { flex: 1, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  confirm: { backgroundColor: RED },
  confirmText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  cancel: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  cancelText: { color: '#FFF9EA', fontWeight: '800', fontSize: 15 },
  pressed: { opacity: 0.8 },
});
