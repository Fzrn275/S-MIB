import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SettingsRow } from '../../components/SettingsRow';
import { useAuth } from '../../context/AuthContext';
import { creatorRepo } from '../../repos';
import { buildAnalytics } from '../../data/creatorStats';
import { colors, spacing, sizes, radii, avatarColor, initials, tabBarClearance } from '../../theme/tokens';

export function CreatorProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    setProjects(await creatorRepo.listMyProjects(user.id));
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user) return <ScreenBackground />;
  const stats = buildAnalytics(projects);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }}>
        <AppHeader paddingBottom={spacing.xl}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Profile</Text>
            <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}><Text style={styles.gear}>⚙️</Text></Pressable>
          </View>
        </AppHeader>

        <View style={styles.card}>
          <View style={[styles.avatar, { backgroundColor: avatarColor(user.id) }]}>
            <Text style={styles.avatarText}>{initials(user.fullName)}</Text>
          </View>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.role}>{user.roleLabel} · {user.publicId}</Text>
          {user.organization ? <Text style={styles.meta}>🏢 {user.organization}</Text> : null}
          {user.expertise ? <Text style={styles.meta}>🎓 {user.expertise}</Text> : null}
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>

        <View style={styles.stats}>
          <StatCard value={projects.length} label="Projects" tone="teal" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.totalStudents} label="Students" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.avgRating || '—'} label="Avg ★" tone="green" />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SettingsRow icon="👤" iconBg="rgba(245,158,11,0.15)" label="Profile Settings" sub="Edit name, organization, bio" onPress={() => navigation.navigate('ProfileSettings')} />
          <SettingsRow icon="⚙️" iconBg={colors.glass} label="Settings" sub="Privacy, language, account" onPress={() => navigation.navigate('Settings')} />
        </View>

        <View style={styles.cta}>
          <Button mode="outlined" textColor={colors.white} style={{ borderColor: colors.border }} onPress={signOut}>Sign out</Button>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gear: { fontSize: sizes.textXl },
  title: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900' },
  card: { alignItems: 'center', marginHorizontal: spacing.lg, marginTop: -spacing.xl + 4, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { color: colors.navy, fontSize: sizes.textXl, fontWeight: '900' },
  name: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900' },
  role: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700', marginTop: 2 },
  meta: { color: colors.textMuted, fontSize: sizes.textSm, marginTop: 6 },
  bio: { color: colors.textMuted, fontSize: sizes.textSm, marginTop: spacing.sm, textAlign: 'center', lineHeight: 19 },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  cta: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
});
