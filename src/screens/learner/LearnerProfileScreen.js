import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Portal, Modal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SettingsRow } from '../../components/SettingsRow';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { projectRepo, progressRepo, achievementRepo } from '../../repos';
import { buildCard } from '../../data/learnerView';
import { colors, gradients, spacing, sizes, radii, initials, tabBarClearance, fonts } from '../../theme/tokens';

export function LearnerProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ projects: 0, done: 0, badges: 0 });
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [projects, progressList, earned] = await Promise.all([
      projectRepo.listProjects(),
      progressRepo.getAllProgress(user.id),
      achievementRepo.listEarnedCodes(user.id),
    ]);
    const byProject = {};
    progressList.forEach((p) => { byProject[p.projectId] = p; });
    const cards = projects.map((proj) => buildCard(proj, byProject[proj.id] || null));
    setStats({
      projects: cards.filter((c) => c.started).length,
      done: cards.filter((c) => c.completed).length,
      badges: earned.length,
    });
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user) return <ScreenBackground />;

  const rows = [
    { icon: '👤', bg: 'rgba(245,158,11,0.15)', label: 'Profile Settings', sub: 'Edit name, school, photo', onPress: () => navigation.navigate('ProfileSettings') },
    { icon: '⚙️', bg: colors.glass, label: 'Settings', sub: 'Privacy, language, account', onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }} showsVerticalScrollIndicator={false}>
        <AppHeader paddingBottom={spacing.xl}>
          <View style={styles.headerRow}>
            <Text style={styles.eyebrow}>PROFILE</Text>
            <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}><Text style={styles.gear}>⚙️</Text></Pressable>
          </View>
        </AppHeader>

        <View style={styles.card}>
          <LinearGradient colors={gradients.learnerHero} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user.fullName)}</Text>
          </LinearGradient>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.meta}>{[user.schoolName, user.grade].filter(Boolean).join(' · ') || user.publicId}</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelBadge}>LEVEL {user.level}</Text>
            <Text style={styles.rank}>{user.rankTitle}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <StatCard value={stats.projects} label="Projects" tone="teal" onPress={() => navigation.navigate('MyProjects')} />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.badges} label="Badges" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.done} label="Done" tone="green" />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          {rows.map((rw) => <SettingsRow key={rw.label} {...rw} />)}
        </View>

        <View style={styles.cta}>
          <AppButton title="🚪 Sign Out" variant="ghost" onPress={() => setConfirm(true)} />
        </View>
      </ScrollView>

      <Portal>
        <Modal visible={confirm} onDismiss={() => setConfirm(false)} contentContainerStyle={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.modalIcon}>🚪</Text>
          <Text style={styles.modalTitle}>Sign Out?</Text>
          <Text style={styles.modalBody}>You will be returned to the login screen. Your progress is saved.</Text>
          <View style={styles.modalBtns}>
            <AppButton title="Cancel" variant="ghost" size="md" onPress={() => setConfirm(false)} style={{ flex: 1 }} />
            <View style={{ width: spacing.sm }} />
            <AppButton title="Sign Out" variant="danger" size="md" onPress={() => { setConfirm(false); signOut(); }} style={{ flex: 1 }} />
          </View>
        </Modal>
      </Portal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700', letterSpacing: 1.5 },
  gear: { fontSize: sizes.textXl },
  card: { alignItems: 'center', marginHorizontal: spacing.lg, marginTop: -spacing.xl + 4, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { color: colors.navy, fontSize: sizes.text2xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  name: { color: colors.white, fontSize: sizes.textXl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  meta: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm },
  levelBadge: { color: colors.navy, backgroundColor: colors.cyan, fontSize: sizes.textXs, fontFamily: fonts.displayBlack, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill, overflow: 'hidden' },
  rank: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700' },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  cta: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  sheet: { backgroundColor: colors.navyLight, marginHorizontal: spacing.lg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  modalIcon: { fontSize: 40, marginBottom: spacing.sm },
  modalTitle: { color: colors.white, fontSize: sizes.textXl, fontFamily: fonts.displayBlack, fontWeight: '900', marginBottom: spacing.xs },
  modalBody: { color: colors.textMuted, fontSize: sizes.textSm, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  modalBtns: { flexDirection: 'row', width: '100%' },
});
