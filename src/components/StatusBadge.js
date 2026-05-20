import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, sizes } from '../theme/tokens';

const META = {
  draft:     { label: 'Draft',     fg: colors.textMuted, bg: colors.glass },
  review:    { label: 'In Review', fg: colors.cyan,      bg: 'rgba(14,116,144,0.18)' },
  published: { label: 'Published', fg: colors.green,     bg: 'rgba(34,197,94,0.15)' },
  rejected:  { label: 'Rejected',  fg: colors.red,       bg: 'rgba(239,68,68,0.15)' },
};

export function StatusBadge({ status, style }) {
  const m = META[status] || META.draft;
  return (
    <View style={[styles.badge, { backgroundColor: m.bg }, style]}>
      <Text style={[styles.text, { color: m.fg }]}>{m.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.pill, alignSelf: 'flex-start' },
  text: { fontSize: sizes.textXs, fontWeight: '800' },
});
