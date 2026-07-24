import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { CategoryOption } from '../models';
import { PaymentMethodType } from '../../domain';

const PAYMENT_METHODS: { id: PaymentMethodType; label: string }[] = [
  { id: PaymentMethodType.CASH, label: 'Cash' },
  { id: PaymentMethodType.UPI, label: 'UPI' },
  { id: PaymentMethodType.CREDIT_CARD, label: 'Credit Card' },
  { id: PaymentMethodType.DEBIT_CARD, label: 'Debit Card' },
  { id: PaymentMethodType.BANK_TRANSFER, label: 'Bank Transfer' },
];

interface ExpenseFormProps {
  initialData?: {
    categoryId?: string;
    amount?: number;
    currency?: string;
    date?: number;
    paymentMethod?: string;
    note?: string;
    merchant?: string;
  };
  categories: CategoryOption[];
  onSubmit: (data: {
    categoryId: string;
    amount: number;
    currency: string;
    date: number;
    paymentMethod: string;
    note?: string;
    merchant?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
}

export function ExpenseForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading,
  disabled,
  error,
}: ExpenseFormProps) {
  const { colors, spacing, typography, radius } = useTheme();
  
  const [amountStr, setAmountStr] = useState(
    initialData?.amount !== undefined ? (initialData.amount / 100).toFixed(2) : ''
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
  const [merchant, setMerchant] = useState(initialData?.merchant || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    (initialData?.paymentMethod as PaymentMethodType) || PaymentMethodType.CASH
  );
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    const amountNum = parseFloat(amountStr);
    if (isNaN(amountNum) || amountNum <= 0 || !categoryId) return;
    
    onSubmit({
      categoryId,
      amount: Math.round(amountNum * 100), // convert back to integer cents
      currency,
      date: date.getTime(),
      paymentMethod,
      note: note.trim() || undefined,
      merchant: merchant.trim() || undefined,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const isValid = !isNaN(parseFloat(amountStr)) && parseFloat(amountStr) > 0 && categoryId;

  return (
    <ScrollView style={[styles.container, { padding: spacing.space16, backgroundColor: colors.surfacePrimary, borderRadius: radius.medium }]}>
      {error ? (
        <View style={{ backgroundColor: colors.error + '20', padding: spacing.space12, borderRadius: radius.small, marginBottom: spacing.space16 }}>
          <Text style={[{ color: colors.error }, typography.body]}>{error}</Text>
        </View>
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
        accessibilityRole="none"
        accessibilityLabel="Expense Amount"
      />

      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Category
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.space16 }}>
        {categories.map((cat) => {
          const isSelected = categoryId === cat.id;
          const isArchived = cat.isArchived;
          
          if (isArchived && !isSelected) return null;
          
          const isDisabled = disabled || isLoading || isArchived;
          const title = isArchived ? `${cat.label} (Archived)` : cat.label;
          const bgColor = isSelected 
            ? (isArchived ? colors.warning : colors.brandPrimary) 
            : colors.surfaceSecondary;

          return (
            <Button 
              key={cat.id}
              title={title}
              onPress={() => setCategoryId(cat.id)}
              disabled={isDisabled}
              style={{ 
                marginRight: spacing.space8, 
                marginBottom: spacing.space8, 
                backgroundColor: bgColor 
              }}
            />
          );
        })}
      </View>

      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Payment Method
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.space16 }}>
        {PAYMENT_METHODS.map((pm) => {
          const isSelected = paymentMethod === pm.id;
          const bgColor = isSelected ? colors.brandPrimary : colors.surfaceSecondary;

          return (
            <Button
              key={pm.id}
              title={pm.label}
              onPress={() => setPaymentMethod(pm.id)}
              disabled={disabled || isLoading}
              style={{
                marginRight: spacing.space8,
                marginBottom: spacing.space8,
                backgroundColor: bgColor,
              }}
            />
          );
        })}
      </View>

      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Date
      </Text>
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: colors.backgroundPrimary,
            padding: spacing.space12,
            borderRadius: radius.small,
            marginBottom: spacing.space16,
            borderColor: colors.border,
            borderWidth: 1,
          }
        ]}
        onPress={() => setShowDatePicker(true)}
        disabled={disabled || isLoading}
        accessibilityRole="button"
        accessibilityLabel="Select date"
      >
        <Text style={[{ color: colors.textPrimary }, typography.body]}>
          {date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Merchant (Optional)
      </Text>
      <TextInput
        style={[styles.input, { ...typography.body, color: colors.textPrimary, backgroundColor: colors.backgroundPrimary, padding: spacing.space12, borderRadius: radius.small, marginBottom: spacing.space16 }]}
        value={merchant}
        onChangeText={setMerchant}
        placeholder="Merchant name"
        placeholderTextColor={colors.disabled}
        editable={!disabled && !isLoading}
        accessibilityRole="none"
        accessibilityLabel="Merchant Name"
      />

      <Text style={[styles.label, { ...typography.label, color: colors.textSecondary, marginBottom: spacing.space8 }]}>
        Note (Optional)
      </Text>
      <TextInput
        style={[styles.input, { ...typography.body, color: colors.textPrimary, backgroundColor: colors.backgroundPrimary, padding: spacing.space12, borderRadius: radius.small, marginBottom: spacing.space24 }]}
        value={note}
        onChangeText={setNote}
        placeholder="Add a note"
        placeholderTextColor={colors.disabled}
        editable={!disabled && !isLoading}
        multiline
        accessibilityRole="none"
        accessibilityLabel="Expense Note"
      />

      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={onCancel}
          disabled={isLoading || disabled}
          accessibilityRole="button"
          style={{ flex: 1, marginRight: spacing.space8, backgroundColor: colors.surfaceSecondary }}
        />
        <Button
          title={isLoading ? 'Saving...' : 'Save'}
          onPress={handleSubmit}
          disabled={!isValid || isLoading || disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValid || isLoading || disabled }}
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
  label: {
  },
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

