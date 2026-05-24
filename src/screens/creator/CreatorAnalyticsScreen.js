import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SectionHeader } from '../../components/SectionHeader';
import { AnalyticsBars } from '../../components/AnalyticsBars';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { buildAnalytics } from '../../data/creatorStats';
import { colors, spacing, sizes, tabBarClearance, fonts } from '../../theme/tokens';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

export function CreatorAnalyticsScreen() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setProjects(await creatorRepo.listMyProjects(user.id));
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const a = buildAnalytics(projects);

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.sub}>Across your published projects</Text>
      </AppHeader>

      {loading ? (
        <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: tabBarClearance }}>
          <View style={styles.stats}>
            <StatCard value={a.totalStudents} label="Students" tone="teal" />
            <View style={{ width: spacing.sm }} />
            <StatCard value={`${a.avgCompletion}%`} label="Avg done" tone="yellow" />
            <View style={{ width: spacing.sm }} />
            <StatCard value={a.avgRating || '—'} label="Avg ★" tone="green" />
          </View>

          <SectionHeader title="Weekly Enrolments" icon="📈" />
          <AnalyticsBars bars={a.weeklyBars} labels={DAYS} />

          <SectionHeader title="Top Projects" icon="🔥" />
          {a.topProjects.map((p) => (
            <View key={p.id} style={styles.row}>
              <Text style={styles.rowTitle} numberOfLines={1}>{p.emoji} {p.title}</Text>
              <Text style={styles.rowMeta}>👥 {p.enrolled} · ✅ {p.completion}%</Text>
            </View>
          ))}
          {a.topProjects.length === 0 ? <Text style={styles.empty}>Publish a project to see analytics.</Text> : null}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: sizes.text2xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: sizes.textXs, marginTop: 2 },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: spacing.lg, marginBottom: 6, padding: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  rowTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700', flex: 1, marginRight: 8 },
  rowMeta: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700' },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: spacing.lg, fontSize: sizes.textSm },
});
