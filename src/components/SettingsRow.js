import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii, sizes, spacing } from '../theme/tokens';

/** Tappable settings/profile row: icon chip + label + optional sub + chevron. */
export function SettingsRow({ icon, iconBg, label, sub, onPress, danger }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg || colors.glass }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.label, danger && { color: '#F87171' }]} numberOfLines={1}>{label}</Text>
        {sub ? <Text style={styles.sub} numberOfLines={1}>{sub}</Text> : null}
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.lg, marginBottom: 6, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  iconWrap: { width: 38, height: 38, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 17 },
  body: { flex: 1, minWidth: 0 },
  label: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700' },
  sub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 1 },
  arrow: { color: colors.textDim, fontSize: sizes.textXl },
});
