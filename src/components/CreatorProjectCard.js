import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, sizes, spacing, thumbGradient } from '../theme/tokens';
import { StatusBadge } from './StatusBadge';

/** project = a Project instance. */
export function CreatorProjectCard({ project, onPress }) {
  const published = project.isPublished;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <LinearGradient colors={thumbGradient(project.color)} style={styles.thumb}>
          <Text style={styles.emoji}>{project.emoji}</Text>
        </LinearGradient>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
          <Text style={styles.meta} numberOfLines={1}>{project.category} · {project.difficulty} · {project.stepCount} steps</Text>
          <StatusBadge status={project.status} style={{ marginTop: 6 }} />
        </View>
      </View>
      {published ? (
        <View style={styles.stats}>
          <Text style={styles.stat}>👥 {project.enrolled}</Text>
          <Text style={styles.stat}>✅ {project.completion}%</Text>
          <Text style={styles.stat}>★ {project.rating || '—'}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 52, height: 52, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  body: { flex: 1, minWidth: 0 },
  title: { color: colors.white, fontSize: sizes.textMd, fontWeight: '800' },
  meta: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 16, marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  stat: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700' },
});
