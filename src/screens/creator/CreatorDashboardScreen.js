import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SectionHeader } from '../../components/SectionHeader';
import { CreatorProjectCard } from '../../components/CreatorProjectCard';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { buildAnalytics } from '../../data/creatorStats';
import { colors, spacing, sizes, tabBarClearance } from '../../theme/tokens';

export function CreatorDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const list = await creatorRepo.listMyProjects(user.id);
    setProjects(list);
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const stats = buildAnalytics(projects);
  const recent = [...projects].slice(0, 4);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }} showsVerticalScrollIndicator={false}>
        <AppHeader paddingBottom={spacing.xl}>
          <Text style={styles.eyebrow}>S-MIB CREATOR</Text>
          <Text style={styles.name}>{user ? user.fullName : ''}</Text>
          <Text style={styles.sub}>{user ? user.publicId : ''}</Text>
        </AppHeader>

        <View style={styles.stats}>
          <StatCard value={projects.length} label="Projects" tone="teal" onPress={() => navigation.navigate('Projects')} />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.totalStudents} label="Students" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.avgRating || '—'} label="Avg ★" tone="green" />
        </View>

        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} onPress={() => navigation.navigate('CreatorNewProject')}>
            + New Project
          </Button>
        </View>

        <SectionHeader title="Recent Projects" icon="🛠️" link="See all" onLink={() => navigation.navigate('Projects')} />
        {loading ? (
          <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.lg }} />
        ) : (
          recent.map((p) => <CreatorProjectCard key={p.id} project={p} onPress={() => navigation.navigate('CreatorProjectDetail', { projectId: p.id })} />)
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800', letterSpacing: 2 },
  name: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900', marginTop: 4 },
  sub: { color: colors.textMuted, fontSize: sizes.textSm, marginTop: 2 },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: -spacing.xl + 4 },
  cta: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
});
