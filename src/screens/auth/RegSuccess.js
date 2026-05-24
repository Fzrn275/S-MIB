import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { useAuth } from '../../context/AuthContext';
import { roleMeta, buildUserModel } from '../../auth/registration';
import { colors, spacing, sizes, radii, fonts } from '../../theme/tokens';

export function RegSuccess({ route }) {
  const { role = 'learner', resolvedRole, email, profile, publicId } = route?.params || {};
  const meta = roleMeta[role] || roleMeta.learner;
  const { configured, refreshProfile, setLocalUser } = useAuth();
  const [busy, setBusy] = useState(false);

  const onEnter = async () => {
    setBusy(true);
    try {
      if (configured) {
        // Session already exists from OTP verify; hydrate the User -> RootNavigator swaps to Main.
        await refreshProfile();
      } else {
        const user = buildUserModel({
          role: resolvedRole,
          id: `demo-${resolvedRole}-${Date.now()}`,
          publicId,
          profile,
        });
        await setLocalUser(user);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.eagle}>🦅</Text>
          <Text style={styles.title}>Welcome to S-MIB!</Text>
          <Text style={styles.greeting}>{meta.greeting}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{meta.icon} {meta.label}</Text>
            </View>
            {role === 'learner' && (
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Level 1 · Starter</Text>
              </View>
            )}
          </View>

          <View style={styles.idCard}>
            <Text style={styles.idLabel}>YOUR {meta.label.toUpperCase()} ID</Text>
            <Text style={[styles.idValue, { color: meta.accent }]}>{publicId || `${meta.prefix}-XXXX`}</Text>
            <Text style={styles.idHint}>{meta.idHint}</Text>
          </View>

          <View style={styles.perks}>
            {meta.perks.map((p, i) => (
              <View key={i} style={styles.perkRow}>
                <View style={styles.perkIcon}>
                  <Text style={styles.perkIconText}>{p.icon}</Text>
                </View>
                <View style={styles.perkBody}>
                  <Text style={styles.perkTitle}>{p.title}</Text>
                  <Text style={styles.perkSub}>{p.sub}</Text>
                </View>
              </View>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={onEnter}
            loading={busy}
            disabled={busy}
            style={styles.cta}
            buttonColor={colors.teal}
            textColor={colors.white}
          >
            {meta.cta}
          </Button>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, alignItems: 'center' },
  eagle: { fontSize: 56, marginBottom: spacing.sm },
  title: { color: colors.white, fontSize: sizes.text3xl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  greeting: { color: colors.textMuted, fontSize: sizes.textSm, textAlign: 'center', lineHeight: 20, marginTop: spacing.sm, marginBottom: spacing.lg },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center', marginBottom: spacing.md },
  roleBadge: { backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: radii.pill, paddingVertical: 4, paddingHorizontal: spacing.md },
  roleBadgeText: { color: colors.yellow, fontSize: sizes.textSm, fontFamily: fonts.displayBlack, fontWeight: '900' },
  levelBadge: { backgroundColor: 'rgba(14,116,144,0.2)', borderWidth: 1, borderColor: 'rgba(103,232,249,0.3)', borderRadius: radii.pill, paddingVertical: 4, paddingHorizontal: spacing.md },
  levelBadgeText: { color: colors.cyan, fontSize: sizes.textSm, fontFamily: fonts.displayBlack, fontWeight: '900' },
  idCard: {
    alignSelf: 'stretch', alignItems: 'center',
    backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  idLabel: { color: colors.textDim, fontSize: 10, letterSpacing: 1, fontWeight: '700' },
  idValue: { fontFamily: 'monospace', fontSize: sizes.textXl, fontWeight: '900', letterSpacing: 2, marginTop: 4 },
  idHint: { color: colors.textDim, fontSize: 10, marginTop: 4, textAlign: 'center' },
  perks: { alignSelf: 'stretch', gap: spacing.md, marginBottom: spacing.xl },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  perkIcon: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.glassStrong, alignItems: 'center', justifyContent: 'center' },
  perkIconText: { fontSize: 20 },
  perkBody: { flex: 1 },
  perkTitle: { color: colors.white, fontSize: sizes.textMd, fontWeight: '700' },
  perkSub: { color: colors.textMuted, fontSize: sizes.textXs, marginTop: 2 },
  cta: { alignSelf: 'stretch', paddingVertical: 4, borderRadius: 12 },
});
