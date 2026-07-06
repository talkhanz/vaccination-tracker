import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { RootStackParamList } from '../navigation/types';
import { CDC_SCHEDULE } from '../data/schedule';
import { doseKey } from '../logic/scheduling';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Button, Card } from '../components/ui';
import { DateField } from '../components/DateField';
import { addMonths, formatDate, parseISO, toISODate } from '../logic/dates';
import { isValidISODate } from '../logic/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanDose'>;

export function PlanDoseScreen({ route, navigation }: Props) {
  const { vaccineId, doseNumber } = route.params;
  const { child, plannedDates, setPlannedDate } = useApp();
  const vaccine = CDC_SCHEDULE.find((v) => v.id === vaccineId);
  const dose = vaccine?.doses.find((d) => d.doseNumber === doseNumber);
  if (!child || !vaccine || !dose) return null;

  const existing = plannedDates[doseKey(vaccineId, doseNumber)];
  const dueDate = addMonths(parseISO(child.birthDate), dose.recommendedAgeMonths);
  const [date, setDate] = useState(existing ?? toISODate(dueDate));

  const dateOk = isValidISODate(date);

  const save = async () => {
    if (!dateOk) return;
    await setPlannedDate(vaccineId, doseNumber, date);
    navigation.goBack();
  };
  const clear = async () => {
    await setPlannedDate(vaccineId, doseNumber, null);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{vaccine.name}</Text>
            <Text style={styles.sub}>{dose.label} · recommended at {dose.rangeLabel}</Text>
          </View>
        </Card>

        <View style={styles.hintRow}>
          <Ionicons name="bulb-outline" size={16} color={colors.textMuted} />
          <Text style={styles.hint}>
            Recommended around {formatDate(dueDate)}. Pick the date of your child's
            appointment — it'll appear on the timeline and drive reminders.
          </Text>
        </View>

        <DateField
          label="Appointment date"
          value={date}
          onChange={setDate}
          minimumDate={parseISO(child.birthDate)}
        />

        <Button
          title={existing ? 'Update appointment' : 'Book appointment'}
          onPress={save}
          disabled={!dateOk}
          icon={<Ionicons name="checkmark" size={18} color={colors.white} />}
        />
        {existing ? (
          <Button
            title="Remove planned date"
            variant="ghost"
            onPress={clear}
            style={{ marginTop: spacing.sm }}
            icon={<Ionicons name="close" size={18} color={colors.textMuted} />}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  iconWrap: {
    width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primaryTint,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...typography.h3 },
  sub: { ...typography.small, marginTop: 2 },
  hintRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, paddingRight: spacing.sm },
  hint: { ...typography.small, flex: 1, lineHeight: 18 },
});
