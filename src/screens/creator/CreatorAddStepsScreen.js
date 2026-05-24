import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { StepEditorSheet } from '../../components/StepEditorSheet';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { authoringService } from '../../services/authoringService';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

export function CreatorAddStepsScreen({ navigation, route }) {
  const { projectId } = route.params;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { index } | null
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const p = await creatorRepo.getMyProjectWithSteps(projectId, user.id);
    setProject(p);
    setSteps(p ? p.steps.map((s) => ({ title: s.title, instruction: s.instruction, materials: s.materials.map((m) => m.name).join(', '), videoUrl: s.videoUrl || '', xp: String(s.xp) })) : []);
    setLoading(false);
  }, [user, projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onSaveStep = (draft) => {
    setSteps((prev) => editing.index == null ? [...prev, draft] : prev.map((s, i) => i === editing.index ? draft : s));
    setEditing(null);
  };
  const removeStep = (i) => setSteps((prev) => prev.filter((_, j) => j !== i));

  const persist = async (submit) => {
    setBusy(true);
    try {
      await authoringService.saveProject({ user, project, steps, submit });
      navigation.navigate('CreatorProjectDetail', { projectId });
    } finally { setBusy(false); }
  };

  if (loading || !project) {
    return <ScreenBackground><ActivityIndicator color={colors.cyan} style={{ marginTop: 80 }} /></ScreenBackground>;
  }

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.title}>Add Steps</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}>
        <Text style={styles.sub}>{project.title} · {steps.length} steps</Text>
        {steps.map((s, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.num}>{i + 1}</Text>
            <Text style={styles.stepTitle} numberOfLines={1}>{s.title}</Text>
            <Pressable onPress={() => setEditing({ index: i })} hitSlop={8}><Text style={styles.edit}>Edit</Text></Pressable>
            <Pressable onPress={() => removeStep(i)} hitSlop={8}><Text style={styles.del}>🗑️</Text></Pressable>
          </View>
        ))}
        {steps.length === 0 ? <Text style={styles.empty}>No steps yet — add your first one.</Text> : null}

        <Pressable style={styles.add} onPress={() => setEditing({ index: null })}>
          <Text style={styles.addText}>＋ Add new step</Text>
        </Pressable>

        <View style={styles.cta}>
          <Button mode="outlined" textColor={colors.white} style={{ borderColor: colors.border }} loading={busy} onPress={() => persist(false)}>Save Draft</Button>
          <Button mode="contained" buttonColor={colors.yellow} textColor={colors.navy} style={{ marginTop: spacing.sm }} loading={busy} disabled={steps.length === 0} onPress={() => persist(true)}>Submit for Review</Button>
        </View>
      </ScrollView>

      <StepEditorSheet
        visible={editing !== null}
        initial={editing && editing.index != null ? steps[editing.index] : null}
        index={editing ? editing.index : null}
        onSave={onSaveStep}
        onCancel={() => setEditing(null)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: sizes.textSm, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginBottom: 6, padding: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  num: { color: colors.cyan, fontWeight: '900', width: 20 },
  stepTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700', flex: 1 },
  edit: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800' },
  del: { fontSize: sizes.textSm },
  empty: { color: colors.textDim, textAlign: 'center', marginVertical: spacing.lg, fontSize: sizes.textSm },
  add: { marginHorizontal: spacing.lg, marginTop: 4, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radii.md },
  addText: { color: colors.cyan, fontSize: sizes.textSm, fontWeight: '800' },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
