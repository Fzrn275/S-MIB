import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, sizes, spacing } from '../theme/tokens';

/** bars: number[] heights 0..1; labels: string[] same length. */
export function AnalyticsBars({ bars, labels }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        {bars.map((h, i) => (
          <View key={i} style={styles.col}>
            <View style={[styles.bar, { height: Math.max(4, Math.round(h * 80)) }]} />
            <Text style={styles.label}>{labels[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: spacing.lg, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  col: { alignItems: 'center', flex: 1 },
  bar: { width: 14, borderRadius: 6, backgroundColor: colors.cyan },
  label: { color: colors.textDim, fontSize: 10, marginTop: 6 },
});
