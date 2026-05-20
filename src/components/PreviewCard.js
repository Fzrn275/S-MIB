import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, sizes, thumbGradient } from '../theme/tokens';
import { DifficultyPill } from './DifficultyPill';

/**
 * card  = { project, totalSteps, pct, started } view-model from buildCard().
 * showProgress shows the bottom progress bar when started.
 */
export function PreviewCard({ card, onPress, showProgress = false }) {
  const { project, totalSteps, pct } = card;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <LinearGradient colors={thumbGradient(project.color)} style={styles.bg}>
        <Text style={styles.emoji}>{project.emoji}</Text>
      </LinearGradient>
      <View style={styles.catRow}>
        <Text style={styles.cat}>{project.category}</Text>
        <DifficultyPill difficulty={project.difficulty} />
      </View>
      <Text style={styles.title} numberOfLines={2}>{project.title}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaStar}>★ {project.rating}</Text>
        <Text style={styles.metaDim}>· {project.duration || '3–5h'} · {totalSteps} steps</Text>
      </View>
      {showProgress && pct > 0 ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 240, marginRight: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 10 },
  bg: { height: 110, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emoji: { fontSize: 44 },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cat: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700' },
  title: { color: colors.white, fontSize: sizes.textMd, fontWeight: '800', marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center' },
  metaStar: { color: colors.yellow, fontSize: sizes.textXs, fontWeight: '700' },
  metaDim: { color: colors.textDim, fontSize: sizes.textXs, marginLeft: 4 },
  track: { height: 6, borderRadius: 999, backgroundColor: colors.glassStrong, marginTop: 8, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 999, backgroundColor: colors.cyan },
});
