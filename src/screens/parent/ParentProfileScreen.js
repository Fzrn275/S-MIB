import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Portal, Modal, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { SettingsRow } from '../../components/SettingsRow';
import { useAuth } from '../../context/AuthContext';
import { parentRepo } from '../../repos';
import { aggregate } from '../../data/parentStats';
import { colors, gradients, spacing, sizes, radii, initials, tabBarClearance } from '../../theme/tokens';

export function ParentProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [children, setChildren] = useState([]);
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setChildren(await parentRepo.listChildren(user));
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user) return <ScreenBackground />;
  const stats = aggregate(children);

  const rows = [
    { icon: '👤', bg: 'rgba(245,158,11,0.15)', label: 'Profile Settings', sub: 'Edit name, photo, contact', onPress: () => navigation.navigate('ProfileSettings') },
    { icon: '➕', bg: 'rgba(34,197,94,0.15)', label: 'Add a Child', sub: 'Link a child by their Learner ID', onPress: () => navigation.navigate('ParentLinkChild') },
    { icon: '🔔', bg: 'rgba(168,85,247,0.15)', label: 'Notifications', sub: 'Children activity & updates', onPress: () => navigation.navigate('ParentNotifications') },
    { icon: '⚙️', bg: colors.glass, label: 'Settings', sub: 'Privacy, language, account', onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }} showsVerticalScrollIndicator={false}>
        <AppHeader paddingBottom={spacing.xl}>
          <View style={styles.headerRow}>
            <Text style={styles.eyebrow}>PARENT</Text>
            <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}><Text style={styles.gear}>⚙️</Text></Pressable>
          </View>
        </AppHeader>

        <View style={styles.card}>
          <LinearGradient colors={gradients.parentHero} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user.fullName)}</Text>
          </LinearGradient>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.role}>Parent · {children.length} {children.length === 1 ? 'child' : 'children'} linked</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>👨‍👩‍👧 Parent · {user.publicId}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <StatCard value={children.length} label="Children" tone="teal" onPress={() => navigation.navigate('Home')} />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.totalDone} label="Completed" tone="yellow" />
          <View style={{ width: spacing.sm }} />
          <StatCard value={stats.totalBadges} label="Badges" tone="green" />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          {rows.map((rw) => <SettingsRow key={rw.label} {...rw} />)}
        </View>

        <View style={styles.cta}>
          <Button mode="outlined" textColor="#F87171" style={{ borderColor: 'rgba(239,68,68,0.3)' }} onPress={() => setConfirm(true)}>🚪 Sign Out</Button>
        </View>
      </ScrollView>

      <Portal>
        <Modal visible={confirm} onDismiss={() => setConfirm(false)} contentContainerStyle={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.modalIcon}>🚪</Text>
          <Text style={styles.modalTitle}>Sign Out?</Text>
          <Text style={styles.modalBody}>You will be returned to the login screen. Your children's progress data is saved.</Text>
          <View style={styles.modalBtns}>
            <Button mode="outlined" textColor={colors.white} style={{ flex: 1, borderColor: colors.border }} onPress={() => setConfirm(false)}>Cancel</Button>
            <View style={{ width: spacing.sm }} />
            <Button mode="contained" buttonColor={colors.red} textColor={colors.white} style={{ flex: 1 }} onPress={() => { setConfirm(false); signOut(); }}>Sign Out</Button>
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
  avatarText: { color: colors.navy, fontSize: sizes.text2xl, fontWeight: '900' },
  name: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900' },
  role: { color: colors.textMuted, fontSize: sizes.textXs, marginTop: 2 },
  pill: { marginTop: spacing.sm, backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4 },
  pillText: { color: '#86EFAC', fontSize: sizes.textXs, fontWeight: '700' },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  cta: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  sheet: { backgroundColor: colors.navyLight, marginHorizontal: spacing.lg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  modalIcon: { fontSize: 40, marginBottom: spacing.sm },
  modalTitle: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900', marginBottom: spacing.xs },
  modalBody: { color: colors.textMuted, fontSize: sizes.textSm, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  modalBtns: { flexDirection: 'row', width: '100%' },
});
