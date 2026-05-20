import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radii, sizes, spacing } from '../theme/tokens';

const NUM_COLORS = { teal: colors.cyan, yellow: colors.yellow, green: colors.green };

export function StatCard({ value, label, tone = 'teal', onPress, style }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.card, style]}>
      <Text style={[styles.num, { color: NUM_COLORS[tone] || colors.cyan }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingVertical: spacing.md, alignItems: 'center' },
  num: { fontSize: sizes.text2xl, fontWeight: '900' },
  label: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700', marginTop: 2 },
});
