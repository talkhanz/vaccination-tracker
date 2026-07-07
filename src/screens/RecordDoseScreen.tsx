import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { RootStackParamList } from '../navigation/types';
import { CDC_SCHEDULE } from '../data/schedule';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Button, Card } from '../components/ui';
import { DateField } from '../components/DateField';
import { TextField } from '../components/TextField';
import { makeId } from '../storage/store';
import { isValidDoseDate } from '../logic/validation';
import { toISODate } from '../logic/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'RecordDose'>;

export function RecordDoseScreen({ route, navigation }: Props) {
  const { child, records, activeVaccineIds, upsertRecord, deleteRecord } = useApp();
  const existing = route.params.recordId
    ? records.find((r) => r.id === route.params.recordId)
    : undefined;

  const [vaccineId, setVaccineId] = useState<string | undefined>(
    existing?.vaccineId ?? route.params.vaccineId
  );
  const [doseNumber, setDoseNumber] = useState<number | undefined>(
    existing?.doseNumber ?? route.params.doseNumber
  );
  const [date, setDate] = useState(existing?.dateAdministered ?? toISODate(new Date()));
  const [provider, setProvider] = useState(existing?.provider ?? '');
  const [lotNumber, setLotNumber] = useState(existing?.lotNumber ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const activeVaccines = useMemo(
    () => CDC_SCHEDULE.filter((v) => activeVaccineIds.includes(v.id)),
    [activeVaccineIds]
  );
  const vaccine = CDC_SCHEDULE.find((v) => v.id === vaccineId);

  const dateOk = child ? isValidDoseDate(date, child.birthDate) : false;
  const canSave = !!vaccineId && !!doseNumber && dateOk;

  const save = async () => {
    if (!canSave) return;
    await upsertRecord({
      id: existing?.id ?? makeId(),
      childId: existing?.childId ?? child?.id ?? '',
      vaccineId: vaccineId!,
      doseNumber: doseNumber!,
      dateAdministered: date,
      provider: provider.trim() || undefined,
      lotNumber: lotNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    navigation.goBack();
  };

  const remove = async () => {
    if (existing) {
      await deleteRecord(existing.id);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Vaccine selector (only when not preset) */}
          {route.params.vaccineId || existing ? (
            <Card style={styles.presetCard}>
              <Text style={styles.presetLabel}>Vaccine</Text>
              <Text style={styles.presetValue}>{vaccine?.name}</Text>
            </Card>
          ) : (
            <>
              <Text style={styles.label}>Choose a vaccine</Text>
              <View style={styles.chips}>
                {activeVaccines.map((v) => {
                  const active = v.id === vaccineId;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => {
                        setVaccineId(v.id);
                        setDoseNumber(undefined);
                      }}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {v.abbreviation}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Dose selector */}
          {vaccine ? (
            <>
              <Text style={[styles.label, { marginTop: spacing.md }]}>Which dose?</Text>
              <View style={styles.chips}>
                {vaccine.doses.map((d) => {
                  const active = d.doseNumber === doseNumber;
                  return (
                    <Pressable
                      key={d.doseNumber}
                      onPress={() => setDoseNumber(d.doseNumber)}
                      style={[styles.doseChip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {d.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <View style={{ height: spacing.lg }} />

          <DateField
            label="Date given"
            value={date}
            onChange={setDate}
            maximumDate={new Date()}
          />
          {!dateOk && date.length > 0 ? (
            <Text style={styles.error}>
              Date must be after the birth date and not in the future.
            </Text>
          ) : null}

          <TextField
            label="Provider / clinic (optional)"
            value={provider}
            onChangeText={setProvider}
            placeholder="e.g. Dr. Lee, City Pediatrics"
          />
          <TextField
            label="Lot number (optional)"
            value={lotNumber}
            onChangeText={setLotNumber}
            placeholder="From the vaccine record"
          />
          <TextField
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any reactions or details"
            multiline
          />

          <Button
            title={existing ? 'Save changes' : 'Save dose'}
            onPress={save}
            disabled={!canSave}
            style={{ marginTop: spacing.sm }}
          />
          {existing ? (
            <Button
              title="Delete this record"
              variant="danger"
              onPress={remove}
              style={{ marginTop: spacing.md }}
              icon={<Ionicons name="trash-outline" size={18} color={colors.overdue} />}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { ...typography.small, fontWeight: '600', marginBottom: spacing.sm },
  presetCard: { marginBottom: spacing.lg },
  presetLabel: { ...typography.small, fontWeight: '600' },
  presetValue: { ...typography.h3, marginTop: 4 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  doseChip: {
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primaryTint, borderColor: colors.primary },
  chipText: { ...typography.small, fontWeight: '700', color: colors.textMuted },
  chipTextActive: { color: colors.primaryDark },

  error: { ...typography.small, color: colors.overdue, marginTop: -spacing.sm, marginBottom: spacing.md },
});
