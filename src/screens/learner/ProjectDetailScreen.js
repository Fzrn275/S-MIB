import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppButton } from '../../components/AppButton';
import { BackButton } from '../../components/BackRow';
import { SectionHeader } from '../../components/SectionHeader';
import { StepRow } from '../../components/StepRow';
import { useAuth } from '../../context/AuthContext';
import { projectRepo, progressRepo } from '../../repos';
import { Progress } from '../../models';
import { colors, spacing, sizes, radii, thumbGradient, fonts } from '../../theme/tokens';

export function ProjectDetailScreen({ navigation, route }) {
  const { projectId } = route.params;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const proj = await projectRepo.getProjectWithSteps(projectId);
    const prog = await progressRepo.getProgress(user.id, projectId);
    setProject(proj);
    setProgress(prog);
    setLoading(false);
  }, [user, projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading || !project) {
    return <ScreenBackground><ActivityIndicator color={colors.cyan} style={{ marginTop: 80 }} /></ScreenBackground>;
  }

  const enrolled = !!progress && progress.completedStepNumbers.length > 0;
  const totalSteps = project.stepCount;
  const doneCount = progress ? progress.completedStepNumbers.length : 0;
  const pct = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;
  const nextStep = project.nextStep(progress);

  const stepState = (s) => {
    if (progress && progress.isStepDone(s.n)) return 'done';
    if (project.isStepUnlocked(s.n, progress)) return 'active';
    return 'locked';
  };

  const goStep = (stepN) => navigation.navigate('StepDetail', { projectId, stepN });

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={thumbGradient(project.color)} style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroBar}>
              <BackButton onPress={() => navigation.goBack()} />
            </View>
          </SafeAreaView>
          <Text style={styles.heroEmoji}>{project.emoji}</Text>
          <View style={styles.heroFooter}>
            <Text style={styles.heroCat}>{project.category}</Text>
            <Text style={styles.heroTitle}>{project.title}</Text>
          </View>
        </LinearGradient>

        <View style={styles.creditRow}>
          <Text style={styles.creditBy}>by <Text style={styles.creditName}>{project.creatorName || 'S-MIB'}</Text></Text>
          <Text style={styles.rating}>★ {project.rating} · {project.enrolled} enrolled</Text>
        </View>

        {project.description ? <Text style={styles.desc}>{project.description}</Text> : null}

        {enrolled ? (
          <View style={styles.progWrap}>
            <View style={styles.progLabels}>
              <Text style={styles.progText}>{doneCount} of {totalSteps} steps done</Text>
              <Text style={styles.progPct}>{pct}%</Text>
            </View>
            <View style={styles.track}><View style={[styles.fill, { width: `${pct}%` }]} /></View>
          </View>
        ) : null}

        <View style={styles.pills}>
          {[
            { k: 'Difficulty', v: project.difficulty, icon: '📶' },
            { k: 'Duration', v: project.duration || '3–5 hrs', icon: '⏱️' },
            { k: 'Steps', v: `${totalSteps} steps`, icon: '📋' },
          ].map((p) => (
            <View key={p.k} style={styles.pill}>
              <Text style={styles.pillIcon}>{p.icon}</Text>
              <Text style={styles.pillVal}>{p.v}</Text>
              <Text style={styles.pillKey}>{p.k}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Steps" icon="📋" />
        {project.steps.map((s) => (
          <StepRow key={s.n} step={s} state={stepState(s)} onPress={() => goStep(s.n)} />
        ))}

        <View style={styles.cta}>
          <AppButton
            title={enrolled ? `Continue Step ${nextStep ? nextStep.n : totalSteps}` : 'Enrol & Start Project'}
            variant={enrolled ? 'primary' : 'yellow'}
            onPress={() => goStep(nextStep ? nextStep.n : 1)}
          />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  hero: { height: 240, justifyContent: 'space-between' },
  heroBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  heroIcon: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  heroEmoji: { fontSize: 72, textAlign: 'center', opacity: 0.85 },
  heroFooter: { padding: spacing.lg },
  heroCat: { color: colors.white, fontSize: sizes.textXs, fontWeight: '800', opacity: 0.85, marginBottom: 4 },
  heroTitle: { color: colors.white, fontSize: sizes.text3xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  creditRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  creditBy: { color: colors.textMuted, fontSize: sizes.textSm },
  creditName: { color: colors.cyan, fontWeight: '800' },
  rating: { color: colors.textMuted, fontSize: sizes.textXs },
  desc: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 20 },
  progWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  progLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progText: { color: colors.textDim, fontSize: sizes.textXs },
  progPct: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700' },
  track: { height: 7, borderRadius: 999, backgroundColor: colors.glassStrong, overflow: 'hidden' },
  fill: { height: 7, borderRadius: 999, backgroundColor: colors.cyan },
  pills: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  pill: { flex: 1, alignItems: 'center', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing.sm },
  pillIcon: { fontSize: sizes.textLg, marginBottom: 3 },
  pillVal: { color: colors.white, fontSize: sizes.textSm, fontFamily: fonts.displayBlack, fontWeight: '900' },
  pillKey: { color: colors.textDim, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
