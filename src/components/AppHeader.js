import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradients, spacing } from '../theme/tokens';

export function AppHeader({ children, paddingBottom = spacing.xl, style }) {
  return (
    <LinearGradient colors={gradients.header} locations={gradients.headerStops} style={[styles.header, style]}>
      <SafeAreaView edges={['top']}>
        <View style={[styles.inner, { paddingBottom }]}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' },
  inner: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
});
