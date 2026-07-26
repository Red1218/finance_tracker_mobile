import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { CategoryKind } from '../../domain';

interface CategoryFormProps {
  initialName?: string;
  initialKind?: CategoryKind;
  onSubmit: (data: { name: string; kind: CategoryKind }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
}

export function CategoryForm({
  initialName = '',
  initialKind = CategoryKind.Expense,
  onSubmit,
  onCancel,
  isLoading,
  disabled,
  error,
}: CategoryFormProps) {
  const { colors, spacing, typography, radius } = useTheme();
  const [name, setName] = useState(initialName);
  const [kind, setKind] = useState<CategoryKind>(initialKind);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), kind });
  };

  const isValid = name.trim().length > 0;

  return (
    <View style={[styles.container, { padding: spacing.space16, backgroundColor: colors.surfacePrimary, borderRadius: radius.medium }]}>
      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Category Name
      </Text>
      
      <TextInput
        style={[
          styles.input,
          {
            ...typography.body,
            color: colors.textPrimary,
            backgroundColor: colors.backgroundPrimary,
            padding: spacing.space12,
            borderRadius: radius.small,
            borderColor: colors.border,
            marginBottom: spacing.space16,
          }
        ]}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Groceries"
        placeholderTextColor={colors.textSecondary}
        editable={!isLoading && !disabled}
        autoFocus
      />

      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Category Kind
      </Text>

      <View style={[styles.segmentedContainer, { backgroundColor: colors.backgroundPrimary, borderRadius: radius.small, marginBottom: spacing.space16 }]}>
        <Pressable
          style={[
            styles.segmentButton,
            kind === CategoryKind.Expense && { backgroundColor: colors.surfacePrimary, borderRadius: radius.small },
          ]}
          onPress={() => setKind(CategoryKind.Expense)}
          disabled={isLoading || disabled}
        >
          <Text
            style={[
              typography.label,
              { color: kind === CategoryKind.Expense ? colors.textPrimary : colors.textSecondary },
            ]}
          >
            Expense
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.segmentButton,
            kind === CategoryKind.Income && { backgroundColor: colors.surfacePrimary, borderRadius: radius.small },
          ]}
          onPress={() => setKind(CategoryKind.Income)}
          disabled={isLoading || disabled}
        >
          <Text
            style={[
              typography.label,
              { color: kind === CategoryKind.Income ? colors.textPrimary : colors.textSecondary },
            ]}
          >
            Income
          </Text>
        </Pressable>
      </View>
      
      {error && (
        <Text style={[styles.error, { ...typography.caption, color: colors.error, marginBottom: spacing.space16 }]}>
          {error}
        </Text>
      )}

      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="secondary"
          onPress={onCancel}
          disabled={isLoading}
          style={styles.button}
        />
        <View style={{ width: spacing.space16 }} />
        <Button
          title="Save"
          variant="primary"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!isValid || disabled}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {},
  input: {
    borderWidth: 1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {},
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    flex: 1,
  },
});
