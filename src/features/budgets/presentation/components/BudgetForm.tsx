import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBudgetSchema, CreateBudgetFormData } from '../validation/budgetSchema';
import { BudgetPeriod } from '../../domain/value-objects/BudgetPeriod';

interface BudgetFormProps {
  initialValues?: Partial<CreateBudgetFormData>;
  onSubmit: (data: CreateBudgetFormData) => void;
  isSubmitting?: boolean;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ initialValues, onSubmit, isSubmitting }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      amount: initialValues?.amount || 0,
      currencyCode: initialValues?.currencyCode || 'USD',
      period: initialValues?.period || BudgetPeriod.Monthly,
      startDate: initialValues?.startDate || new Date(),
      endDate: initialValues?.endDate || new Date(),
      categoryId: initialValues?.categoryId || null,
    }
  });

  return (
    <View className="p-4 bg-white rounded-xl">
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-1">Amount</Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border border-gray-300 rounded-md p-2 text-base text-gray-900"
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              value={value.toString()}
            />
          )}
        />
        {errors.amount && <Text className="text-xs text-red-500 mt-1">{errors.amount.message}</Text>}
      </View>

      <TouchableOpacity 
        className={`bg-blue-600 rounded-md py-3 px-4 flex-row justify-center items-center ${isSubmitting ? 'opacity-50' : ''}`}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text className="text-white font-bold text-base">Save Budget</Text>
      </TouchableOpacity>
    </View>
  );
};
