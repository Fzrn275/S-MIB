import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Portal, Modal, Button } from 'react-native-paper';
import { ScreenBackground } from '../../components/ScreenBackground';
import { AppHeader } from '../../components/AppHeader';
import { NotifRow } from '../../components/NotifRow';
import { SEED_PARENT_NOTIFS, SEED_CHILDREN } from '../../data/seedData';
import { colors, spacing, sizes, radii } from '../../theme/tokens';

const PROGRESS_TYPES = new Set(['step', 'complete', 'enrol', 'badge', 'cert', 'goal', 'streak']);

export function ParentNotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState(() => SEED_PARENT_NOTIFS.map((n) => ({ ...n })));
  const [expanded, setExpanded] = useState(null);
  const groups = useMemo(() => [...new Set(notifs.map((n) => n.group))], [notifs]);

  const markAll = () => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false })));
  const open = (notif) => {
    setNotifs((ns) => ns.map((n) => (n === notif ? { ...n, unread: false } : n)));
    setExpanded(notif);
  };
  const viewProgress = () => {
    setExpanded(null);
    navigation.navigate('ParentChildProgress', { child: SEED_CHILDREN[0] });
  };

  return (
    <ScreenBackground>
      <AppHeader paddingBottom={spacing.md}>
        <View style={styles.headerRow}>
          <View style={styles.left}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}><Text style={styles.back}>←</Text></Pressable>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <Pressable onPress={markAll} hitSlop={8}><Text style={styles.markAll}>Mark all read</Text></Pressable>
        </View>
      </AppHeader>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl, paddingTop: spacing.sm }} showsVerticalScrollIndicator={false}>
        {groups.map((g) => (
          <View key={g}>
            <Text style={styles.dateLabel}>{g}</Text>
            {notifs.filter((n) => n.group === g).map((n, i) => (
              <NotifRow key={`${g}-${i}`} item={n} onPress={() => open(n)} />
            ))}
          </View>
        ))}
      </ScrollView>

      <Portal>
        <Modal visible={!!expanded} onDismiss={() => setExpanded(null)} contentContainerStyle={styles.sheet}>
          <View style={styles.handle} />
          {expanded && (
            <>
              <View style={styles.modalHead}>
                <View style={[styles.modalIconWrap, { backgroundColor: expanded.bg }]}><Text style={styles.modalIcon}>{expanded.icon}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.modalTitle}>{expanded.title}</Text>
                  <Text style={styles.modalTime}>{expanded.time} ago</Text>
                </View>
              </View>
              <Text style={styles.modalBody}>{expanded.sub}</Text>
              {PROGRESS_TYPES.has(expanded.type) && (
                <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} style={{ marginBottom: spacing.sm }} onPress={viewProgress}>View Child Progress</Button>
              )}
              <Button mode="outlined" textColor={colors.white} style={{ borderColor: colors.border }} onPress={() => setExpanded(null)}>Close</Button>
            </>
          )}
        </Modal>
      </Portal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { color: colors.white, fontSize: sizes.text2xl, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: sizes.textXl, fontWeight: '900' },
  markAll: { color: colors.cyan, fontSize: sizes.textXs, fontWeight: '700' },
  dateLabel: { color: colors.textDim, fontSize: sizes.textXs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  sheet: { backgroundColor: colors.navyLight, marginHorizontal: spacing.lg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  modalHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: spacing.md },
  modalIconWrap: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  modalIcon: { fontSize: 22 },
  modalTitle: { color: colors.white, fontSize: sizes.textLg, fontWeight: '900' },
  modalTime: { color: colors.textDim, fontSize: sizes.textXs, marginTop: 2 },
  modalBody: { color: colors.textMuted, fontSize: sizes.textSm, lineHeight: 21, backgroundColor: colors.glass, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
});
