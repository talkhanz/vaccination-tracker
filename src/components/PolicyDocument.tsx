// Presentational renderer for a legal document (Terms of Use, Privacy Policy).
// Shared so both read identically.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/theme';

export interface PolicySection {
  heading: string;
  body: string[];
}

export function PolicyDocument({
  title,
  lastUpdated,
  intro,
  sections,
  logoIcon,
}: {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: PolicySection[];
  /** When set, shows a branded icon badge above the title. */
  logoIcon?: string;
}) {
  return (
    <>
      {logoIcon ? (
        <View style={styles.logoWrap}>
          <Ionicons name={logoIcon as any} size={30} color={colors.white} />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.updated}>Last updated {lastUpdated}</Text>
      <Text style={styles.intro}>{intro}</Text>

      {sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.heading}>{section.heading}</Text>
          {section.body.map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {p}
            </Text>
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  title: { ...typography.h1 },
  updated: { ...typography.small, color: colors.textFaint, marginTop: 2 },
  intro: { ...typography.body, color: colors.textMuted, marginTop: spacing.md, lineHeight: 22 },
  section: { marginTop: spacing.lg },
  heading: { ...typography.bodyStrong, marginBottom: spacing.xs },
  paragraph: { ...typography.small, color: colors.text, lineHeight: 20, marginTop: spacing.xs },
});
