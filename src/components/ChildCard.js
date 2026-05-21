import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, sizes, spacing } from '../theme/tokens';
import { xpPercent } from '../data/parentStats';

const STAT_COLORS = ['#7FDBFF', '#86EFAC', colors.yellow, colors.cyan];

/** Dashboard card for one linked child. `child` = a SEED_CHILDREN-shaped object. */
export function ChildCard({ child, onPress }) {
  const pct = xpPercent(child);
  const stats = [
    { num: child.active_proj, label: 'Active' },
    { num: child.done_proj, label: 'Done' },
    { num: child.badges, label: 'Badges' },
    { num: `Lv${child.level}`, label: 'Level' },
  ];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <LinearGradient colors={[child.color, child.color + 'bb']} style={[styles.avatar, { borderColor: child.color + '66' }]}>
          <Text style={styles.avatarText}>{child.init}</Text>
        </LinearGradient>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{child.name}</Text>
          <Text style={styles.meta} numberOfLines={1}>{child.grade} · {child.school}</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelBadge}>LV {child.level}</Text>
            <Text style={styles.rank} numberOfLines={1}>{child.rank}</Text>
          </View>
        </View>

        <View style={styles.right}>
          {child.active ? (
            <Text style={styles.activeNow}>● Active now</Text>
          ) : (
            <Text style={styles.lastSeen} numberOfLines={1}>{child.lastSeen}</Text>
          )}
          <Text style={styles.streak}>🔥{child.streak}d</Text>
        </View>
      </View>

      <View style={styles.xpRow}>
        <Text style={styles.xpText}>{child.xp} / {child.xpMax} XP</Text>
        <Text style={[styles.xpText, { color: child.color }]}>{child.xpMax - child.xp} XP to Lv {child.level + 1}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>

      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={s.label} style={styles.stat}>
            <Text style={[styles.statNum, { color: STAT_COLORS[i] }]}>{s.num}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  avatarText: { color: colors.navy, fontSize: sizes.textXl, fontWeight: '900' },
  info: { flex: 1, minWidth: 0 },
  name: { color: colors.white, fontSize: sizes.textMd, fontWeight: '900' },
  meta: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 1 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  levelBadge: { fontSize: 9, fontWeight: '900', color: colors.cyan, backgroundColor: 'rgba(14,116,144,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.pill, overflow: 'hidden' },
  rank: { fontSize: 10, color: colors.textDim, fontStyle: 'italic', flexShrink: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  activeNow: { fontSize: 10, fontWeight: '700', color: '#86EFAC' },
  lastSeen: { fontSize: 10, color: colors.textDim },
  streak: { fontSize: 10, fontWeight: '800', color: colors.orange },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  xpText: { fontSize: 10, color: colors.textDim },
  track: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 10 },
  fill: { height: 5, borderRadius: 3, backgroundColor: colors.teal },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: sizes.textLg, fontWeight: '900' },
  statLabel: { fontSize: 9, color: colors.textDim, marginTop: 2, textTransform: 'uppercase' },
});
