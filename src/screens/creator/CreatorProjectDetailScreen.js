import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { authoringService } from '../../services/authoringService';
import { colors, spacing, sizes, radii, fonts } from '../../theme/tokens';

export function CreatorProjectDetailScreen({ navigation, route }) {
  const { projectId } = route.params;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setProject(await creatorRepo.getMyProjectWithSteps(projectId, user.id));
    setLoading(false);
  }, [user, projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading || !project) {
    return <ScreenBackground><ActivityIndicator color={colors.cyan} style={{ marginTop: 80 }} /></ScreenBackground>;
  }

  const doStatus = async (fn) => { setBusy(true); try { await fn(); await load(); } finally { setBusy(false); } };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.headerRow}>
          <StatusBadge status={project.status} />
          <Text style={styles.cat}>{project.category} · {project.difficulty}</Text>
        </View>

        <View style={styles.pills}>
          {[{ k: 'Enrolled', v: project.enrolled }, { k: 'Completion', v: `${project.completion}%` }, { k: 'Rating', v: project.rating || '—' }, { k: 'Steps', v: project.stepCount }].map((p) => (
            <View key={p.k} style={styles.pill}>
              <Text style={styles.pillVal}>{p.v}</Text>
              <Text style={styles.pillKey}>{p.k}</Text>
            </View>
          ))}
        </View>

        {project.description ? <Text style={styles.desc}>{project.description}</Text> : null}

        <SectionHeader title="Steps" icon="📋" />
        {project.steps.map((s) => (
          <View key={s.n} style={styles.stepRow}>
            <Text style={styles.stepNum}>{s.n}</Text>
            <Text style={styles.stepTitle} numberOfLines={1}>{s.title}</Text>
            <Text style={styles.stepXp}>+{s.xp} XP</Text>
          </View>
        ))}

        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} onPress={() => navigation.navigate('CreatorEditProject', { projectId })}>Edit Project</Button>
          {project.status === 'draft' ? (
            <Button mode="contained" buttonColor={colors.yellow} textColor={colors.navy} loading={busy} style={{ marginTop: spacing.sm }} onPress={() => doStatus(() => authoringService.submitForReview({ user, projectId }))}>Submit for Review</Button>
          ) : null}
          {project.status === 'review' ? (
            <Button mode="outlined" textColor={colors.white} loading={busy} style={{ marginTop: spacing.sm, borderColor: colors.border }} onPress={() => doStatus(() => authoringService.withdraw({ user, projectId }))}>Withdraw to Draft</Button>
          ) : null}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  title: { color: colors.white, fontSize: sizes.textXl, fontFamily: fonts.displayBlack, fontWeight: '900', flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  cat: { color: colors.textMuted, fontSize: sizes.textXs },
  pills: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  pill: { flex: 1, alignItems: 'center', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing.sm },
  pillVal: { color: colors.white, fontSize: sizes.textMd, fontFamily: fonts.displayBlack, fontWeight: '900' },
  pillKey: { color: colors.textDim, fontSize: 9, textTransform: 'uppercase', marginTop: 2 },
  desc: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.lg, marginBottom: 6, padding: 12, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  stepNum: { color: colors.cyan, fontFamily: fonts.displayBlack, fontWeight: '900', fontSize: sizes.textSm, width: 20 },
  stepTitle: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700', flex: 1 },
  stepXp: { color: colors.yellow, fontSize: sizes.textXs, fontWeight: '800' },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
