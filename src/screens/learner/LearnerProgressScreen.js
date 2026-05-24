import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SectionHeader } from '../../components/SectionHeader';
import { useAuth } from '../../context/AuthContext';
import { projectRepo, progressRepo, achievementRepo } from '../../repos';
import { buildCard } from '../../data/learnerView';
import { colors, spacing, sizes, radii, tabBarClearance, fonts } from '../../theme/tokens';

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
    { icon: '⚡', label: 'XP Earned', value: p.xp, sub: 'across all steps', color: colors.yellow },
    { icon: '📚', label: 'Projects Started', value: p.startedCount, sub: 'enrolled so far', color: colors.green },
    { icon: '🏆', label: 'Top Category', value: p.topCat, sub: 'most completed', color: colors.yellow },
  ];

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>My Progress</Text>
            <Text style={styles.sub}>Level up by completing projects</Text>
          </View>
          <View style={styles.streakPill}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakText}>{user.streak} days</Text>
          </View>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <StatCard value={active} label="Active" tone="teal" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={done} label="Done" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={badges} label="Badges" tone="green" />
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelRow}>
            <View style={styles.levelIconCircle}><Text style={styles.levelIcon}>🏗️</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelEyebrow}>CURRENT LEVEL</Text>
              <Text style={styles.levelRank}>Level {user.level} · {user.rankTitle}</Text>
            </View>
            <Text style={styles.levelArrow}>›</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fillWrap, { width: `${user.levelProgressPct}%` }]}>
              <LinearGradient colors={['#B45309', '#F59E0B', '#FCD34D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill} />
            </View>
          </View>
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
  title: { color: colors.white, fontSize: sizes.text2xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  sub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  streakFire: { fontSize: sizes.textXs },
  streakText: { fontFamily: fonts.displayExtraBold, fontSize: 11, fontWeight: '800', color: colors.yellow },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.md },
  levelCard: { marginVertical: 14, marginHorizontal: 16, padding: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.2)', borderRadius: 18 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.sm },
  levelIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  levelIcon: { fontSize: 20 },
  levelEyebrow: { color: colors.cyan, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  levelRank: { color: colors.white, fontSize: 15, fontFamily: fonts.displayBlack, fontWeight: '900', marginTop: 2 },
  levelArrow: { color: 'rgba(255,255,255,0.3)', fontSize: 22, fontWeight: '300' },
  track: { height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'hidden' },
  fillWrap: { height: 6, borderRadius: 999 },
  fill: { ...StyleSheet.absoluteFillObject, borderRadius: 999 },
  levelMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  levelMetaText: { color: colors.textMuted, fontSize: sizes.textXs },
  bold: { color: colors.white, fontFamily: fonts.displayBlack, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  statBox: { width: '47.8%', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.md },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: sizes.textXl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: sizes.textXs, fontWeight: '800', marginTop: 2 },
  statSub: { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 2 },
});
