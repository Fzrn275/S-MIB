import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii, sizes, spacing } from '../theme/tokens';

/** state: 'done' | 'active' | 'locked' */
export function StepRow({ step, state, onPress }) {
  const pressable = state === 'active';
  const subtitle = state === 'done' ? '✅ Completed' : state === 'active' ? '▶ In progress' : '🔒 Locked';
  return (
    <Pressable
      onPress={pressable ? onPress : undefined}
      disabled={!pressable}
      style={[styles.row, state === 'active' ? styles.active : state === 'done' ? styles.done : styles.locked]}
    >
      <View style={[styles.num, state === 'active' ? styles.numActive : state === 'done' ? styles.numDone : styles.numLocked]}>
        <Text style={styles.numText}>{state === 'done' ? '✓' : step.n}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: state === 'active' ? colors.white : state === 'done' ? colors.textMuted : colors.textDim }]} numberOfLines={1}>{step.title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.xp, { color: state === 'done' ? colors.green : state === 'active' ? colors.yellow : colors.textDim }]}>+{step.xp} XP</Text>
        {state === 'active' ? <Text style={styles.go}>Go →</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.lg, marginBottom: 6, padding: 12, borderRadius: radii.md, borderWidth: 1 },
  active: { backgroundColor: 'rgba(14,116,144,0.12)', borderColor: 'rgba(103,232,249,0.25)' },
  done: { backgroundColor: 'rgba(22,101,52,0.08)', borderColor: 'rgba(34,197,94,0.2)' },
  locked: { backgroundColor: colors.glass, borderColor: colors.border },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numActive: { backgroundColor: colors.teal },
  numDone: { backgroundColor: colors.greenDark },
  numLocked: { backgroundColor: colors.glassStrong },
  numText: { color: colors.white, fontWeight: '900', fontSize: sizes.textSm },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: sizes.textSm, fontWeight: '800' },
  sub: { color: colors.textDim, fontSize: 10, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  xp: { fontSize: sizes.textXs, fontWeight: '800' },
  go: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700', marginTop: 2 },
});
