import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { ProjectListCard } from '../../components/ProjectListCard';
import { useAuth } from '../../context/AuthContext';
import { projectRepo, progressRepo } from '../../repos';
import { buildCard } from '../../data/learnerView';
import { colors, spacing, sizes, fonts } from '../../theme/tokens';

const TABS = [
  { label: 'In Progress', icon: '⚡' },
  { label: 'Completed', icon: '✅' },
  { label: 'Saved', icon: '🔖' },
];

export function MyProjectsScreen({ navigation }) {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [projects, progressList] = await Promise.all([
      projectRepo.listProjects(),
      progressRepo.getAllProgress(user.id),
    ]);
    const byProject = {};
    progressList.forEach((p) => { byProject[p.projectId] = p; });
    setCards(projects.map((proj) => buildCard(proj, byProject[proj.id] || null)));
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const inProgress = cards.filter((c) => c.started && !c.completed);
  const completed = cards.filter((c) => c.completed);
  const saved = cards.filter((c) => c.bookmarked);
  const lists = [inProgress, completed, saved];
  const shown = lists[tab];

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.title}>My Projects</Text>
        </View>
      </AppHeader>

      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <Pressable key={t.label} onPress={() => setTab(i)} style={[styles.tab, tab === i && styles.tabActive]}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t.icon} {t.label}</Text>
            <Text style={styles.tabCount}>{lists[i].length}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.xxl }}>
          {shown.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>{TABS[tab].icon}</Text>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySub}>
                {tab === 0 ? 'Start a new project to see it here' : tab === 1 ? 'Finish a project to earn certificates' : 'Save projects to come back later'}
              </Text>
            </View>
          ) : (
            shown.map((c) => <ProjectListCard key={c.id} card={c} onPress={() => navigation.navigate('ProjectDetail', { projectId: c.id })} />)
          )}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  title: { color: colors.white, fontSize: sizes.text2xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.cyan },
  tabText: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '800' },
  tabTextActive: { color: colors.white },
  tabCount: { color: colors.cyan, fontSize: sizes.textXs, fontFamily: fonts.displayBlack, fontWeight: '900' },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyIcon: { fontSize: 48, opacity: 0.5, marginBottom: spacing.sm },
  emptyTitle: { color: colors.textMuted, fontSize: sizes.textMd, fontWeight: '800' },
  emptySub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 4, textAlign: 'center' },
});
