import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { ProjectListCard } from '../../components/ProjectListCard';
import { useAuth } from '../../context/AuthContext';
import { projectRepo, progressRepo } from '../../repos';
import { buildCard } from '../../data/learnerView';
import { colors, spacing, sizes, radii, tabBarClearance, fonts } from '../../theme/tokens';

const CATS = ['All', 'Electronics', 'Agriculture', 'Coding', 'Renewable', 'Biology', 'Physics'];
const CAT_EMOJI = { All: '🌐', Electronics: '🔌', Agriculture: '🌱', Coding: '💻', Renewable: '♻️', Biology: '🧬', Physics: '⚡' };
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
        {CATS.map((c) => {
          const active = filter === c;
          return (
            <Pressable key={c} onPress={() => setFilter(c)} style={[styles.catPill, active && styles.catPillActive]}>
              <Text style={styles.catEmoji}>{CAT_EMOJI[c] || '📦'}</Text>
              <Text style={[styles.catText, active && styles.catTextActive]}>{c}</Text>
            </Pressable>
          );
        })}
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
        <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance, paddingTop: spacing.sm }} showsVerticalScrollIndicator={false}>
          {shown.map((c) => (
            <ProjectListCard key={c.id} card={c} onPress={() => navigation.navigate('ProjectDetail', { projectId: c.id })} />
          ))}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: sizes.text2xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  sub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, paddingHorizontal: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, color: colors.white, fontSize: sizes.textSm, paddingVertical: 10 },
  cats: { paddingHorizontal: spacing.lg, gap: 8, paddingTop: spacing.md },
  catPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  catPillActive: { backgroundColor: colors.teal, borderColor: 'rgba(103,232,249,0.5)', shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 4 },
  catEmoji: { fontSize: 14 },
  catText: { fontFamily: fonts.displayExtraBold, fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  catTextActive: { color: colors.white },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  sortBtnActive: { backgroundColor: 'rgba(245,158,11,0.18)', borderColor: 'rgba(245,158,11,0.45)', shadowColor: colors.yellow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 },
  sortText: { fontFamily: fonts.displayExtraBold, fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  sortTextActive: { color: colors.yellow },
  count: { color: colors.textDim, fontSize: 10 },
});
