import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../../../shared/theme';
import { createBudgetSchema, CreateBudgetFormData } from '../validation/budgetSchema';
import { BudgetPeriodType } from '../../domain/value-objects/BudgetPeriod';

export interface CategoryOption {
  id: string;
  label: string;
}

export interface BudgetFormProps {
  initialValues?: Partial<CreateBudgetFormData>;
  categories?: CategoryOption[];
  isEditMode?: boolean;
  onSubmit: (data: CreateBudgetFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const PERIOD_OPTIONS: { id: BudgetPeriodType; label: string }[] = [
  { id: BudgetPeriodType.Monthly, label: 'Monthly' },
  { id: BudgetPeriodType.Weekly, label: 'Weekly' },
  { id: BudgetPeriodType.Quarterly, label: 'Quarterly' },
  { id: BudgetPeriodType.Yearly, label: 'Yearly' },
  { id: BudgetPeriodType.Custom, label: 'Custom' },
];

export function BudgetForm({
  initialValues,
  categories = [],
  isEditMode = false,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: BudgetFormProps) {
  const { colors, typography } = useTheme();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      amount: initialValues?.amount || 0,
      currencyCode: initialValues?.currencyCode || 'INR',
      period: initialValues?.period || BudgetPeriodType.Monthly,
      startDate: initialValues?.startDate ? new Date(initialValues.startDate) : new Date(),
      endDate: initialValues?.endDate ? new Date(initialValues.endDate) : new Date(Date.now() + 30 * 86400000),
      categoryId: initialValues?.categoryId !== undefined ? initialValues.categoryId : null,
    },
  });

  const selectedCategoryId = watch('categoryId');
  const selectedPeriod = watch('period');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {error ? (
        <View style={[styles.errorBanner, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.error }]}>
          <Text style={[styles.errorText, { color: colors.error, fontSize: typography.caption.fontSize }]}>{error}</Text>
        </View>
      ) : null}

      {/* Scope / Category Selector (Read-only during edit) */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Scope / Category
          </Text>
          {isEditMode && (
            <Text style={[styles.readOnlyBadge, { color: colors.textMuted, fontSize: typography.caption.fontSize }]}>
              (Read-only in Edit)
            </Text>
          )}
        </View>
        <View style={[styles.chipGrid, isEditMode && styles.disabledContainer]}>
          <TouchableOpacity
            key="overall"
            disabled={isEditMode}
            onPress={() => setValue('categoryId', null)}
            style={[
              styles.chip,
              {
                backgroundColor: selectedCategoryId === null ? colors.brandPrimary : colors.surfaceElevated,
                borderColor: selectedCategoryId === null ? colors.brandPrimary : colors.borderSubtle,
                opacity: isEditMode ? (selectedCategoryId === null ? 0.8 : 0.4) : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select Overall Budget"
          >
            <Text style={[styles.chipText, { color: selectedCategoryId === null ? '#FFFFFF' : colors.textPrimary }]}>
              Overall (All Categories)
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            if (isEditMode && !isSelected) return null; // In edit mode, show the active scope chip
            return (
              <TouchableOpacity
                key={cat.id}
                disabled={isEditMode}
                onPress={() => setValue('categoryId', cat.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.brandPrimary : colors.surfaceElevated,
                    borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                    opacity: isEditMode ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select category ${cat.label}`}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.categoryId && (
          <Text style={[styles.fieldError, { color: colors.error, fontSize: typography.caption.fontSize }]}>
            {errors.categoryId.message}
          </Text>
        )}
      </View>

      {/* Budget Amount Input (Active editable field) */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
          Budget Limit Amount (₹)
        </Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceElevated,
                  color: colors.textPrimary,
                  borderColor: errors.amount ? colors.error : colors.borderSubtle,
                  fontSize: typography.body.fontSize,
                },
              ]}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              onBlur={onBlur}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              value={value ? value.toString() : ''}
              accessibilityLabel="Budget Amount Input"
            />
          )}
        />
        {errors.amount && (
          <Text style={[styles.fieldError, { color: colors.error, fontSize: typography.caption.fontSize }]}>
            {errors.amount.message}
          </Text>
        )}
      </View>

      {/* Budget Period Selector (Read-only during edit) */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Period Type
          </Text>
          {isEditMode && (
            <Text style={[styles.readOnlyBadge, { color: colors.textMuted, fontSize: typography.caption.fontSize }]}>
              (Read-only in Edit)
            </Text>
          )}
        </View>
        <View style={[styles.chipGrid, isEditMode && styles.disabledContainer]}>
          {PERIOD_OPTIONS.map((p) => {
            const isSelected = selectedPeriod === p.id;
            if (isEditMode && !isSelected) return null; // In edit mode, display active period chip
            return (
              <TouchableOpacity
                key={p.id}
                disabled={isEditMode}
                onPress={() => setValue('period', p.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.brandPrimary : colors.surfaceElevated,
                    borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                    opacity: isEditMode ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select period ${p.label}`}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Date Range Display (Read-only during edit) */}
      <View style={styles.dateRow}>
        <View style={styles.dateCol}>
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            Start Date
          </Text>
          <TouchableOpacity
            disabled={isEditMode}
            onPress={() => setShowStartDatePicker(true)}
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                opacity: isEditMode ? 0.6 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select start date"
          >
            <Text style={[styles.dateButtonText, { color: colors.textPrimary }]}>
              {startDate ? new Date(startDate).toLocaleDateString('en-IN') : 'Start Date'}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && !isEditMode && (
            <DateTimePicker
              value={startDate ? new Date(startDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selected) => {
                if (Platform.OS === 'android') setShowStartDatePicker(false);
                if (selected) setValue('startDate', selected);
              }}
            />
          )}
        </View>

        <View style={styles.dateCol}>
          <Text style={[styles.label, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
            End Date
          </Text>
          <TouchableOpacity
            disabled={isEditMode}
            onPress={() => setShowEndDatePicker(true)}
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                opacity: isEditMode ? 0.6 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select end date"
          >
            <Text style={[styles.dateButtonText, { color: colors.textPrimary }]}>
              {endDate ? new Date(endDate).toLocaleDateString('en-IN') : 'End Date'}
            </Text>
          </TouchableOpacity>
          {showEndDatePicker && !isEditMode && (
            <DateTimePicker
              value={endDate ? new Date(endDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selected) => {
                if (Platform.OS === 'android') setShowEndDatePicker(false);
                if (selected) setValue('endDate', selected);
              }}
            />
          )}
        </View>
      </View>

      {/* Form Action Buttons */}
      <View style={styles.actionsRow}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary }]}
            onPress={onCancel}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Cancel budget form"
          >
            <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.submitBtn,
            { backgroundColor: colors.brandPrimary, opacity: isSubmitting ? 0.6 : 1 },
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Save budget"
        >
          <Text style={[styles.actionBtnText, { color: '#FFFFFF', fontWeight: '700' }]}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Budget' : 'Save Budget'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
  readOnlyBadge: {
    fontStyle: 'italic',
  },
  disabledContainer: {
    opacity: 0.8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  fieldError: {
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateCol: {
    flex: 1,
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {},
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
