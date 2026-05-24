import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { ActivityRow } from '../../components/ActivityRow';
import { SEED_PARENT_ACTIVITY } from '../../data/seedData';
import { childTabs, filterAndGroup } from '../../data/parentActivity';
import { colors, spacing, sizes, radii, tabBarClearance, fonts } from '../../theme/tokens';

export function ParentActivityScreen() {
  const [filter, setFilter] = useState('All');
  const tabs = useMemo(() => childTabs(SEED_PARENT_ACTIVITY), []);
  const groups = useMemo(() => filterAndGroup(SEED_PARENT_ACTIVITY, filter), [filter]);

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.sub}>What your children are up to</Text>
          </View>
          <Text style={styles.markAll}>Mark all read</Text>
        </View>
      </AppHeader>

      <View style={styles.tabs}>
        {tabs.map((t) => (
          <Pressable key={t} onPress={() => setFilter(t)} style={[styles.tab, filter === t && styles.tabActive]}>
            <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance, paddingTop: spacing.sm }} showsVerticalScrollIndicator={false}>
        {groups.map((g) => (
          <View key={g.group}>
            <Text style={styles.dateLabel}>{g.group}</Text>
            {g.items.map((a, i) => <ActivityRow key={`${g.group}-${i}`} item={a} />)}
          </View>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.white, fontSize: sizes.text2xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  sub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  markAll: { color: colors.green, fontSize: sizes.textXs, fontWeight: '700' },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: 'rgba(22,101,52,0.5)', borderColor: colors.green },
  tabText: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700' },
  tabTextActive: { color: colors.white },
  dateLabel: { color: colors.textDim, fontSize: sizes.textXs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
});
