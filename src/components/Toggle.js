import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

/** Minimal on/off switch matching the prototype's notification-prefs toggle. */
export function Toggle({ value, onValueChange }) {
  return (
    <Pressable
      onPress={() => onValueChange?.(!value)}
      style={[styles.track, { backgroundColor: value ? colors.teal : 'rgba(255,255,255,0.12)' }]}
    >
      <View style={[styles.knob, { left: value ? 23 : 3 }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 44, height: 24, borderRadius: 999, justifyContent: 'center' },
  knob: { position: 'absolute', top: 3, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.white },
});
