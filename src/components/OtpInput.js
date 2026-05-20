import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, sizes } from '../theme/tokens';

/**
 * Controlled 6-box numeric code input. `value` is the current string; `onChange`
 * receives the new string. Auto-advances on entry, steps back on backspace, and
 * handles paste/autofill (a multi-character change is distributed across boxes).
 */
export function OtpInput({ value = '', onChange, length = 6, disabled = false }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const setAt = (i, text) => {
    const clean = text.replace(/\D/g, '');

    // Paste / autofill: a single change carrying multiple digits.
    if (clean.length > 1) {
      const next = clean.slice(0, length);
      onChange(next);
      const focusIdx = Math.min(next.length, length - 1);
      refs.current[focusIdx]?.focus();
      return;
    }

    const arr = digits.slice();
    arr[i] = clean; // '' when cleared
    onChange(arr.join('').slice(0, length));
    if (clean && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyPress = (i, e) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          editable={!disabled}
          onChangeText={(t) => setAt(i, t)}
          onKeyPress={(e) => onKeyPress(i, e)}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={length} // allow paste; single-entry still advances
          selectTextOnFocus
          style={[styles.box, d ? styles.boxFilled : null]}
          placeholder="•"
          placeholderTextColor={colors.textDim}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  box: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
    color: colors.white,
    textAlign: 'center',
    fontSize: sizes.text2xl,
    fontWeight: '800',
  },
  boxFilled: {
    borderColor: colors.teal,
    backgroundColor: 'rgba(14,116,144,0.18)',
  },
});
