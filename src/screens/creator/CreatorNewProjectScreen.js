import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { FormTextField } from '../../components/FormTextField';
import { FormSelectField } from '../../components/FormSelectField';
import { useAuth } from '../../context/AuthContext';
import { authoringService } from '../../services/authoringService';
import { colors, spacing, sizes, fonts } from '../../theme/tokens';

const CATS = ['Electronics', 'Agriculture', 'Renewable Energy', 'Coding', 'Biology', 'Physics'];
const DIFFS = ['Easy', 'Medium', 'Hard'];
const DURS = ['1–2 hours', '3–5 hours', '1–2 days', '1 week', '2+ weeks'];

export function CreatorNewProjectScreen({ navigation }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', category: '', difficulty: 'Easy', duration: '3–5 hours', description: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const saveAndAddSteps = async () => {
    if (!form.title.trim() || !form.category) return;
    setBusy(true);
    try {
      const saved = await authoringService.saveProject({ user, project: form, steps: [], submit: false });
      navigation.replace('CreatorAddSteps', { projectId: saved.id });
    } finally { setBusy(false); }
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.title}>New Project</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}>
        <Text style={styles.hint}>ℹ️ Steps are added after saving the project metadata.</Text>
        <FormTextField label="Project Title" required value={form.title} onChangeText={set('title')} placeholder="e.g. Solar Phone Charger" />
        <FormSelectField label="Category" required value={form.category} options={CATS} onSelect={set('category')} placeholder="Select category…" />
        <FormSelectField label="Difficulty" value={form.difficulty} options={DIFFS} onSelect={set('difficulty')} />
        <FormSelectField label="Duration" value={form.duration} options={DURS} onSelect={set('duration')} />
        <FormTextField label="Description" value={form.description} onChangeText={set('description')} placeholder="Describe what learners will build…" multiline />
        <View style={styles.cover}>
          <Text style={styles.coverIcon}>🖼️</Text>
          <Text style={styles.coverLabel}>Upload cover image</Text>
          <Text style={styles.coverHint}>PNG / JPG · Max 5MB · 16:9 (coming soon)</Text>
        </View>
        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} loading={busy} disabled={!form.title.trim() || !form.category} onPress={saveAndAddSteps}>Save & Add Steps →</Button>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  title: { color: colors.white, fontSize: sizes.text2xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  hint: { color: colors.textDim, fontSize: sizes.textXs, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  cover: { marginHorizontal: spacing.lg, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 12, padding: spacing.xl, backgroundColor: colors.glass },
  coverIcon: { fontSize: 28 },
  coverLabel: { color: colors.textMuted, fontSize: sizes.textSm, marginTop: 6 },
  coverHint: { color: colors.textDim, fontSize: 10, marginTop: 2 },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
