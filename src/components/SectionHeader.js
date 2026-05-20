import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, sizes } from '../theme/tokens';

export function SectionHeader({ eyebrow, title, icon, link, onLink }) {
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{icon ? `${icon} ` : ''}{title}</Text>
      </View>
      {link ? (
        <Pressable onPress={onLink} style={styles.linkBtn} hitSlop={8}>
          <Text style={styles.linkText}>{link} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  titles: { flex: 1 },
  eyebrow: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  title: { color: colors.white, fontSize: sizes.textLg, fontWeight: '800' },
  linkBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  linkText: { color: colors.white, fontSize: sizes.textXs, fontWeight: '700' },
});
