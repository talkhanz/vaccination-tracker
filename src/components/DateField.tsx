// A date input that works on both native and web. On a device it opens the
// native date picker; on web (used for previewing) it falls back to a simple,
// validated yyyy-mm-dd text field. Loading the native picker lazily avoids
// pulling a native-only module into the web bundle.

import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/theme';
import { formatDate, parseISO, toISODate } from '../logic/dates';

interface Props {
  label: string;
  value: string; // ISO yyyy-mm-dd, or '' when unset
  onChange: (iso: string) => void;
  maximumDate?: Date;
  minimumDate?: Date;
}

function isValidISO(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseISO(s);
  return !isNaN(d.getTime()) && toISODate(d) === s;
}

export function DateField({ label, value, onChange, maximumDate, minimumDate }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const display = value && isValidISO(value) ? formatDate(parseISO(value)) : 'Tap to choose';

  // --- Web / fallback editor -------------------------------------------------
  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrap}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.field}>
          <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.webInput}
            value={value}
            onChangeText={(t) => {
              onChange(t);
            }}
            placeholder="yyyy-mm-dd"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
          />
        </View>
        {value.length > 0 && !isValidISO(value) ? (
          <Text style={styles.error}>Enter a date as yyyy-mm-dd</Text>
        ) : null}
      </View>
    );
  }

  // --- Native picker ---------------------------------------------------------
  const openPicker = () => {
    setDraft(value || toISODate(new Date()));
    setOpen(true);
  };

  const DateTimePicker = open
    ? require('@react-native-community/datetimepicker').default
    : null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={openPicker}>
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.value, !value && styles.placeholder]}>{display}</Text>
      </Pressable>
      {open && DateTimePicker ? (
        <DateTimePicker
          value={draft && isValidISO(draft) ? parseISO(draft) : new Date()}
          mode="date"
          display="spinner"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(event: any, selected?: Date) => {
            setOpen(Platform.OS === 'ios');
            if (event.type === 'dismissed') {
              setOpen(false);
              return;
            }
            if (selected) onChange(toISODate(selected));
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { ...typography.small, fontWeight: '600', marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  value: { ...typography.body, flex: 1 },
  webInput: { ...typography.body, flex: 1, outlineStyle: 'none' as any, paddingVertical: 0 },
  placeholder: { color: colors.textFaint },
  error: { ...typography.small, color: colors.overdue, marginTop: 4 },
});
