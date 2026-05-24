import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { radii, fonts } from '../theme/tokens';

// Glass stat card — ported from styles.css `.glass-card` (:241–263).
// Number colors follow the CSS .glass-num.* tints (green = #86EFAC, not #22C55E).
const NUM_COLORS = { teal: '#7FDBFF', yellow: '#F59E0B', green: '#86EFAC', orange: '#FB923C' };

export function StatCard({ value, label, tone = 'teal', onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed, style]}
    >
      {/* Frost + top highlight, clipped to the radius (kept off the shadow layer) */}
      <View style={styles.clip} pointerEvents="none">
        <BlurView intensity={12} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.highlight}
        />
      </View>
      <Text style={[styles.num, { color: NUM_COLORS[tone] || NUM_COLORS.teal }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.35)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.22)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 4,
  },
  pressed: { transform: [{ scale: 0.94 }] },
  clip: { ...StyleSheet.absoluteFillObject, borderRadius: radii.lg, overflow: 'hidden' },
  highlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  num: { fontFamily: fonts.displayBlack, fontSize: 24, fontWeight: '900' },
  label: {
    fontFamily: fonts.bodySemi,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
