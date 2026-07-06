// Grid ("chart") view of the schedule: vaccines down the side, age across the
// top — mirroring the CDC schedule chart parents recognize.
//
// Layout: the age header and the vaccine-name column both stay put while you
// scroll. The body scrolls vertically (labels move with their rows) and
// horizontally (the age header mirrors the body's horizontal offset). The
// child's current age is highlighted as a "Now" band.

import React, { useMemo, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/theme';
import { DoseSchedule, DoseStatus } from '../logic/scheduling';
import { STATUS_META } from './ui';
import { ageInMonths, parseISO } from '../logic/dates';

const LEFT_W = 92;
const COL_W = 62;
const ROW_H = 46;
const HEADER_H = 54;

/** Friendly age label for a column, e.g. 0→"Birth", 4→"4 mo", 48→"4 yr". */
function ageLabel(months: number): string {
  if (months === 0) return 'Birth';
  if (months < 24) return `${months} mo`;
  const years = months / 12;
  if (Number.isInteger(years)) return `${years} yr`;
  return `${Math.floor(years)}½ yr`;
}

interface Cell {
  status: DoseStatus;
  planned: boolean;
  count: number;
}

interface VaccineRow {
  vaccineId: string;
  abbreviation: string;
  completed: number;
  total: number;
  minAge: number;
  cells: Record<number, Cell>;
}

const STATUS_RANK: Record<DoseStatus, number> = {
  overdue: 0,
  dueSoon: 1,
  completed: 2,
  upcoming: 3,
};

export function TimelineChart({
  schedule,
  birthDate,
  onSelectVaccine,
}: {
  schedule: DoseSchedule[];
  birthDate: string;
  onSelectVaccine: (vaccineId: string) => void;
}) {
  const headerScrollRef = useRef<ScrollView>(null);

  const { columns, rows, currentCol } = useMemo(() => {
    const ageSet = new Set<number>();
    const rowMap = new Map<string, VaccineRow>();

    for (const item of schedule) {
      const age = item.dose.recommendedAgeMonths;
      ageSet.add(age);
      let row = rowMap.get(item.vaccine.id);
      if (!row) {
        row = {
          vaccineId: item.vaccine.id,
          abbreviation: item.vaccine.abbreviation,
          completed: 0,
          total: 0,
          minAge: age,
          cells: {},
        };
        rowMap.set(item.vaccine.id, row);
      }
      row.total += 1;
      if (item.status === 'completed') row.completed += 1;
      row.minAge = Math.min(row.minAge, age);

      const planned = !item.record && !!item.plannedDate;
      const existing = row.cells[age];
      if (!existing) {
        row.cells[age] = { status: item.status, planned, count: 1 };
      } else {
        existing.count += 1;
        existing.planned = existing.planned || planned;
        if (STATUS_RANK[item.status] < STATUS_RANK[existing.status]) {
          existing.status = item.status;
        }
      }
    }

    const columns = Array.from(ageSet).sort((a, b) => a - b);
    const rows = Array.from(rowMap.values()).sort(
      (a, b) => a.minAge - b.minAge || a.abbreviation.localeCompare(b.abbreviation)
    );

    const currentAge = ageInMonths(parseISO(birthDate));
    let currentCol = -1;
    columns.forEach((age, i) => {
      if (age <= currentAge) currentCol = i;
    });

    return { columns, rows, currentCol };
  }, [schedule, birthDate]);

  // Mirror the body's horizontal scroll onto the (non-interactive) age header.
  const onBodyScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    headerScrollRef.current?.scrollTo({ x: e.nativeEvent.contentOffset.x, animated: false });
  };

  return (
    <View style={styles.wrap}>
      {/* Sticky top: corner + horizontally-mirrored age header */}
      <View style={styles.topRow}>
        <View style={[styles.corner, { width: LEFT_W, height: HEADER_H }]}>
          <Text style={styles.cornerText}>Vaccine</Text>
        </View>
        <ScrollView
          ref={headerScrollRef}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={[styles.headerRow, { height: HEADER_H }]}>
            {columns.map((age, i) => {
              const isNow = i === currentCol;
              const isPast = i < currentCol;
              return (
                <View key={age} style={[styles.headerCell, { width: COL_W }, isNow && styles.nowBand]}>
                  <Text
                    style={[
                      styles.headerText,
                      isPast && styles.headerTextPast,
                      isNow && styles.headerTextNow,
                    ]}
                  >
                    {ageLabel(age)}
                  </Text>
                  {isNow ? <Text style={styles.nowTag}>now</Text> : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Body: vertical scroll; labels frozen at left, cells scroll horizontally */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {/* Frozen vaccine-name column */}
          <View style={{ width: LEFT_W }}>
            {rows.map((row, i) => (
              <Pressable
                key={row.vaccineId}
                onPress={() => onSelectVaccine(row.vaccineId)}
                style={[styles.labelCell, { height: ROW_H }, i % 2 === 1 && styles.stripe]}
              >
                <Text style={styles.labelAbbr} numberOfLines={1}>
                  {row.abbreviation}
                </Text>
                <Text style={styles.labelProgress}>
                  {row.completed}/{row.total} doses
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Scrollable cells */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            scrollEventThrottle={16}
            onScroll={onBodyScroll}
            style={{ flex: 1 }}
          >
            <View>
              {rows.map((row, ri) => (
                <View key={row.vaccineId} style={[styles.bodyRow, { height: ROW_H }, ri % 2 === 1 && styles.stripe]}>
                  {columns.map((age, ci) => {
                    const cell = row.cells[age];
                    return (
                      <View key={age} style={[styles.cell, { width: COL_W }, ci === currentCol && styles.nowBand]}>
                        {cell ? (
                          <Pressable onPress={() => onSelectVaccine(row.vaccineId)}>
                            <Marker cell={cell} />
                          </Pressable>
                        ) : (
                          <View style={styles.emptyDot} />
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <Legend />
    </View>
  );
}

function Marker({ cell }: { cell: Cell }) {
  const meta = STATUS_META[cell.status];
  const color = cell.planned ? colors.primary : meta.color;
  const filled = cell.status !== 'upcoming' || cell.planned;
  const icon = cell.planned
    ? 'calendar'
    : cell.status === 'completed'
    ? 'checkmark'
    : cell.status === 'overdue'
    ? 'alert'
    : null;

  return (
    <View
      style={[
        styles.marker,
        filled ? { backgroundColor: color } : { borderColor: color, borderWidth: 2 },
      ]}
    >
      {icon ? (
        <Ionicons name={icon as any} size={13} color={colors.white} />
      ) : (
        <View style={[styles.markerInnerDot, { backgroundColor: color }]} />
      )}
      {cell.count > 1 ? (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{cell.count}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Legend() {
  const items: { label: string; color: string; icon?: string; hollow?: boolean }[] = [
    { label: 'Given', color: colors.completed, icon: 'checkmark' },
    { label: 'Due soon', color: colors.dueSoon },
    { label: 'Overdue', color: colors.overdue, icon: 'alert' },
    { label: 'Upcoming', color: colors.upcoming, hollow: true },
    { label: 'Booked', color: colors.primary, icon: 'calendar' },
  ];
  return (
    <View style={styles.legend}>
      {items.map((it) => (
        <View key={it.label} style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              it.hollow ? { borderColor: it.color, borderWidth: 2 } : { backgroundColor: it.color },
            ]}
          >
            {it.icon && !it.hollow ? <Ionicons name={it.icon as any} size={9} color={colors.white} /> : null}
          </View>
          <Text style={styles.legendLabel}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },

  topRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  corner: { justifyContent: 'flex-end', paddingBottom: spacing.sm, paddingLeft: 2, borderRightWidth: 1, borderRightColor: colors.border },
  cornerText: { ...typography.tiny, textTransform: 'uppercase', letterSpacing: 0.5, color: colors.textMuted },

  headerRow: { flexDirection: 'row' },
  headerCell: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: spacing.sm },
  headerText: { ...typography.small, fontWeight: '700', color: colors.text },
  headerTextPast: { color: colors.textFaint },
  headerTextNow: { color: colors.primaryDark },
  nowTag: { fontSize: 9, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  nowBand: { backgroundColor: colors.primaryTint },

  body: { flex: 1 },
  labelCell: { justifyContent: 'center', paddingLeft: 2, paddingRight: spacing.sm, borderRightWidth: 1, borderRightColor: colors.border },
  labelAbbr: { ...typography.bodyStrong, fontSize: 14 },
  labelProgress: { fontSize: 10, color: colors.textMuted, marginTop: 1 },

  bodyRow: { flexDirection: 'row' },
  stripe: { backgroundColor: 'rgba(14,124,134,0.035)' },
  cell: { alignItems: 'center', justifyContent: 'center' },
  emptyDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border },

  marker: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  markerInnerDot: { width: 8, height: 8, borderRadius: 4 },
  countBadge: {
    position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15, borderRadius: 8,
    backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  countText: { color: colors.white, fontSize: 9, fontWeight: '800' },

  legend: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xs,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  legendLabel: { ...typography.small, color: colors.textMuted },
});
