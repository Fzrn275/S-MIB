import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, sizes, fonts } from '../theme/tokens';

// Section row — ported from styles.css `.sec-row` / `.sec-title` / `.sec-link` (:265–278).
export function SectionHeader({ eyebrow, title, icon, link, onLink }) {
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{icon ? `${icon} ` : ''}{title}</Text>
      </View>
      {link ? (
        <Pressable
          onPress={onLink}
          hitSlop={8}
          style={({ pressed }) => [styles.linkBtn, pressed && styles.linkPressed]}
        >
          <Text style={styles.linkText}>{link}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  titles: { flex: 1 },
  eyebrow: { fontFamily: fonts.bodySemi, color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  title: { fontFamily: fonts.displayBlack, color: 'rgba(255,255,255,0.95)', fontSize: 16, fontWeight: '900' },
  linkBtn: {
    backgroundColor: colors.yellow,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  linkPressed: { transform: [{ scale: 0.94 }] },
  linkText: { fontFamily: fonts.displayExtraBold, color: colors.navy, fontSize: sizes.textXs, fontWeight: '800' },
});
