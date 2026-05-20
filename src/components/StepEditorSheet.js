import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { FormTextField } from './FormTextField';
import { colors, radii, sizes, spacing } from '../theme/tokens';

const EMPTY = { title: '', instruction: '', materials: '', videoUrl: '', xp: '40' };

/** initial: a step draft (or null for new). onSave(draft), onCancel(). */
export function StepEditorSheet({ visible, initial, index, onSave, onCancel }) {
  const [draft, setDraft] = useState(EMPTY);
  useEffect(() => { setDraft(initial ? { ...EMPTY, ...initial } : EMPTY); }, [initial, visible]);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{index == null ? 'Add New Step' : `Edit Step ${index + 1}`}</Text>
          <ScrollView>
            <FormTextField label="Step Title" required value={draft.title} onChangeText={set('title')} placeholder="e.g. Gather Materials" />
            <FormTextField label="Instructions" value={draft.instruction} onChangeText={set('instruction')} placeholder="Step-by-step instructions…" multiline />
            <FormTextField label="Materials (comma separated)" value={draft.materials} onChangeText={set('materials')} placeholder="Breadboard, LED, Resistor" />
            <FormTextField label="Learning Video URL (optional)" value={draft.videoUrl} onChangeText={set('videoUrl')} placeholder="https://youtube.com/…" keyboardType="url" />
            <FormTextField label="XP Reward" value={String(draft.xp)} onChangeText={set('xp')} placeholder="40" keyboardType="number-pad" />
          </ScrollView>
          <View style={styles.actions}>
            <Button mode="outlined" textColor={colors.white} style={styles.btn} onPress={onCancel}>Cancel</Button>
            <Button mode="contained" buttonColor={colors.teal} textColor={colors.white} style={styles.btn} disabled={!draft.title.trim()} onPress={() => onSave(draft)}>Save Step</Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.navyLight, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, paddingTop: spacing.sm, paddingBottom: spacing.xl, maxHeight: '88%' },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  title: { color: colors.white, fontSize: sizes.textLg, fontWeight: '900', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  btn: { flex: 1, borderColor: colors.border },
});
