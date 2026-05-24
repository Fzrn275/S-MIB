import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { FormTextField } from '../../components/FormTextField';
import { FormSelectField } from '../../components/FormSelectField';
import { StepEditorSheet } from '../../components/StepEditorSheet';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { authoringService } from '../../services/authoringService';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

const CATS = ['Electronics', 'Agriculture', 'Renewable Energy', 'Coding', 'Biology', 'Physics'];
const DIFFS = ['Easy', 'Medium', 'Hard'];
const DURS = ['1–2 hours', '3–5 hours', '1–2 days', '1 week', '2+ weeks'];

export function CreatorEditProjectScreen({ navigation, route }) {
  const { projectId } = route.params;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const p = await creatorRepo.getMyProjectWithSteps(projectId, user.id);
    setProject(p);
    setForm(p ? { title: p.title, category: p.category, difficulty: p.difficulty, duration: p.duration || '3–5 hours', description: p.description || '' } : null);
    setSteps(p ? p.steps.map((s) => ({ title: s.title, instruction: s.instruction, materials: s.materials.map((m) => m.name).join(', '), videoUrl: s.videoUrl || '', xp: String(s.xp) })) : []);
    setLoading(false);
  }, [user, projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading || !project || !form) {
    return <ScreenBackground><ActivityIndicator color={colors.cyan} style={{ marginTop: 80 }} /></ScreenBackground>;
  }

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const onSaveStep = (draft) => { setSteps((prev) => editing.index == null ? [...prev, draft] : prev.map((s, i) => i === editing.index ? draft : s)); setEditing(null); };
  const removeStep = (i) => setSteps((prev) => prev.filter((_, j) => j !== i));

  const save = async () => {
    setBusy(true);
    try {
      await authoringService.saveProject({ user, project: { ...form, id: project.id, status: project.status, enrolled: project.enrolled, completion: project.completion, rating: project.rating }, steps, submit: false });
      navigation.navigate('CreatorProjectDetail', { projectId });
    } finally { setBusy(false); }
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.title}>Edit Project</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}>
        {project.enrolled > 0 ? (
          <View style={styles.warn}>
            <Text style={styles.warnText}>⚠️ This project has {project.enrolled} enrolled learners. Major step changes may affect their progress.</Text>
          </View>
        ) : null}

        <FormTextField label="Project Title" required value={form.title} onChangeText={set('title')} />
        <FormSelectField label="Category" required value={form.category} options={CATS} onSelect={set('category')} />
        <FormSelectField label="Difficulty" value={form.difficulty} options={DIFFS} onSelect={set('difficulty')} />
        <FormSelectField label="Duration" value={form.duration} options={DURS} onSelect={set('duration')} />
        <FormTextField label="Description" value={form.description} onChangeText={set('description')} multiline />

        <View style={styles.stepsHead}>
          <Text style={styles.stepsTitle}>Project Steps ({steps.length})</Text>
        </View>
        {steps.map((s, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.num}>{i + 1}</Text>
            <Text style={styles.stepTitle} numberOfLines={1}>{s.title}{s.videoUrl ? '  📹' : ''}</Text>
            <Pressable onPress={() => setEditing({ index: i })} hitSlop={8}><Text style={styles.edit}>Edit</Text></Pressable>
            <Pressable onPress={() => removeStep(i)} hitSlop={8}><Text style={styles.del}>🗑️</Text></Pressable>
          </View>
        ))}
        <Pressable style={styles.add} onPress={() => setEditing({ index: null })}><Text style={styles.addText}>＋ Add new step</Text></Pressable>

        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} loading={busy} onPress={save}>
            {project.status === 'published' ? 'Save & Re-submit →' : 'Save & View Project'}
          </Button>
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
  warn: { marginHorizontal: spacing.lg, marginBottom: spacing.md, padding: spacing.md, backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: radii.md },
  warnText: { color: colors.yellow, fontSize: sizes.textXs, lineHeight: 18 },
  stepsHead: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  stepsTitle: { color: colors.white, fontSize: sizes.textMd, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginBottom: 6, padding: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  num: { color: colors.cyan, fontWeight: '900', width: 20 },
  stepTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700', flex: 1 },
  edit: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800' },
  del: { fontSize: sizes.textSm },
  add: { marginHorizontal: spacing.lg, marginTop: 4, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radii.md },
  addText: { color: colors.cyan, fontSize: sizes.textSm, fontWeight: '800' },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
