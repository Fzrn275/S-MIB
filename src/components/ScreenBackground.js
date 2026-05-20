import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme/tokens';

/**
 * Full-screen multi-stop gradient backdrop used behind every screen.
 * Children render on top via absolute positioning.
 */
export function ScreenBackground({ children, colors: colorOverride, locations }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colorOverride || gradients.appBg}
        locations={locations || gradients.appBgStops}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0C1A2E' },
});
