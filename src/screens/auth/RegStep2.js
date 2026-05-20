import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, Menu } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AuthHeader } from '../../components/AuthHeader';
import { useAuth } from '../../context/AuthContext';
import { resolveRole, roleMeta } from '../../auth/registration';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

// Field definitions per UI role. `key` maps to the camelCase profile object.
const FIELDS = {
  learner: [
    { key: 'displayName', label: 'Full Name', placeholder: 'e.g. Fazrin Ezan Darwish' },
    { key: 'email', label: 'Email', placeholder: 'you@school.edu.my', keyboardType: 'email-address' },
    { key: 'schoolName', label: 'School Name', placeholder: 'e.g. SMK Bandar Kuching' },
    { key: 'age', label: 'Age', placeholder: 'e.g. 15', keyboardType: 'number-pad', half: true },
    { key: 'grade', label: 'Grade / Form', select: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'], half: true },
  ],
  creator: [
    { key: 'displayName', label: 'Full Name', placeholder: 'e.g. Cikgu Aminah binti Yusof' },
    { key: 'email', label: 'Email', placeholder: 'creator@school.edu.my', keyboardType: 'email-address' },
    { key: 'organization', label: 'Organisation / School', placeholder: 'e.g. SMK Bandar Kuching' },
    { key: 'expertise', label: 'Field of Expertise', select: ['Robotics', 'Coding', 'Electronics', 'Engineering', 'Science', 'Maths', 'Agriculture', 'Other'] },
    { key: 'yearsExperience', label: 'Years of Experience', placeholder: 'e.g. 5', keyboardType: 'number-pad' },
  ],
  parent: [
    { key: 'displayName', label: 'Full Name', placeholder: 'e.g. Encik Hashim bin Ahmad' },
    { key: 'email', label: 'Email', placeholder: 'parent@example.com', keyboardType: 'email-address' },
    { key: 'phone', label: 'Phone Number', placeholder: '+60 12-345 6789', keyboardType: 'phone-pad' },
    { key: 'icNumber', label: 'IC Number', placeholder: 'e.g. 850101-13-5678', note: 'Used to verify your identity as a guardian' },
  ],
};

const EMAIL_RE = /\S+@\S+\.\S+/;

export function RegStep2({ navigation, route }) {
  const role = route?.params?.role || 'learner';
  const fields = FIELDS[role];
  const meta = roleMeta[role];

  const { signUpWithProfile } = useAuth();
  const [values, setValues] = useState({});
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [menuFor, setMenuFor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const setField = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));

  const validation = useMemo(() => {
    for (const f of fields) {
      if (!values[f.key] || String(values[f.key]).trim() === '') return `${f.label} is required`;
    }
    if (!EMAIL_RE.test(values.email || '')) return 'Enter a valid email address';
    if ((password || '').length < 8) return 'Password must be at least 8 characters';
    if (password !== confirm) return 'Passwords do not match';
    if (!agreed) return 'Please accept the Terms & Conditions';
    return null;
  }, [fields, values, password, confirm, agreed]);

  const onSubmit = async () => {
    if (validation) { setError(validation); return; }
    setBusy(true);
    setError(null);
    try {
      const profile = { ...values };
      const resolvedRole = resolveRole({ role, grade: values.grade, age: values.age });
      await signUpWithProfile({ email: values.email, password, role: resolvedRole, profile });
      navigation.navigate('RegVerify', { role, resolvedRole, email: values.email, profile });
    } catch (err) {
      setError(err.message || 'Could not create your account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground>
      <AuthHeader
        navigation={navigation}
        title="Your Details"
        sub={`Step 2 of 3 — ${meta.label} information`}
        step={2}
        totalSteps={3}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.grid}>
            {fields.map((f) => (
              <View key={f.key} style={[styles.field, f.half ? styles.half : styles.full]}>
                <Text style={styles.label}>
                  {f.label}
                  {f.note ? <Text style={styles.note}>  {f.note}</Text> : null}
                </Text>
                {f.select ? (
                  <Menu
                    visible={menuFor === f.key}
                    onDismiss={() => setMenuFor(null)}
                    anchor={
                      <Pressable style={styles.select} onPress={() => setMenuFor(f.key)}>
                        <Text style={values[f.key] ? styles.selectValue : styles.selectPlaceholder}>
                          {values[f.key] || 'Select…'}
                        </Text>
                        <Text style={styles.selectCaret}>▾</Text>
                      </Pressable>
                    }
                  >
                    {f.select.map((opt) => (
                      <Menu.Item
                        key={opt}
                        title={opt}
                        onPress={() => { setField(f.key, opt); setMenuFor(null); }}
                      />
                    ))}
                  </Menu>
                ) : (
                  <TextInput
                    mode="outlined"
                    value={values[f.key] || ''}
                    onChangeText={(v) => setField(f.key, v)}
                    placeholder={f.placeholder}
                    keyboardType={f.keyboardType}
                    autoCapitalize={f.keyboardType === 'email-address' ? 'none' : 'sentences'}
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.teal}
                    textColor={colors.white}
                    theme={{ colors: { background: 'transparent', onSurfaceVariant: colors.textMuted } }}
                  />
                )}
              </View>
            ))}
          </View>

          <View style={styles.full}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              placeholder="Min. 8 characters"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.teal}
              textColor={colors.white}
              right={<TextInput.Icon icon={showPass ? 'eye-off' : 'eye'} onPress={() => setShowPass((s) => !s)} />}
              theme={{ colors: { background: 'transparent', onSurfaceVariant: colors.textMuted } }}
            />
          </View>

          <View style={styles.full}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              mode="outlined"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              placeholder="Re-enter password"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.teal}
              textColor={colors.white}
              right={<TextInput.Icon icon={showConfirm ? 'eye-off' : 'eye'} onPress={() => setShowConfirm((s) => !s)} />}
              theme={{ colors: { background: 'transparent', onSurfaceVariant: colors.textMuted } }}
            />
          </View>

          <Pressable style={styles.terms} onPress={() => setAgreed((a) => !a)}>
            <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
              {agreed && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms &amp; Conditions</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Pressable>

          {error && <HelperText type="error" visible>{error}</HelperText>}

          <Button
            mode="contained"
            onPress={onSubmit}
            loading={busy}
            disabled={busy}
            style={styles.submit}
            buttonColor={colors.teal}
            textColor={colors.white}
          >
            Create Account →
          </Button>
          <Button mode="text" onPress={() => navigation.goBack()} textColor={colors.textMuted}>
            ← Back
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  field: { marginBottom: spacing.sm },
  full: { width: '100%' },
  half: { width: '48%' },
  label: { color: colors.white, fontSize: sizes.textSm, fontWeight: '600', marginBottom: 4, marginTop: spacing.sm },
  note: { color: colors.textDim, fontSize: 10, fontWeight: '400' },
  input: { backgroundColor: 'transparent' },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  selectValue: { color: colors.white, fontSize: sizes.textMd },
  selectPlaceholder: { color: colors.textMuted, fontSize: sizes.textMd },
  selectCaret: { color: colors.textMuted, fontSize: sizes.textMd },
  terms: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.lg },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxOn: { borderColor: colors.teal, backgroundColor: colors.teal },
  checkboxMark: { color: colors.white, fontSize: 12, fontWeight: '800' },
  termsText: { flex: 1, color: colors.textMuted, fontSize: sizes.textXs, lineHeight: 18 },
  termsLink: { color: colors.cyan },
  submit: { marginTop: spacing.lg, paddingVertical: 4, borderRadius: 12 },
});
