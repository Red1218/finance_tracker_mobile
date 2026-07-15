import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { CategoryBudgetOption } from '../models';

interface BudgetFormProps {
  initialData?: {
    categoryId?: string | null;
    amount?: number;
    currency?: string;
    period?: string;
    status?: string;
  };
  categories: CategoryBudgetOption[];
  onSubmit: (data: {
    categoryId: string | null;
    amount: number;
    currency: string;
    period: string;
    status: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
}

export function BudgetForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading,
  disabled,
  error,
}: BudgetFormProps) {
  const { colors, spacing, typography, radius } = useTheme();
  
  const [amountStr, setAmountStr] = useState(
    initialData?.amount !== undefined ? (initialData.amount / 100).toFixed(2) : ''
  );
  const [categoryId, setCategoryId] = useState<string | null>(initialData?.categoryId || null);
  const [period, setPeriod] = useState(initialData?.period || '2024-01');
  const [status, setStatus] = useState(initialData?.status || 'Active');
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');

  const handleSubmit = () => {
    const amountNum = parseFloat(amountStr);
    if (isNaN(amountNum) || amountNum <= 0) return;
    
    onSubmit({
      categoryId: categoryId || null,
      amount: Math.round(amountNum * 100),
      currency,
      period: period.trim(),
      status,
    });
  };

  const isValid = !isNaN(parseFloat(amountStr)) && parseFloat(amountStr) > 0 && period.trim().length > 0;

  return (
    <ScrollView style={[styles.container, { padding: spacing.space16, backgroundColor: colors.surfacePrimary, borderRadius: radius.medium }]}>
      {error ? (
        <Text style={{ color: colors.error, marginBottom: spacing.space8 }}>{error}</Text>
      ) : null}
      
      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Amount
      </Text>
      <TextInput
        style={[styles.input, { ...typography.body, color: colors.textPrimary, backgroundColor: colors.backgroundPrimary, padding: spacing.space12, borderRadius: radius.small, marginBottom: spacing.space16 }]}
        value={amountStr}
        onChangeText={setAmountStr}
        placeholder="0.00"
        placeholderTextColor={colors.disabled}
        keyboardType="decimal-pad"
        editable={!disabled && !isLoading}
      />

      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Period (YYYY-MM)
      </Text>
      <TextInput
        style={[styles.input, { ...typography.body, color: colors.textPrimary, backgroundColor: colors.backgroundPrimary, padding: spacing.space12, borderRadius: radius.small, marginBottom: spacing.space16 }]}
        value={period}
        onChangeText={setPeriod}
        placeholder="2024-01"
        placeholderTextColor={colors.disabled}
        editable={!disabled && !isLoading}
      />

      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Category
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.space16 }}>
        <Button 
          title="Overall"
          onPress={() => setCategoryId(null)}
          disabled={disabled || isLoading}
          style={{ 
            marginRight: spacing.space8, 
            marginBottom: spacing.space8, 
            backgroundColor: categoryId === null ? colors.brandPrimary : colors.surfaceSecondary 
          }}
        />
        {categories.map((cat) => (
          <Button 
            key={cat.id}
            title={cat.name}
            onPress={() => setCategoryId(cat.id)}
            disabled={disabled || isLoading}
            style={{ 
              marginRight: spacing.space8, 
              marginBottom: spacing.space8, 
              backgroundColor: categoryId === cat.id ? colors.brandPrimary : colors.surfaceSecondary 
            }}
          />
        ))}
      </View>

      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Status
      </Text>
      <View style={{ flexDirection: 'row', marginBottom: spacing.space24 }}>
        <Button 
          title="Active"
          onPress={() => setStatus('Active')}
          disabled={disabled || isLoading}
          style={{ 
            flex: 1,
            marginRight: spacing.space8, 
            backgroundColor: status === 'Active' ? colors.brandPrimary : colors.surfaceSecondary 
          }}
        />
        <Button 
          title="Inactive"
          onPress={() => setStatus('Inactive')}
          disabled={disabled || isLoading}
          style={{ 
            flex: 1,
            backgroundColor: status === 'Inactive' ? colors.brandPrimary : colors.surfaceSecondary 
          }}
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={onCancel}
          disabled={isLoading || disabled}
          style={{ flex: 1, marginRight: spacing.space8, backgroundColor: colors.surfaceSecondary }}
        />
        <Button
          title={isLoading ? 'Saving...' : 'Save'}
          onPress={handleSubmit}
          disabled={!isValid || isLoading || disabled}
          style={{ flex: 1, marginLeft: spacing.space8 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {},
  input: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 40,
  }
});
