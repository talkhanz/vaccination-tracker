// Shared form for creating or editing the child. Used by onboarding and the
// edit screen so validation and layout stay identical.

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Child } from '../data/types';
import { avatarColors, colors, radius, spacing, typography } from '../theme/theme';
import { isValidBirthDate } from '../logic/validation';
import { DateField } from './DateField';
import { TextField } from './TextField';
import { Button } from './ui';
import { makeId } from '../storage/store';

type Sex = NonNullable<Child['sex']>;

export function ChildForm({
  initial,
  submitLabel,
  defaultColor,
  onSubmit,
}: {
  initial?: Child;
  submitLabel: string;
  defaultColor?: string;
  onSubmit: (child: Child) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [sex, setSex] = useState<Sex>(initial?.sex ?? 'unspecified');
  const [color, setColor] = useState(initial?.color ?? defaultColor ?? avatarColors[0]);

  const nameOk = name.trim().length > 0;
  const dateOk = isValidBirthDate(birthDate);
  const canSubmit = nameOk && dateOk;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      id: initial?.id ?? makeId(),
      name: name.trim(),
      birthDate,
      sex,
      color,
    });
  };

  const sexOptions: { key: Sex; label: string }[] = [
    { key: 'female', label: 'Girl' },
    { key: 'male', label: 'Boy' },
    { key: 'unspecified', label: 'Prefer not to say' },
  ];

  return (
    <View>
      <TextField
        label="Child's name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Ava"
        autoFocus
      />
      <DateField
        label="Date of birth"
        value={birthDate}
        onChange={setBirthDate}
        maximumDate={new Date()}
      />

      <Text style={styles.label}>Sex (optional)</Text>
      <View style={styles.segment}>
        {sexOptions.map((o) => {
          const active = sex === o.key;
          return (
            <Text
              key={o.key}
              onPress={() => setSex(o.key)}
              style={[styles.segmentItem, active && styles.segmentItemActive]}
            >
              {o.label}
            </Text>
          );
        })}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.colorRow}>
        <View style={[styles.preview, { backgroundColor: color }]}>
          <Text style={styles.previewText}>{name.trim().charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.swatches}>
          {avatarColors.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]}
            >
              {color === c ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
            </Pressable>
          ))}
        </View>
      </View>

      <Button
        title={submitLabel}
        onPress={submit}
        disabled={!canSubmit}
        style={{ marginTop: spacing.md }}
      />
      {!dateOk && birthDate.length > 0 ? (
        <Text style={styles.hint}>Please enter a valid past date of birth.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.small, fontWeight: '600', marginBottom: 6 },
  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  segmentItem: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  segmentItemActive: {
    color: colors.primaryDark,
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  hint: { ...typography.small, color: colors.overdue, marginTop: spacing.sm, textAlign: 'center' },

  colorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  preview: {
    width: 48, height: 48, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  previewText: { color: colors.white, fontSize: 20, fontWeight: '700' },
  swatches: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: {
    width: 32, height: 32, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  swatchActive: { borderWidth: 3, borderColor: colors.text },
});
