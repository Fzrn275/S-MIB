import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Portal, Modal, TextInput, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, sizes, radii } from '../theme/tokens';

/**
 * Reset-password bottom sheet. Sends a reset email via Supabase when configured;
 * always shows the success state so the offline demo flow still reads correctly.
 */
export function ForgotPasswordModal({ visible, onDismiss }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setSent(false);
    setEmail('');
    onDismiss?.();
  };

  const onSend = async () => {
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={close} contentContainerStyle={styles.sheet}>
        <View style={styles.handle} />
        {!sent ? (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Reset Password</Text>
              <Pressable onPress={close} hitSlop={10}>
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.body}>
              Enter your registered email and we'll send you a reset link.
            </Text>
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.teal}
              textColor={colors.white}
              theme={{ colors: { background: 'transparent', onSurfaceVariant: colors.textMuted } }}
            />
            <Button
              mode="contained"
              onPress={onSend}
              loading={busy}
              disabled={busy || !email}
              style={styles.btn}
              buttonColor={colors.teal}
              textColor={colors.white}
            >
              Send Reset Link
            </Button>
          </>
        ) : (
          <View style={styles.successWrap}>
            <Text style={styles.successIcon}>📧</Text>
            <Text style={styles.successTitle}>Check your email!</Text>
            <Text style={styles.successBody}>
              We sent a reset link to{'\n'}
              <Text style={styles.successEmail}>{email || 'your email'}</Text>
            </Text>
            <Button mode="text" onPress={close} textColor={colors.cyan} style={styles.doneBtn}>
              Done
            </Button>
          </View>
        )}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.navyLight,
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { color: colors.white, fontSize: sizes.textXl, fontWeight: '800' },
  close: { color: colors.white, fontSize: 22, opacity: 0.6 },
  body: { color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 20, marginBottom: spacing.md },
  input: { backgroundColor: 'transparent', marginBottom: spacing.md },
  btn: { paddingVertical: 4, borderRadius: 12 },
  successWrap: { alignItems: 'center', paddingVertical: spacing.md },
  successIcon: { fontSize: 48, marginBottom: spacing.sm },
  successTitle: { color: colors.white, fontSize: sizes.textLg, fontWeight: '900', marginBottom: spacing.xs },
  successBody: { color: colors.textMuted, fontSize: sizes.textSm, textAlign: 'center', lineHeight: 20 },
  successEmail: { color: colors.white, fontWeight: '700' },
  doneBtn: { marginTop: spacing.md },
});
