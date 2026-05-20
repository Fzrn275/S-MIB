import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { useAuth } from '../../context/AuthContext';
import { projectRepo, progressRepo } from '../../repos';
import { progressService } from '../../services/progressService';
import { Progress } from '../../models';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

export function StepDetailScreen({ navigation, route }) {
  const { projectId, stepN } = route.params;
  const { user, applyStepReward } = useAuth();
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState([]);
  const [rating, setRating] = useState(0);
  const [overlay, setOverlay] = useState(null); // { xp, done, total }
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const proj = await projectRepo.getProjectWithSteps(projectId);
    let prog = await progressRepo.getProgress(user.id, projectId);
    if (!prog) prog = new Progress({ userId: user.id, projectId });
    setProject(proj);
    setProgress(prog);
    setLoading(false);
  }, [user, projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading || !project) {
    return <ScreenBackground><ActivityIndicator color={colors.cyan} style={{ marginTop: 80 }} /></ScreenBackground>;
  }

  const step = project.steps.find((s) => s.n === stepN) || project.steps[0];
  const totalSteps = project.stepCount;
  const toggle = (i) => setChecked((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const markDone = async () => {
    if (saving) return;
    setSaving(true);
    const res = await progressService.completeStep({ user, project, progress, stepN: step.n, rating });
    if (res.xpDelta > 0) await applyStepReward({ xpDelta: res.xpDelta });
    const doneCount = progress.completedStepNumbers.length;
    setOverlay({ xp: step.xp, done: doneCount, total: totalSteps });
    setSaving(false);
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.headRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>←</Text></Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.crumb}>Step {step.n} of {totalSteps} · {project.title}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
          </View>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>📋 Instructions</Text>
          <Text style={styles.cardText}>{step.instruction}</Text>
        </View>

        {step.tip ? (
          <View style={styles.tip}>
            <Text style={styles.tipTitle}>💡 Tip</Text>
            <Text style={styles.tipBody}>{step.tip}</Text>
          </View>
        ) : null}

        {step.materials.length > 0 ? (
          <>
            <SectionHeader title="Materials Needed" icon="🧰" />
            {step.materials.map((m, i) => (
              <Pressable key={i} style={styles.matRow} onPress={() => toggle(i)}>
                <Text style={styles.matCheck}>{checked.includes(i) ? '✅' : '⬜'}</Text>
                <Text style={[styles.matName, checked.includes(i) && styles.matChecked]}>{m.toString()}</Text>
              </Pressable>
            ))}
          </>
        ) : null}

        <SectionHeader title="Proof Photo" icon="📸" />
        <View style={styles.photo}>
          <Text style={styles.photoIcon}>📷</Text>
          <Text style={styles.photoLabel}>Tap to take or upload a photo of your work</Text>
          <Text style={styles.photoHint}>JPEG · Max 10MB</Text>
        </View>

        <View style={styles.rate}>
          <Text style={styles.rateLabel}>Rate this step (optional)</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Pressable key={s} onPress={() => setRating(s)}>
                <Text style={[styles.star, { color: s <= rating ? colors.yellow : colors.textDim }]}>★</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.yellow} textColor={colors.navy} loading={saving} onPress={markDone}>
            ✅ Mark Step Done · +{step.xp} XP
          </Button>
        </View>
      </ScrollView>

      {overlay ? (
        <View style={styles.overlay}>
          <Text style={styles.burst}>⚡</Text>
          <Text style={styles.amount}>+{overlay.xp} XP</Text>
          <Text style={styles.big}>Step Complete!</Text>
          <Text style={styles.small}>{overlay.done} of {overlay.total} steps done</Text>
          <Button mode="contained" buttonColor={colors.yellow} textColor={colors.navy} style={{ marginTop: 20 }} onPress={() => { setOverlay(null); navigation.navigate('ProjectDetail', { projectId }); }}>
            Back to Project
          </Button>
        </View>
      ) : null}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  crumb: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800' },
  stepTitle: { color: colors.white, fontSize: sizes.textLg, fontWeight: '900' },
  card: { margin: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md },
  cardLabel: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800', marginBottom: 6 },
  cardText: { color: colors.white, fontSize: sizes.textSm, lineHeight: 20 },
  tip: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: radii.md, padding: spacing.md },
  tipTitle: { color: colors.yellow, fontSize: sizes.textXs, fontWeight: '800', marginBottom: 4 },
  tipBody: { color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 19 },
  matRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingVertical: 8 },
  matCheck: { fontSize: sizes.textLg },
  matName: { color: colors.white, fontSize: sizes.textSm, flex: 1 },
  matChecked: { textDecorationLine: 'line-through', opacity: 0.45 },
  photo: { marginHorizontal: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radii.md, padding: spacing.xl, backgroundColor: colors.glass },
  photoIcon: { fontSize: 32, marginBottom: spacing.sm },
  photoLabel: { color: colors.textMuted, fontSize: sizes.textSm, textAlign: 'center' },
  photoHint: { color: colors.textDim, fontSize: 10, marginTop: 4 },
  rate: { marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  rateLabel: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700', marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 6 },
  star: { fontSize: 26 },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(12,26,46,0.96)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  burst: { fontSize: 72 },
  amount: { color: colors.yellow, fontSize: sizes.text4xl, fontWeight: '900', marginTop: spacing.sm },
  big: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900', marginTop: 4 },
  small: { color: colors.cyan, fontSize: sizes.textMd, fontWeight: '800', marginTop: 4 },
});
