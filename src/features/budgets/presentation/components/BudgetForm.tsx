import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createBudgetSchema, CreateBudgetFormData } from '../validation/budgetSchema';
import { BudgetPeriod } from '../../domain/value-objects/BudgetPeriod';

export interface CategoryOption {
  id: string;
  label: string;
}

interface BudgetFormProps {
  initialValues?: Partial<CreateBudgetFormData>;
  categories?: CategoryOption[];
  onSubmit: (data: CreateBudgetFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const PERIOD_OPTIONS: { id: BudgetPeriod; label: string }[] = [
  { id: BudgetPeriod.Monthly, label: 'Monthly' },
  { id: BudgetPeriod.Weekly, label: 'Weekly' },
  { id: BudgetPeriod.Quarterly, label: 'Quarterly' },
  { id: BudgetPeriod.Yearly, label: 'Yearly' },
  { id: BudgetPeriod.Custom, label: 'Custom' },
];

export const BudgetForm: React.FC<BudgetFormProps> = ({
  initialValues,
  categories = [],
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}) => {
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      amount: initialValues?.amount || 0,
      currencyCode: initialValues?.currencyCode || 'INR',
      period: initialValues?.period || BudgetPeriod.Monthly,
      startDate: initialValues?.startDate ? new Date(initialValues.startDate) : new Date(),
      endDate: initialValues?.endDate ? new Date(initialValues.endDate) : new Date(Date.now() + 30 * 86400000),
      categoryId: initialValues?.categoryId !== undefined ? initialValues.categoryId : null,
    }
  });

  const selectedCategoryId = watch('categoryId');
  const selectedPeriod = watch('period');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  return (
    <ScrollView className="p-4 bg-white rounded-xl max-h-[85vh]">
      {error ? (
        <View className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
          <Text className="text-red-600 text-sm font-medium">{error}</Text>
        </View>
      ) : null}

      {/* Category Picker */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Category</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity
            key="overall"
            onPress={() => setValue('categoryId', null)}
            className={`px-3 py-2 rounded-lg border ${
              selectedCategoryId === null ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'
            }`}
          >
            <Text className={selectedCategoryId === null ? 'text-white font-semibold' : 'text-gray-700'}>
              Overall (All Categories)
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setValue('categoryId', cat.id)}
                className={`px-3 py-2 rounded-lg border ${
                  isSelected ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'
                }`}
              >
                <Text className={isSelected ? 'text-white font-semibold' : 'text-gray-700'}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.categoryId && <Text className="text-xs text-red-500 mt-1">{errors.categoryId.message}</Text>}
      </View>

      {/* Amount Input */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-1">Budget Amount</Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base text-gray-900 bg-gray-50"
              keyboardType="numeric"
              placeholder="0.00"
              onBlur={onBlur}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              value={value ? value.toString() : ''}
              accessibilityLabel="Budget Amount"
            />
          )}
        />
        {errors.amount && <Text className="text-xs text-red-500 mt-1">{errors.amount.message}</Text>}
      </View>

      {/* Period Selector */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Budget Period</Text>
        <View className="flex-row flex-wrap gap-2">
          {PERIOD_OPTIONS.map((p) => {
            const isSelected = selectedPeriod === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setValue('period', p.id)}
                className={`px-3 py-2 rounded-lg border ${
                  isSelected ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'
                }`}
              >
                <Text className={isSelected ? 'text-white font-semibold' : 'text-gray-700'}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.period && <Text className="text-xs text-red-500 mt-1">{errors.period.message}</Text>}
      </View>

      {/* Date Pickers */}
      <View className="mb-6 flex-row justify-between gap-3">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-700 mb-1">Start Date</Text>
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(true)}
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            accessibilityLabel="Select start date"
          >
            <Text className="text-gray-900 text-sm">
              {startDate ? new Date(startDate).toLocaleDateString() : 'Select Start Date'}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && (
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
          {errors.startDate && <Text className="text-xs text-red-500 mt-1">{errors.startDate.message}</Text>}
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-700 mb-1">End Date</Text>
          <TouchableOpacity
            onPress={() => setShowEndDatePicker(true)}
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            accessibilityLabel="Select end date"
          >
            <Text className="text-gray-900 text-sm">
              {endDate ? new Date(endDate).toLocaleDateString() : 'Select End Date'}
            </Text>
          </TouchableOpacity>
          {showEndDatePicker && (
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
          {errors.endDate && <Text className="text-xs text-red-500 mt-1">{errors.endDate.message}</Text>}
        </View>
      </View>

      {/* Form Action Buttons */}
      <View className="flex-row justify-end space-x-3 mb-6">
        {onCancel && (
          <TouchableOpacity
            className="bg-gray-200 rounded-lg py-3 px-4 flex-1 items-center mr-2"
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          className={`bg-blue-600 rounded-lg py-3 px-4 flex-1 items-center ${isSubmitting ? 'opacity-50' : ''}`}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-white font-bold text-base">
            {isSubmitting ? 'Saving...' : 'Save Budget'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

