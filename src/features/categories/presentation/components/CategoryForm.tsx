import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { CategoryType } from '../../domain';

interface CategoryFormProps {
  initialName?: string;
  initialType?: CategoryType;
  onSubmit: (data: { name: string; type: CategoryType }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
}

export function CategoryForm({
  initialName = '',
  initialType = CategoryType.Custom,
  onSubmit,
  onCancel,
  isLoading,
  disabled,
  error,
}: CategoryFormProps) {
  const { colors, spacing, typography, radius } = useTheme();
  const [name, setName] = useState(initialName);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), type: initialType });
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
  error: {},
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    flex: 1,
  },
});
