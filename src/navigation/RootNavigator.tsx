import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from './types';
import { useApp } from '../state/AppContext';
import { colors } from '../theme/theme';
import { rescheduleReminders } from '../logic/notifications';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { TermsGate, TermsScreen } from '../screens/TermsScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { VaccineDetailScreen } from '../screens/VaccineDetailScreen';
import { RecordDoseScreen } from '../screens/RecordDoseScreen';
import { PlanDoseScreen } from '../screens/PlanDoseScreen';
import { EditChildScreen } from '../screens/EditChildScreen';
import { ChildrenScreen } from '../screens/ChildrenScreen';
import { ManageVaccinesScreen } from '../screens/ManageVaccinesScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

const TAB_ICONS: Record<keyof TabParamList, [string, string]> = {
  Home: ['home', 'home-outline'],
  Schedule: ['calendar', 'calendar-outline'],
  Timeline: ['git-commit', 'git-commit-outline'],
  History: ['reader', 'reader-outline'],
  Settings: ['settings', 'settings-outline'],
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.surface },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return (
            <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Timeline" component={TimelineScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { loading, termsAccepted, child, settings, allSchedules } = useApp();

  // Keep reminders in sync with every child's schedule when they're enabled.
  useEffect(() => {
    if (settings.remindersEnabled && allSchedules.length > 0) {
      rescheduleReminders(
        allSchedules.map((s) => ({ childName: s.child.name, schedule: s.schedule })),
        settings.reminderLeadDays
      );
    }
  }, [settings.remindersEnabled, settings.reminderLeadDays, allSchedules]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {!termsAccepted ? (
        <TermsGate />
      ) : !child ? (
        <OnboardingScreen />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="VaccineDetail"
            component={VaccineDetailScreen}
            options={{ title: 'Vaccine', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="RecordDose"
            component={RecordDoseScreen}
            options={{ title: 'Record a dose', presentation: 'modal' }}
          />
          <Stack.Screen
            name="PlanDose"
            component={PlanDoseScreen}
            options={{ title: 'Plan appointment', presentation: 'modal' }}
          />
          <Stack.Screen name="EditChild" component={EditChildScreen} options={{ title: 'Edit profile' }} />
          <Stack.Screen
            name="Children"
            component={ChildrenScreen}
            options={{ title: 'Children', presentation: 'modal' }}
          />
          <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms of Use' }} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy Policy' }} />
          <Stack.Screen
            name="ManageVaccines"
            component={ManageVaccinesScreen}
            options={{ title: 'Vaccines tracked' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
