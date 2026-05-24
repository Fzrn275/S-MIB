import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { Toggle } from '../../components/Toggle';
import { useAuth } from '../../context/AuthContext';
import { localStore, keys } from '../../data/localStore';
import { colors, spacing, sizes } from '../../theme/tokens';

const DEFAULTS = { push: true, email: false, xp: true, badges: true, streak: true, leaderboard: false, newProjects: true, weeklyDigest: false };

const GROUPS = [
  { title: 'General', items: [
    { key: 'push', label: 'Push Notifications', sub: 'Receive alerts on your device' },
    { key: 'email', label: 'Email Digest', sub: 'Daily summary to your inbox' },
  ] },
  { title: 'Activity', items: [
    { key: 'xp', label: 'XP & Level Updates', sub: 'When you earn XP or level up' },
    { key: 'badges', label: 'Badge Unlocks', sub: 'When you earn a new badge' },
    { key: 'streak', label: 'Streak Reminders', sub: 'Daily reminder to keep your streak' },
  ] },
  { title: 'Community', items: [
    { key: 'leaderboard', label: 'Leaderboard Changes', sub: 'When your rank changes' },
    { key: 'newProjects', label: 'New Projects', sub: 'When new projects are published' },
    { key: 'weeklyDigest', label: 'Weekly Summary', sub: 'Your weekly progress overview' },
  ] },
];

export function NotifPrefsScreen({ navigation }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(DEFAULTS);

  useFocusEffect(useCallback(() => {
    let active = true;
    if (user) {
      localStore.getJSON(keys.notifPrefs(user.id), DEFAULTS).then((v) => { if (active) setPrefs({ ...DEFAULTS, ...(v || {}) }); });
    }
    return () => { active = false; };
  }, [user]));

  const toggle = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    if (user) localStore.setJSON(keys.notifPrefs(user.id), next);
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.sm }} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Choose how and when S-MIB notifies you.</Text>
        {GROUPS.map((g) => (
          <View key={g.title}>
            <Text style={styles.groupLabel}>{g.title}</Text>
            {g.items.map((item) => (
              <Pressable key={item.key} style={styles.row} onPress={() => toggle(item.key)}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.sub}>{item.sub}</Text>
                </View>
                <Toggle value={!!prefs[item.key]} onValueChange={() => toggle(item.key)} />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900' },
  intro: { color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 20, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  groupLabel: { color: colors.textDim, fontSize: sizes.textXs, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.lg, marginBottom: 6, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  label: { color: colors.white, fontSize: sizes.textSm, fontWeight: '700' },
  sub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 1 },
});
