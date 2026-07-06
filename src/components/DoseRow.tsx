// One row representing a single dose in the schedule. Reused on the dashboard,
// schedule, and vaccine-detail screens for visual consistency.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/theme';
import { DoseSchedule } from '../logic/scheduling';
import { formatDate, formatRelative, parseISO } from '../logic/dates';
import { STATUS_META } from './ui';

export function DoseRow({
  item,
  onPress,
  showVaccineName = true,
}: {
  item: DoseSchedule;
  onPress?: () => void;
  showVaccineName?: boolean;
}) {
  const meta = STATUS_META[item.status];
  const done = item.status === 'completed';

  const subtitle = done
    ? item.record
      ? `Given ${formatDate(parseISO(item.record.dateAdministered))}`
      : 'Recorded'
    : `Due ${formatRelative(item.dueDate)} · ${item.dose.rangeLabel}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.tint }]}>
        <Ionicons name={meta.icon as any} size={20} color={meta.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {showVaccineName ? `${item.vaccine.abbreviation} · ` : ''}
          {item.dose.label}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={[styles.pill, { backgroundColor: meta.tint }]}>
        <Text style={[styles.pillText, { color: meta.color }]}>{meta.label}</Text>
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  pressed: { opacity: 0.6 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: { ...typography.bodyStrong },
  subtitle: { ...typography.small, marginTop: 2 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pillText: { fontSize: 11, fontWeight: '700' },
});
