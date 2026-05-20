import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { runModelSmokeTest } from '../models/__smoketest';
import { runAuthSmokeTest } from '../auth/__regtest';
import { colors, radii, spacing, sizes } from '../theme/tokens';

/**
 * Developer-only component that runs the in-app self-tests on mount and shows a
 * pass/fail badge per suite (OOP models + auth/registration logic). Mounted on
 * dev surfaces so any regression surfaces immediately.
 */
export function SmokeBadge() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    setReports({
      model: runModelSmokeTest(),
      auth: runAuthSmokeTest(),
    });
  }, []);

  if (!reports) return null;
  const allOk = reports.model.ok && reports.auth.ok;

  return (
    <View style={[styles.card, { borderColor: allOk ? colors.green : colors.red }]}>
      <Suite label="OOP smoke test" report={reports.model} />
      <View style={{ height: spacing.sm }} />
      <Suite label="Auth smoke test" report={reports.auth} />
    </View>
  );
}

function Suite({ label, report }) {
  const passing = report.results.filter((r) => r.ok).length;
  const failed = report.results.filter((r) => !r.ok);
  return (
    <View>
      <Text style={styles.title}>
        {report.ok ? `✓ ${label}: ` : `✗ ${label} FAILED: `}
        {passing}/{report.results.length} passing
      </Text>
      {failed.length > 0 && (
        <ScrollView style={styles.list}>
          {failed.map((f, i) => (
            <Text key={i} style={styles.failure}>
              • {f.name} — {f.error}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: colors.glass,
  },
  title: {
    color: colors.white,
    fontSize: sizes.textSm,
    fontWeight: '700',
  },
  list: {
    maxHeight: 160,
    marginTop: spacing.sm,
  },
  failure: {
    color: colors.red,
    fontSize: sizes.textXs,
    marginTop: 2,
  },
});
