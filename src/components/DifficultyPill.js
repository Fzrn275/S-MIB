import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { diffColors, radii, sizes } from '../theme/tokens';

export function DifficultyPill({ difficulty, style }) {
  const { fg, bg } = diffColors(difficulty);
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{difficulty}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill, alignSelf: 'flex-start' },
  text: { fontSize: sizes.textXs, fontWeight: '800' },
});
