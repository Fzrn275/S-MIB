import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradients, spacing } from '../theme/tokens';

/**
 * Dark header panel. Ported from styles.css `.app-header` (:108–147):
 * 160deg navy→green gradient, three decorative blob overlays, a 28px bottom
 * radius, and a bottom fade that blends the header into the body below.
 */
export function AppHeader({ children, paddingBottom = spacing.xl, style }) {
  return (
    <LinearGradient
      colors={gradients.header}
      locations={gradients.headerStops}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.header, style]}
    >
      {/* Decorative blobs (behind content, clipped by overflow:hidden) */}
      <View pointerEvents="none" style={[styles.blob, styles.blobTopRight]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottomLeft]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottomRight]} />

      <SafeAreaView edges={['top']}>
        <View style={[styles.inner, { paddingBottom }]}>{children}</View>
      </SafeAreaView>

      {/* Bottom fade — transparent → rgba(6,28,20,0.5) */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(6,28,20,0.5)']}
        style={styles.fade}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  inner: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  blob: { position: 'absolute', borderRadius: 9999 },
  blobTopRight: { width: 240, height: 240, top: -80, right: -80, backgroundColor: 'rgba(245,158,11,0.08)' },
  blobBottomLeft: { width: 180, height: 180, bottom: -20, left: -40, backgroundColor: 'rgba(14,116,144,0.07)' },
  blobBottomRight: { width: 160, height: 160, bottom: -60, right: 20, backgroundColor: 'rgba(234,88,12,0.05)' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 50 },
});
