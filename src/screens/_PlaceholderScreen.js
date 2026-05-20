import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { ScreenBackground } from '../components/ScreenBackground';
import { SmokeBadge } from '../components/SmokeBadge';
import { colors, spacing, sizes, fonts } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';

/**
 * Generic placeholder screen used during Day 1 to exercise the navigation
 * tree. Day 2+ each placeholder gets replaced with its real screen.
 */
export function PlaceholderScreen({ route, navigation }) {
  const title = route?.name || 'Screen';
  const { user, signOut, configured } = useAuth();

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.eyebrow}>S-MIB</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>
            Placeholder screen — Day 1 scaffolding milestone.
          </Text>

          <View style={styles.userBox}>
            <Text style={styles.userLabel}>Current user</Text>
            {user ? (
              <>
                <Text style={styles.userLine}>Name: {user.fullName}</Text>
                <Text style={styles.userLine}>Role: {user.roleLabel}</Text>
                <Text style={styles.userLine}>Public ID: {user.publicId}</Text>
                {typeof user.xp === 'number' && (
                  <Text style={styles.userLine}>XP: {user.xp} · Level {user.level} · Streak {user.streak}d</Text>
                )}
              </>
            ) : (
              <Text style={styles.userLine}>(no user)</Text>
            )}
            <Text style={styles.userLine}>
              Supabase: {configured ? 'configured' : 'NOT configured — running in local demo mode'}
            </Text>
          </View>

          <SmokeBadge />

          {user && (
            <Button
              mode="outlined"
              onPress={signOut}
              style={styles.btn}
              textColor={colors.white}
            >
              Sign out
            </Button>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  eyebrow: {
    color: colors.cyan,
    fontSize: sizes.textXs,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: sizes.text3xl,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  sub: {
    color: colors.textMuted,
    fontSize: sizes.textSm,
    marginBottom: spacing.xl,
  },
  userBox: {
    backgroundColor: colors.glass,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  userLabel: {
    color: colors.cyan,
    fontSize: sizes.textXs,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  userLine: {
    color: colors.white,
    fontSize: sizes.textSm,
    marginVertical: 2,
  },
  btn: {
    marginTop: spacing.lg,
    borderColor: colors.white,
  },
});
