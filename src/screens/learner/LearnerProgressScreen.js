import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SectionHeader } from '../../components/SectionHeader';
import { useAuth } from '../../context/AuthContext';
import { projectRepo, progressRepo, achievementRepo } from '../../repos';
import { buildCard } from '../../data/learnerView';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

/** Compute real performance stats from the learner's cards. */
function perf(cards) {
  const started = cards.filter((c) => c.started);
  const done = cards.filter((c) => c.completed);
  const xp = cards.reduce((sum, c) => sum + (c.progress ? c.progress.xpEarned : 0), 0);
  const catCount = {};
  done.forEach((c) => { const k = c.project.category || '—'; catCount[k] = (catCount[k] || 0) + 1; });
  const topCat = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0] || '—';
  const completionRate = started.length ? Math.round((done.length / started.length) * 100) : 0;
  return { completionRate, xp, startedCount: started.length, topCat };
}

export function LearnerProgressScreen() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [badges, setBadges] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [projects, progressList, earned] = await Promise.all([
      projectRepo.listProjects(),
      progressRepo.getAllProgress(user.id),
      achievementRepo.listEarnedCodes(user.id),
    ]);
    const byProject = {};
    progressList.forEach((p) => { byProject[p.projectId] = p; });
    setCards(projects.map((proj) => buildCard(proj, byProject[proj.id] || null)));
    setBadges(earned.length);
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user) return <ScreenBackground />;
  const active = cards.filter((c) => c.started && !c.completed).length;
  const done = cards.filter((c) => c.completed).length;
  const p = perf(cards);
  const stats = [
    { icon: '🎯', label: 'Completion Rate', value: `${p.completionRate}%`, sub: 'of started projects', color: colors.cyan },
    { icon: '⚡', label: 'XP Earned', value: p.xp, sub: 'across all steps', color: colors.green },
    { icon: '📚', label: 'Projects Started', value: p.startedCount, sub: 'enrolled so far', color: colors.yellow },
    { icon: '🏆', label: 'Top Category', value: p.topCat, sub: 'most completed', color: colors.orange },
  ];

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <Text style={styles.title}>My Progress</Text>
        <Text style={styles.sub}>Level up by completing projects</Text>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <StatCard value={active} label="Active" tone="teal" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={done} label="Done" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={badges} label="Badges" tone="green" />
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelRow}>
            <Text style={styles.levelIcon}>🏗️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelEyebrow}>CURRENT LEVEL</Text>
              <Text style={styles.levelRank}>Level {user.level} · {user.rankTitle}</Text>
            </View>
          </View>
          <View style={styles.track}><View style={[styles.fill, { width: `${user.levelProgressPct}%` }]} /></View>
          <View style={styles.levelMeta}>
            <Text style={styles.levelMetaText}><Text style={styles.bold}>{user.xp}</Text> / {user.xpForNextLevel} XP</Text>
            <Text style={[styles.levelMetaText, { color: colors.yellow }]}>{user.xpToNextLevel} XP to Level {user.level + 1}</Text>
          </View>
        </View>

        <SectionHeader eyebrow="Your Stats" title="Performance" icon="📈" />
        {loading ? (
          <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.md }} />
        ) : (
          <View style={styles.grid}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color }]} numberOfLines={1}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  sub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.md },
  levelCard: { marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.sm },
  levelIcon: { fontSize: 26 },
  levelEyebrow: { color: colors.cyan, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  levelRank: { color: colors.white, fontSize: sizes.textMd, fontWeight: '900', marginTop: 2 },
  track: { height: 8, borderRadius: 999, backgroundColor: colors.glassStrong, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 999, backgroundColor: colors.cyan },
  levelMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  levelMetaText: { color: colors.textMuted, fontSize: sizes.textXs },
  bold: { color: colors.white, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  statBox: { width: '47.8%', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.md },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: sizes.textXl, fontWeight: '900' },
  statLabel: { color: colors.white, fontSize: sizes.textXs, fontWeight: '800', marginTop: 2 },
  statSub: { color: colors.textDim, fontSize: 10, marginTop: 2 },
});
