import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { RootStackParamList } from '../navigation/types';
import { CDC_SCHEDULE } from '../data/schedule';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Button, Card, STATUS_META } from '../components/ui';
import { formatDate, formatRelative, parseISO } from '../logic/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'VaccineDetail'>;

export function VaccineDetailScreen({ route, navigation }: Props) {
  const { vaccineId } = route.params;
  const { schedule } = useApp();
  const vaccine = CDC_SCHEDULE.find((v) => v.id === vaccineId);
  if (!vaccine) return null;

  const doses = schedule
    .filter((s) => s.vaccine.id === vaccineId)
    .sort((a, b) => a.dose.doseNumber - b.dose.doseNumber);

  const completed = doses.filter((d) => d.status === 'completed').length;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.abbr}>{vaccine.abbreviation}</Text>
        <Text style={styles.name}>{vaccine.name}</Text>
        <Text style={styles.protects}>Protects against {vaccine.diseasesPrevented}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>{completed}/{doses.length}</Text>
            <Text style={styles.summaryLabel}>doses recorded</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>{vaccine.routineDoseCount}</Text>
            <Text style={styles.summaryLabel}>in routine series</Text>
          </View>
        </View>

        {vaccine.notes ? (
          <Card style={{ marginTop: spacing.lg }}>
            <View style={styles.notesHead}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={styles.notesTitle}>About this series</Text>
            </View>
            <Text style={styles.notesBody}>{vaccine.notes}</Text>
          </Card>
        ) : null}

        <Text style={styles.sectionLabel}>Doses</Text>
        {doses.map((item) => {
          const meta = STATUS_META[item.status];
          const done = item.status === 'completed';
          return (
            <Card key={item.dose.doseNumber} style={{ marginBottom: spacing.md }}>
              <View style={styles.doseHead}>
                <View style={[styles.doseIcon, { backgroundColor: meta.tint }]}>
                  <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doseTitle}>{item.dose.label}</Text>
                  <Text style={styles.doseRange}>Recommended at {item.dose.rangeLabel}</Text>
                </View>
                <Text style={[styles.doseStatus, { color: meta.color }]}>{meta.label}</Text>
              </View>

              <Text style={styles.doseWhen}>
                {done && item.record
                  ? `Given ${formatDate(parseISO(item.record.dateAdministered))}` +
                    (item.record.provider ? ` · ${item.record.provider}` : '')
                  : `${item.status === 'overdue' ? 'Was due' : 'Due'} ${formatRelative(item.dueDate)} (${formatDate(item.dueDate)})`}
              </Text>

              {!done && item.plannedDate ? (
                <View style={styles.bookedRow}>
                  <Ionicons name="calendar" size={14} color={colors.primary} />
                  <Text style={styles.bookedText}>
                    Appointment booked for {formatDate(item.plannedDate)}
                  </Text>
                </View>
              ) : null}

              {item.dose.notes ? <Text style={styles.doseNote}>{item.dose.notes}</Text> : null}

              <View style={{ marginTop: spacing.md }}>
                {done ? (
                  <Button
                    title="Edit record"
                    variant="secondary"
                    onPress={() =>
                      navigation.navigate('RecordDose', {
                        vaccineId: vaccine.id,
                        doseNumber: item.dose.doseNumber,
                        recordId: item.record!.id,
                      })
                    }
                  />
                ) : (
                  <View style={styles.doseActions}>
                    <Button
                      title="Mark as given"
                      icon={<Ionicons name="checkmark" size={18} color={colors.white} />}
                      onPress={() =>
                        navigation.navigate('RecordDose', {
                          vaccineId: vaccine.id,
                          doseNumber: item.dose.doseNumber,
                        })
                      }
                      style={{ flex: 1 }}
                    />
                    <Button
                      title={item.plannedDate ? 'Edit date' : 'Plan'}
                      variant="secondary"
                      icon={<Ionicons name="calendar-outline" size={18} color={colors.primaryDark} />}
                      onPress={() =>
                        navigation.navigate('PlanDose', {
                          vaccineId: vaccine.id,
                          doseNumber: item.dose.doseNumber,
                        })
                      }
                    />
                  </View>
                )}
              </View>
            </Card>
          );
        })}

        <Button
          title="Read more on CDC.gov"
          variant="ghost"
          icon={<Ionicons name="open-outline" size={18} color={colors.primary} />}
          onPress={() => Linking.openURL(vaccine.cdcUrl)}
          style={{ marginTop: spacing.sm }}
        />
        <Text style={styles.disclaimer}>
          Recommended dates are estimated from your child's date of birth and the
          CDC schedule. Your pediatrician may adjust timing for your child.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  abbr: { ...typography.small, color: colors.primary, fontWeight: '800', letterSpacing: 0.5 },
  name: { ...typography.h1, fontSize: 26, marginTop: 2 },
  protects: { ...typography.body, color: colors.textMuted, marginTop: 4 },

  summaryRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  summaryChip: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center',
  },
  summaryValue: { ...typography.h2 },
  summaryLabel: { ...typography.small, marginTop: 2 },

  notesHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  notesTitle: { ...typography.bodyStrong },
  notesBody: { ...typography.small, lineHeight: 20, color: colors.textMuted },

  sectionLabel: { ...typography.h3, fontSize: 16, marginTop: spacing.xl, marginBottom: spacing.md },

  doseHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  doseIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  doseTitle: { ...typography.bodyStrong },
  doseRange: { ...typography.small, marginTop: 2 },
  doseStatus: { fontSize: 12, fontWeight: '800' },
  doseWhen: { ...typography.small, color: colors.text, marginTop: spacing.md },
  doseNote: { ...typography.small, color: colors.textMuted, marginTop: 6, lineHeight: 18, fontStyle: 'italic' },
  doseActions: { flexDirection: 'row', gap: spacing.sm },
  bookedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  bookedText: { ...typography.small, color: colors.primary, fontWeight: '600' },

  disclaimer: { ...typography.small, color: colors.textFaint, marginTop: spacing.md, textAlign: 'center', lineHeight: 18 },
});
