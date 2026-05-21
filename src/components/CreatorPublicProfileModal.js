import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Portal, Modal, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SEED_CREATORS } from '../data/seedData';
import { colors, radii, sizes, spacing } from '../theme/tokens';

const FALLBACK = { init: '?', color: colors.teal, role: 'Creator', org: '', bio: '', projects: 0, students: 0, rating: 0, badges: '', id: 'CRT-0000' };

/**
 * Read-only creator profile bottom sheet. `creatorName` keys into SEED_CREATORS.
 * Shown from Child Progress (and reusable by the learner Project Detail).
 */
export function CreatorPublicProfileModal({ creatorName, visible, onClose }) {
  const c = (creatorName && SEED_CREATORS[creatorName]) || FALLBACK;
  const badges = c.badges ? c.badges.split(' · ') : [];

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.sheet}>
        <View style={styles.handle} />
        <Pressable onPress={onClose} hitSlop={10} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>

        <View style={styles.hero}>
          <LinearGradient colors={[c.color, c.color + 'cc']} style={styles.avatar}>
            <Text style={styles.avatarText}>{c.init}</Text>
          </LinearGradient>
          <Text style={styles.name}>{creatorName || 'Creator'}</Text>
          <Text style={styles.role}>{c.role}{c.org ? ` · ${c.org}` : ''}</Text>
          <Text style={styles.id}>{c.id}</Text>
          {badges.length ? (
            <View style={styles.badgeRow}>
              {badges.map((b) => (
                <Text key={b} style={styles.badge}>✓ {b}</Text>
              ))}
            </View>
          ) : null}
        </View>

        {c.bio ? <Text style={styles.bio}>{c.bio}</Text> : null}

        <View style={styles.stats}>
          <Stat num={c.projects} label="Projects" color={colors.yellow} />
          <Stat num={c.students.toLocaleString()} label="Students" color={colors.cyan} />
          <Stat num={`${c.rating.toFixed(1)}★`} label="Avg Rating" color="#86EFAC" />
        </View>

        <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} onPress={onClose} style={styles.btn}>Close</Button>
      </Modal>
    </Portal>
  );
}

function Stat({ num, label, color }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statNum, { color }]}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: colors.navyLight, marginHorizontal: spacing.lg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.sm },
  close: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 2 },
  closeText: { color: colors.white, fontSize: 24, opacity: 0.6 },
  hero: { alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { color: colors.navy, fontSize: sizes.text2xl, fontWeight: '900' },
  name: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900' },
  role: { color: colors.textMuted, fontSize: sizes.textXs, marginTop: 2 },
  id: { color: colors.textDim, fontSize: 11, marginTop: 4, letterSpacing: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 10 },
  badge: { fontSize: 10, fontWeight: '800', color: colors.cyan, backgroundColor: 'rgba(103,232,249,0.12)', borderWidth: 1, borderColor: 'rgba(103,232,249,0.3)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.pill, overflow: 'hidden' },
  bio: { color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 20, textAlign: 'center', marginTop: spacing.md },
  stats: { flexDirection: 'row', gap: 8, marginTop: spacing.lg, marginBottom: spacing.md },
  stat: { flex: 1, alignItems: 'center', backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingVertical: spacing.sm },
  statNum: { fontSize: sizes.textLg, fontWeight: '900' },
  statLabel: { color: colors.textDim, fontSize: 9, textTransform: 'uppercase', marginTop: 2 },
  btn: { borderRadius: 12 },
});
