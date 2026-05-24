import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HelperText } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AuthHeader } from '../../components/AuthHeader';
import { OtpInput } from '../../components/OtpInput';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { makeOfflinePublicId } from '../../auth/registration';
import { colors, spacing, sizes } from '../../theme/tokens';

const RESEND_SECONDS = 45;

export function RegVerify({ navigation, route }) {
  const { role, resolvedRole, email, profile } = route?.params || {};
  const { configured, verifyEmailOtp, resendOtp, fetchMyProfile } = useAuth();

  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const onVerify = async () => {
    setBusy(true);
    setError(null);
    try {
      let publicId;
      let finalRole = resolvedRole;
      if (configured) {
        await verifyEmailOtp({ email, token: code });
        const row = await fetchMyProfile();
        publicId = row?.public_id;
        finalRole = row?.role || resolvedRole;
      } else {
        // Offline demo: accept any 6 digits, generate a display ID.
        publicId = makeOfflinePublicId(role);
      }
      navigation.navigate('RegSuccess', { role, resolvedRole: finalRole, email, profile, publicId });
    } catch (err) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    try {
      await resendOtp({ email });
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(err.message || 'Could not resend the code');
    }
  };

  return (
    <ScreenBackground>
      <AuthHeader
        navigation={navigation}
        title="Verify your email"
        sub="Step 3 of 3 — Enter the 6-digit code"
        step={3}
        totalSteps={3}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.envelope}>📩</Text>
        <Text style={styles.sentTo}>
          We sent a verification code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
        <Text style={styles.expires}>
          Code expires in <Text style={styles.expiresHi}>10 minutes</Text>
        </Text>

        <OtpInput value={code} onChange={setCode} length={6} disabled={busy} />

        {error && <HelperText type="error" visible style={styles.error}>{error}</HelperText>}

        <AppButton
          title="Verify Email →"
          onPress={onVerify}
          loading={busy}
          disabled={busy || code.length !== 6}
          variant="primary"
          style={{ alignSelf: 'stretch', marginTop: spacing.xl }}
        />

        <View style={styles.resendRow}>
          {resendIn > 0 ? (
            <Text style={styles.resendText}>
              Didn't receive it? <Text style={styles.resendDisabled}>Resend in {resendIn}s</Text>
            </Text>
          ) : (
            <Text style={styles.resendText}>
              Didn't receive it?{' '}
              <Text style={styles.resendLink} onPress={onResend}>Resend code</Text>
            </Text>
          )}
        </View>

        {!configured && (
          <Text style={styles.devNote}>
            Demo mode: no real email is sent — enter any 6 digits to continue.
          </Text>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, alignItems: 'center' },
  envelope: { fontSize: 52, marginBottom: spacing.sm },
  sentTo: { color: colors.textMuted, fontSize: sizes.textSm, textAlign: 'center', lineHeight: 22 },
  email: { color: colors.white, fontWeight: '700' },
  expires: { color: colors.textDim, fontSize: sizes.textXs, marginTop: spacing.sm, marginBottom: spacing.xl },
  expiresHi: { color: colors.yellow, fontWeight: '700' },
  error: { alignSelf: 'stretch', textAlign: 'center' },
  verifyBtn: { alignSelf: 'stretch', marginTop: spacing.xl, paddingVertical: 4, borderRadius: 12 },
  resendRow: { marginTop: spacing.lg },
  resendText: { color: colors.textMuted, fontSize: sizes.textSm },
  resendDisabled: { color: colors.textDim },
  resendLink: { color: colors.cyan, fontWeight: '700' },
  devNote: { color: colors.yellow, fontSize: sizes.textXs, marginTop: spacing.lg, textAlign: 'center' },
});
