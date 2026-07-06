import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { CDC_SCHEDULE } from '../data/schedule';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Button, Card } from '../components/ui';
import { formatDate, parseISO } from '../logic/dates';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'History'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HistoryScreen({ navigation }: Props) {
  const { records } = useApp();

  const sorted = [...records].sort(
    (a, b) => parseISO(b.dateAdministered).getTime() - parseISO(a.dateAdministered).getTime()
  );

  const nameFor = (id: string) => CDC_SCHEDULE.find((v) => v.id === id);
  const doseLabel = (vaccineId: string, doseNumber: number) =>
    nameFor(vaccineId)?.doses.find((d) => d.doseNumber === doseNumber)?.label ??
    `Dose ${doseNumber}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>History</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate('RecordDose', {})}
        >
          <Ionicons name="add" size={20} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <Card style={styles.empty}>
            <Ionicons name="document-text-outline" size={40} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>No doses recorded yet</Text>
            <Text style={styles.emptySub}>
              Add doses your child has already received to build a complete record.
            </Text>
            <Button
              title="Add a dose"
              onPress={() => navigation.navigate('RecordDose', {})}
              style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
              icon={<Ionicons name="add" size={18} color={colors.white} />}
            />
          </Card>
        ) : (
          <>
            <Text style={styles.count}>{sorted.length} dose{sorted.length === 1 ? '' : 's'} recorded</Text>
            <Card style={{ paddingVertical: spacing.xs }}>
              {sorted.map((r, i) => {
                const v = nameFor(r.vaccineId);
                return (
                  <Pressable
                    key={r.id}
                    onPress={() =>
                      navigation.navigate('RecordDose', {
                        vaccineId: r.vaccineId,
                        doseNumber: r.doseNumber,
                        recordId: r.id,
                      })
                    }
                    style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
                  >
                    {i > 0 ? <View style={styles.divider} /> : null}
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{v?.abbreviation ?? '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{v?.name ?? r.vaccineId}</Text>
                      <Text style={styles.rowSub}>
                        {doseLabel(r.vaccineId, r.doseNumber)}
                        {r.provider ? ` · ${r.provider}` : ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.rowDate}>{formatDate(parseISO(r.dateAdministered))}</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
                    </View>
                  </Pressable>
                );
              })}
            </Card>
          </>
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md,
  },
  title: { ...typography.h1 },
  addBtn: {
    width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.lg },
  count: { ...typography.small, marginBottom: spacing.sm },

  empty: { alignItems: 'center', paddingVertical: spacing.xl, marginTop: spacing.xl },
  emptyTitle: { ...typography.h3, marginTop: spacing.md },
  emptySub: { ...typography.small, textAlign: 'center', marginTop: 4, lineHeight: 18 },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  divider: { position: 'absolute', top: 0, left: 52, right: 0, height: 1, backgroundColor: colors.border },
  badge: {
    minWidth: 48, height: 38, borderRadius: radius.md, paddingHorizontal: 6,
    backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: colors.primaryDark },
  rowTitle: { ...typography.bodyStrong },
  rowSub: { ...typography.small, marginTop: 2 },
  rowDate: { ...typography.small, color: colors.text, fontWeight: '600' },
});
