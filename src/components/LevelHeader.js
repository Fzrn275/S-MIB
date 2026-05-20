import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, sizes, spacing } from '../theme/tokens';

/**
 * student = a Student model instance (has fullName, streak, level, xp,
 * rankTitle, xpForNextLevel, xpToNextLevel, levelProgressPct).
 */
export function LevelHeader({ student }) {
  const greetingName = (student.fullName || 'there').split(' ')[0];
  return (
    <View>
      <Text style={styles.greeting}>Good day,</Text>
      <Text style={styles.name}>{greetingName} 👋</Text>

      <View style={styles.streakRow}>
        <Text style={styles.fire}>🔥</Text>
        <Text style={styles.streakCount}>{student.streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>

      <View style={styles.levelRow}>
        <Text style={styles.levelBadge}>LEVEL {student.level}</Text>
        <Text style={styles.rankTitle}>{student.rankTitle}</Text>
      </View>

      <View style={styles.xpInfoRow}>
        <Text style={styles.xpCurrent}><Text style={styles.bold}>{student.xp}</Text> / {student.xpForNextLevel} XP</Text>
        <Text style={styles.xpNext}>{student.xpToNextLevel} XP to Level {student.level + 1}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${student.levelProgressPct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: { color: colors.textMuted, fontSize: sizes.textSm, fontWeight: '600' },
  name: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900', marginBottom: spacing.sm },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  fire: { fontSize: sizes.textLg },
  streakCount: { color: colors.yellow, fontSize: sizes.textLg, fontWeight: '900', marginLeft: 4 },
  streakLabel: { color: colors.textMuted, fontSize: sizes.textXs, marginLeft: 6 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  levelBadge: { color: colors.navy, backgroundColor: colors.cyan, fontSize: sizes.textXs, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  rankTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700' },
  xpInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  xpCurrent: { color: colors.textMuted, fontSize: sizes.textXs },
  xpNext: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700' },
  bold: { color: colors.white, fontWeight: '900' },
  track: { height: 8, borderRadius: 999, backgroundColor: colors.glassStrong, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 999, backgroundColor: colors.cyan },
});
