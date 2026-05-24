import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SectionHeader } from '../../components/SectionHeader';
import { ChildCard } from '../../components/ChildCard';
import { useAuth } from '../../context/AuthContext';
import { parentRepo } from '../../repos';
import { aggregate } from '../../data/parentStats';
import { colors, gradients, spacing, sizes, radii, initials, tabBarClearance } from '../../theme/tokens';

export function ParentDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setChildren(await parentRepo.listChildren(user));
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const stats = aggregate(children);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }} showsVerticalScrollIndicator={false}>
        <AppHeader paddingBottom={spacing.xl}>
          <View style={styles.topRow}>
            <Text style={styles.logo}>🦅 S-<Text style={{ color: colors.cyan }}>MIB</Text></Text>
            <View style={styles.icons}>
              <Pressable onPress={() => navigation.navigate('ParentNotifications')} hitSlop={8} style={styles.bell}>
                <Text style={styles.bellIcon}>🔔</Text>
                <View style={styles.bellDot} />
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Profile')} hitSlop={8}>
                <LinearGradient colors={gradients.parentHero} style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(user ? user.fullName : '')}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user ? user.fullName : ''} 👋</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>👨‍👩‍👧 {children.length} {children.length === 1 ? 'Child' : 'Children'} Linked</Text>
          </View>
        </AppHeader>

        <View style={styles.stats}>
          <StatCard value={stats.totalActive} label="Active" tone="teal" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.totalDone} label="Completed" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.totalBadges} label="Badges" tone="green" />
        </View>

        <SectionHeader title="My Children" icon="👨‍👩‍👧" />
        {loading ? (
          <ActivityIndicator color={colors.cyan} style={{ marginTop: spacing.lg }} />
        ) : (
          children.map((c) => (
            <ChildCard key={c.id} child={c} onPress={() => navigation.navigate('ParentChildProgress', { child: c })} />
          ))
        )}

        <View style={styles.cta}>
          <Button mode="outlined" textColor={colors.white} style={{ borderColor: colors.border }} onPress={() => navigation.navigate('ParentLinkChild')}>
            + Link Another Child
          </Button>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: colors.white, fontSize: sizes.textLg, fontWeight: '900' },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bell: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  bellIcon: { fontSize: 16 },
  bellDot: { position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.navy, fontSize: sizes.textXs, fontWeight: '900' },
  greeting: { color: colors.textMuted, fontSize: sizes.textSm, marginTop: spacing.md },
  name: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '900', marginTop: 2 },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', marginTop: spacing.sm, backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 4 },
  pillText: { color: '#86EFAC', fontSize: sizes.textXs, fontWeight: '700' },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: -spacing.xl + 4 },
  cta: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
});
