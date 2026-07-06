import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Card, STATUS_META } from '../components/ui';
import { DateField } from '../components/DateField';
import {
  buildTimeline,
  summarizeAsOf,
  TimelineEntry,
} from '../logic/scheduling';
import { formatDate, formatRelative, parseISO, toISODate, today } from '../logic/dates';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Timeline'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Row =
  | { kind: 'month'; key: string; label: string }
  | { kind: 'marker'; key: string; variant: 'today' | 'selected'; label: string }
  | { kind: 'entry'; key: string; entry: TimelineEntry };

export function TimelineScreen({ navigation }: Props) {
  const { child, schedule } = useApp();
  const [selected, setSelected] = useState(toISODate(today()));

  const flatEntries = useMemo(
    () => buildTimeline(schedule).flatMap((m) => m.entries),
    [schedule]
  );

  const t = today();
  const sel = parseISO(selected);
  const showSelected = toISODate(sel) !== toISODate(t);
  const asOf = useMemo(() => summarizeAsOf(schedule, sel), [schedule, selected]);

  // Interleave month headers and the "today"/"viewing" markers into one list.
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    let lastMonth = '';
    let todayDone = false;
    let selDone = false;
    const tTime = t.getTime();
    const selTime = sel.getTime();

    const placeMarkers = (boundary: number) => {
      const pend: { time: number; variant: 'today' | 'selected'; label: string }[] = [];
      if (!todayDone && tTime <= boundary)
        pend.push({ time: tTime, variant: 'today', label: 'TODAY' });
      if (showSelected && !selDone && selTime <= boundary)
        pend.push({ time: selTime, variant: 'selected', label: `VIEWING ${formatDate(sel)}` });
      pend.sort((a, b) => a.time - b.time);
      for (const p of pend) {
        out.push({ kind: 'marker', key: `m-${p.variant}`, variant: p.variant, label: p.label });
        if (p.variant === 'today') todayDone = true;
        else selDone = true;
      }
    };

    for (const entry of flatEntries) {
      const d = entry.date;
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthKey !== lastMonth) {
        out.push({
          kind: 'month',
          key: monthKey,
          label: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        });
        lastMonth = monthKey;
      }
      placeMarkers(d.getTime());
      out.push({ kind: 'entry', key: entry.key, entry });
    }
    placeMarkers(Infinity); // markers beyond the last dose land at the end
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatEntries, selected]);

  if (!child) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Timeline</Text>

        {/* Date scrubber + as-of summary */}
        <Card style={styles.scrubCard}>
          <View style={styles.scrubHead}>
            <Text style={styles.scrubLabel}>Viewing status as of</Text>
            {showSelected ? (
              <Pressable onPress={() => setSelected(toISODate(t))} hitSlop={8}>
                <Text style={styles.reset}>Reset to today</Text>
              </Pressable>
            ) : null}
          </View>
          <DateField label="" value={selected} onChange={setSelected} />
          <View style={styles.asOfRow}>
            <AsOfStat value={asOf.given} label="Given" color={colors.completed} />
            <AsOfStat value={asOf.expected} label="Due by then" color={colors.dueSoon} />
            <AsOfStat value={asOf.upcoming} label="Still ahead" color={colors.upcoming} />
          </View>
        </Card>

        {/* Timeline */}
        <View style={styles.timeline}>
          {rows.map((row) => {
            if (row.kind === 'month') {
              return (
                <Text key={row.key} style={styles.monthLabel}>
                  {row.label}
                </Text>
              );
            }
            if (row.kind === 'marker') {
              const isToday = row.variant === 'today';
              const color = isToday ? colors.primary : colors.accent;
              return (
                <View key={row.key} style={styles.marker}>
                  <View style={[styles.markerLine, { backgroundColor: color }]} />
                  <View style={[styles.markerPill, { backgroundColor: color }]}>
                    <Ionicons
                      name={isToday ? 'ellipse' : 'eye'}
                      size={10}
                      color={colors.white}
                    />
                    <Text style={styles.markerText}>{row.label}</Text>
                  </View>
                  <View style={[styles.markerLine, { backgroundColor: color }]} />
                </View>
              );
            }
            return (
              <TimelineRow
                key={row.key}
                entry={row.entry}
                onEdit={(vaccineId, doseNumber, recordId) =>
                  navigation.navigate('RecordDose', { vaccineId, doseNumber, recordId })
                }
                onPlan={(vaccineId, doseNumber) =>
                  navigation.navigate('PlanDose', { vaccineId, doseNumber })
                }
                onOpen={(vaccineId) => navigation.navigate('VaccineDetail', { vaccineId })}
              />
            );
          })}
        </View>

        <Text style={styles.footer}>
          Past doses show the date given. Pending doses sit at their booked
          appointment, or their CDC-recommended date if none is booked yet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function AsOfStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.asOfStat}>
      <Text style={[styles.asOfValue, { color }]}>{value}</Text>
      <Text style={styles.asOfLabel}>{label}</Text>
    </View>
  );
}

