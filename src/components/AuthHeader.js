import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, sizes } from '../theme/tokens';

/**
 * Shared header for every auth screen — consistent height/layout. Renders an
 * optional back chevron, the centered S-MIB brand, an optional title/subtitle,
 * and an optional step-progress bar.
 *
 * Props:
 *   navigation   – nav object (used for the default back action)
 *   onBack       – override back handler (defaults to navigation.goBack)
 *   showBack     – force-show/hide the back chevron (defaults to !!(onBack||navigation))
 *   title, sub   – heading texts
 *   step, totalSteps – when both set, renders that many progress bars
 */
export function AuthHeader({ navigation, onBack, showBack, title, sub, step, totalSteps }) {
  const back = onBack || (navigation ? () => navigation.goBack() : null);
  const renderBack = showBack ?? !!back;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.inner}>
        <View style={styles.row}>
          {renderBack ? (
            <Pressable hitSlop={12} onPress={back} style={styles.side}>
              <Text style={styles.chevron}>‹</Text>
            </Pressable>
          ) : (
            <View style={styles.side} />
          )}
          <View style={styles.brand}>
            <Text style={styles.logo}>🦅</Text>
            <Text style={styles.brandText}>
              S-<Text style={styles.brandAccent}>MIB</Text>
            </Text>
          </View>
          <View style={styles.side} />
        </View>

        {title ? <Text style={styles.title}>{title}</Text> : null}
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}

        {step && totalSteps ? (
          <View style={styles.progress}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressBar,
                  { backgroundColor: i < step ? colors.teal : 'rgba(255,255,255,0.15)' },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {},
  inner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: { width: 32, height: 32, alignItems: 'flex-start', justifyContent: 'center' },
  chevron: { color: colors.white, fontSize: 30, lineHeight: 32, fontWeight: '700' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { fontSize: 20 },
  brandText: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900', letterSpacing: 1 },
  brandAccent: { color: colors.cyan },
  title: {
    color: colors.white,
    fontSize: sizes.text2xl,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sub: {
    color: colors.textMuted,
    fontSize: sizes.textSm,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
