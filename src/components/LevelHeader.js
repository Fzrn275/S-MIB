import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, sizes, spacing, fonts } from '../theme/tokens';

/**
 * student = a Student model instance (has fullName, streak, level, xp,
 * rankTitle, xpForNextLevel, xpToNextLevel, levelProgressPct).
 * XP bar / badge / streak ported from styles.css :186–221.
 */
export function LevelHeader({ student }) {
  const greetingName = (student.fullName || 'there').split(' ')[0];
  const pct = Math.max(0, Math.min(100, student.levelProgressPct || 0));
  return (
    <View>
      <Text style={styles.greeting}>Good day,</Text>
      <Text style={styles.name}>{greetingName} 👋</Text>

      <View style={styles.streakPill}>
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
        <View style={[styles.fillWrap, { width: `${pct}%` }]}>
          <LinearGradient
            colors={['#B45309', '#F59E0B', '#FCD34D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
          {pct > 0 ? <View style={styles.dot} /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: { fontFamily: fonts.body, color: 'rgba(255,255,255,0.5)', fontSize: sizes.textSm },
  name: { fontFamily: fonts.displayBlack, color: colors.white, fontSize: sizes.text2xl, fontWeight: '900', marginBottom: spacing.sm },

  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: 999,
    paddingVertical: 3,
    paddingLeft: 7,
    paddingRight: 10,
    marginBottom: spacing.sm,
  },
  fire: { fontSize: sizes.textSm },
  streakCount: { fontFamily: fonts.displayBlack, color: colors.yellow, fontSize: sizes.textXs, fontWeight: '900', marginLeft: 5 },
  streakLabel: { fontFamily: fonts.body, color: 'rgba(255,255,255,0.45)', fontSize: 10, marginLeft: 5 },

  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: spacing.sm },
  levelBadge: {
    fontFamily: fonts.displayExtraBold,
    color: colors.navy,
    backgroundColor: colors.yellow,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: colors.yellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  rankTitle: { fontFamily: fonts.bodyMedium, color: 'rgba(255,255,255,0.4)', fontSize: sizes.textXs, fontStyle: 'italic' },

  xpInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  xpCurrent: { fontFamily: fonts.body, color: 'rgba(255,255,255,0.5)', fontSize: sizes.textXs },
  xpNext: { fontFamily: fonts.body, color: 'rgba(245,158,11,0.7)', fontSize: 10, fontWeight: '600' },
  bold: { color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

  track: { height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'visible' },
  fillWrap: {
    height: 6,
    borderRadius: 999,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  fill: { ...StyleSheet.absoluteFillObject, borderRadius: 999 },
  dot: {
    position: 'absolute',
    right: -6,
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FCD34D',
    borderWidth: 2,
    borderColor: '#0C1A2E',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
});
