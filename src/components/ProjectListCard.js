import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, sizes, spacing, thumbGradient } from '../theme/tokens';

export function ProjectListCard({ card, onPress }) {
  const { project, totalSteps, pct, completed } = card;
  const pctLabel = pct === 0 ? 'New' : `${pct}%`;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <LinearGradient colors={thumbGradient(project.color)} style={styles.thumb}>
        <Text style={styles.emoji}>{project.emoji}</Text>
      </LinearGradient>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {project.category} · {project.difficulty} · {totalSteps} steps{project.duration ? ` · ${project.duration}` : ''}
        </Text>
        <View style={styles.progRow}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: completed ? colors.green : colors.cyan }]} />
          </View>
          <Text style={styles.pct}>{pctLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: 10, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg },
  thumb: { width: 56, height: 56, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
  body: { flex: 1, minWidth: 0 },
  title: { color: colors.white, fontSize: sizes.textMd, fontWeight: '800' },
  meta: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  track: { flex: 1, height: 6, borderRadius: 999, backgroundColor: colors.glassStrong, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 999 },
  pct: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700', minWidth: 34, textAlign: 'right' },
});
