import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { projectRepo } from '../../repos';
import { colors, spacing, sizes, radii, thumbGradient, fonts } from '../../theme/tokens';

export function ParentChildProjectViewScreen({ navigation, route }) {
  const { child, proj } = route.params;
  const [steps, setSteps] = useState([]);

  const load = useCallback(async () => {
    const project = await projectRepo.getProjectWithSteps(proj.id);
    setSteps(project ? project.steps : []);
  }, [proj.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const doneCount = proj.doneSteps || 0;
  const total = proj.stepCount || steps.length;

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle} numberOfLines={1}>{proj.title}</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>👁️ Read-only · You are viewing {child.name}'s active project</Text>
        </View>

        <View style={styles.infoRow}>
          <LinearGradient colors={thumbGradient(proj.color)} style={styles.thumb}><Text style={styles.thumbEmoji}>{proj.emoji}</Text></LinearGradient>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.title}>{proj.title}</Text>
            <Text style={styles.meta}>{proj.category} · {proj.difficulty} · {total} steps</Text>
          </View>
        </View>
        {proj.description ? <Text style={styles.desc}>{proj.description}</Text> : null}

        <View style={styles.progWrap}>
          <View style={styles.progLabels}>
            <Text style={styles.progLabel}>{child.name}'s progress</Text>
            <Text style={styles.progPct}>{proj.pct}%</Text>
          </View>
          <View style={styles.track}><View style={[styles.fill, { width: `${proj.pct}%` }]} /></View>
          <Text style={styles.progSub}>{doneCount} of {total} steps completed</Text>
        </View>

        <Text style={styles.overview}>📋 Steps Overview</Text>
        {steps.map((s, i) => {
          const done = i < doneCount;
          const active = i === doneCount;
          return (
            <View key={s.n} style={[styles.stepRow, done && styles.stepDone, active && styles.stepActive]}>
              <View style={[styles.stepNum, done && styles.stepNumDone, active && styles.stepNumActive]}>
                <Text style={[styles.stepNumText, { color: done ? colors.green : active ? colors.cyan : colors.textDim }]}>{done ? '✓' : s.n}</Text>
              </View>
              <Text style={[styles.stepTitle, { color: done ? colors.textMuted : active ? colors.white : colors.textDim }]} numberOfLines={1}>{s.title}</Text>
              <Text style={[styles.stepState, { color: done ? colors.green : active ? colors.yellow : colors.textDim }]}>
                {done ? `+${s.xp || 40} XP` : active ? 'In progress' : 'Locked'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: sizes.textXl, fontFamily: fonts.displayBlack, fontWeight: '900', flex: 1 },
  banner: { marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', borderRadius: radii.md },
  bannerText: { color: colors.textMuted, fontSize: 11 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  thumb: { width: 56, height: 56, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 28 },
  title: { color: colors.white, fontSize: sizes.textLg, fontFamily: fonts.displayBlack, fontWeight: '900' },
  meta: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  desc: { color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 20, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  progWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  progLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progLabel: { color: colors.textMuted, fontSize: sizes.textXs },
  progPct: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700' },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.teal },
  progSub: { color: colors.textDim, fontSize: 11, marginTop: 6 },
  overview: { color: colors.white, fontSize: sizes.textMd, fontFamily: fonts.displayBlack, fontWeight: '900', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginBottom: 6, padding: spacing.md, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  stepDone: { backgroundColor: 'rgba(22,101,52,0.08)', borderColor: 'rgba(34,197,94,0.15)' },
  stepActive: { backgroundColor: 'rgba(14,116,144,0.08)', borderColor: 'rgba(103,232,249,0.15)' },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  stepNumDone: { backgroundColor: 'rgba(34,197,94,0.2)' },
  stepNumActive: { backgroundColor: 'rgba(14,116,144,0.2)' },
  stepNumText: { fontSize: 11, fontWeight: '800' },
  stepTitle: { flex: 1, fontSize: sizes.textXs, fontWeight: '700' },
  stepState: { fontSize: 10, fontWeight: '700' },
});
