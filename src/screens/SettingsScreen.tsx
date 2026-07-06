import React from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Card } from '../components/ui';
import { formatAge, formatDate, parseISO } from '../logic/dates';
import { cancelAllReminders, requestPermission, rescheduleReminders } from '../logic/notifications';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

function Row({
  icon,
  title,
  subtitle,
  onPress,
  right,
  danger,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  const color = danger ? colors.overdue : colors.text;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? { opacity: 0.6 } : null]}
    >
      <View style={[styles.rowIcon, danger && { backgroundColor: colors.overdueTint }]}>
        <Ionicons name={icon as any} size={18} color={danger ? colors.overdue : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color }]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textFaint} /> : null)}
    </Pressable>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const { child, settings, saveSettings, schedule, resetEverything } = useApp();
  if (!child) return null;

  const toggleReminders = async (value: boolean) => {
    if (value) {
      const ok = await requestPermission();
      if (!ok && Platform.OS !== 'web') {
        Alert.alert(
          'Notifications are off',
          'To get reminders, enable notifications for Vaccinator in your device settings.'
        );
      }
      await saveSettings({ ...settings, remindersEnabled: true });
      await rescheduleReminders(child.name, schedule, settings.reminderLeadDays);
    } else {
      await saveSettings({ ...settings, remindersEnabled: false });
      await cancelAllReminders();
    }
  };

  const confirmReset = () => {
    const doReset = async () => {
      await resetEverything();
      await cancelAllReminders();
    };
    if (Platform.OS === 'web') {
      doReset();
    } else {
      Alert.alert(
        'Delete all data?',
        'This permanently removes the profile and all recorded doses on this device. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doReset },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.groupLabel}>Profile</Text>
        <Card style={styles.card}>
          <Row
            icon="person-circle-outline"
            title={child.name}
            subtitle={`Born ${formatDate(parseISO(child.birthDate))} · ${formatAge(parseISO(child.birthDate))}`}
            onPress={() => navigation.navigate('EditChild')}
          />
          <View style={styles.sep} />
          <Row
            icon="medkit-outline"
            title="Vaccines tracked"
            subtitle="Choose which vaccines apply to your child"
            onPress={() => navigation.navigate('ManageVaccines')}
          />
        </Card>

        <Text style={styles.groupLabel}>Reminders</Text>
        <Card style={styles.card}>
          <Row
            icon="notifications-outline"
            title="Due-date reminders"
            subtitle={
              Platform.OS === 'web'
                ? 'Available on the mobile app'
                : `Notify me ${settings.reminderLeadDays} days before a dose is due`
            }
            right={
              <Switch
                value={settings.remindersEnabled}
                onValueChange={toggleReminders}
                trackColor={{ true: colors.primary }}
                disabled={Platform.OS === 'web'}
              />
            }
          />
        </Card>

        <Text style={styles.groupLabel}>About</Text>
        <Card style={styles.card}>
          <Row
            icon="globe-outline"
            title="CDC immunization schedules"
            subtitle="cdc.gov/vaccines/schedules"
            onPress={() =>
              Linking.openURL('https://www.cdc.gov/vaccines/hcp/imz-schedules/child-adolescent-age.html')
            }
          />
          <View style={styles.sep} />
          <Row
            icon="shield-checkmark-outline"
            title="Your data is private"
            subtitle="Everything is stored only on this device"
          />
        </Card>

        <Text style={styles.groupLabel}>Data</Text>
        <Card style={styles.card}>
          <Row
            icon="trash-outline"
            title="Delete all data"
            subtitle="Remove the profile and all records"
            onPress={confirmReset}
            danger
          />
        </Card>

        <Text style={styles.disclaimer}>
          Vaccinator is for informational and organizational purposes only and is
          not medical advice. Schedules are estimates based on the CDC childhood
          immunization schedule; always confirm with your child's pediatrician.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.lg },
  groupLabel: {
    ...typography.tiny, textTransform: 'uppercase', letterSpacing: 0.6,
    color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: 4,
  },
  card: { paddingVertical: spacing.xs },
  rowText: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  rowIcon: {
    width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primaryTint,
    alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { ...typography.bodyStrong },
  rowSub: { ...typography.small, marginTop: 2 },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: 48 },
  disclaimer: { ...typography.small, color: colors.textFaint, marginTop: spacing.xl, lineHeight: 18, textAlign: 'center' },
});
