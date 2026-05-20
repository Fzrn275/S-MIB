import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Menu } from 'react-native-paper';
import { colors, radii, sizes, spacing } from '../theme/tokens';

export function FormSelectField({ label, value, options, onSelect, placeholder, required }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchor={
          <Pressable style={styles.input} onPress={() => setOpen(true)}>
            <Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder || 'Select…'}</Text>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>
        }
      >
        {options.map((opt) => (
          <Menu.Item key={opt} title={opt} onPress={() => { onSelect(opt); setOpen(false); }} />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: sizes.textXs, fontWeight: '700', marginBottom: 6 },
  input: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 12 },
  value: { color: colors.white, fontSize: sizes.textSm },
  placeholder: { color: colors.textDim },
  chevron: { color: colors.textMuted, fontSize: sizes.textSm },
});
