// Shared form for creating or editing the child. Used by onboarding and the
// edit screen so validation and layout stay identical.

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Child } from '../data/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { isValidBirthDate } from '../logic/validation';
import { DateField } from './DateField';
import { TextField } from './TextField';
import { Button } from './ui';
import { makeId } from '../storage/store';

type Sex = NonNullable<Child['sex']>;

export function ChildForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Child;
  submitLabel: string;
  onSubmit: (child: Child) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [sex, setSex] = useState<Sex>(initial?.sex ?? 'unspecified');

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
});
