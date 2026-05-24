import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Portal, Modal, Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { SettingsRow } from '../../components/SettingsRow';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

export function SettingsScreen({ navigation }) {
  const { signOut } = useAuth();
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const groups = [
    { title: 'Account', items: [
      { icon: '👤', bg: 'rgba(245,158,11,0.15)', label: 'Profile Settings', sub: 'Name, contact, photo', onPress: () => navigation.navigate('ProfileSettings') },
      { icon: '🌐', bg: 'rgba(14,116,144,0.15)', label: 'Language', sub: 'English / Bahasa Malaysia', onPress: () => navigation.navigate('Language') },
      { icon: '🔔', bg: 'rgba(168,85,247,0.15)', label: 'Notifications', sub: 'Manage preferences', onPress: () => navigation.navigate('NotifPrefs') },
    ] },
    { title: 'Privacy', items: [
      { icon: '🔒', bg: 'rgba(34,197,94,0.15)', label: 'Privacy & Security', sub: 'Two-factor, sessions', onPress: () => navigation.navigate('PrivacySecurity') },
      { icon: '📄', bg: colors.glass, label: 'Terms & Conditions', onPress: () => navigation.navigate('Terms') },
      { icon: '🛡️', bg: colors.glass, label: 'Privacy Policy', onPress: () => navigation.navigate('PrivacyPolicy') },
    ] },
    { title: 'Support', items: [
      { icon: '❓', bg: 'rgba(103,232,249,0.15)', label: 'Help Centre', sub: 'FAQs & guides', onPress: () => navigation.navigate('HelpCentre') },
      { icon: '✉️', bg: 'rgba(245,158,11,0.15)', label: 'Contact Support', sub: 'Get help from our team', onPress: () => navigation.navigate('ContactSupport') },
    ] },
    { title: 'Danger zone', items: [
      { icon: '🚪', bg: 'rgba(239,68,68,0.15)', label: 'Sign Out', danger: true, onPress: () => setSignOutVisible(true) },
      { icon: '🗑️', bg: 'rgba(239,68,68,0.15)', label: 'Delete Account', sub: 'Permanently remove your data', danger: true, onPress: () => setDeleteVisible(true) },
    ] },
  ];

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.sm }} showsVerticalScrollIndicator={false}>
        {groups.map((g) => (
          <View key={g.title}>
            <Text style={styles.groupLabel}>{g.title}</Text>
            {g.items.map((it) => <SettingsRow key={it.label} {...it} />)}
          </View>
        ))}
        <Text style={styles.version}>S-MIB v1.0.0</Text>
      </ScrollView>

      <Portal>
        <Modal visible={signOutVisible} onDismiss={() => setSignOutVisible(false)} contentContainerStyle={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.modalIcon}>🚪</Text>
          <Text style={styles.modalTitle}>Sign Out?</Text>
          <Text style={styles.modalBody}>You will be returned to the login screen. Your progress is saved.</Text>
          <View style={styles.modalBtns}>
            <Button mode="outlined" textColor={colors.white} style={{ flex: 1, borderColor: colors.border }} onPress={() => setSignOutVisible(false)}>Cancel</Button>
            <View style={{ width: spacing.sm }} />
            <Button mode="contained" buttonColor={colors.red} textColor={colors.white} style={{ flex: 1 }} onPress={() => { setSignOutVisible(false); signOut(); }}>Sign Out</Button>
          </View>
        </Modal>

        <Modal visible={deleteVisible} onDismiss={() => setDeleteVisible(false)} contentContainerStyle={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.modalIcon}>🗑️</Text>
          <Text style={styles.modalTitle}>Delete Account?</Text>
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>⚠️ This action is permanent and cannot be undone. All your progress, certificates and badges will be deleted.</Text>
          </View>
          <View style={styles.modalBtns}>
            <Button mode="outlined" textColor={colors.white} style={{ flex: 1, borderColor: colors.border }} onPress={() => setDeleteVisible(false)}>Cancel</Button>
            <View style={{ width: spacing.sm }} />
            <Button mode="contained" buttonColor={colors.red} textColor={colors.white} style={{ flex: 1 }} onPress={() => { setDeleteVisible(false); signOut(); }}>Delete</Button>
          </View>
        </Modal>
      </Portal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900' },
  groupLabel: { color: colors.textDim, fontSize: sizes.textXs, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  version: { textAlign: 'center', color: colors.textDim, fontSize: sizes.textXs, paddingTop: spacing.lg },
  sheet: { backgroundColor: colors.navyLight, marginHorizontal: spacing.lg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  modalIcon: { fontSize: 40, marginBottom: spacing.sm },
  modalTitle: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900', marginBottom: spacing.xs },
  modalBody: { color: colors.textMuted, fontSize: sizes.textSm, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  warnBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
  warnText: { color: '#FCA5A5', fontSize: sizes.textXs, lineHeight: 19 },
  modalBtns: { flexDirection: 'row', width: '100%' },
});
