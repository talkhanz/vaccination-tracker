import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Button, Card, ProgressBar } from '../components/ui';
import { formatAge, parseISO } from '../logic/dates';
import { childColor } from '../logic/avatar';
import { summarize } from '../logic/scheduling';

type Props = NativeStackScreenProps<RootStackParamList, 'Children'>;

export function ChildrenScreen({ navigation }: Props) {
  const { children, selectedChildId, allSchedules, selectChild, deleteChild } = useApp();

  const pctFor = (childId: string) => {
    const entry = allSchedules.find((s) => s.child.id === childId);
    return entry ? summarize(entry.schedule).completionPct : 0;
  };

  const switchTo = async (id: string) => {
    await selectChild(id);
    navigation.goBack();
  };

  const confirmDelete = (id: string, name: string) => {
    const msg = `Remove ${name} and all of their vaccine records from this device? This can't be undone.`;
    const run = () => deleteChild(id);
    if (Platform.OS === 'web') {
      if ((globalThis as any).confirm(msg)) run();
    } else {
      Alert.alert('Remove child?', msg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: run },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Switch between children, or add another. Each child keeps their own
          records, schedule, and reminders.
        </Text>

        {children.map((c) => {
          const selected = c.id === selectedChildId;
          const pct = pctFor(c.id);
          return (
            <Card key={c.id} style={[styles.card, selected && styles.cardSelected]}>
              <Pressable style={styles.row} onPress={() => switchTo(c.id)}>
                <View style={[styles.avatar, { backgroundColor: childColor(c) }]}>
                  <Text style={styles.avatarText}>
                    {c.name.trim().charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{c.name}</Text>
                    {selected ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Selected</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.age}>{formatAge(parseISO(c.birthDate))}</Text>
                  <View style={styles.progressRow}>
                    <ProgressBar pct={pct} height={6} />
                    <Text style={styles.pct}>{pct}%</Text>
                  </View>
                </View>
              </Pressable>

              <View style={styles.actions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={async () => {
                    await selectChild(c.id);
                    navigation.navigate('EditChild');
                  }}
                >
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => confirmDelete(c.id, c.name)}>
                  <Ionicons name="trash-outline" size={18} color={colors.overdue} />
                  <Text style={[styles.actionText, { color: colors.overdue }]}>Remove</Text>
                </Pressable>
              </View>
            </Card>
          );
        })}

        <Button
          title="Add a child"
          icon={<Ionicons name="add" size={18} color={colors.white} />}
          onPress={() => navigation.navigate('EditChild', { add: true })}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  intro: { ...typography.small, lineHeight: 20, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md, padding: spacing.md },
  cardSelected: { borderColor: colors.primary, borderWidth: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.upcoming,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarSelected: { backgroundColor: colors.primary },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { ...typography.h3 },
  badge: { backgroundColor: colors.primaryTint, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800', color: colors.primaryDark },
  age: { ...typography.small, color: colors.primary, fontWeight: '600', marginTop: 1 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 6 },
  pct: { ...typography.tiny, color: colors.textMuted, width: 32, textAlign: 'right' },

  actions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.lg,
    marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { ...typography.small, fontWeight: '700', color: colors.primary },
});
