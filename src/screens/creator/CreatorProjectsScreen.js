import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppButton } from '../../components/AppButton';
import { AppHeader } from '../../components/AppHeader';
import { CreatorProjectCard } from '../../components/CreatorProjectCard';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { colors, spacing, sizes, tabBarClearance, fonts } from '../../theme/tokens';

const TABS = [
  { label: 'All', match: () => true },
  { label: 'Published', match: (p) => p.status === 'published' },
  { label: 'In Review', match: (p) => p.status === 'review' },
  { label: 'Draft', match: (p) => p.status === 'draft' },
];

export function CreatorProjectsScreen({ navigation }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setProjects(await creatorRepo.listMyProjects(user.id));
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const shown = projects.filter(TABS[tab].match);

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Projects</Text>
          <AppButton title="+ New" variant="primary" size="sm" onPress={() => navigation.navigate('CreatorNewProject')} />
        </View>
      </AppHeader>

      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <Pressable key={t.label} onPress={() => setTab(i)} style={[styles.tab, tab === i && styles.tabActive]}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: tabBarClearance }}>
          {shown.length === 0 ? (
            <Text style={styles.empty}>No projects here yet.</Text>
          ) : (
            shown.map((p) => <CreatorProjectCard key={p.id} project={p} onPress={() => navigation.navigate('CreatorProjectDetail', { projectId: p.id })} />)
          )}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.white, fontSize: sizes.text2xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.cyan },
  tabText: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '800' },
  tabTextActive: { color: colors.white },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: spacing.xxl, fontSize: sizes.textSm },
});
