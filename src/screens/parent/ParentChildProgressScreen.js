import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { ChildHeader } from '../../components/ChildHeader';
import { GoalCard } from '../../components/GoalCard';
import { SectionHeader } from '../../components/SectionHeader';
import { StatCard } from '../../components/StatCard';
import { CreatorPublicProfileModal } from '../../components/CreatorPublicProfileModal';
import { projectRepo } from '../../repos';
import { SEED_BADGES } from '../../data/seedData';
import { colors, spacing, sizes, radii, thumbGradient } from '../../theme/tokens';

/** Build plain read-only project views for a child from the published catalog. */
function deriveChildProjects(projects, child) {
  const toView = (p, pct) => ({
    id: p.id, title: p.title, category: p.category, difficulty: p.difficulty,
    emoji: p.emoji, color: p.color, stepCount: p.stepCount, description: p.description,
    creatorName: p.creatorName, pct, doneSteps: Math.round((pct / 100) * (p.stepCount || 0)),
  });
  const active = projects.slice(0, child.active_proj).map((p) => {
    let pct = p.completion || 0;
    if (pct <= 0) pct = 25;
    if (pct >= 100) pct = 90;
    return toView(p, pct);
  });
  const completed = projects
    .slice(child.active_proj, child.active_proj + Math.min(2, child.done_proj))
    .map((p) => toView(p, 100));
  return { active, completed };
}

export function ParentChildProgressScreen({ navigation, route }) {
  const child = route.params.child;
  const [projects, setProjects] = useState({ active: [], completed: [] });
  const [viewCreator, setViewCreator] = useState(null);

  const load = useCallback(async () => {
    const list = await projectRepo.listProjects();
    setProjects(deriveChildProjects(list, child));
  }, [child]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const badges = SEED_BADGES.slice(0, Math.min(child.badges, SEED_BADGES.length));

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>←</Text></Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{child.name}</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <ChildHeader child={child} />

        <View style={styles.stats}>
          <StatCard value={child.active_proj} label="Active" tone="teal" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={child.done_proj} label="Done" tone="green" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={child.badges} label="Badges" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={`🔥${child.streak}`} label="Streak" tone="teal" />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <GoalCard goal={child.goal} deadline={child.goalDate} />
        </View>

        <SectionHeader title="Active Projects" icon="📚" />
        <Text style={styles.note}>👁️ Read-only · Tap a project to see more details</Text>
        {projects.active.map((p) => (
          <View key={p.id} style={styles.projCard}>
            <Pressable style={styles.projRow} onPress={() => navigation.navigate('ParentChildProjectView', { child, proj: p })}>
              <LinearGradient colors={thumbGradient(p.color)} style={styles.thumb}><Text style={styles.thumbEmoji}>{p.emoji}</Text></LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.projTitle} numberOfLines={1}>{p.title}</Text>
                <View style={styles.progRow}>
                  <View style={styles.track}><View style={[styles.fill, { width: `${p.pct}%` }]} /></View>
                  <Text style={styles.pct}>{p.pct}%</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable style={styles.creatorRow} onPress={() => setViewCreator(p.creatorName)}>
              <Text style={styles.creatorBy} numberOfLines={1}>👤 by {p.creatorName}</Text>
              <Text style={styles.creatorLink}>View profile →</Text>
            </Pressable>
          </View>
        ))}

        {projects.completed.length > 0 && (
          <>
            <SectionHeader title="Recently Completed" icon="✅" />
            {projects.completed.map((p) => (
              <View key={p.id} style={styles.doneCard}>
                <LinearGradient colors={thumbGradient(p.color)} style={styles.thumb}><Text style={styles.thumbEmoji}>{p.emoji}</Text></LinearGradient>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.projTitle} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.doneMeta}>{p.category} · {p.difficulty}</Text>
                </View>
                <Text style={styles.doneBadge}>✓ Done</Text>
              </View>
            ))}
          </>
        )}

        <SectionHeader title="Earned Badges" icon="🏅" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badges}>
          {badges.map((b, i) => (
            <View key={i} style={styles.badgeCard}>
              <Text style={styles.badgeTier}>{b.tier}</Text>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <Text style={styles.badgeName} numberOfLines={2}>{b.name}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <CreatorPublicProfileModal creatorName={viewCreator} visible={!!viewCreator} onClose={() => setViewCreator(null)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900', flex: 1 },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg },
  note: { color: colors.textDim, fontSize: 11, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  projCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, overflow: 'hidden' },
  projRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md },
  thumb: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 22 },
  projTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '900' },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.teal },
  pct: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700' },
  chevron: { color: colors.textDim, fontSize: sizes.textLg },
  creatorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.02)' },
  creatorBy: { color: colors.textMuted, fontSize: 11, fontWeight: '700', flex: 1 },
  creatorLink: { color: colors.cyan, fontSize: 10, fontWeight: '700' },
  doneCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: 'rgba(22,101,52,0.10)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', borderRadius: radii.lg },
  doneMeta: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  doneBadge: { fontSize: 9, fontWeight: '700', color: '#86EFAC', backgroundColor: 'rgba(22,101,52,0.4)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: radii.pill, overflow: 'hidden' },
  badges: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.sm },
  badgeCard: { width: 84, alignItems: 'center', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.sm },
  badgeTier: { color: colors.textDim, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  badgeIcon: { fontSize: 22, marginVertical: 4 },
  badgeName: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textAlign: 'center' },
});
