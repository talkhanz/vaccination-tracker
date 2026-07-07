import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PolicyDocument } from '../components/PolicyDocument';
import { colors, spacing, typography } from '../theme/theme';
import {
  PRIVACY_INTRO,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
  PRIVACY_VERSION,
} from '../data/privacy';

export function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PolicyDocument
          title="Privacy Policy"
          lastUpdated={PRIVACY_LAST_UPDATED}
          intro={PRIVACY_INTRO}
          sections={PRIVACY_SECTIONS}
        />
        <Text style={styles.version}>Version {PRIVACY_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  version: { ...typography.small, color: colors.textFaint, marginTop: spacing.xl, textAlign: 'center' },
});
