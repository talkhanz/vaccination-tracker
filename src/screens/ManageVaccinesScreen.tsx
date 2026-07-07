import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../state/AppContext';
import { CDC_SCHEDULE } from '../data/schedule';
import { VACCINE_META } from '../data/vaccineMeta';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Card } from '../components/ui';

export function ManageVaccinesScreen() {
  const { child, activeVaccineIds, saveChild } = useApp();
  const active = new Set(activeVaccineIds);
  if (!child) return null;

  const toggle = (id: string, value: boolean) => {
    const next = new Set(active);
    const group = VACCINE_META[id]?.group;
    if (value) {
      // Enabling a grouped vaccine disables its exclusive siblings.
      if (group) {
        for (const [otherId, meta] of Object.entries(VACCINE_META)) {
          if (meta.group === group && otherId !== id) next.delete(otherId);
        }
      }
      next.add(id);
    } else {
      next.delete(id);
    }
    saveChild({ ...child, activeVaccineIds: Array.from(next) });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Turn vaccines on or off to match what applies to {child.name}. Progress
          and reminders only count the vaccines you track here.
        </Text>
        <Card style={styles.card}>
          {CDC_SCHEDULE.map((v, i) => {
            const meta = VACCINE_META[v.id];
            return (
              <View key={v.id}>
                {i > 0 ? <View style={styles.sep} /> : null}
                <View style={styles.row}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{v.abbreviation}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{v.name}</Text>
                    <Text style={styles.hint}>{meta?.hint ?? v.diseasesPrevented}</Text>
                  </View>
                  <Switch
                    value={active.has(v.id)}
                    onValueChange={(val) => toggle(v.id, val)}
                    trackColor={{ true: colors.primary }}
                  />
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  intro: { ...typography.small, lineHeight: 20, marginBottom: spacing.lg },
  card: { paddingVertical: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: 56 },
  badge: {
    minWidth: 50, height: 38, borderRadius: radius.md, paddingHorizontal: 6,
    backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: colors.primaryDark },
  name: { ...typography.bodyStrong },
  hint: { ...typography.small, marginTop: 2 },
});
