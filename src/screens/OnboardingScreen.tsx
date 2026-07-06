import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { ChildForm } from '../components/ChildForm';
import { Card } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme/theme';

export function OnboardingScreen() {
  const { saveChild } = useApp();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <Ionicons name="shield-checkmark" size={34} color={colors.white} />
          </View>
          <Text style={styles.title}>Welcome to Vaccinator</Text>
          <Text style={styles.subtitle}>
            Keep your child's immunizations organized — see what's done, what's
            coming up, and what's overdue, all based on the CDC schedule.
          </Text>

          <Card style={{ marginTop: spacing.xl }}>
            <Text style={styles.cardTitle}>Let's set up your child's profile</Text>
            <View style={{ height: spacing.md }} />
            <ChildForm submitLabel="Get started" onSubmit={saveChild} />
          </Card>

          <Text style={styles.disclaimer}>
            Vaccinator is an informational tool and not a substitute for your
            pediatrician's advice. Your data stays private on this device.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  cardTitle: { ...typography.h3 },
  disclaimer: {
    ...typography.small,
    color: colors.textFaint,
    marginTop: spacing.xl,
    textAlign: 'center',
    lineHeight: 18,
  },
});
