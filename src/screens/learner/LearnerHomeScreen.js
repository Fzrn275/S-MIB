import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { LevelHeader } from '../../components/LevelHeader';
import { StatCard } from '../../components/StatCard';
import { SectionHeader } from '../../components/SectionHeader';
import { PreviewCard } from '../../components/PreviewCard';
import { useAuth } from '../../context/AuthContext';
import { projectRepo, progressRepo, achievementRepo } from '../../repos';
import { buildCard } from '../../data/learnerView';
import { colors, spacing, sizes, tabBarClearance } from '../../theme/tokens';

export function LearnerHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
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
    setBadgeCount(earned.length);
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const active = cards.filter((c) => c.started && !c.completed);
  const done = cards.filter((c) => c.completed);
  const explore = cards.filter((c) => !c.started).slice(0, 6);
  const popular = [...cards].sort((a, b) => b.project.enrolled - a.project.enrolled).slice(0, 5);

  const goDetail = (card) => navigation.navigate('ProjectDetail', { projectId: card.id });

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppHeader paddingBottom={spacing.xl}>
          {user ? <LevelHeader student={user} /> : null}
        </AppHeader>

        <View style={styles.stats}>
          <StatCard value={active.length} label="Active" tone="teal" onPress={() => navigation.navigate('MyProjects')} />
          <View style={{ width: spacing.sm }} />
          <StatCard value={done.length} label="Done" tone="yellow" onPress={() => navigation.navigate('MyProjects')} />
          <View style={{ width: spacing.sm }} />
          <StatCard value={badgeCount} label="Badges" tone="green" onPress={() => navigation.navigate('Progress')} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            {active.length > 0 ? (
              <>
                <SectionHeader eyebrow="Continue Learning" title="My Projects" icon="🛠️" link="See all" onLink={() => navigation.navigate('MyProjects')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                  {active.map((c) => <PreviewCard key={c.id} card={c} showProgress onPress={() => goDetail(c)} />)}
                </ScrollView>
              </>
            ) : null}

            <SectionHeader eyebrow="Recommended" title="Explore New" icon="✨" link="Browse" onLink={() => navigation.navigate('MyProjects')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {explore.map((c) => <PreviewCard key={c.id} card={c} onPress={() => goDetail(c)} />)}
            </ScrollView>

            <SectionHeader eyebrow="Trending" title="Most Popular" icon="🔥" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {popular.map((c) => <PreviewCard key={c.id} card={c} onPress={() => goDetail(c)} />)}
            </ScrollView>
          </>
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: tabBarClearance },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: -spacing.xl + 4 },
  rail: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
});
