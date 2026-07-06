// Reusable UI primitives shared across screens, so spacing, radii, and status
// colors stay consistent everywhere.

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../theme/theme';
import { DoseStatus } from '../logic/scheduling';

export interface StatusMeta {
  label: string;
  color: string;
  tint: string;
  icon: string; // Ionicons name
}

export const STATUS_META: Record<DoseStatus, StatusMeta> = {
  overdue: { label: 'Overdue', color: colors.overdue, tint: colors.overdueTint, icon: 'alert-circle' },
  dueSoon: { label: 'Due soon', color: colors.dueSoon, tint: colors.dueSoonTint, icon: 'time' },
  upcoming: { label: 'Upcoming', color: colors.upcoming, tint: colors.upcomingTint, icon: 'calendar-outline' },
  completed: { label: 'Done', color: colors.completed, tint: colors.completedTint, icon: 'checkmark-circle' },
};

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function StatusPill({ status }: { status: DoseStatus }) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.pill, { backgroundColor: meta.tint }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.pillText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

export function ProgressBar({
  pct,
  color = colors.primary,
  height = 8,
}: {
  pct: number;
  color?: string;
  height?: number;
}) {
  return (
    <View style={[styles.progressTrack, { height, borderRadius: height }]}>
      <View
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height,
          borderRadius: height,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const bg =
    variant === 'ghost'
      ? 'transparent'
      : variant === 'secondary'
      ? colors.primaryTint
      : isDanger
      ? colors.overdueTint
      : colors.primary;
  const fg =
    isPrimary
      ? colors.white
      : isDanger
      ? colors.overdue
      : variant === 'ghost'
      ? colors.textMuted
      : colors.primaryDark;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  pillText: { fontSize: 12, fontWeight: '700' },
  progressTrack: {
    backgroundColor: colors.border,
    overflow: 'hidden',
    width: '100%',
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h3, fontSize: 18 },
});
