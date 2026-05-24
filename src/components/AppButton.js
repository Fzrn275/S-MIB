import React from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radii, fonts } from '../theme/tokens';

/**
 * Custom button — ported from styles.css `.btn*` (:397–420).
 * Variants: primary | yellow | green | outline | ghost | danger.
 * Sizes: lg (full-width) | md | sm. `pill` forces a 999 radius.
 * Press = scale 0.96 + a white overlay (rgba(255,255,255,0.12)).
 */
const VARIANTS = {
  primary: { bg: colors.teal, fg: colors.white, glow: 'rgba(14,116,144,0.4)' },
  yellow: { bg: colors.yellow, fg: colors.navy, glow: 'rgba(245,158,11,0.4)' },
  green: { bg: colors.green, fg: colors.navy, glow: 'rgba(34,197,94,0.4)' },
  outline: { bg: 'rgba(255,255,255,0.08)', fg: colors.cyan, borderWidth: 2, borderColor: 'rgba(103,232,249,0.7)' },
  ghost: { bg: 'rgba(255,255,255,0.10)', fg: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  danger: { bg: colors.red, fg: colors.white, glow: 'rgba(239,68,68,0.4)' },
};

const SIZES = {
  lg: { fontSize: 15, paddingVertical: 14, paddingHorizontal: 28, full: true },
  md: { fontSize: 14, paddingVertical: 11, paddingHorizontal: 22 },
  sm: { fontSize: 12, paddingVertical: 7, paddingHorizontal: 14, radius: radii.sm },
};

export function AppButton({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'lg',
  pill = false,
  full,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.lg;
  const radius = pill ? radii.pill : s.radius != null ? s.radius : radii.md;
  const isFull = full != null ? full : !!s.full;
  const label = title != null ? title : children;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderRadius: radius,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
        },
        v.borderWidth ? { borderWidth: v.borderWidth, borderColor: v.borderColor } : null,
        v.glow ? { shadowColor: v.bg, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 4 } : null,
        isFull && styles.full,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {pressed ? <View pointerEvents="none" style={[styles.overlay, { borderRadius: radius }]} /> : null}
          {loading ? (
            <ActivityIndicator color={v.fg} size="small" />
          ) : (
            <Text numberOfLines={1} style={[styles.text, { color: v.fg, fontSize: s.fontSize }, textStyle]}>
              {label}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  full: { width: '100%', alignSelf: 'stretch' },
  pressed: { transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.35 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.12)' },
  text: { fontFamily: fonts.displayExtraBold, fontWeight: '800', letterSpacing: 0.3, textAlign: 'center' },
});
