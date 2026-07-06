import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, radius, spacing, typography, shadow } from '../theme/theme';
import { Button, Card, ProgressBar, SectionHeader, STATUS_META } from '../components/ui';
import { DoseRow } from '../components/DoseRow';
import { formatAge, formatRelative, parseISO } from '../logic/dates';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function DashboardScreen({ navigation }: Props) {
  const { child, schedule, summary } = useApp();
  if (!child || !summary) return null;

  const attention = schedule
    .filter((s) => s.status === 'overdue' || s.status === 'dueSoon')
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const upcoming = schedule
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 4);

  const initial = child.name.trim().charAt(0).toUpperCase() || '?';

  const stats = [
    { key: 'overdue', label: 'Overdue', value: summary.overdue, meta: STATUS_META.overdue },
    { key: 'dueSoon', label: 'Due soon', value: summary.dueSoon, meta: STATUS_META.dueSoon },
    { key: 'completed', label: 'Done', value: summary.completed, meta: STATUS_META.completed },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Hi, keeping track for</Text>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAge}>{formatAge(parseISO(child.birthDate))}</Text>
          </View>
        </View>

        {/* Progress */}
        <Card>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressPct}>{summary.completionPct}%</Text>
              <Text style={styles.progressCaption}>
                {summary.completed} of {summary.total} scheduled doses recorded
              </Text>
            </View>
            <View style={styles.trophy}>
              <Ionicons name="ribbon" size={22} color={colors.primary} />
            </View>
          </View>
          <View style={{ marginTop: spacing.md }}>
            <ProgressBar pct={summary.completionPct} />
          </View>
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.key} style={styles.stat}>
                <Text style={[styles.statValue, { color: s.meta.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Next up hero */}
        {summary.nextUp ? (
          <View style={[styles.hero, summary.nextUp.status === 'overdue' && styles.heroOverdue]}>
            <Text style={styles.heroKicker}>
              {summary.nextUp.status === 'overdue' ? 'PAST DUE' : 'NEXT UP'}
            </Text>
            <Text style={styles.heroTitle}>
              {summary.nextUp.vaccine.name}
            </Text>
            <Text style={styles.heroSub}>
              {summary.nextUp.dose.label} · recommended at {summary.nextUp.dose.rangeLabel}
            </Text>
            <Text style={styles.heroDue}>
              {summary.nextUp.status === 'overdue' ? 'Was due ' : 'Due '}
              {formatRelative(summary.nextUp.dueDate)}
            </Text>
            <View style={styles.heroActions}>
              <Button
                title="Record dose"
                variant="secondary"
                icon={<Ionicons name="checkmark" size={18} color={colors.primaryDark} />}
                onPress={() =>
                  navigation.navigate('RecordDose', {
                    vaccineId: summary.nextUp!.vaccine.id,
                    doseNumber: summary.nextUp!.dose.doseNumber,
                  })
                }
                style={{ flex: 1 }}
              />
              <Button
                title="Details"
                variant="ghost"
                onPress={() =>
                  navigation.navigate('VaccineDetail', {
                    vaccineId: summary.nextUp!.vaccine.id,
                  })
                }
              />
            </View>
          </View>
        ) : (
          <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Ionicons name="checkmark-done-circle" size={40} color={colors.completed} />
            <Text style={styles.allDoneTitle}>All caught up!</Text>
            <Text style={styles.allDoneSub}>No doses are currently due.</Text>
          </Card>
        )}

        {/* Needs attention */}
        {attention.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Needs attention" />
            <Card style={{ paddingVertical: spacing.xs }}>
              {attention.map((item, i) => (
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
        ) : null}

        {/* Coming up */}
        {upcoming.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Coming up"
              action={
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate('Tabs', { screen: 'Schedule' })}
                >
                  See all
                </Text>
              }
            />
            <Card style={{ paddingVertical: spacing.xs }}>
              {upcoming.map((item, i) => (
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
        ) : null}

        <Text style={styles.footer}>
          Schedule based on the CDC 2025 childhood immunization schedule.
          Always confirm timing with your pediatrician.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: '700' },
  hello: { ...typography.small },
  childName: { ...typography.h2 },
  childAge: { ...typography.small, color: colors.primary, fontWeight: '600' },

  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressPct: { fontSize: 40, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  progressCaption: { ...typography.small, marginTop: 2 },
  trophy: {
    width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primaryTint,
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { ...typography.tiny, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadow.card,
  },
  heroOverdue: { backgroundColor: colors.overdue },
  heroKicker: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '800', marginTop: 6 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  heroDue: { color: colors.white, fontSize: 15, fontWeight: '700', marginTop: spacing.sm },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },

  allDoneTitle: { ...typography.h3, marginTop: spacing.sm },
  allDoneSub: { ...typography.small, marginTop: 2 },

  section: { marginTop: spacing.xl },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 52 },
  link: { ...typography.small, color: colors.primary, fontWeight: '700' },

  footer: { ...typography.small, color: colors.textFaint, marginTop: spacing.xl, textAlign: 'center', lineHeight: 18 },
});
