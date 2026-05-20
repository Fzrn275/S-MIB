import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AuthHeader } from '../../components/AuthHeader';
import { roleMeta } from '../../auth/registration';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

const ROLE_ORDER = ['learner', 'creator', 'parent'];

/**
 * Registration step 1 — pick a role. The selection (the UI role) is passed to
 * RegStep2 via route params.
 */
export function RegStep1({ navigation }) {
  const [selected, setSelected] = useState(null);

  return (
    <ScreenBackground>
      <AuthHeader
        navigation={navigation}
        title="Create Account"
        sub="Step 1 of 3 — Choose your role"
        step={1}
        totalSteps={3}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {ROLE_ORDER.map((key) => {
          const r = roleMeta[key];
          const isSel = selected === key;
          return (
            <Pressable
              key={key}
              onPress={() => setSelected(key)}
              style={[styles.card, isSel && styles.cardSelected]}
            >
              {isSel && (
                <View style={styles.check}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
              <Text style={styles.icon}>{r.icon}</Text>
              <View style={styles.cardBody}>
                <Text style={styles.roleLabel}>{r.label}</Text>
                <Text style={styles.roleSub}>{r.sub}</Text>
                <View style={styles.idPill}>
                  <Text style={styles.idPillText}>ID: {r.prefix}-XXXX</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            ℹ️ Each account gets a unique ID (e.g.{' '}
            <Text style={styles.noteAccent}>LRN-4821</Text>). Parents use their child's Learner ID to
            link accounts.
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('RegStep2', { role: selected })}
          disabled={!selected}
          style={styles.continueBtn}
          buttonColor={colors.teal}
          textColor={colors.white}
        >
          Continue →
        </Button>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  cardSelected: {
    borderColor: colors.teal,
    backgroundColor: 'rgba(14,116,144,0.14)',
  },
  check: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: colors.white, fontSize: 12, fontWeight: '800' },
  icon: { fontSize: 30 },
  cardBody: { flex: 1, minWidth: 0 },
  roleLabel: { color: colors.white, fontSize: sizes.textLg, fontWeight: '800' },
  roleSub: { color: colors.textMuted, fontSize: sizes.textXs, marginTop: 3, lineHeight: 16 },
  idPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  idPillText: { color: colors.textDim, fontSize: 10, fontWeight: '800', fontFamily: 'monospace' },
  note: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.15)',
    backgroundColor: 'rgba(14,116,144,0.08)',
  },
  noteText: { color: colors.textMuted, fontSize: sizes.textXs, lineHeight: 18 },
  noteAccent: { color: colors.cyan, fontFamily: 'monospace' },
  continueBtn: {
    marginTop: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
