import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { ForgotPasswordModal } from '../../components/ForgotPasswordModal';
import { SmokeBadge } from '../../components/SmokeBadge';
import { colors, spacing, sizes } from '../../theme/tokens';
import { useAuth } from '../../context/AuthContext';
import { SeniorLearner, JuniorLearner, VerifiedCreator, Parent } from '../../models';

/**
 * Day 1 Login screen. Functional sign-in path exists for when Supabase is
 * wired; otherwise the user can pick a demo role to enter the app without
 * a backend. Day 2 replaces this with the full prototype-style login UI.
 */
export function LoginScreen({ navigation }) {
  const { signIn, configured, setLocalUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const onSignIn = async () => {
    if (!email || !password) {
      setError('Email and password required');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn({ email, password });
    } catch (err) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  const onDemoRole = async (role) => {
    const id = `demo-${role}-${Date.now()}`;
    let inst;
    switch (role) {
      case 'junior':
        inst = new JuniorLearner({
          id, email: 'demo.junior@smib.app', displayName: 'Nurul Hana',
          schoolName: 'SMK Bandar Kuching', grade: 'Form 2', xp: 320, level: 2, streak: 3,
        });
        break;
      case 'senior':
        inst = new SeniorLearner({
          id, email: 'demo.senior@smib.app', displayName: 'Fazrin Ezan',
          schoolName: 'SMK Bandar Kuching', grade: 'Form 4', xp: 620, level: 4, streak: 12,
        });
        break;
      case 'creator':
        inst = new VerifiedCreator({
          id, email: 'demo.creator@smib.app', displayName: 'Ahmad Khalil',
          organization: 'SMK Bandar Kuching', expertise: 'Electronics & IoT',
          bio: 'STEM teacher and verified S-MIB creator.', rating: 4.9,
        });
        break;
      case 'parent':
        inst = new Parent({
          id, email: 'demo.parent@smib.app', displayName: 'Pat Razak',
          phone: '+60 12 345 6789',
        });
        break;
      default:
        return;
    }
    await setLocalUser(inst);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.brand}>S-MIB</Text>
            <Text style={styles.tagline}>Sarawak Maker-In-A-Box</Text>

            <View style={styles.card}>
              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.sub}>Continue your maker journey</Text>

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
              <TextInput
                mode="outlined"
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.teal}
                textColor={colors.white}
                right={<TextInput.Icon icon={showPwd ? 'eye-off' : 'eye'} onPress={() => setShowPwd(s => !s)} />}
                theme={{ colors: { background: 'transparent', onSurfaceVariant: colors.textMuted } }}
              />
              {error && <HelperText type="error" visible>{error}</HelperText>}

              <Text style={styles.forgot} onPress={() => setForgotOpen(true)}>
                Forgot password?
              </Text>

              <Button
                mode="contained"
                onPress={onSignIn}
                loading={busy}
                disabled={busy || !configured}
                style={styles.signInBtn}
                buttonColor={colors.teal}
                textColor={colors.white}
              >
                Sign in
              </Button>

              <Button
                mode="outlined"
                icon="google"
                disabled
                style={styles.googleBtn}
                textColor={colors.textMuted}
              >
                Continue with Google (Coming soon)
              </Button>

              {!configured && (
                <Text style={styles.note}>
                  Supabase not configured — set EXPO_PUBLIC_SUPABASE_URL in your .env to enable
                  real sign-in. For Day 1 you can enter via a demo role below.
                </Text>
              )}

              <Button
                mode="text"
                onPress={() => navigation?.navigate?.('RegStep1')}
                textColor={colors.cyan}
              >
                Create new account
              </Button>
            </View>

            <View style={styles.demoCard}>
              <Text style={styles.demoTitle}>Dev / demo entry (no backend)</Text>
              <View style={styles.demoRow}>
                <Button compact mode="outlined" textColor={colors.white} onPress={() => onDemoRole('senior')}>
                  Senior Learner
                </Button>
                <Button compact mode="outlined" textColor={colors.white} onPress={() => onDemoRole('junior')}>
                  Junior Learner
                </Button>
              </View>
              <View style={styles.demoRow}>
                <Button compact mode="outlined" textColor={colors.white} onPress={() => onDemoRole('creator')}>
                  Verified Creator
                </Button>
                <Button compact mode="outlined" textColor={colors.white} onPress={() => onDemoRole('parent')}>
                  Parent
                </Button>
              </View>
            </View>

            <SmokeBadge />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ForgotPasswordModal visible={forgotOpen} onDismiss={() => setForgotOpen(false)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  brand: {
    color: colors.white,
    fontSize: sizes.text4xl,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  tagline: {
    color: colors.cyan,
    fontSize: sizes.textSm,
    textAlign: 'center',
    marginBottom: spacing.xl,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.glass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    color: colors.white,
    fontSize: sizes.text2xl,
    fontWeight: '800',
  },
  sub: {
    color: colors.textMuted,
    fontSize: sizes.textSm,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: 'transparent',
    marginTop: spacing.sm,
  },
  forgot: {
    color: colors.cyan,
    fontSize: sizes.textXs,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  signInBtn: {
    marginTop: spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  googleBtn: {
    marginTop: spacing.sm,
    borderRadius: 12,
    borderColor: colors.border,
  },
  note: {
    marginTop: spacing.md,
    color: colors.yellow,
    fontSize: sizes.textXs,
    lineHeight: 16,
  },
  demoCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.glass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoTitle: {
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
