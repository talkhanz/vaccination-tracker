import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Card, ProgressBar, STATUS_META } from '../components/ui';
import { DoseRow } from '../components/DoseRow';
import { groupByAgeBand, groupByVaccine } from '../logic/scheduling';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Schedule'>,
  NativeStackScreenProps<RootStackParamList>
>;

type View2 = 'vaccine' | 'age';

export function ScheduleScreen({ navigation }: Props) {
  const { schedule } = useApp();
  const [view, setView] = useState<View2>('vaccine');

  const byVaccine = groupByVaccine(schedule);
  const byAge = groupByAgeBand(schedule);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Schedule</Text>
        <View style={styles.toggle}>
          {(['vaccine', 'age'] as View2[]).map((v) => (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              style={[styles.toggleItem, view === v && styles.toggleItemActive]}
            >
              <Text style={[styles.toggleText, view === v && styles.toggleTextActive]}>
                {v === 'vaccine' ? 'By vaccine' : 'By age'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {view === 'vaccine'
          ? byVaccine.map((group) => {
              const meta = STATUS_META[group.headlineStatus];
              const pct = Math.round((group.completedDoses / group.totalDoses) * 100);
              return (
                <Pressable
                  key={group.vaccine.id}
                  onPress={() =>
                    navigation.navigate('VaccineDetail', { vaccineId: group.vaccine.id })
                  }
                >
                  <Card style={{ marginBottom: spacing.md }}>
                    <View style={styles.groupHead}>
                      <View style={[styles.badge, { backgroundColor: meta.tint }]}>
                        <Text style={[styles.badgeText, { color: meta.color }]}>
                          {group.vaccine.abbreviation}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupName} numberOfLines={1}>
                          {group.vaccine.name}
                        </Text>
                        <Text style={styles.groupMeta}>
                          {group.completedDoses}/{group.totalDoses} doses ·{' '}
                          <Text style={{ color: meta.color, fontWeight: '700' }}>{meta.label}</Text>
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                    </View>
                    <View style={{ marginTop: spacing.md }}>
                      <ProgressBar pct={pct} color={meta.color} height={6} />
                    </View>
                  </Card>
                </Pressable>
              );
            })
          : byAge.map((band) => (
              <View key={band.band.key} style={styles.bandBlock}>
                <View style={styles.bandHeader}>
                  <View style={styles.bandDot} />
                  <Text style={styles.bandLabel}>{band.band.label}</Text>
                </View>
                <Card style={{ paddingVertical: spacing.xs }}>
                  {band.doses.map((item, i) => (
                    <View key={`${item.vaccine.id}-${item.dose.doseNumber}`}>
                      {i > 0 ? <View style={styles.divider} /> : null}
                      <DoseRow
                        item={item}
                        onPress={() =>
                          navigation.navigate('VaccineDetail', { vaccineId: item.vaccine.id })
                        }
                      />
                    </View>
                  ))}
                </Card>
              </View>
            ))}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { ...typography.h1, marginBottom: spacing.md },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.primaryTint,
    borderRadius: radius.pill,
    padding: 3,
  },
  toggleItem: { flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center' },
  toggleItemActive: { backgroundColor: colors.surface, ...{
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  } },
  toggleText: { ...typography.small, fontWeight: '700', color: colors.primaryDark },
  toggleTextActive: { color: colors.primary },

  content: { paddingHorizontal: spacing.lg },

  groupHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badge: {
    minWidth: 54, height: 40, borderRadius: radius.md, paddingHorizontal: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 13, fontWeight: '800' },
  groupName: { ...typography.bodyStrong },
  groupMeta: { ...typography.small, marginTop: 2 },

  bandBlock: { marginBottom: spacing.lg },
  bandHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm, marginLeft: 2 },
  bandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  bandLabel: { ...typography.h3, fontSize: 15 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 52 },
});
