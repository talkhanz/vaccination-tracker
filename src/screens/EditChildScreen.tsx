import React, { useLayoutEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useApp } from '../state/AppContext';
import { RootStackParamList } from '../navigation/types';
import { ChildForm } from '../components/ChildForm';
import { colors, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditChild'>;

export function EditChildScreen({ route, navigation }: Props) {
  const isAdd = route.params?.add === true;
  const { child, addChild, saveChild } = useApp();

  useLayoutEffect(() => {
    navigation.setOptions({ title: isAdd ? 'Add a child' : 'Edit profile' });
  }, [navigation, isAdd]);

  if (!isAdd && !child) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ChildForm
            initial={isAdd ? undefined : child ?? undefined}
            submitLabel={isAdd ? 'Add child' : 'Save changes'}
            onSubmit={async (next) => {
              if (isAdd) await addChild(next);
              else await saveChild(next);
              navigation.goBack();
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
});
