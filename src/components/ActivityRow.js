import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, sizes, spacing } from '../theme/tokens';

/** One row in the parent Activity feed. `item` = a SEED_PARENT_ACTIVITY object. */
export function ActivityRow({ item }) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: item.color + '33', borderColor: item.color + '44' }]}>
        <Text style={styles.init}>{item.init}</Text>
      </View>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.sub} numberOfLines={1}>{item.sub}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
      {item.unread ? <View style={styles.dot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginBottom: 6, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  init: { color: colors.white, fontSize: sizes.textXs, fontWeight: '900' },
  iconWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 12 },
  body: { flex: 1, minWidth: 0 },
  title: { color: colors.white, fontSize: sizes.textXs, fontWeight: '700' },
  sub: { color: colors.textDim, fontSize: 11, marginTop: 1 },
  time: { color: colors.textDim, fontSize: 10 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
});
