import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { FormTextField } from '../../components/FormTextField';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../models';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { colors, gradients, spacing, sizes, radii, initials } from '../../theme/tokens';

/** Editable fields per role; `key` is the snake_case profiles column. */
function fieldsForUser(user) {
  if (user.isParent && user.isParent()) {
    return {
      hero: gradients.parentHero, idLabel: 'Parent ID',
      fields: [
        { key: 'display_name', label: 'Full Name', value: user.fullName },
        { key: 'email', label: 'Email', value: user.email, keyboardType: 'email-address' },
        { key: 'phone', label: 'Phone', value: user.phone || '', keyboardType: 'phone-pad' },
        { key: 'ic_number', label: 'IC Number', value: user.icNumber || '' },
      ],
    };
  }
  if (user.isCreator && user.isCreator()) {
    return {
      hero: gradients.creatorHero, idLabel: 'Creator ID',
      fields: [
        { key: 'display_name', label: 'Full Name', value: user.fullName },
        { key: 'email', label: 'Email', value: user.email, keyboardType: 'email-address' },
        { key: 'organization', label: 'Organization', value: user.organization || '' },
        { key: 'expertise', label: 'Expertise', value: user.expertise || '' },
        { key: 'bio', label: 'Bio', value: user.bio || '', multiline: true },
      ],
    };
  }
  return {
    hero: gradients.learnerHero, idLabel: 'Learner ID',
    fields: [
      { key: 'display_name', label: 'Full Name', value: user.fullName },
      { key: 'email', label: 'Email', value: user.email, keyboardType: 'email-address' },
      { key: 'school_name', label: 'School Name', value: user.schoolName || '' },
      { key: 'grade', label: 'Grade / Form', value: user.grade || '' },
    ],
  };
}

export function ProfileSettingsScreen({ navigation }) {
  const { user, setLocalUser } = useAuth();
  const cfg = useMemo(() => (user ? fieldsForUser(user) : null), [user]);
  const [form, setForm] = useState(() => {
    const init = {};
    (cfg ? cfg.fields : []).forEach((f) => { init[f.key] = f.value; });
    return init;
  });
  const [busy, setBusy] = useState(false);

  if (!user || !cfg) return <ScreenBackground />;
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    setBusy(true);
    try {
      const overrides = {};
      cfg.fields.forEach((f) => { overrides[f.key] = form[f.key]; });
      const merged = { ...user.toRow(), ...overrides, public_id: user.publicId };
      await setLocalUser(User.fromRow(merged));
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('profiles').update(overrides).eq('id', user.id);
        if (error) console.warn('[profileSettings] update failed:', error.message);
      }
    } finally {
      setBusy(false);
      navigation.goBack();
    }
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <Pressable onPress={onSave} hitSlop={10} disabled={busy}><Text style={styles.save}>{busy ? '…' : 'Save'}</Text></Pressable>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.lg }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarWrap}>
          <LinearGradient colors={cfg.hero} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(form.display_name || user.fullName)}</Text>
          </LinearGradient>
          <Text style={styles.changePhoto}>📷 Change photo</Text>
        </View>

        {cfg.fields.map((f) => (
          <FormTextField key={f.key} label={f.label} value={form[f.key]} onChangeText={set(f.key)} multiline={f.multiline} keyboardType={f.keyboardType} />
        ))}

        <View style={styles.idGroup}>
          <Text style={styles.idLabel}>{cfg.idLabel}</Text>
          <View style={styles.idBox}><Text style={styles.idText}>{user.publicId}</Text></View>
          <Text style={styles.idHint}>Your unique identifier — cannot be changed</Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900', flex: 1 },
  save: { color: colors.green, fontSize: sizes.textSm, fontWeight: '800' },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.navy, fontSize: sizes.text3xl, fontWeight: '900' },
  changePhoto: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '800', marginTop: spacing.sm },
  idGroup: { paddingHorizontal: spacing.lg, marginTop: spacing.xs },
  idLabel: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700', marginBottom: 6 },
  idBox: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 11 },
  idText: { color: colors.cyan, fontSize: sizes.textMd, letterSpacing: 1, fontWeight: '700' },
  idHint: { color: colors.textDim, fontSize: 10, marginTop: 4 },
});
