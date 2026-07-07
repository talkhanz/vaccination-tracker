import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Button } from '../components/ui';
import { PolicyDocument } from '../components/PolicyDocument';
import {
  TERMS_INTRO,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
  TERMS_VERSION,
} from '../data/terms';
import {
  PRIVACY_INTRO,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
} from '../data/privacy';

function TermsDoc({ logo }: { logo?: boolean }) {
  return (
    <PolicyDocument
      title="Terms of Use"
      lastUpdated={TERMS_LAST_UPDATED}
      intro={TERMS_INTRO}
      sections={TERMS_SECTIONS}
      logoIcon={logo ? 'document-text' : undefined}
    />
  );
}

/** The acceptance gate shown before the rest of the app is usable. */
export function TermsGate() {
  const { acceptPolicies } = useApp();
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TermsDoc logo />
        <Text style={styles.disclaimer}>
          Vaccinator is an informational tool, not medical advice. Please use it
          alongside — not instead of — your pediatrician's guidance.
        </Text>
        <Pressable onPress={() => setShowPrivacy(true)}>
          <Text style={styles.privacyLink}>View our Privacy Policy</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.checkRow}
          onPress={() => setAgreed((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
            {agreed ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
          </View>
          <Text style={styles.checkLabel}>
            I have read and agree to the Terms of Use and Privacy Policy, and
            understand this app does not provide medical advice.
          </Text>
        </Pressable>
        <Button
          title="Agree & Continue"
          onPress={acceptPolicies}
          disabled={!agreed}
          icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
        />
      </View>

      {/* Privacy Policy is reachable before acceptance via this modal. */}
      <Modal visible={showPrivacy} animationType="slide" onRequestClose={() => setShowPrivacy(false)}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.modalBar}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <Pressable onPress={() => setShowPrivacy(false)} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <PolicyDocument
              title="Privacy Policy"
              lastUpdated={PRIVACY_LAST_UPDATED}
              intro={PRIVACY_INTRO}
              sections={PRIVACY_SECTIONS}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/** Read-only view of the Terms, reachable from Settings after acceptance. */
export function TermsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TermsDoc />
        <Text style={styles.version}>Version {TERMS_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },

  disclaimer: {
    ...typography.small, color: colors.textFaint, marginTop: spacing.xl,
    lineHeight: 18, fontStyle: 'italic',
  },
  privacyLink: {
    ...typography.small, color: colors.primary, fontWeight: '700',
    marginTop: spacing.lg,
  },
  version: { ...typography.small, color: colors.textFaint, marginTop: spacing.xl, textAlign: 'center' },

  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  checkbox: {
    width: 24, height: 24, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { ...typography.small, flex: 1, lineHeight: 19, color: colors.text },

  modalBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.h3 },
});
