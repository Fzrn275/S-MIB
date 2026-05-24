import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, fonts } from '../theme/tokens';

/**
 * Back controls — ported from styles.css `.back-row` / `.back-btn` (:423–435).
 * A 34x34 glass circle with a ← arrow; press = scale 0.88 + brighter bg.
 *
 *  <BackButton onPress={...} />        → just the circle (drop-in for an arrow)
 *  <BackRow title="Settings" navigation={nav} />  → circle + Nunito title row
 */
export function BackButton({ onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed, style]}
    >
      <Text style={styles.arrow}>←</Text>
    </Pressable>
  );
}

export function BackRow({ title, onBack, navigation, style }) {
  const back = onBack || (navigation ? () => navigation.goBack() : undefined);
  return (
    <View style={[styles.row, style]}>
      <BackButton onPress={back} />
      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 6 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { backgroundColor: 'rgba(255,255,255,0.16)', transform: [{ scale: 0.88 }] },
  arrow: { color: colors.white, fontSize: 18, lineHeight: 20 },
  title: { fontFamily: fonts.displayBlack, color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: '900' },
});