function TimelineRow({
  entry,
  onEdit,
  onPlan,
  onOpen,
}: {
  entry: TimelineEntry;
  onEdit: (vaccineId: string, doseNumber: number, recordId: string) => void;
  onPlan: (vaccineId: string, doseNumber: number) => void;
  onOpen: (vaccineId: string) => void;
}) {
  const { item } = entry;
  const meta = STATUS_META[item.status];
  const nodeColor = entry.administered
    ? colors.completed
    : entry.planned
    ? colors.primary
    : meta.color;

  const tag = entry.administered ? 'Given' : entry.planned ? 'Booked' : meta.label;
  const tagColor = entry.administered ? colors.completed : entry.planned ? colors.primary : meta.color;

  return (
    <View style={styles.row}>
      {/* Rail */}
      <View style={styles.rail}>
        <View style={styles.railLine} />
        <View style={[styles.node, { backgroundColor: nodeColor, borderColor: colors.background }]}>
          <Ionicons
            name={entry.administered ? 'checkmark' : entry.planned ? 'calendar' : 'ellipse'}
            size={entry.administered || entry.planned ? 11 : 7}
            color={colors.white}
          />
        </View>
      </View>

      {/* Card */}
      <Pressable
        style={styles.entryCard}
        onPress={() =>
          entry.administered && item.record
            ? onEdit(item.vaccine.id, item.dose.doseNumber, item.record.id)
            : onOpen(item.vaccine.id)
        }
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.entryDate}>
            {formatDate(entry.date)} · <Text style={{ color: colors.textMuted }}>{formatRelative(entry.date)}</Text>
          </Text>
          <Text style={styles.entryTitle} numberOfLines={1}>
            {item.vaccine.abbreviation} · {item.dose.label}
          </Text>
          <View style={[styles.tag, { backgroundColor: tagColor + '1A' }]}>
            <Text style={[styles.tagText, { color: tagColor }]}>{tag}</Text>
          </View>
        </View>

        {/* Actions for pending doses */}
        {!entry.administered ? (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, entry.planned && { backgroundColor: colors.primary }]}
              onPress={() => onPlan(item.vaccine.id, item.dose.doseNumber)}
              hitSlop={6}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={entry.planned ? colors.white : colors.primary}
              />
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.actionPrimary]}
              onPress={() => onEdit(item.vaccine.id, item.dose.doseNumber, '')}
              hitSlop={6}
            >
              <Ionicons name="checkmark" size={18} color={colors.white} />
            </Pressable>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
        )}
      </Pressable>
    </View>
  );
}

const NODE = 22;
const RAIL_W = 40;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.lg },

  scrubCard: { marginBottom: spacing.xl },
  scrubHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  scrubLabel: { ...typography.small, fontWeight: '600' },
  reset: { ...typography.small, color: colors.primary, fontWeight: '700' },
  asOfRow: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md,
  },
  asOfStat: { flex: 1, alignItems: 'center' },
  asOfValue: { fontSize: 22, fontWeight: '800' },
  asOfLabel: { ...typography.tiny, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2, textAlign: 'center' },

  timeline: {},
  monthLabel: {
    ...typography.tiny, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.textMuted,
    marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: RAIL_W,
  },

  marker: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.sm, marginLeft: RAIL_W - 8 },
  markerLine: { flex: 1, height: 2, borderRadius: 2, opacity: 0.5 },
  markerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
  },
  markerText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  row: { flexDirection: 'row' },
  rail: { width: RAIL_W, alignItems: 'center' },
  railLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.border },
  node: {
    width: NODE, height: NODE, borderRadius: NODE / 2, marginTop: spacing.md, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  entryCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.md, marginLeft: spacing.xs,
  },
  entryDate: { ...typography.small, fontWeight: '600', color: colors.text },
  entryTitle: { ...typography.bodyStrong, marginTop: 2 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, marginTop: 6 },
  tagText: { fontSize: 11, fontWeight: '800' },

  actions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  actionBtn: {
    width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primaryTint,
    alignItems: 'center', justifyContent: 'center',
  },
  actionPrimary: { backgroundColor: colors.completed },

  footer: { ...typography.small, color: colors.textFaint, marginTop: spacing.lg, textAlign: 'center', lineHeight: 18 },
});
