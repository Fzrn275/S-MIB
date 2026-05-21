import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { ProjectListCard } from '../../components/ProjectListCard';
import { useAuth } from '../../context/AuthContext';
import { projectRepo, progressRepo } from '../../repos';
import { buildCard } from '../../data/learnerView';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

const CATS = ['All', 'Electronics', 'Agriculture', 'Coding', 'Renewable', 'Biology', 'Physics'];
const SORTS = [['newest', '🆕 Newest'], ['popular', '🔥 Popular'], ['rating', '⭐ Top Rated']];

export function LearnerExploreScreen({ navigation }) {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  const load = useCallback(async () => {
    setLoading(true);
    const [projects, progressList] = await Promise.all([
      projectRepo.listProjects(),
      user ? progressRepo.getAllProgress(user.id) : Promise.resolve([]),
    ]);
    const byProject = {};
    progressList.forEach((p) => { byProject[p.projectId] = p; });
    setCards(projects.map((proj) => buildCard(proj, byProject[proj.id] || null)));
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards
      .filter((c) => {
        const p = c.project;
        const catOk = filter === 'All' || (p.category || '').startsWith(filter);
        const searchOk = !q || p.title.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
        return catOk && searchOk;
      })
      .sort((a, b) => (sort === 'popular' ? b.project.enrolled - a.project.enrolled : sort === 'rating' ? b.project.rating - a.project.rating : b.project.id - a.project.id));
  }, [cards, filter, search, sort]);

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.sub}>Discover new TVET projects</Text>
      </AppHeader>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects, topics, materials…"
          placeholderTextColor={colors.textDim}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
        {CATS.map((c) => (
          <Pressable key={c} onPress={() => setFilter(c)} style={[styles.catChip, filter === c && styles.catChipActive]}>
            <Text style={[styles.catText, filter === c && styles.catTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.toolbar}>
        {SORTS.map(([s, label]) => (
          <Pressable key={s} onPress={() => setSort(s)} style={[styles.sortBtn, sort === s && styles.sortBtnActive]}>
            <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>{label}</Text>
          </Pressable>
        ))}
        <View style={{ flex: 1 }} />
        <Text style={styles.count}>{shown.length} found</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.sm }} showsVerticalScrollIndicator={false}>
          {shown.map((c) => (
            <ProjectListCard key={c.id} card={c} onPress={() => navigation.navigate('ProjectDetail', { projectId: c.id })} />
          ))}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  sub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, paddingHorizontal: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, color: colors.white, fontSize: sizes.textSm, paddingVertical: 10 },
  cats: { paddingHorizontal: spacing.lg, gap: 8, paddingTop: spacing.md },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: 'rgba(14,116,144,0.5)', borderColor: colors.cyan },
  catText: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700' },
  catTextActive: { color: colors.white },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.sm, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border },
  sortBtnActive: { backgroundColor: colors.glassStrong, borderColor: colors.cyan },
  sortText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  sortTextActive: { color: colors.white },
  count: { color: colors.textDim, fontSize: 10 },
});
