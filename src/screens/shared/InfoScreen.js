import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { colors, spacing, sizes } from '../../theme/tokens';

/**
 * Generic static info screen. Backs the legal/support stubs (Privacy & Security,
 * Terms, Privacy Policy, Help Centre, Contact Support) via route initialParams
 * { title, icon, body }. Full content is deferred (see Day 5 spec).
 */
export function InfoScreen({ navigation, route }) {
  const { title = 'Info', icon = 'ℹ️', body = 'Content coming soon.' } = route.params || {};
  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>←</Text></Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.xl, paddingHorizontal: spacing.lg }}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>This page is part of the S-MIB MVP. Full content will be available in a future update.</Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900', flex: 1 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: spacing.md },
  title: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900', textAlign: 'center' },
  body: { color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 21, textAlign: 'center', marginTop: spacing.md },
  placeholder: { marginTop: spacing.xl, padding: spacing.lg, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  placeholderText: { color: colors.textDim, fontSize: sizes.textXs, lineHeight: 19, textAlign: 'center' },
});
