import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, sizes, spacing } from '../theme/tokens';

/** "Current Goal" card shown on the Child Progress screen. */
export function GoalCard({ goal, deadline }) {
  if (!goal) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🎯 Current Goal</Text>
      <Text style={styles.desc}>{goal}</Text>
      {deadline ? <Text style={styles.deadline}>Deadline: {deadline}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: 'rgba(14,116,144,0.10)', borderWidth: 1, borderColor: 'rgba(103,232,249,0.18)', borderRadius: radii.lg },
  title: { color: colors.cyan, fontSize: sizes.textSm, fontWeight: '900', marginBottom: 6 },
  desc: { color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 20 },
  deadline: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 8 },
});
