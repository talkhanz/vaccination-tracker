import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { Child } from '../data/types';
import { ChildForm } from '../components/ChildForm';
import { Button, Card } from '../components/ui';
import { childColor, suggestColor } from '../logic/avatar';
import { formatAge, parseISO } from '../logic/dates';
import { colors, radius, spacing, typography } from '../theme/theme';

export function OnboardingScreen() {
  const { addChildren } = useApp();
  // Children are staged locally so a parent can add several before entering the app.
  const [staged, setStaged] = useState<Child[]>([]);
  const [mode, setMode] = useState<'form' | 'review'>('form');

  const addToStaged = (child: Child) => {
    setStaged((prev) => [...prev, child]);
    setMode('review');
  };
  const removeStaged = (id: string) => {
    setStaged((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) setMode('form');
      return next;
    });
  };

  // ---- Form step (first child, or "add another") ---------------------------
  if (mode === 'form') {
    const first = staged.length === 0;
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {first ? (
              <>
                <View style={styles.logoWrap}>
                  <Ionicons name="shield-checkmark" size={34} color={colors.white} />
                </View>
                <Text style={styles.title}>Welcome to Vaccinator</Text>
                <Text style={styles.subtitle}>
                  Keep your children's immunizations organized — see what's done,
                  what's coming up, and what's overdue, based on the CDC schedule.
                </Text>
              </>
            ) : (
              <View style={styles.addHeader}>
                <Text style={styles.title}>Add another child</Text>
                {staged.length > 0 ? (
                  <Pressable onPress={() => setMode('review')} hitSlop={8}>
                    <Text style={styles.cancel}>Cancel</Text>
                  </Pressable>
                ) : null}
              </View>
            )}

            <Card style={{ marginTop: spacing.lg }}>
              <Text style={styles.cardTitle}>
                {first ? "Set up your first child's profile" : 'New child profile'}
              </Text>
              <View style={{ height: spacing.md }} />
              <ChildForm
                submitLabel="Add child"
                defaultColor={suggestColor(staged)}
                onSubmit={addToStaged}
              />
            </Card>

            {first ? (
              <Text style={styles.disclaimer}>
                You can add more than one child — you'll get the chance on the next
                screen. Your data stays private on this device.
              </Text>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ---- Review step ---------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {staged.length === 1 ? 'Ready to go' : `${staged.length} children added`}
        </Text>
        <Text style={styles.subtitle}>
          Add more children now if you'd like, or continue. You can always add or
          edit children later in Settings.
        </Text>

        <View style={{ marginTop: spacing.lg }}>
          {staged.map((c) => (
            <Card key={c.id} style={styles.childCard}>
              <View style={[styles.avatar, { backgroundColor: childColor(c) }]}>
                <Text style={styles.avatarText}>
                  {c.name.trim().charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{c.name}</Text>
                <Text style={styles.childAge}>{formatAge(parseISO(c.birthDate))}</Text>
              </View>
              <Pressable onPress={() => removeStaged(c.id)} hitSlop={8} style={styles.removeBtn}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </Card>
          ))}
        </View>

        <Button
          title="Add another child"
          variant="secondary"
          icon={<Ionicons name="add" size={18} color={colors.primaryDark} />}
          onPress={() => setMode('form')}
          style={{ marginTop: spacing.sm }}
        />
        <Button
          title="Continue"
          icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
          onPress={() => addChildren(staged)}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  logoWrap: {
    width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  addHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancel: { ...typography.small, color: colors.primary, fontWeight: '700' },
  cardTitle: { ...typography.h3 },
  disclaimer: {
    ...typography.small, color: colors.textFaint, marginTop: spacing.xl,
    textAlign: 'center', lineHeight: 18,
  },

  childCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.md },
  avatar: {
    width: 44, height: 44, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  childName: { ...typography.h3, fontSize: 16 },
  childAge: { ...typography.small, color: colors.primary, fontWeight: '600', marginTop: 1 },
  removeBtn: {
    width: 30, height: 30, borderRadius: radius.pill, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
});
