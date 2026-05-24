import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { useAuth } from '../../context/AuthContext';
import { parentRepo } from '../../repos';
import { colors, spacing, sizes, radii, fonts } from '../../theme/tokens';

const GUIDE = [
  "Open S-MIB on your child's phone",
  'Go to Profile (bottom right tab)',
  'Tap Profile Settings',
  'Look for "Learner ID: LRN-XXXX"',
];

export function ParentLinkChildScreen({ navigation }) {
  const { user, setLocalUser } = useAuth();
  const [lrnId, setLrnId] = useState('');
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(null);
  const [error, setError] = useState('');
  const [linked, setLinked] = useState(false);

  const onSearch = async () => {
    setError('');
    setFound(null);
    setSearching(true);
    try {
      const res = await parentRepo.lookupChildByPublicId(lrnId);
      if (res.found) setFound(res.child);
      else setError(res.error);
    } finally {
      setSearching(false);
    }
  };

  const onLink = async () => {
    const updated = await parentRepo.linkChild(user, found);
    await setLocalUser(updated);
    setLinked(true);
    setTimeout(() => navigation.navigate('Home'), 1100);
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Link a Child</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.lg }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.introIcon}>👨‍👩‍👧</Text>
          <Text style={styles.introTitle}>Connect Your Child's Account</Text>
          <Text style={styles.introBody}>Ask your child to open S-MIB and go to Profile → Profile Settings to find their Learner ID.</Text>
        </View>

        <View style={styles.guide}>
          <Text style={styles.guideTitle}>📱 How to find the Learner ID:</Text>
          {GUIDE.map((step, i) => (
            <View key={i} style={styles.guideRow}>
              <Text style={styles.guideNum}>{i + 1}.</Text>
              <Text style={styles.guideText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Child's Learner ID</Text>
          <View style={[styles.inputWrap, error && styles.inputErr]}>
            <Text style={styles.inputIcon}>🪪</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. LRN-4821"
              placeholderTextColor={colors.textDim}
              value={lrnId}
              autoCapitalize="characters"
              onChangeText={(t) => { setLrnId(t.toUpperCase()); setError(''); setFound(null); }}
            />
          </View>
          {error ? <Text style={styles.errMsg}>⚠ {error}</Text> : null}
        </View>

        <View style={styles.cta}>
          <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} loading={searching} disabled={!lrnId.trim() || searching} onPress={onSearch}>Search</Button>
        </View>

        {found && !linked && (
          <View style={styles.foundCard}>
            <Text style={styles.foundLabel}>✓ Learner found</Text>
            <View style={styles.foundRow}>
              <LinearGradient colors={[found.color || colors.yellow, (found.color || colors.yellow) + 'cc']} style={styles.foundAvatar}>
                <Text style={styles.foundAvatarText}>{found.init}</Text>
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.foundName}>{found.name}</Text>
                <Text style={styles.foundMeta}>{found.school} · {found.grade}</Text>
                <Text style={styles.foundLevel}>LV {found.level} · {found.rank || 'Learner'}</Text>
              </View>
            </View>
            <Button mode="contained" buttonColor={colors.green} textColor={colors.navy} onPress={onLink}>✓ Link this child to my account</Button>
          </View>
        )}

        {linked && (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>Child linked successfully!</Text>
            <Text style={styles.successSub}>Returning to dashboard…</Text>
            <ActivityIndicator color={colors.green} style={{ marginTop: spacing.sm }} />
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: sizes.textXl, fontFamily: fonts.displayBlack, fontWeight: '900' },
  intro: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  introIcon: { fontSize: 48, marginBottom: spacing.sm },
  introTitle: { color: colors.white, fontSize: sizes.textLg, fontFamily: fonts.displayBlack, fontWeight: '900', marginBottom: 6 },
  introBody: { color: colors.textMuted, fontSize: sizes.textSm, textAlign: 'center', lineHeight: 20 },
  guide: { marginHorizontal: spacing.lg, marginVertical: spacing.md, padding: spacing.md, backgroundColor: 'rgba(14,116,144,0.08)', borderWidth: 1, borderColor: 'rgba(103,232,249,0.15)', borderRadius: radii.md },
  guideTitle: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800', marginBottom: 6 },
  guideRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  guideNum: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800', width: 16 },
  guideText: { color: colors.textMuted, fontSize: sizes.textXs, flex: 1 },
  inputGroup: { paddingHorizontal: spacing.lg },
  label: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md },
  inputErr: { borderColor: colors.red },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: colors.white, fontSize: sizes.textMd, paddingVertical: 11, letterSpacing: 1 },
  errMsg: { color: '#FCA5A5', fontSize: sizes.textXs, marginTop: 6 },
  cta: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  foundCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.lg, backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', borderRadius: radii.lg },
  foundLabel: { color: colors.green, fontSize: sizes.textXs, fontWeight: '800', marginBottom: spacing.md },
  foundRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg },
  foundAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  foundAvatarText: { color: colors.navy, fontSize: sizes.textLg, fontFamily: fonts.displayBlack, fontWeight: '900' },
  foundName: { color: colors.white, fontSize: sizes.textMd, fontFamily: fonts.displayBlack, fontWeight: '900' },
  foundMeta: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  foundLevel: { color: colors.textMuted, fontSize: sizes.textXs, marginTop: 4 },
  successCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.lg, alignItems: 'center', backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', borderRadius: radii.lg },
  successIcon: { fontSize: 36, marginBottom: spacing.sm },
  successTitle: { color: colors.green, fontSize: sizes.textMd, fontFamily: fonts.displayBlack, fontWeight: '900' },
  successSub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 4 },
});
