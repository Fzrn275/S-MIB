import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, sizes, spacing } from '../theme/tokens';
import { xpPercent } from '../data/parentStats';

/** Centered child identity block used at the top of the Child Progress screen. */
export function ChildHeader({ child }) {
  const pct = xpPercent(child);
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={[child.color, child.color + '99']} style={[styles.avatar, { borderColor: child.color + '66' }]}>
        <Text style={styles.avatarText}>{child.init}</Text>
      </LinearGradient>
      <Text style={styles.name}>{child.name}</Text>
      <Text style={styles.meta}>{child.school} · {child.grade}</Text>
      <View style={styles.badgeRow}>
        <Text style={styles.levelBadge}>LEVEL {child.level}</Text>
        <Text style={styles.rank}>{child.rank}</Text>
      </View>
      <View style={styles.xpRow}>
        <Text style={styles.xpText}>{child.xp} / {child.xpMax} XP</Text>
        <Text style={styles.xpText}>{child.xpMax - child.xp} to Level {child.level + 1}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  avatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 10 },
  avatarText: { color: colors.navy, fontSize: sizes.text2xl, fontWeight: '900' },
  name: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900' },
  meta: { color: colors.textDim, fontSize: sizes.textXs, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBadge: { fontSize: 10, fontWeight: '900', color: colors.cyan, backgroundColor: 'rgba(14,116,144,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill, overflow: 'hidden' },
  rank: { fontSize: sizes.textXs, color: colors.textMuted, fontWeight: '700' },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10, marginBottom: 4 },
  xpText: { fontSize: 10, color: colors.textDim },
  track: { height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', width: '100%' },
  fill: { height: 7, borderRadius: 4, backgroundColor: colors.teal },
});
