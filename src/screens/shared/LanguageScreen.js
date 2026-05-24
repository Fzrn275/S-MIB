import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { BackButton } from '../../components/BackRow';
import { AppHeader } from '../../components/AppHeader';
import { useAuth } from '../../context/AuthContext';
import { localStore, keys } from '../../data/localStore';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

const LANGS = [
  { code: 'EN', locale: 'en', label: 'English', sub: 'Default app language', bg: 'rgba(103,232,249,0.15)', border: 'rgba(103,232,249,0.3)', fg: colors.cyan },
  { code: 'BM', locale: 'ms', label: 'Bahasa Malaysia', sub: 'Bahasa Melayu — beta', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', fg: colors.green },
];

export function LanguageScreen({ navigation }) {
  const { user } = useAuth();
  const [lang, setLang] = useState('EN');

  useFocusEffect(useCallback(() => {
    let active = true;
    localStore.getJSON(keys.lang, 'EN').then((v) => { if (active) setLang(v || 'EN'); });
    return () => { active = false; };
  }, []));

  const apply = async (l) => {
    setLang(l.code);
    await localStore.setJSON(keys.lang, l.code);
    if (isSupabaseConfigured() && supabase && user) {
      const { error } = await supabase.from('profiles').update({ locale: l.locale }).eq('id', user.id);
      if (error) console.warn('[language] update failed:', error.message);
    }
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Language</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.sm }} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Choose how the app displays text. You can change this at any time.</Text>
        {LANGS.map((l) => {
          const sel = lang === l.code;
          return (
            <Pressable key={l.code} onPress={() => apply(l)} style={[styles.row, sel && styles.rowSel]}>
              <View style={[styles.badge, { backgroundColor: l.bg, borderColor: l.border }]}>
                <Text style={[styles.badgeText, { color: l.fg }]}>{l.code}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.label}>{l.label}</Text>
                <Text style={styles.sub}>{l.sub}</Text>
              </View>
              {sel ? <View style={styles.check}><Text style={styles.checkText}>✓</Text></View> : null}
            </Pressable>
          );
        })}
        <Text style={styles.note}>💡 Bahasa Malaysia translation is in beta. Some screens may still show English.</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900' },
  intro: { color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 20, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg },
  rowSel: { backgroundColor: 'rgba(103,232,249,0.1)', borderColor: 'rgba(103,232,249,0.4)' },
  badge: { width: 40, height: 40, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: sizes.textSm, fontWeight: '900' },
  label: { color: colors.white, fontSize: sizes.textMd, fontWeight: '900' },
  sub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  check: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: colors.white, fontSize: sizes.textXs, fontWeight: '900' },
  note: { color: colors.textDim, fontSize: sizes.textXs, lineHeight: 18, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
});
