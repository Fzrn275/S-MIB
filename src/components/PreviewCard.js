import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, sizes, fonts, thumbGradient } from '../theme/tokens';
import { DifficultyPill } from './DifficultyPill';

/**
 * card  = { project, totalSteps, pct, started } view-model from buildCard().
 * showProgress shows the bottom progress bar when started.
 * Ported from styles.css `.project-card` (:288–331).
 */
export function PreviewCard({ card, onPress, showProgress = false }) {
  const { project, totalSteps, pct } = card;
  const anim = useRef(new Animated.Value(0)).current;
  const pressIn = () =>
    Animated.timing(anim, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.timing(anim, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }, { translateY }] }]}>
        <LinearGradient
          colors={thumbGradient(project.color)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bg}
        >
          <Text style={styles.emoji}>{project.emoji}</Text>
        </LinearGradient>
        <View style={styles.catRow}>
          <Text style={styles.cat}>{project.category}</Text>
          <DifficultyPill difficulty={project.difficulty} />
        </View>
        <Text style={styles.title} numberOfLines={2}>{project.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaStar}>★ {project.rating}</Text>
          <Text style={styles.metaDim}>· {project.duration || '3–5h'} · {totalSteps} steps</Text>
        </View>
        {showProgress && pct > 0 ? (
          <View style={styles.track}>
            <View style={[styles.fillWrap, { width: `${pct}%` }]}>
              <LinearGradient
                colors={['#B45309', '#F59E0B', '#FCD34D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fill}
              />
            </View>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 185,
    marginRight: 12,
    backgroundColor: colors.glass,
    borderRadius: radii.xl,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.18)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  bg: { height: 110, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emoji: { fontSize: 44 },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cat: { fontFamily: fonts.bodySemi, color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700' },
  title: { fontFamily: fonts.displayBlack, color: 'rgba(255,255,255,0.95)', fontSize: sizes.textMd, fontWeight: '900', marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center' },
  metaStar: { fontFamily: fonts.bodySemi, color: colors.yellow, fontSize: sizes.textXs, fontWeight: '700' },
  metaDim: { fontFamily: fonts.body, color: colors.textDim, fontSize: sizes.textXs, marginLeft: 4 },
  track: { height: 6, borderRadius: 999, backgroundColor: colors.glassStrong, marginTop: 8, overflow: 'hidden' },
  fillWrap: { height: 6, borderRadius: 999 },
  fill: { ...StyleSheet.absoluteFillObject, borderRadius: 999 },
});
