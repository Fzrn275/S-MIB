import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radii, sizes, spacing } from '../theme/tokens';

export function FormTextField({ label, value, onChangeText, placeholder, required, multiline, keyboardType }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        multiline={!!multiline}
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.white, fontSize: sizes.textSm },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
