import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii, sizes, spacing } from '../theme/tokens';

/** One notification row. `item` = a SEED_PARENT_NOTIFS object. */
export function NotifRow({ item, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: item.bg || colors.glass }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.sub} numberOfLines={2}>{item.sub}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
      {item.unread ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.lg, marginBottom: 6, padding: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  iconWrap: { width: 40, height: 40, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18 },
  body: { flex: 1, minWidth: 0 },
  title: { color: colors.white, fontSize: sizes.textSm, fontWeight: '800' },
  sub: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2, lineHeight: 17 },
  time: { color: colors.textDim, fontSize: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
});
