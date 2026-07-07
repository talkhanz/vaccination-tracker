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
import { exportBackup, pickBackup } from '../logic/backup';

/** Cross-platform alert: native uses Alert, web uses window.alert. */
function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    (globalThis as any).alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

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
  const {
    child,
    children,
    settings,
    saveSettings,
    allSchedules,
    buildBackupData,
    restoreFromBackup,
    resetEverything,
  } = useApp();
  if (!child) return null;

  const reminderEntries = allSchedules.map((s) => ({ childName: s.child.name, schedule: s.schedule }));

  const handleExport = async () => {
    try {
      const result = await exportBackup(buildBackupData());
      if (result === 'unavailable') {
        notify('Sharing unavailable', 'Saving files is not available on this device.');
      } else if (result === 'downloaded') {
        notify('Backup downloaded', 'Your backup file has been saved.');
      }
      // On native, the share sheet appearing is confirmation enough.
    } catch {
      notify('Export failed', 'Something went wrong creating the backup. Please try again.');
    }
  };

  const doImport = async () => {
    try {
      const data = await pickBackup();
      if (!data) return; // cancelled
      await restoreFromBackup(data);
      notify('Restore complete', `Loaded ${data.records.length} dose record${data.records.length === 1 ? '' : 's'}.`);
    } catch (e: any) {
      notify('Could not restore', e?.message ?? 'The file could not be read.');
    }
  };

  const handleImport = () => {
    const warning =
      'Restoring will replace every child and all records on this device with the backup. Continue?';
    if (Platform.OS === 'web') {
      if ((globalThis as any).confirm(warning)) doImport();
    } else {
      Alert.alert('Restore from backup?', warning, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive', onPress: doImport },
      ]);
    }
  };

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
      await rescheduleReminders(reminderEntries, settings.reminderLeadDays);
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
        'This permanently removes every child and all recorded doses on this device. This cannot be undone.',
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

        <Text style={styles.groupLabel}>Children</Text>
        <Card style={styles.card}>
          <Row
            icon="people-outline"
            title="Manage children"
            subtitle={`${children.length} ${children.length === 1 ? 'child' : 'children'} · switch or add`}
            onPress={() => navigation.navigate('Children')}
          />
        </Card>

        <Text style={styles.groupLabel}>{child.name}</Text>
        <Card style={styles.card}>
          <Row
            icon="person-circle-outline"
            title="Profile"
            subtitle={`Born ${formatDate(parseISO(child.birthDate))} · ${formatAge(parseISO(child.birthDate))}`}
            onPress={() => navigation.navigate('EditChild')}
          />
          <View style={styles.sep} />
          <Row
            icon="medkit-outline"
            title="Vaccines tracked"
            subtitle={`Choose which vaccines apply to ${child.name}`}
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
            icon="document-text-outline"
            title="Terms of Use"
            subtitle="How to use Vaccinator responsibly"
            onPress={() => navigation.navigate('Terms')}
          />
          <View style={styles.sep} />
          <Row
            icon="lock-closed-outline"
            title="Privacy Policy"
            subtitle="What we store and how it stays private"
            onPress={() => navigation.navigate('Privacy')}
          />
          <View style={styles.sep} />
          <Row
            icon="shield-checkmark-outline"
            title="Your data is private"
            subtitle="Everything is stored only on this device"
          />
        </Card>

        <Text style={styles.groupLabel}>Backup &amp; restore</Text>
        <Card style={styles.card}>
          <Row
            icon="cloud-upload-outline"
            title="Export a backup"
            subtitle="Save all records to a file you control"
            onPress={handleExport}
          />
          <View style={styles.sep} />
          <Row
            icon="cloud-download-outline"
            title="Restore from a backup"
            subtitle="Replace this device's data with a backup file"
            onPress={handleImport}
          />
        </Card>
        <Text style={styles.helpNote}>
          Your data lives only on this device. Export a backup regularly and keep
          it somewhere safe (Files, iCloud/Drive, email) so records survive
          reinstalling the app or switching phones.
        </Text>

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
  helpNote: { ...typography.small, color: colors.textFaint, marginTop: spacing.sm, marginHorizontal: 4, lineHeight: 18 },
  disclaimer: { ...typography.small, color: colors.textFaint, marginTop: spacing.xl, lineHeight: 18, textAlign: 'center' },
});
